from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional
from app.models import get_db, CVE
from app.services import cache

router = APIRouter(prefix="/api/cves", tags=["cves"])


@router.get("")
def list_cves(
    severity: Optional[str] = None,
    attack_vector: Optional[str] = None,
    component: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(CVE)

    if severity:
        query = query.filter(CVE.severity == severity)
    if attack_vector:
        query = query.filter(CVE.attack_vector == attack_vector)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CVE.cve_id.ilike(search_term),
                CVE.title.ilike(search_term),
                CVE.description.ilike(search_term)
            )
        )

    total = query.count()

    offset = (page - 1) * limit
    cves = query.offset(offset).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "cves": [
            {
                "id": cve.cve_id,
                "severity": cve.severity,
                "risk": cve.risk,
                "attackVector": cve.attack_vector,
                "component": {
                    "name": cve.component.name if cve.component else None,
                    "version": cve.component.version if cve.component else None
                },
                "cwes": cve.cwe_references or [],
                "epssScore": cve.epss_score,
                "exploitMaturity": cve.exploit_maturity,
                "inKev": cve.in_kev,
                "detected": cve.detected.isoformat() if cve.detected else None
            }
            for cve in cves
        ]
    }


@router.get("/{cve_id}")
def get_cve_detail(cve_id: str, db: Session = Depends(get_db)):
    cache_key = f"cve:detail:{cve_id}"
    cached_data = cache_get(cache_key)
    if cached_data:
        return cached_data

    cve = db.query(CVE).filter(CVE.cve_id == cve_id).first()

    if not cve:
        return {"error": "CVE not found"}, 404

    data = {
        "id": cve.cve_id,
        "title": cve.title,
        "severity": cve.severity,
        "risk": cve.risk,
        "description": cve.description,
        "component": {
            "name": cve.component.name if cve.component else None,
            "version": cve.component.version if cve.component else None
        },
        "cwes": cve.cwe_references or [],
        "cveReferences": cve.cve_references or [],
        "epssScore": cve.epss_score,
        "epssPercentile": cve.epss_percentile,
        "exploitMaturity": cve.exploit_maturity,
        "inKev": cve.in_kev,
        "attackVector": cve.attack_vector,
        "remediation": cve.remediation,
        "detected": cve.detected.isoformat() if cve.detected else None
    }

    cache_set(cache_key, data, expire=300)
    return data
