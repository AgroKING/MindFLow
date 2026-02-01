"""Add mood and journal tables

Revision ID: 002
Revises: 001
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Mood logs
    op.create_table(
        'mood_logs',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('mood_score', sa.SmallInteger(), nullable=False),
        sa.Column('energy_level', sa.SmallInteger(), nullable=True),
        sa.Column('anxiety_level', sa.SmallInteger(), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('note_sentiment', sa.Float(), nullable=True),
        sa.Column('logged_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('time_of_day', sa.String(20), nullable=True),
        sa.Column('day_of_week', sa.SmallInteger(), nullable=True),
        sa.Column('location_type', sa.String(30), nullable=True),
        sa.Column('processed_for_insights', sa.Boolean(), default=False),
        sa.Column('crisis_flag_triggered', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_mood_logs_user_id', 'mood_logs', ['user_id'])

    # Mood factors
    op.create_table(
        'mood_factors',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('mood_log_id', UUID(), nullable=False),
        sa.Column('factor_type', sa.String(30), nullable=False),
        sa.Column('factor_value', sa.String(50), nullable=True),
        sa.Column('impact_score', sa.SmallInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['mood_log_id'], ['mood_logs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # Journal entries
    op.create_table(
        'journal_entries',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('content_encrypted', sa.LargeBinary(), nullable=False),
        sa.Column('content_iv', sa.LargeBinary(), nullable=False),
        sa.Column('content_hash', sa.String(64), nullable=True),
        sa.Column('word_count', sa.Integer(), nullable=True),
        sa.Column('entry_type', sa.String(20), default='freeform'),
        sa.Column('prompt_id', UUID(), nullable=True),
        sa.Column('sentiment_score', sa.Float(), nullable=True),
        sa.Column('primary_emotion', sa.String(30), nullable=True),
        sa.Column('topics', JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_journal_entries_user_id', 'journal_entries', ['user_id'])


def downgrade() -> None:
    op.drop_table('journal_entries')
    op.drop_table('mood_factors')
    op.drop_table('mood_logs')
