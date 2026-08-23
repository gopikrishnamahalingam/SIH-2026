from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Application
from ..schemas import ApplicationCreate


router = APIRouter(
    prefix="/api/applications",
    tags=["Applications"]
)


@router.post("/")
def create_application(
    data: ApplicationCreate,
    db: Session = Depends(get_db)
):

    application = Application(
        startup_id=data.startup_id,
        challenge_id=data.challenge_id,
        proposal=data.proposal,
        proposed_cost=data.proposed_cost
    )

    db.add(application)

    db.commit()

    db.refresh(application)

    return application


@router.get("/{application_id}")
def get_application(
    application_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Application).filter(
        Application.id == application_id
    ).first()


@router.get("/challenge/{challenge_id}")
def get_applications_for_challenge(
    challenge_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Application).filter(
        Application.challenge_id == challenge_id
    ).all()