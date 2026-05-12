from datetime import datetime

MOCK_CVES = [
    {
        "id": "CVE-2025-40254",
        "severity": "high",
        "risk": 78,
        "attackVector": "LOCAL",
        "component": {"name": "Linux", "version": "5.15.170"},
        "cwes": ["CWE-787"],
        "epssScore": 0.00061,
        "exploitMaturity": "",
        "inKev": False,
        "detected": "2026-05-08T06:39:17Z"
    },
    {
        "id": "CVE-2025-0725",
        "severity": "critical",
        "risk": 92,
        "attackVector": "NETWORK",
        "component": {"name": "cURL", "version": "7.80.0"},
        "cwes": ["CWE-416"],
        "epssScore": 0.063,
        "exploitMaturity": "poc",
        "inKev": True,
        "detected": "2026-05-07T12:00:00Z"
    },
    {
        "id": "CVE-2025-21927",
        "severity": "high",
        "risk": 75,
        "attackVector": "LOCAL",
        "component": {"name": "Linux", "version": "5.15.170-android13-8"},
        "cwes": ["CWE-787"],
        "epssScore": 0.00061,
        "exploitMaturity": "",
        "inKev": False,
        "detected": "2026-05-06T08:20:00Z"
    }
]


def get_mock_cves():
    return MOCK_CVES


def get_mock_cve_detail(cve_id: str):
    for cve in MOCK_CVES:
        if cve["id"] == cve_id:
            return {
                "id": cve_id,
                "title": f"Vulnerability {cve_id}",
                "severity": cve["severity"],
                "risk": cve["risk"],
                "description": "This is a detailed description of the vulnerability.",
                "component": cve["component"],
                "cwes": cve["cwes"],
                "cveReferences": [f"https://nvd.nist.gov/vuln/detail/{cve_id}"],
                "epssScore": cve["epssScore"],
                "epssPercentile": 0.19148,
                "exploitMaturity": cve["exploitMaturity"],
                "inKev": cve["inKev"],
                "attackVector": cve["attackVector"],
                "remediation": "Upgrade to latest version",
                "detected": cve["detected"]
            }
    return None


def get_mock_dashboard():
    return {
        "total_cves": 582,
        "high_severity": 45,
        "critical_severity": 12,
        "in_kev": 3,
        "has_poc": 8,
        "network_attack": 23,
        "severity_distribution": {
            "critical": 12,
            "high": 45,
            "medium": 156,
            "low": 369
        },
        "top_cwes": [
            {"cwe": "CWE-416", "count": 35},
            {"cwe": "CWE-787", "count": 22},
            {"cwe": "CWE-476", "count": 18},
            {"cwe": "CWE-120", "count": 15},
            {"cwe": "CWE-401", "count": 12}
        ],
        "epss_distribution": {
            "high_risk": 15,
            "medium_risk": 67,
            "low_risk": 500
        }
    }
