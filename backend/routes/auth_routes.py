from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Conversation, Message
from backend.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from backend.schemas import UserRegister, UserLogin, AuthResponse, UserOut

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account with hashed credentials."""
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Hash password & create user
    hashed_password = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name.strip(),
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create an initial welcome conversation session for the new user
    welcome_conv = Conversation(
        user_id=user.id,
        title="Welcome to Nivaaran"
    )
    db.add(welcome_conv)
    db.commit()
    db.refresh(welcome_conv)

    welcome_msg = Message(
        conversation_id=welcome_conv.id,
        role="assistant",
        content=(
            "### 🙏 Namaste and Welcome to Nivaaran!\n\n"
            "I am your personal **Financial Inclusion Assistant**, dedicated to helping you make smart, safe, and confident financial decisions for you and your family.\n\n"
            "Here are some ways we can work together:\n"
            "- 📊 **Plan a Budget**: Build a realistic 50/30/20 plan for your monthly earnings.\n"
            "- 🛡️ **Scam & UPI Safety**: Learn how to protect your hard-earned money and spot online fraud.\n"
            "- 🏛️ **Government Welfare Schemes**: Explore zero-balance accounts (PMJDY), ₹20/year accident insurance (PMSBY), and Atal Pension (APY).\n"
            "- 💳 **Manage Debt**: Create a step-by-step strategy to eliminate high-interest loans.\n\n"
            "*How would you like to begin today? You can ask any question or select one of the suggested topics below.*"
        )
    )
    db.add(welcome_msg)
    db.commit()

    # Generate JWT token
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return AuthResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return AuthResponse(access_token=access_token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the profile of currently authenticated user."""
    return UserOut.model_validate(current_user)
