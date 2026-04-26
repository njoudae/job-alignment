import axios from 'axios';
import type { CourseParseResponse, JobHierarchyResponse, MatchResponse, CleanedJob, CourseProfile } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const jobsApi = {
  async getHierarchy() {
    const { data } = await api.get<JobHierarchyResponse>('/jobs/hierarchy');
    return data;
  },
  async search(q: string) {
    const { data } = await api.get<{ items: CleanedJob[]; total: number }>('/jobs/search', { params: { q } });
    return data;
  },
};

export const courseApi = {
  async parse(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<CourseParseResponse>('/course/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export const matchApi = {
  async analyze(courseProfile: CourseProfile, selectedJob: CleanedJob) {
    const { data } = await api.post<MatchResponse>('/match', {
      course_profile: courseProfile,
      selected_job: selectedJob,
    });
    return data;
  },
};
