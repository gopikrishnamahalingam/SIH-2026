from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Evaluation
from ..schemas import EvaluationCreate


router = APIRouter(
    prefix="/api/evaluations",
    tags=["Evaluations"]
)


@router.post("/")
def evaluate_application(
    data: EvaluationCreate,
    db: Session = Depends(get_db)
):

    total = (
        data.innovation
        + data.problem_fit
        + data.scalability
        + data.cost_effectiveness
        + data.security
        + data.team
    )

    evaluation = Evaluation(
        application_id=data.application_id,
        innovation=data.innovation,
        problem_fit=data.problem_fit,
        scalability=data.scalability,
        cost_effectiveness=data.cost_effectiveness,
        security=data.security,
        team=data.team,
        total_score=total
    )

    db.add(evaluation)

    db.commit()

    db.refresh(evaluation)

    return evaluation