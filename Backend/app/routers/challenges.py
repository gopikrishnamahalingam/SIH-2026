from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Challenge
from ..schemas import ChallengeCreate


router = APIRouter(
    prefix="/api/challenges",
    tags=["Challenges"]
)


@router.post("/")
def create_challenge(
    data: ChallengeCreate,
    db: Session = Depends(get_db)
):

    challenge = Challenge(
        title=data.title,
        description=data.description,
        department=data.department,
        budget=data.budget,
        deadline=data.deadline,
        expected_outcome=data.expected_outcome
    )

    db.add(challenge)

    db.commit()

    db.refresh(challenge)

    return challenge


@router.get("/")
def get_challenges(
    db: Session = Depends(get_db)
):

    return db.query(Challenge).all()


@router.get("/{challenge_id}")
def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Challenge).filter(
        Challenge.id == challenge_id
    ).first()