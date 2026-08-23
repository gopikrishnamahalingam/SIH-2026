from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Pilot, Milestone, KPI
from ..schemas import (
    PilotCreate,
    MilestoneCreate,
    KPICreate
)


router = APIRouter(
    prefix="/api/pilots",
    tags=["Pilots"]
)


@router.post("/")
def create_pilot(
    data: PilotCreate,
    db: Session = Depends(get_db)
):

    pilot = Pilot(
        application_id=data.application_id,
        start_date=data.start_date,
        end_date=data.end_date,
        budget=data.budget
    )

    db.add(pilot)

    db.commit()

    db.refresh(pilot)

    return pilot


@router.post("/{pilot_id}/milestones")
def create_milestone(
    pilot_id: int,
    data: MilestoneCreate,
    db: Session = Depends(get_db)
):

    milestone = Milestone(
        pilot_id=pilot_id,
        name=data.name,
        amount=data.amount
    )

    db.add(milestone)

    db.commit()

    db.refresh(milestone)

    return milestone


@router.post("/{pilot_id}/kpis")
def create_kpi(
    pilot_id: int,
    data: KPICreate,
    db: Session = Depends(get_db)
):

    kpi = KPI(
        pilot_id=pilot_id,
        name=data.name,
        baseline=data.baseline,
        target=data.target,
        current=data.current,
        unit=data.unit
    )

    db.add(kpi)

    db.commit()

    db.refresh(kpi)

    return kpi


@router.get("/{pilot_id}")
def get_pilot(
    pilot_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Pilot).filter(
        Pilot.id == pilot_id
    ).first()