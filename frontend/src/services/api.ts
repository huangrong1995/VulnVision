import { DashboardData, CVE, CVEListResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export type { DashboardData, CVE, CVEListResponse };

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/api/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json() as Promise<DashboardData>;
}

export async function fetchCVEs(params?: {
  severity?: string;
  attack_vector?: string;
  component?: string;
  search?: string;
  cwe?: string;
  epss_category?: string;
  in_kev?: string;
  has_poc?: string;
  weaponized?: string;
  ransomware?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.severity) searchParams.set('severity', params.severity);
  if (params?.attack_vector) searchParams.set('attack_vector', params.attack_vector);
  if (params?.component) searchParams.set('component', params.component);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.cwe) searchParams.set('cwe', params.cwe);
  if (params?.epss_category) searchParams.set('epss_category', params.epss_category);
  if (params?.in_kev) searchParams.set('in_kev', params.in_kev);
  if (params?.has_poc) searchParams.set('has_poc', params.has_poc);
  if (params?.weaponized) searchParams.set('weaponized', params.weaponized);
  if (params?.ransomware) searchParams.set('ransomware', params.ransomware);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/api/cves?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch CVEs');
  return res.json();
}

export async function fetchCVEDetail(cveId: string) {
  const res = await fetch(`${API_BASE}/api/cves/${cveId}`);
  if (!res.ok) throw new Error('Failed to fetch CVE detail');
  return res.json();
}

export async function fetchComponents() {
  const res = await fetch(`${API_BASE}/api/components`);
  if (!res.ok) throw new Error('Failed to fetch components');
  return res.json();
}

export async function fetchComponentDetail(componentId: number) {
  const res = await fetch(`${API_BASE}/api/components/${componentId}`);
  if (!res.ok) throw new Error('Failed to fetch component detail');
  return res.json();
}

export async function fetchCWEStats() {
  const res = await fetch(`${API_BASE}/api/cwes`);
  if (!res.ok) throw new Error('Failed to fetch CWE stats');
  return res.json();
}

export async function fetchCWEDetail(cweId: string) {
  const res = await fetch(`${API_BASE}/api/cwes/${cweId}`);
  if (!res.ok) throw new Error('Failed to fetch CWE detail');
  return res.json();
}

export async function fetchAttackSurface() {
  const res = await fetch(`${API_BASE}/api/attack-surface`);
  if (!res.ok) throw new Error('Failed to fetch attack surface');
  return res.json();
}

export async function fetchPriorities() {
  const res = await fetch(`${API_BASE}/api/priorities`);
  if (!res.ok) throw new Error('Failed to fetch priorities');
  return res.json();
}
