import { FileUp, X } from 'lucide-react';

interface Props {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function FileDropzone({ file, onFileChange }: Props) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
      <label className="flex cursor-pointer flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-white p-4 shadow-soft">
          <FileUp className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <p className="font-medium text-slate-800">Upload course specification PDF</p>
          <p className="text-sm text-slate-500">Drag & drop is optional — click to choose a PDF file.</p>
        </div>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </label>

      {file ? (
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
