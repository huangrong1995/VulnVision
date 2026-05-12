import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator


class ComponentData(BaseModel):
    name: str
    version: Optional[str] = None
    path: Optional[str] = None


class CVEParserData(BaseModel):
    cveId: str
    title: Optional[str] = None
    severity: Optional[str] = None
    risk: Optional[int] = None
    description: Optional[str] = None
    component: Optional[ComponentData] = None
    cwes: List[str] = Field(default_factory=list)
    cveReferences: List[str] = Field(default_factory=list)
    epssScore: Optional[float] = None
    epssPercentile: Optional[float] = None
    exploitMaturity: Optional[str] = None
    inKev: bool = False
    hasPoc: bool = False
    attackVector: Optional[str] = None
    findingId: Optional[str] = None
    remediation: Optional[str] = None
    detected: Optional[str] = None

    @validator("severity")
    def validate_severity(cls, v):
        if v and v.lower() in ["critical", "high", "medium", "low"]:
            return v.lower()
        return v

    @validator("attackVector")
    def validate_attack_vector(cls, v):
        if v and v.upper() in ["NETWORK", "LOCAL", "PHYSICAL", "ADJACENT_NETWORK"]:
            return v.upper()
        return v


class CVEImportResult(BaseModel):
    total: int
    success: int
    failed: int
    errors: List[str] = Field(default_factory=list)
    imported_cves: List[str] = Field(default_factory=list)


class JSONParser:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def parse(self) -> List[CVEParserData]:
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except UnicodeDecodeError:
            with open(self.file_path, "r", encoding="latin-1") as f:
                data = json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {self.file_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format: {e}")

        if isinstance(data, list):
            return self._parse_cve_list(data)
        elif isinstance(data, dict):
            return self._parse_cve_dict(data)
        else:
            raise ValueError("Unexpected JSON format. Expected list or dict.")

    def _parse_cve_list(self, data: List[Dict]) -> List[CVEParserData]:
        cves = []
        for i, item in enumerate(data):
            try:
                cve = self._parse_single_cve(item)
                cves.append(cve)
            except Exception as e:
                self.errors.append(f"Index {i}: {str(e)}")
        return cves

    def _parse_cve_dict(self, data: Dict) -> List[CVEParserData]:
        cves = []
        vulnerabilities = data.get("vulnerabilities", [])
        if isinstance(vulnerabilities, list):
            for i, item in enumerate(vulnerabilities):
                try:
                    cve = self._parse_single_cve(item)
                    cves.append(cve)
                except Exception as e:
                    self.errors.append(f"Index {i}: {str(e)}")
        return cves

    def _parse_single_cve(self, item: Dict) -> CVEParserData:
        component_data = None
        if "component" in item:
            comp = item["component"]
            if isinstance(comp, dict):
                component_data = ComponentData(
                    name=comp.get("name", "unknown"),
                    version=comp.get("version"),
                    path=comp.get("path")
                )
            elif isinstance(comp, str):
                component_data = ComponentData(name=comp)
            else:
                component_data = ComponentData(name="unknown")
        elif "componentName" in item:
            component_data = ComponentData(
                name=item.get("componentName", "unknown"),
                version=item.get("componentVersion")
            )

        detected = item.get("detected")
        if detected and isinstance(detected, str) and "T" in detected:
            detected = detected.split("T")[0]

        cwe_refs = item.get("cweReferences", [])
        if isinstance(cwe_refs, str):
            cwe_refs = [cwe_refs]
        elif not isinstance(cwe_refs, list):
            cwe_refs = []

        cve_references = item.get("cveReferences", [])
        if isinstance(cve_references, str):
            cve_references = [cve_references]
        elif not isinstance(cve_references, list):
            cve_references = []

        severity = item.get("severity", item.get("severityLevel", ""))
        if isinstance(severity, int):
            severity_map = {10: "critical", 7: "high", 4: "medium", 0: "low"}
            severity = severity_map.get(severity, str(severity))

        return CVEParserData(
            cveId=item.get("cveId", item.get("cve_id", "")),
            title=item.get("title"),
            severity=severity,
            risk=item.get("risk"),
            description=item.get("description"),
            component=component_data,
            cwes=cwe_refs,
            cveReferences=cve_references,
            epssScore=item.get("epssScore", item.get("epss_score")),
            epssPercentile=item.get("epssPercentile", item.get("epss_percentile")),
            exploitMaturity=item.get("exploitMaturity", item.get("exploit_maturity")),
            inKev=item.get("inKev", item.get("in_kev", False)),
            hasPoc=item.get("hasPoc", item.get("has_poc", False)),
            attackVector=item.get("attackVector", item.get("attack_vector")),
            findingId=item.get("findingId", item.get("finding_id")),
            remediation=item.get("remediation"),
            detected=detected
        )

    def validate(self, cves: List[CVEParserData]) -> CVEImportResult:
        imported = []
        errors = []

        for cve in cves:
            if not cve.cveId:
                errors.append("Missing CVE ID")
                continue
            if not cve.component:
                errors.append(f"{cve.cveId}: Missing component")
                continue
            imported.append(cve.cveId)

        return CVEImportResult(
            total=len(cves) + len(errors),
            success=len(imported),
            failed=len(errors),
            errors=errors,
            imported_cves=imported
        )


def parse_cve_file(file_path: str) -> List[CVEParserData]:
    parser = JSONParser(file_path)
    return parser.parse()


def validate_cve_data(cves: List[CVEParserData]) -> CVEImportResult:
    parser = JSONParser("")
    return parser.validate(cves)
