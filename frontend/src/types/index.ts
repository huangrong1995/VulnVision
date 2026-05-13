export interface DashboardData {
  total_cves: number;
  high_severity: number;
  critical_severity: number;
  in_kev: number;
  has_poc: number;
  is_weaponized: number;
  is_ransomware: number;
  network_attack: number;
  severity_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  top_cwes: Array<{ cwe: string; count: number }>;
  epss_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface CVE {
  id: string;
  _uid?: string;
  title?: string;
  severity: string;
  risk: number;
  description?: string;
  attackVector: string;
  component: {
    name: string;
    version: string;
  };
  cwes: string[];
  cveReferences?: string[];
  epssScore: number;
  epssPercentile?: number;
  exploitMaturity: string;
  inKev: boolean;
  hasPoc?: boolean;
  findingId?: string;
  remediation?: string;
  detected: string;
}

export interface CVEListResponse {
  total: number;
  page: number;
  limit: number;
  cves: CVE[];
}
