const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// 임원
export const api = {
  // 통계
  getStats: () => request('/api/stats'),

  // 임원
  getExecutives: () => request('/api/executives'),
  getExecutive: (id: number) => request(`/api/executives/${id}`),
  createExecutive: (data: any) => request('/api/executives', { method: 'POST', body: JSON.stringify(data) }),
  updateExecutive: (id: number, data: any) => request(`/api/executives/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExecutive: (id: number) => request(`/api/executives/${id}`, { method: 'DELETE' }),

  // 일정
  getSchedules: (params?: { exec_id?: number; date_from?: string; date_to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.exec_id) qs.set('exec_id', String(params.exec_id));
    if (params?.date_from) qs.set('date_from', params.date_from);
    if (params?.date_to) qs.set('date_to', params.date_to);
    return request(`/api/schedules?${qs.toString()}`);
  },
  getTodaySchedules: () => request('/api/schedules/today'),
  getCalendarDates: (year: number, month: number) => request(`/api/schedules/calendar/${year}/${month}`),
  createSchedule: (data: any) => request('/api/schedules', { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (id: number, data: any) => request(`/api/schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSchedule: (id: number) => request(`/api/schedules/${id}`, { method: 'DELETE' }),

  // 출장
  getTrips: (execId?: number) => request(`/api/trips${execId ? `?exec_id=${execId}` : ''}`),
  getUpcomingTrips: () => request('/api/trips/upcoming'),
  createTrip: (data: any) => request('/api/trips', { method: 'POST', body: JSON.stringify(data) }),
  deleteTrip: (id: number) => request(`/api/trips/${id}`, { method: 'DELETE' }),
};
