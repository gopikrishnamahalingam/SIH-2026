from datetime import date
from pydantic import BaseModel


# -------------------------
# CHALLENGE
# -------------------------

class ChallengeCreate(BaseModel):

    title: str

    description: str

    department: str

    budget: float

    deadline: date

    expected_outcome: str


# -------------------------
# STARTUP
# -------------------------

class StartupCreate(BaseModel):

    name: str

    recognition_id: str

    industry: str

    technology: str

    description: str


# -------------------------
# APPLICATION
# -------------------------

class ApplicationCreate(BaseModel):

    startup_id: int

    challenge_id: int

    proposal: str

    proposed_cost: float


# -------------------------
# EVALUATION
# -------------------------

class EvaluationCreate(BaseModel):

    application_id: int

    innovation: float

    problem_fit: float

    scalability: float

    cost_effectiveness: float

    security: float

    team: float


# -------------------------
# PILOT
# -------------------------

class PilotCreate(BaseModel):

    application_id: int

    start_date: date

    end_date: date

    budget: float


# -------------------------
# MILESTONE
# -------------------------

class MilestoneCreate(BaseModel):

    name: str

    amount: float


# -------------------------
# KPI
# -------------------------

class KPICreate(BaseModel):

    name: str

    baseline: float

    target: float

    current: float

    unit: str