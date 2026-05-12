@app.get("/api/priorities")
def get_priorities():
    """Returns mock priority/triage data."""
    return {
        "summary": {
            "total": 582,
            "p0_critical": 12,
            "p1_high": 45,
            "p2_medium": 156,
            "p3_low": 369
        },
        "p0_critical": [
            {"id": "CVE-2025-0725", "severity": "critical", "risk": 92, "component": "cURL", "epssScore": 0.063, "inKev": True, "exploitMaturity": "poc"},
            {"id": "CVE-2025-9999", "severity": "critical", "risk": 95, "component": "OpenSSL", "epssScore": 0.089, "inKev": True, "exploitMaturity": "poc"}
        ],
        "p1_high": [
            {"id": "CVE-2025-40254", "severity": "high", "risk": 78, "component": "Linux", "epssScore": 0.00061, "inKev": False, "exploitMaturity": ""},
            {"id": "CVE-2025-21927", "severity": "high", "risk": 75, "component": "Linux", "epssScore": 0.00061, "inKev": False, "exploitMaturity": ""}
        ],
        "p2_medium": [
            {"id": "CVE-2025-1111", "severity": "medium", "risk": 55, "component": "nginx", "epssScore": 0.001, "inKev": False, "exploitMaturity": ""}
        ],
        "p3_low": [
            {"id": "CVE-2025-2222", "severity": "low", "risk": 25, "component": "curl", "epssScore": 0.0001, "inKev": False, "exploitMaturity": ""}
        ]
    }
