from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models import PublicResource
from backend.schemas import PublicResourceOut

router = APIRouter(prefix="/api/resources", tags=["Public Resources"])


@router.get("", response_model=List[PublicResourceOut])
def get_public_resources(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search keyword in title, description or eligibility"),
    db: Session = Depends(get_db)
):
    """Retrieve verified financial inclusion public schemes, helplines, and resources."""
    query = db.query(PublicResource).filter(PublicResource.verified == True)

    if category and category != "All":
        query = query.filter(PublicResource.category == category)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PublicResource.title.ilike(search_filter),
                PublicResource.description.ilike(search_filter),
                PublicResource.eligibility.ilike(search_filter)
            )
        )

    return query.order_by(PublicResource.category.asc(), PublicResource.title.asc()).all()


@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    """Get list of all distinct resource categories."""
    categories = db.query(PublicResource.category).distinct().all()
    return [c[0] for c in categories if c[0]]
