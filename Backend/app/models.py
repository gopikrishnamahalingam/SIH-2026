from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Date,
    ForeignKey
)

from sqlalchemy.orm import relationship

from .database import Base


# -------------------------
# STARTUP
# -------------------------

class Startup(Base):

    __tablename__ = "startups"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(200), nullable=False)

    recognition_id = Column(String(100))

    industry = Column(String(100))

    technology = Column(String(200))

    description = Column(Text)

    applications = relationship(
        "Application",
        back_populates="startup"
    )


# -------------------------
# CHALLENGE
# -------------------------

class Challenge(Base):

    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(300), nullable=False)

    description = Column(Text, nullable=False)

    department = Column(String(200))

    budget = Column(Float)

    deadline = Column(Date)

    expected_outcome = Column(Text)

    status = Column(
        String(50),
        default="OPEN"
    )

    applications = relationship(
        "Application",
        back_populates="challenge"
    )


# -------------------------
# APPLICATION
# -------------------------

class Application(Base):

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True)

    startup_id = Column(
        Integer,
        ForeignKey("startups.id")
    )

    challenge_id = Column(
        Integer,
        ForeignKey("challenges.id")
    )

    proposal = Column(Text)

    proposed_cost = Column(Float)

    status = Column(
        String(50),
        default="SUBMITTED"
    )

    startup = relationship(
        "Startup",
        back_populates="applications"
    )

    challenge = relationship(
        "Challenge",
        back_populates="applications"
    )


# -------------------------
# EVALUATION
# -------------------------

class Evaluation(Base):

    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True)

    application_id = Column(
        Integer,
        ForeignKey("applications.id")
    )

    innovation = Column(Float, default=0)

    problem_fit = Column(Float, default=0)

    scalability = Column(Float, default=0)

    cost_effectiveness = Column(Float, default=0)

    security = Column(Float, default=0)

    team = Column(Float, default=0)

    total_score = Column(Float, default=0)


# -------------------------
# PILOT
# -------------------------

class Pilot(Base):

    __tablename__ = "pilots"

    id = Column(Integer, primary_key=True)

    application_id = Column(
        Integer,
        ForeignKey("applications.id")
    )

    start_date = Column(Date)

    end_date = Column(Date)

    budget = Column(Float)

    status = Column(
        String(50),
        default="PLANNED"
    )

    milestones = relationship(
        "Milestone",
        back_populates="pilot"
    )

    kpis = relationship(
        "KPI",
        back_populates="pilot"
    )


# -------------------------
# MILESTONE
# -------------------------

class Milestone(Base):

    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True)

    pilot_id = Column(
        Integer,
        ForeignKey("pilots.id")
    )

    name = Column(String(200))

    amount = Column(Float)

    status = Column(
        String(50),
        default="PENDING"
    )

    pilot = relationship(
        "Pilot",
        back_populates="milestones"
    )


# -------------------------
# KPI
# -------------------------

class KPI(Base):

    __tablename__ = "kpis"

    id = Column(Integer, primary_key=True)

    pilot_id = Column(
        Integer,
        ForeignKey("pilots.id")
    )

    name = Column(String(200))

    baseline = Column(Float)

    target = Column(Float)

    current = Column(Float)

    unit = Column(String(50))

    pilot = relationship(
        "Pilot",
        back_populates="kpis"
    )