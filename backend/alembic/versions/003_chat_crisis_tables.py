"""Add chat and crisis tables

Revision ID: 003
Revises: 002
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector

revision = '003'
down_revision = '002'


def upgrade() -> None:
    # Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')

    # Chat sessions
    op.create_table(
        'chat_sessions',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('title', sa.String(100), nullable=True),
        sa.Column('session_type', sa.String(30), default='general'),
        sa.Column('context_summary', sa.Text(), nullable=True),
        sa.Column('mood_context', JSONB(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('message_count', sa.Integer(), default=0),
        sa.Column('last_message_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_chat_sessions_user_id', 'chat_sessions', ['user_id'])

    # Chat messages
    op.create_table(
        'chat_messages',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('session_id', UUID(), nullable=False),
        sa.Column('role', sa.String(10), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('model_used', sa.String(50), nullable=True),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('response_time_ms', sa.Integer(), nullable=True),
        sa.Column('crisis_detected', sa.Boolean(), default=False),
        sa.Column('content_filtered', sa.Boolean(), default=False),
        sa.Column('embedding', Vector(384), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['session_id'], ['chat_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_chat_messages_session_id', 'chat_messages', ['session_id'])

    # Crisis events
    op.create_table(
        'crisis_events',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('trigger_source', sa.String(30), nullable=False),
        sa.Column('trigger_content_hash', sa.String(64), nullable=True),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('detection_confidence', sa.Float(), nullable=True),
        sa.Column('resources_shown', JSONB(), nullable=True),
        sa.Column('resource_clicked', sa.String(50), nullable=True),
        sa.Column('hotline_called', sa.Boolean(), default=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolution_type', sa.String(30), nullable=True),
        sa.Column('follow_up_scheduled', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_crisis_events_user_id', 'crisis_events', ['user_id'])

    # Crisis resources
    op.create_table(
        'crisis_resources',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('resource_type', sa.String(30), nullable=False),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('sms_number', sa.String(20), nullable=True),
        sa.Column('website_url', sa.String(500), nullable=True),
        sa.Column('available_24_7', sa.Boolean(), default=False),
        sa.Column('available_hours', JSONB(), nullable=True),
        sa.Column('countries', JSONB(), nullable=True),
        sa.Column('languages', JSONB(), nullable=True),
        sa.Column('specializations', JSONB(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('priority', sa.SmallInteger(), default=5),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('crisis_resources')
    op.drop_table('crisis_events')
    op.drop_table('chat_messages')
    op.drop_table('chat_sessions')
