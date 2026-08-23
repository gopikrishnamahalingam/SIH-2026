from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Startup
from ..schemas import StartupCreate


router = APIRouter(
    prefix="/api/startups",
    tags=["Startups"]
)


@router.post("/")
def create_startup(
    data: StartupCreate,
    db: Session = Depends(get_db)
):

    startup = Startup(
        name=data.name,
        recognition_id=data.recognition_id,
        industry=data.industry,
        technology=data.technology,
        description=data.description
    )

    db.add(startup)

    db.commit()

    db.refresh(startup)

    return startup


@router.get("/")
def get_startups(
    db: Session = Depends(get_db)
):

    return db.query(Startup).all()


@router.get("/{startup_id}")
def get_startup(
    startup_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Startup).filter(
        Startup.id == startup_id
    ).first()