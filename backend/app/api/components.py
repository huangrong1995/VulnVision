@app.get("/api/components")
def list_components():
    """Returns mock component list for testing."""
    return {
        "total": 3,
        "components": [
            {
                "id": 1,
                "name": "Linux",
                "version": "5.15.170",
                "cve_count": 1,
                "latest_cve": "CVE-2025-40254"
            },
            {
                "id": 2,
                "name": "cURL",
                "version": "7.80.0",
                "cve_count": 1,
                "latest_cve": "CVE-2025-0725"
            },
            {
                "id": 3,
                "name": "Linux",
                "version": "5.15.170-android13-8",
                "cve_count": 1,
                "latest_cve": "CVE-2025-21927"
            }
        ]
    }


@app.get("/api/components/{component_id}")
def get_component_detail(component_id: int):
    """Returns mock component detail with related CVEs."""
    components = {
        1: {
            "id": 1,
            "name": "Linux",
            "version": "5.15.170",
            "cves": [
                {
                    "id": "CVE-2025-40254",
                    "severity": "high",
                    "risk": 78,
                    "attackVector": "LOCAL",
                    "epssScore": 0.00061,
                    "inKev": False
                }
            ]
        },
        2: {
            "id": 2,
            "name": "cURL",
            "version": "7.80.0",
            "cves": [
                {
                    "id": "CVE-2025-0725",
                    "severity": "critical",
                    "risk": 92,
                    "attackVector": "NETWORK",
                    "epssScore": 0.063,
                    "inKev": True
                }
            ]
        }
    }
    return components.get(component_id, {"error": "Component not found"})
