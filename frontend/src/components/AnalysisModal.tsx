import { X } from 'lucide-react';
import type { MatchResponse } from '../types';
import AxisRadarChart from './AxisRadarChart';
import ScoreBadge from './ScoreBadge';

interface Props {
  open: boolean;
  onClose: () => void;
  data: MatchResponse | null;
}

function ChipList({ items, emptyMessage }: { items: string[]; emptyMessage: string }) {
  if (!items.length) return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
          {item}
        </span>
      ))}
    </div>
  );
}

export default function AnalysisModal({ open, onClose, data }: Props) {
  if (!open || !data) return null;

  const { course_profile, selected_job, result } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Alignment Analysis Result</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Course ↔ Job Matching Report</h3>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{result.executive_summary}</p>
          </div>
          <button onClick={onClose} className="rounded-2xl p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <ScoreBadge score={result.alignment_score} />
          <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">{result.final_verdict}</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="scroll-box rounded-3xl border border-slate-200 p-5">
                <h4 className="mb-3 text-lg font-semibold text-slate-900">Course Information</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><span className="font-semibold">Title:</span> {course_profile.course_title || '—'}</p>
                  <p><span className="font-semibold">Code:</span> {course_profile.course_code || '—'}</p>
                  <p><span className="font-semibold">Program:</span> {course_profile.program || '—'}</p>
                  <p><span className="font-semibold">Institution:</span> {course_profile.institution || '—'}</p>
                  <p><span className="font-semibold">Description:</span> {course_profile.course_description || '—'}</p>
                </div>
              </div>

              <div className="scroll-box rounded-3xl border border-slate-200 p-5">
                <h4 className="mb-3 text-lg font-semibold text-slate-900">Job Information</h4>
                <div className="space-y-2 text-sm text-slate-700">
                  <p><span className="font-semibold">Job Title:</span> {selected_job.job_title}</p>
                  <p><span className="font-semibold">Job ID:</span> {selected_job.job_id}</p>
                  <p><span className="font-semibold">Summary:</span> {selected_job.summary || '—'}</p>
                  <p><span className="font-semibold">Minimum Education:</span> {selected_job.minimum_education || '—'}</p>
                </div>
              </div>
            </div>

            <div className="scroll-box rounded-3xl border border-slate-200 p-5">
              <h4 className="mb-4 text-lg font-semibold text-slate-900">Key Findings</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 font-medium text-slate-800">Matched Skills</p>
                  <ChipList items={result.matched_skills} emptyMessage="No strong matched skills were detected." />
                </div>
                <div>
                  <p className="mb-2 font-medium text-slate-800">Missing Skills</p>
                  <ChipList items={result.missing_skills} emptyMessage="No critical skill gaps were listed." />
                </div>
                <div>
                  <p className="mb-2 font-medium text-slate-800">Matched Tasks</p>
                  <ChipList items={result.matched_tasks} emptyMessage="No strong matched tasks were detected." />
                </div>
                <div>
                  <p className="mb-2 font-medium text-slate-800">Missing Responsibilities</p>
                  <ChipList items={result.uncovered_job_responsibilities} emptyMessage="No major uncovered responsibilities were listed." />
                </div>
              </div>
            </div>

            <div className="scroll-box rounded-3xl border border-slate-200 p-5">
              <h4 className="mb-4 text-lg font-semibold text-slate-900">Practical Readiness & Recommendations</h4>
              <div className="space-y-4 text-sm text-slate-700">
                <p><span className="font-semibold">Practical Readiness:</span> {result.practical_readiness_assessment}</p>
                <p><span className="font-semibold">Degree Handling:</span> {result.degree_requirement_assessment}</p>
                <p><span className="font-semibold">Fairness Note:</span> {result.inferred_degree_handling_note}</p>
                <div>
                  <p className="mb-2 font-semibold">Recommendations</p>
                  <ul className="list-disc space-y-1 ps-5">
                    {result.recommendations_to_improve_course.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="scroll-box rounded-3xl border border-slate-200 p-5">
              <h4 className="mb-4 text-lg font-semibold text-slate-900">Axis Visualization</h4>
              <AxisRadarChart data={result.axis_scores} />
            </div>

            <div className="scroll-box rounded-3xl border border-slate-200 p-5">
              <h4 className="mb-4 text-lg font-semibold text-slate-900">Axis Scores</h4>
              <div className="space-y-4">
                {result.axis_scores.map((axis) => (
                  <div key={axis.name}>
                    <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
                      <span>{axis.name}</span>
                      <span>{axis.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-brand-500" style={{ width: `${axis.score}%` }} />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{axis.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="scroll-box rounded-3xl border border-slate-200 p-5">
              <h4 className="mb-4 text-lg font-semibold text-slate-900">Main Job Tasks</h4>
              <ul className="list-disc space-y-2 ps-5 text-sm text-slate-700">
                {selected_job.main_tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
