from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import json
from app.parsers import parse_cve_file, validate_cve_data, CVEParserData

router = APIRouter(prefix="/api/import", tags=["import"])


@router.post("/cves")
async def import_cves(file: UploadFile = File(...)):
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Only JSON files are supported")

    try:
        content = await file.read()

        try:
            data = json.loads(content.decode("utf-8"))
        except UnicodeDecodeError:
            data = json.loads(content.decode("latin-1"))
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON format: {e}")

        if isinstance(data, list):
            cves = data
        elif isinstance(data, dict):
            cves = data.get("vulnerabilities", [data])
        else:
            raise HTTPException(status_code=400, detail="Unexpected JSON format")

        validated = validate_cve_data(cves)

        return {
            "status": "success",
            "total": validated.total,
            "success": validated.success,
            "failed": validated.failed,
            "imported_cves": validated.imported_cves[:50],
            "message": f"Validated {validated.success} CVEs successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/validate")
def validate_sample():
    sample_data = [
        {
            "cveId": "CVE-2025-1234",
            "title": "Test Vulnerability",
            "severity": "high",
            "risk": 85,
            "component": {"name": "openssl", "version": "1.0.0"},
            "cwes": ["CWE-787"],
            "epssScore": 0.045,
            "attackVector": "NETWORK"
        }
    ]

    validated = validate_cve_data(sample_data)

    return {
        "status": "success",
        "total": validated.total,
        "success": validated.success,
        "failed": validated.failed,
        "message": "Sample data validation passed"
    }
