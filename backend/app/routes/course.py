from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.course_service import CourseService
from app.services.pdf_service import PDFService
from app.utils.config import settings

router = APIRouter()
course_service = CourseService()


@router.post("/parse")
async def parse_course_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    max_size = settings.max_pdf_size_mb * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail=f"PDF exceeds the maximum size of {settings.max_pdf_size_mb} MB.")

    try:
        extraction = PDFService.extract_text(content)
        if not extraction["text"].strip():
            raise HTTPException(status_code=400, detail="No readable text could be extracted from the PDF.")
        return course_service.parse_course_profile(extraction["text"], extraction["pages"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to parse course PDF: {exc}") from exc
