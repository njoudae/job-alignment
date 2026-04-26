from __future__ import annotations

import json
import re
from fastapi import HTTPException

from app.schemas.match import MatchRequest, MatchResponse
from app.utils.openai_client import get_openai_client
from app.utils.config import settings


def extract_json_object(text: str) -> dict:
    if not text or not text.strip():
        raise ValueError("OpenAI returned an empty response.")

    cleaned = text.strip()

    cleaned = re.sub(r"^```json", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"^```", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            raise ValueError(f"OpenAI did not return valid JSON:\n{cleaned[:1000]}")
        return json.loads(match.group(0))


class MatchService:
    def match_course_to_job(self, req: MatchRequest) -> MatchResponse:
        client = get_openai_client()

        prompt = f"""
You are an expert evaluator of alignment between university courses and job profiles.

Return ONLY valid JSON (no markdown).

SCHEMA:
{{
  "alignment_score": 0,
  "final_verdict": "",
  "academic_alignment": 0,
  "skill_alignment": 0,
  "task_alignment": 0,
  "practical_readiness": 0,
  "tool_alignment": 0,
  "domain_relevance": 0,
  "matched_skills": [],
  "missing_skills": [],
  "matched_tasks": [],
  "uncovered_job_responsibilities": [],
  "practical_readiness_assessment": "",
  "recommendations_to_improve_course": []
}}

IMPORTANT RULES:
- Degree mismatch MUST NOT heavily penalize score.
- Evaluate fairly across:
  theory + skills + tasks + tools + practical readiness.
- Use real reasoning, not keyword matching.

COURSE:
{req.course_profile.model_dump_json()}

JOB:
{req.job}

"""

        try:
            response = client.responses.create(
                model=settings.openai_model,
                input=prompt,
                temperature=0
            )

            payload = getattr(response, "output_text", None)

            if not payload:
                try:
                    payload = response.output[0].content[0].text
                except Exception:
                    payload = ""

            data = extract_json_object(payload)

            return MatchResponse(**data)

        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate match result: {exc}"
            )