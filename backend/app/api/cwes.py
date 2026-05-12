@app.get("/api/cwes")
def get_cwe_stats():
    """Returns mock CWE statistics for testing."""
    return {
        "total_cwes": 10,
        "cwe_list": [
            {"cwe": "CWE-416", "count": 35, "severity": {"critical": 8, "high": 15, "medium": 10, "low": 2}},
            {"cwe": "CWE-787", "count": 22, "severity": {"critical": 3, "high": 12, "medium": 5, "low": 2}},
            {"cwe": "CWE-476", "count": 18, "severity": {"critical": 2, "high": 8, "medium": 6, "low": 2}},
            {"cwe": "CWE-120", "count": 15, "severity": {"critical": 5, "high": 6, "medium": 3, "low": 1}},
            {"cwe": "CWE-401", "count": 12, "severity": {"critical": 1, "high": 5, "medium": 4, "low": 2}},
            {"cwe": "CWE-190", "count": 8, "severity": {"critical": 2, "high": 3, "medium": 2, "low": 1}},
            {"cwe": "CWE-othe", "count": 6, "severity": {"critical": 1, "high": 2, "medium": 2, "low": 1}},
            {"cwe": "CWE-77", "count": 4, "severity": {"critical": 0, "high": 2, "medium": 1, "low": 1}},
            {"cwe": "CWE-89", "count": 3, "severity": {"critical": 1, "high": 1, "medium": 1, "low": 0}},
            {"cwe": "CWE-94", "count": 2, "severity": {"critical": 0, "high": 1, "medium": 1, "low": 0}}
        ]
    }


@app.get("/api/cwes/{cwe_id}")
def get_cwe_detail(cwe_id: str):
    """Returns mock CWE detail with related CVEs."""
    cwe_data = {
        "CWE-416": {
            "cwe": "CWE-416",
            "name": "Use After Free",
            "description": "The program reclaims or attempts to reclaim memory previously allocated and freed.",
            "cves": [
                {"id": "CVE-2025-0725", "severity": "critical", "risk": 92, "component": "cURL", "epssScore": 0.063},
                {"id": "CVE-2025-1234", "severity": "high", "risk": 80, "component": "Linux", "epssScore": 0.045}
            ]
        },
        "CWE-787": {
            "cwe": "CWE-787",
            "name": "Out-of-bounds Write",
            "description": "The software writes data past the end or before the beginning of the intended buffer.",
            "cves": [
                {"id": "CVE-2025-40254", "severity": "high", "risk": 78, "component": "Linux", "epssScore": 0.00061}
            ]
        }
    }
    return cwe_data.get(cwe_id, {"error": "CWE not found"})
