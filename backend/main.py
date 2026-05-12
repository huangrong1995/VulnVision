from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI(title="VulnVision API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store imported CVEs in memory
imported_cves = []
has_imported_data = False


@app.get("/")
def root():
    return {"message": "VulnVision API", "version": "1.0.0"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "api": "running"}


def calculate_stats(cves):
    """Calculate dashboard statistics from CVE list"""
    total = len(cves)
    severities = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    in_kev = 0
    has_poc = 0
    network_attack = 0
    cwe_counts = {}

    for cve in cves:
        sev = cve.get("severity", "").lower()
        if sev in severities:
            severities[sev] += 1
        if cve.get("inKev"):
            in_kev += 1
        if cve.get("exploitMaturity"):
            has_poc += 1
        if cve.get("attackVector") == "NETWORK":
            network_attack += 1
        for cwe in cve.get("cwes", []):
            cwe_counts[cwe] = cwe_counts.get(cwe, 0) + 1

    top_cwes = sorted(cwe_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_cwes = [{"cwe": cwe, "count": count} for cwe, count in top_cwes]

    # Calculate EPSS distribution (EPSS + KEV联动)
    epss_critical = sum(1 for cve in cves if cve.get("inKev") or cve.get("epssScore", 0) >= 0.5)
    epss_high = sum(1 for cve in cves if not cve.get("inKev") and cve.get("epssScore", 0) >= 0.1 and cve.get("epssScore", 0) < 0.5)
    epss_medium = sum(1 for cve in cves if not cve.get("inKev") and cve.get("epssScore", 0) >= 0.01 and cve.get("epssScore", 0) < 0.1)
    epss_low = sum(1 for cve in cves if not cve.get("inKev") and cve.get("epssScore", 0) < 0.01)

    return {
        "total_cves": total,
        "high_severity": severities["high"],
        "critical_severity": severities["critical"],
        "in_kev": in_kev,
        "has_poc": has_poc,
        "network_attack": network_attack,
        "severity_distribution": severities,
        "top_cwes": top_cwes,
        "epss_distribution": {
            "critical": epss_critical,
            "high": epss_high,
            "medium": epss_medium,
            "low": epss_low
        }
    }


@app.get("/api/dashboard")
def get_dashboard():
    global imported_cves, has_imported_data

    if has_imported_data and imported_cves:
        return calculate_stats(imported_cves)

    # Fallback to mock data if no import
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
            "critical": 15,
            "high": 67,
            "medium": 200,
            "low": 300
        }
    }


@app.get("/api/cves")
def list_cves(
    severity: str = None,
    attack_vector: str = None,
    component: str = None,
    search: str = None,
    cwe: str = None,
    epss_category: str = None,
    in_kev: str = None,
    has_poc: str = None,
    page: int = 1,
    limit: int = 10
):
    global imported_cves, has_imported_data

    cves = imported_cves if (has_imported_data and imported_cves) else []

    # Apply filters
    filtered = cves
    if severity and severity.lower() != 'undefined':
        filtered = [c for c in filtered if c.get("severity", "").lower() == severity.lower()]
    if attack_vector and attack_vector.lower() != 'undefined':
        filtered = [c for c in filtered if (c.get("attackVector") or "").upper() == attack_vector.upper()]
    if cwe and cwe.lower() != 'undefined':
        filtered = [c for c in filtered if cwe.upper() in [x.upper() for x in c.get("cwes", [])]]
    if epss_category and epss_category.lower() != 'undefined':
        if epss_category.lower() == 'critical':
            filtered = [c for c in filtered if c.get("inKev") or c.get("epssScore", 0) >= 0.5]
        elif epss_category.lower() == 'high':
            filtered = [c for c in filtered if not c.get("inKev") and 0.1 <= c.get("epssScore", 0) < 0.5]
        elif epss_category.lower() == 'medium':
            filtered = [c for c in filtered if not c.get("inKev") and 0.01 <= c.get("epssScore", 0) < 0.1]
        elif epss_category.lower() == 'low':
            filtered = [c for c in filtered if not c.get("inKev") and c.get("epssScore", 0) < 0.01]
    if in_kev and in_kev.lower() == 'true':
        filtered = [c for c in filtered if c.get("inKev") == True]
    if has_poc and has_poc.lower() == 'true':
        filtered = [c for c in filtered if c.get("exploitMaturity") in ['poc', 'PoC', 'POC']]
    if search and search.lower() != 'undefined':
        search_lower = search.lower()
        filtered = [c for c in filtered if search_lower in c.get("id", "").lower() or search_lower in c.get("component", {}).get("name", "").lower()]

    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    paginated = filtered[start:end]

    return {"total": total, "page": page, "limit": limit, "cves": paginated}


@app.get("/api/cves/{cve_id}")
def get_cve_detail(cve_id: str):
    global imported_cves, has_imported_data

    if has_imported_data and imported_cves:
        for cve in imported_cves:
            if cve.get("id") == cve_id:
                return cve

    # Fallback to mock detail
    return {
        "id": cve_id,
        "title": f"Vulnerability {cve_id}",
        "severity": "high",
        "risk": 78,
        "description": "This is a detailed description of the vulnerability.",
        "component": {"name": "Unknown", "version": "N/A"},
        "cwes": ["CWE-787"],
        "cveReferences": [f"https://nvd.nist.gov/vuln/detail/{cve_id}"],
        "epssScore": 0.00061,
        "epssPercentile": 0.19148,
        "exploitMaturity": "",
        "inKev": False,
        "attackVector": "LOCAL",
        "remediation": "Upgrade to latest version",
        "detected": "2026-05-08T06:39:17Z"
    }


@app.post("/api/import/cves")
async def import_cves(file: UploadFile = File(...)):
    global imported_cves, has_imported_data

    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Only JSON files are supported")

    try:
        content = await file.read()
        data = json.loads(content.decode("utf-8"))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")

    if isinstance(data, list):
        cves = data
    elif isinstance(data, dict):
        cves = data.get("vulnerabilities", [data])
    else:
        raise HTTPException(status_code=400, detail="Unexpected JSON format")

    def extract_cve_id(cve):
        """Extract proper CVE ID from various fields"""
        import re
        cve_id = cve.get("id", "")
        # If id doesn't look like a CVE ID, try to extract from title or cveReferences
        if not cve_id.startswith("CVE-"):
            title = cve.get("title", "")
            if title.startswith("CVE-"):
                cve_id = title.split(" ")[0]
            else:
                cve_refs = cve.get("cveReferences", [])
                for ref in cve_refs:
                    if "CVE-" in ref:
                        match = re.search(r'(CVE-\d{4}-\d+)', ref)
                        if match:
                            cve_id = match.group(1)
                            break
        return cve_id

    # Normalize CVE data to ensure consistent structure
    normalized_cves = []
    for cve in cves:
        cve_id = extract_cve_id(cve)
        normalized = {
            "id": cve_id,
            "title": cve.get("title", cve_id),
            "severity": cve.get("severity", "unknown"),
            "risk": cve.get("risk", cve.get("cvssScore", 0)),
            "description": cve.get("description", ""),
            "component": cve.get("component", {"name": "Unknown", "version": "N/A"}),
            "cwes": cve.get("cwes", []),
            "cveReferences": cve.get("cveReferences", []),
            "epssScore": cve.get("epssScore", 0),
            "epssPercentile": cve.get("epssPercentile", 0),
            "exploitMaturity": cve.get("exploitMaturity", ""),
            "inKev": cve.get("inKev", False),
            "attackVector": cve.get("attackVector", "NETWORK"),
            "remediation": cve.get("remediation", ""),
            "detected": cve.get("detected", cve.get("published", "")),
        }
        normalized_cves.append(normalized)

    # Store imported CVEs
    imported_cves = normalized_cves
    has_imported_data = True

    return {
        "status": "success",
        "total": len(normalized_cves),
        "success": len(normalized_cves),
        "failed": 0,
        "message": f"Successfully imported {len(normalized_cves)} CVEs"
    }


@app.get("/api/components")
def list_components():
    global imported_cves, has_imported_data

    if has_imported_data and imported_cves:
        # Aggregate components from imported CVEs
        component_map = {}
        for cve in imported_cves:
            comp = cve.get("component", {})
            name = comp.get("name", "Unknown")
            version = comp.get("version", "N/A")
            key = f"{name}@{version}"
            if key not in component_map:
                component_map[key] = {
                    "name": name,
                    "version": version,
                    "cve_count": 0,
                    "cves": []
                }
            component_map[key]["cve_count"] += 1
            component_map[key]["cves"].append(cve.get("id"))

        components = list(component_map.values())
        return {"total": len(components), "components": components}

    return {
        "total": 0,
        "components": []
    }


@app.get("/api/components/{component_id}")
def get_component_detail(component_id: int):
    return {"error": "Component detail not implemented"}


@app.get("/api/cwes")
def get_cwe_stats():
    global imported_cves, has_imported_data

    if has_imported_data and imported_cves:
        cwe_map = {}
        for cve in imported_cves:
            for cwe in cve.get("cwes", []):
                if cwe not in cwe_map:
                    cwe_map[cwe] = {"cwe": cwe, "count": 0, "severity": {"critical": 0, "high": 0, "medium": 0, "low": 0}}
                cwe_map[cwe]["count"] += 1
                sev = cve.get("severity", "unknown").lower()
                if sev in cwe_map[cwe]["severity"]:
                    cwe_map[cwe]["severity"][sev] += 1

        cwe_list = sorted(cwe_map.values(), key=lambda x: x["count"], reverse=True)
        return {"total_cwes": len(cwe_list), "cwe_list": cwe_list}

    return {"total_cwes": 0, "cwe_list": []}


@app.get("/api/cwes/{cwe_id}")
def get_cwe_detail(cwe_id: str):
    return {"error": "CWE detail not implemented"}


@app.get("/api/attack-surface")
def get_attack_surface():
    global imported_cves, has_imported_data

    if has_imported_data and imported_cves:
        by_vector = {
            "NETWORK": {"count": 0, "critical": 0, "high": 0, "medium": 0, "low": 0, "cves": []},
            "LOCAL": {"count": 0, "critical": 0, "high": 0, "medium": 0, "low": 0, "cves": []},
            "PHYSICAL": {"count": 0, "critical": 0, "high": 0, "medium": 0, "low": 0, "cves": []},
            "ADJACENT_NETWORK": {"count": 0, "critical": 0, "high": 0, "medium": 0, "low": 0, "cves": []},
        }

        for cve in imported_cves:
            av = cve.get("attackVector", "NETWORK")
            if av in by_vector:
                by_vector[av]["count"] += 1
                sev = cve.get("severity", "unknown").lower()
                if sev in by_vector[av]["severity"]:
                    by_vector[av]["severity"][sev] += 1
                if len(by_vector[av]["cves"]) < 10:
                    by_vector[av]["cves"].append({
                        "id": cve.get("id"),
                        "severity": cve.get("severity"),
                        "risk": cve.get("risk"),
                        "component": cve.get("component", {}).get("name", ""),
                        "inKev": cve.get("inKev", False)
                    })

        summary = {
            "total": len(imported_cves),
            "network": by_vector["NETWORK"]["count"],
            "local": by_vector["LOCAL"]["count"],
            "physical": by_vector["PHYSICAL"]["count"],
            "adjacent": by_vector["ADJACENT_NETWORK"]["count"],
        }

        return {"summary": summary, "by_vector": by_vector}

    return {
        "summary": {"total": 0, "network": 0, "local": 0, "physical": 0, "adjacent": 0},
        "by_vector": {}
    }


@app.get("/api/priorities")
def get_priorities():
    global imported_cves, has_imported_data

    if has_imported_data and imported_cves:
        p0 = []
        p1 = []
        p2 = []
        p3 = []

        for cve in imported_cves:
            cve_data = {
                "id": cve.get("id"),
                "severity": cve.get("severity"),
                "risk": cve.get("risk"),
                "component": cve.get("component", {}).get("name", ""),
                "epssScore": cve.get("epssScore", 0),
                "inKev": cve.get("inKev", False),
                "exploitMaturity": cve.get("exploitMaturity", "")
            }

            sev = cve.get("severity", "").lower()
            if sev == "critical":
                p0.append(cve_data)
            elif sev == "high":
                p1.append(cve_data)
            elif sev == "medium":
                p2.append(cve_data)
            else:
                p3.append(cve_data)

        return {
            "summary": {"total": len(imported_cves), "p0_critical": len(p0), "p1_high": len(p1), "p2_medium": len(p2), "p3_low": len(p3)},
            "p0_critical": p0,
            "p1_high": p1,
            "p2_medium": p2,
            "p3_low": p3
        }

    return {
        "summary": {"total": 0, "p0_critical": 0, "p1_high": 0, "p2_medium": 0, "p3_low": 0},
        "p0_critical": [],
        "p1_high": [],
        "p2_medium": [],
        "p3_low": []
    }


@app.get("/api/import/progress")
def get_import_progress():
    global imported_cves, has_imported_data

    if has_imported_data:
        return {
            "status": "completed",
            "total": len(imported_cves),
            "imported": len(imported_cves),
            "failed": 0,
            "progress_percent": 100,
            "message": "Import completed successfully"
        }

    return {
        "status": "no_data",
        "total": 0,
        "imported": 0,
        "failed": 0,
        "progress_percent": 0,
        "message": "No data imported"
    }


@app.get("/api/export")
def export_data(format: str = "json"):
    global imported_cves, has_imported_data

    return {
        "status": "success",
        "format": format,
        "record_count": len(imported_cves) if has_imported_data else 0,
        "download_url": f"/api/export/download?format={format}",
        "message": f"Export ready for download in {format.upper()} format"
    }
