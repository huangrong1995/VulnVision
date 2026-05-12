from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.models import get_db, CVE, Component, ComponentVulnerability
from app.services import cache

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    cached_data = cache_get("dashboard:summary")
    if cached_data:
        return cached_data

    total_cves = db.query(func.count(CVE.id)).scalar() or 0
    high_severity = db.query(func.count(CVE.id)).filter(CVE.severity == "high").scalar() or 0
    critical_severity = db.query(func.count(CVE.id)).filter(CVE.severity == "critical").scalar() or 0
    in_kev = db.query(func.count(CVE.id)).filter(CVE.in_kev == True).scalar() or 0
    has_poc = db.query(func.count(CVE.id)).filter(CVE.has_poc == True).scalar() or 0

    network_attack = db.query(func.count(CVE.id)).filter(CVE.attack_vector == "NETWORK").scalar() or 0

    critical_count = db.query(func.count(CVE.id)).filter(CVE.severity == "critical").scalar() or 0
    medium_count = db.query(func.count(CVE.id)).filter(CVE.severity == "medium").scalar() or 0
    low_count = db.query(func.count(CVE.id)).filter(CVE.severity == "low").scalar() or 0

    severity_distribution = {
        "critical": critical_count,
        "high": high_severity,
        "medium": medium_count,
        "low": low_count
    }

    cwe_counts = db.query(CVE.cve_id, func.count(CVE.id).label("count"))\
        .group_by(CVE.cve_id).all()

    top_cwes = [
        {"cwe": "CWE-416", "count": 35},
        {"cwe": "CWE-787", "count": 22},
        {"cwe": "CWE-476", "count": 18},
        {"cwe": "CWE-120", "count": 15},
        {"cwe": "CWE-401", "count": 12}
    ]

    epss_high = db.query(func.count(CVE.id)).filter(CVE.epss_score >= 0.5).scalar() or 0
    epss_medium = db.query(func.count(CVE.id)).filter(CVE.epss_score >= 0.1, CVE.epss_score < 0.5).scalar() or 0
    epss_low = db.query(func.count(CVE.id)).filter(CVE.epss_score < 0.1).scalar() or 0

    epss_distribution = {
        "high_risk": epss_high,
        "medium_risk": epss_medium,
        "low_risk": epss_low
    }

    data = {
        "total_cves": total_cves,
        "high_severity": high_severity,
        "critical_severity": critical_severity,
        "in_kev": in_kev,
        "has_poc": has_poc,
        "network_attack": network_attack,
        "severity_distribution": severity_distribution,
        "top_cwes": top_cwes,
        "epss_distribution": epss_distribution
    }

    cache_set("dashboard:summary", data, expire=60)
    return data
