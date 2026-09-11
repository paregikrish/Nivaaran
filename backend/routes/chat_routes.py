import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Conversation, Message
from backend.auth import get_current_user
from backend.ai_service import generate_chat_response, generate_conversation_title
from backend.schemas import (
    ConversationCreate,
    ConversationRename,
    ConversationSummary,
    ConversationDetail,
    MessageCreate,
    MessageOut
)

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


@router.get("", response_model=List[ConversationSummary])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all conversation sessions belonging to the current user."""
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )

    summaries = []
    for conv in conversations:
        last_msg = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        msg_count = db.query(Message).filter(Message.conversation_id == conv.id).count()
        
        last_preview = ""
        if last_msg:
            last_preview = last_msg.content[:80] + ("..." if len(last_msg.content) > 80 else "")

        summaries.append(
            ConversationSummary(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                message_count=msg_count,
                last_message_preview=last_preview
            )
        )
    return summaries


@router.post("", response_model=ConversationDetail, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conv_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new conversation thread."""
    conv = Conversation(
        user_id=current_user.id,
        title=conv_in.title or "New Financial Conversation"
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # If initial message provided, process it
    if conv_in.initial_message:
        user_msg = Message(
            conversation_id=conv.id,
            role="user",
            content=conv_in.initial_message
        )
        db.add(user_msg)
        db.commit()

        # Generate title
        conv.title = await generate_conversation_title(conv_in.initial_message)
        
        # Generate AI response
        ai_reply_text = await generate_chat_response([{"role": "user", "content": conv_in.initial_message}])
        ai_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content=ai_reply_text
        )
        db.add(ai_msg)
        conv.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(conv)

    return conv


@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get conversation details with all historical messages."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found."
        )
    return conv


@router.patch("/{conversation_id}", response_model=ConversationSummary)
def rename_conversation(
    conversation_id: str,
    rename_in: ConversationRename,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rename conversation title."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found."
        )
    conv.title = rename_in.title.strip()
    conv.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(conv)

    msg_count = db.query(Message).filter(Message.conversation_id == conv.id).count()
    return ConversationSummary(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        message_count=msg_count
    )


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a conversation thread and all its messages."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found."
        )
    db.delete(conv)
    db.commit()
    return None


@router.post("/{conversation_id}/messages", response_model=MessageOut)
async def send_message(
    conversation_id: str,
    msg_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a user message in a conversation and receive an AI response."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found."
        )

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=msg_in.content
    )
    db.add(user_msg)
    db.commit()

    # If first user message or default title, update title
    if conv.title in ["New Financial Conversation", "New Chat", "Welcome to Nivaaran"]:
        existing_user_msgs = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id, Message.role == "user")
            .count()
        )
        if existing_user_msgs <= 1:
            conv.title = await generate_conversation_title(msg_in.content)

    # Fetch recent message history for multi-turn context (last 12 messages)
    history_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at.asc())
        .all()
    )

    formatted_history = [
        {"role": m.role, "content": m.content}
        for m in history_messages[-12:]
    ]

    # Generate AI response
    ai_text = await generate_chat_response(formatted_history)

    # Save AI message
    ai_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=ai_text
    )
    db.add(ai_msg)
    conv.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(ai_msg)

    return ai_msg


@router.post("/{conversation_id}/regenerate", response_model=MessageOut)
async def regenerate_message(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate the last AI response in a conversation."""
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found."
        )

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at.asc())
        .all()
    )

    if not messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot regenerate on an empty conversation."
        )

    # If last message was assistant, remove it before generating new
    if messages[-1].role == "assistant":
        db.delete(messages[-1])
        db.commit()
        messages = messages[:-1]

    if not messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No user message found to regenerate response for."
        )

    formatted_history = [
        {"role": m.role, "content": m.content}
        for m in messages[-12:]
    ]

    ai_text = await generate_chat_response(formatted_history)

    new_ai_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=ai_text
    )
    db.add(new_ai_msg)
    conv.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(new_ai_msg)

    return new_ai_msg
