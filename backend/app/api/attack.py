@app.get("/api/attack-surface")
def get_attack_surface():
    """Returns mock attack surface statistics."""
    return {
        "summary": {
            "total": 582,
            "network": 23,
            "local": 45,
            "physical": 3,
            "adjacent": 12
        },
        "by_vector": {
            "NETWORK": {
                "count": 23,
                "critical": 5,
                "high": 12,
                "medium": 4,
                "low": 2,
                "cves": [
                    {"id": "CVE-2025-0725", "severity": "critical", "risk": 92, "component": "cURL", "inKev": True},
                    {"id": "CVE-2025-9999", "severity": "high", "risk": 85, "component": "OpenSSL", "inKev": False}
                ]
            },
            "LOCAL": {
                "count": 45,
                "critical": 3,
                "high": 20,
                "medium": 15,
                "low": 7,
                "cves": [
                    {"id": "CVE-2025-40254", "severity": "high", "risk": 78, "component": "Linux", "inKev": False}
                ]
            },
            "PHYSICAL": {
                "count": 3,
                "critical": 1,
                "high": 1,
                "medium": 1,
                "low": 0,
                "cves": []
            },
            "ADJACENT_NETWORK": {
                "count": 12,
                "critical": 2,
                "high": 5,
                "medium": 3,
                "low": 2,
                "cves": []
            }
        }
    }
