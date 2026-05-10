import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, FileSearch, Loader2, Sparkles } from 'lucide-react';
import AnalysisModal from './components/AnalysisModal';
import FileDropzone from './components/FileDropzone';
import SectionCard from './components/SectionCard';
import SelectField from './components/SelectField';
import { courseApi, jobsApi, matchApi } from './services/api';
import type { CleanedJob, CourseParseResponse, JobHierarchyResponse, MatchResponse } from './types';
import { defaultSelections, getJobs, getMainGroups, getSpecializations, getUnits, type HierarchySelections } from './utils/hierarchy';

export default function App() {
  const [hierarchy, setHierarchy] = useState<JobHierarchyResponse | null>(null);
  const [selected, setSelected] = useState<HierarchySelections>(defaultSelections);
  const [selectedJob, setSelectedJob] = useState<CleanedJob | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedCourse, setParsedCourse] = useState<CourseParseResponse | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    jobsApi.getHierarchy()
      .then(setHierarchy)
      .catch((err) => setError(err?.response?.data?.detail || 'Failed to load jobs hierarchy.'));
  }, []);

  const mainGroups = useMemo(() => (hierarchy ? getMainGroups(hierarchy.items, selected.education) : []), [hierarchy, selected.education]);
  const specializations = useMemo(
    () => (hierarchy ? getSpecializations(hierarchy.items, selected.education, selected.mainGroup) : []),
    [hierarchy, selected.education, selected.mainGroup],
  );
  const units = useMemo(
    () => (hierarchy ? getUnits(hierarchy.items, selected.education, selected.mainGroup, selected.specialization) : []),
    [hierarchy, selected.education, selected.mainGroup, selected.specialization],
  );
  const jobs = useMemo(
    () => (hierarchy ? getJobs(hierarchy.items, selected.education, selected.mainGroup, selected.specialization, selected.unit) : []),
    [hierarchy, selected.education, selected.mainGroup, selected.specialization, selected.unit],
  );

  const handleSelectionChange = (field: keyof HierarchySelections, value: string) => {
    setError('');
    setResult(null);
    setSelectedJob(null);

    if (field === 'education') {
      setSelected({ education: value, mainGroup: '', specialization: '', unit: '', jobId: '' });
      return;
    }
    if (field === 'mainGroup') {
      setSelected((prev) => ({ ...prev, mainGroup: value, specialization: '', unit: '', jobId: '' }));
      return;
    }
    if (field === 'specialization') {
      setSelected((prev) => ({ ...prev, specialization: value, unit: '', jobId: '' }));
      return;
    }
    if (field === 'unit') {
      setSelected((prev) => ({ ...prev, unit: value, jobId: '' }));
      return;
    }
    if (field === 'jobId') {
      setSelected((prev) => ({ ...prev, jobId: value }));
      setSelectedJob(jobs.find((job) => job.job_id === value) ?? null);
    }
  };

  const analyze = async () => {
    if (!selectedJob) {
      setError('Please select a job first.');
      return;
    }
    if (!file) {
      setError('Please upload a course specification PDF first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const course = await courseApi.parse(file);
      setParsedCourse(course);
      const match = await matchApi.analyze(course.profile, selectedJob);
      setResult(match);
      setModalOpen(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Analysis failed. Please verify the API key, PDF content, and backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.10),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 text-slate-900">
      {loading && (
       <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
         <div className="w-[90%] max-w-md rounded-3xl border border-white/20 bg-white p-8 text-center shadow-2xl">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
      </div>

      <h2 className="text-xl font-bold text-slate-900">
        Analyzing Course Alignment
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        The system is extracting the course content, analyzing the job profile,
        and generating the alignment result. Please wait.
      </p>
    </div>
  </div>
)}
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Local AI Alignment System</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 lg:text-5xl">Course Specification ↔ Job Profile Alignment Analyzer</h1>
              <p className="mt-4 max-w-3xl text-slate-600">
                A local presentation-ready system that normalizes job data, extracts structured course evidence from PDF,
                and generates explainable GPT-4o alignment results across academic, skills, tasks, tools, and practical readiness.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm lg:w-[360px]">
              <div className="rounded-2xl bg-slate-900 p-4 text-white">
                <p className="text-slate-300">Loaded Jobs</p>
                <p className="mt-2 text-2xl font-semibold">{hierarchy?.total_jobs ?? '—'}</p>
              </div>
              <div className="rounded-2xl bg-brand-600 p-4 text-white">
                <p className="text-blue-100">Workflow</p>
                <p className="mt-2 text-lg font-semibold">Select → Upload → Analyze</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <SectionCard
              title="1) Select Job Profile"
              subtitle="Hierarchical, presentation-friendly selection based on cleaned backend data."
              icon={<BriefcaseBusiness className="h-5 w-5" />}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <SelectField
                  label="Minimum Education"
                  value={selected.education}
                  onChange={(value) => handleSelectionChange('education', value)}
                  options={hierarchy?.education_options.map((item) => item.value) ?? []}
                  placeholder="Select education"
                />
                <SelectField
                  label="Main Group / Domain"
                  value={selected.mainGroup}
                  onChange={(value) => handleSelectionChange('mainGroup', value)}
                  options={mainGroups}
                  placeholder="Select main group"
                  disabled={!selected.education}
                />
                <SelectField
                  label="Specialization"
                  value={selected.specialization}
                  onChange={(value) => handleSelectionChange('specialization', value)}
                  options={specializations}
                  placeholder="Select specialization"
                  disabled={!selected.mainGroup}
                />
                <SelectField
                  label="Unit"
                  value={selected.unit}
                  onChange={(value) => handleSelectionChange('unit', value)}
                  options={units}
                  placeholder="Select unit"
                  disabled={!selected.specialization}
                />
                <SelectField
                  label="Final Job"
                  value={selected.jobId}
                  onChange={(value) => handleSelectionChange('jobId', value)}
                  options={jobs.map((job) => ({ value: job.job_id, label: `${job.job_id} — ${job.job_title}` }))}
                  placeholder="Select final job"
                  disabled={!selected.unit}
                />
              </div>

              {selected.unit && jobs.length > 0 ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">Available Jobs in This Branch</p>
                  <ul className="mt-2 list-disc space-y-1 ps-5">
                    {jobs.map((job) => (
                      <li key={job.job_id}>{job.job_id} — {job.job_title}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              title="2) Upload Course PDF"
              subtitle="The backend extracts text locally, then GPT-4o returns a structured course profile with null/[] for missing fields."
              icon={<FileSearch className="h-5 w-5" />}
            >
              <FileDropzone file={file} onFileChange={setFile} />
              {parsedCourse ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Parsed: <span className="font-semibold">{parsedCourse.profile.course_title || 'Unnamed course'}</span> · {parsedCourse.pages} pages · {parsedCourse.extracted_characters} chars extracted.
                </div>
              ) : null}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="3) Run Alignment Analysis"
              subtitle="Explainable AI matching with fair handling of missing degree information."
              icon={<Sparkles className="h-5 w-5" />}
            >
              <div className="space-y-4">
                <button
                  onClick={analyze}
                  disabled={loading}
                  className="w-full rounded-2xl bg-brand-600 px-5 py-4 text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Analyzing alignment…' : 'Analyze Alignment'}
                </button>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-800">Fairness logic used</p>
                  <ul className="mt-2 list-disc space-y-1 ps-5">
                    <li>Normalization is applied before showing jobs or matching.</li>
                    <li>Degree mention is treated as optional/inferred, not a hard failure.</li>
                    <li>The final score balances theory, skills, tasks, tools, and practical readiness.</li>
                  </ul>
                </div>

                {selectedJob ? (
                  <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Selected Job</p>
                    <p className="mt-2">{selectedJob.job_title} ({selectedJob.job_id})</p>
                    <p className="mt-2 text-slate-500">{selectedJob.summary || 'No summary available.'}</p>
                  </div>
                ) : null}

                {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
                {result ? <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">Latest analysis ready. Opened in modal for presentation view.</div> : null}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <AnalysisModal open={modalOpen} onClose={() => setModalOpen(false)} data={result} />
    </main>
  );
}
