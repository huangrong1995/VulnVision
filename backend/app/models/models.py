from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.database import Base


class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    version = Column(String(100), nullable=False)
    path = Column(Text, nullable=True)
    project_version_id = Column(Integer, ForeignKey("project_versions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    cves = relationship("CVE", back_populates="component", lazy="dynamic")
    vulnerabilities = relationship("ComponentVulnerability", back_populates="component", lazy="dynamic")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    project_type = Column(String(50), default="FIRMWARE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    versions = relationship("ProjectVersion", back_populates="project", lazy="dynamic", cascade="all, delete-orphan")


class ProjectVersion(Base):
    __tablename__ = "project_versions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    version = Column(String(100), nullable=False)
    release_type = Column(String(20), default="RELEASE")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="versions")
    components = relationship("Component", back_populates="project_version", lazy="dynamic")


class CVE(Base):
    __tablename__ = "cves"

    id = Column(Integer, primary_key=True, index=True)
    cve_id = Column(String(50), nullable=False, unique=True, index=True)
    title = Column(String(500), nullable=True)
    severity = Column(String(20), nullable=True, index=True)
    risk = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    attack_vector = Column(String(20), nullable=True, index=True)
    epss_score = Column(Float, nullable=True)
    epss_percentile = Column(Float, nullable=True)
    exploit_maturity = Column(String(50), nullable=True)
    in_kev = Column(Boolean, default=False)
    has_poc = Column(Boolean, default=False)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=True)
    finding_id = Column(String(100), nullable=True, index=True)
    remediated = Column(Boolean, default=False)
    remediation = Column(Text, nullable=True)
    cwe_references = Column(JSON, nullable=True)
    cve_references = Column(JSON, nullable=True)
    detected = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    component = relationship("Component", back_populates="cves")
    cwe_links = relationship("CWELink", back_populates="cve", lazy="dynamic", cascade="all, delete-orphan")


class CWELink(Base):
    __tablename__ = "cwe_links"

    id = Column(Integer, primary_key=True, index=True)
    cve_id = Column(Integer, ForeignKey("cves.id"), nullable=False)
    cwe = Column(String(20), nullable=False, index=True)

    cve = relationship("CVE", back_populates="cwe_links")


class ComponentVulnerability(Base):
    __tablename__ = "component_vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=False)
    cve_id = Column(Integer, ForeignKey("cves.id"), nullable=False)
    severity = Column(String(20), nullable=True)
    risk = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    component = relationship("Component", back_populates="vulnerabilities")
    cve = relationship("CVE")
