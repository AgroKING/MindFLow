"""Add insights, recommendations, and content library tables

Revision ID: 004
Revises: 003
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '004'
down_revision = '003'


def upgrade() -> None:
    # Content library
    op.create_table(
        'content_library',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('content_type', sa.String(30), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('content_body', sa.Text(), nullable=True),
        sa.Column('duration_minutes', sa.SmallInteger(), nullable=True),
        sa.Column('difficulty', sa.String(20), nullable=True),
        sa.Column('instructions', JSONB(), nullable=True),
        sa.Column('target_moods', JSONB(), nullable=True),
        sa.Column('target_factors', JSONB(), nullable=True),
        sa.Column('audio_url', sa.String(500), nullable=True),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('is_premium', sa.Boolean(), default=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('view_count', sa.Integer(), default=0),
        sa.Column('avg_rating', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )

    # User insights
    op.create_table(
        'user_insights',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('insight_type', sa.String(30), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('data_points', JSONB(), nullable=True),
        sa.Column('data_visualization', JSONB(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('shown_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('dismissed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('helpful_rating', sa.SmallInteger(), nullable=True),
        sa.Column('valid_from', sa.DateTime(timezone=True), nullable=False),
        sa.Column('valid_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_user_insights_user_id', 'user_insights', ['user_id'])

    # Recommendations
    op.create_table(
        'recommendations',
        sa.Column('id', UUID(), nullable=False),
        sa.Column('user_id', UUID(), nullable=False),
        sa.Column('insight_id', UUID(), nullable=True),
        sa.Column('content_id', UUID(), nullable=False),
        sa.Column('reason', sa.String(500), nullable=True),
        sa.Column('priority', sa.SmallInteger(), default=5),
        sa.Column('shown_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('clicked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('feedback', sa.String(20), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['insight_id'], ['user_insights.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['content_id'], ['content_library.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_recommendations_user_id', 'recommendations', ['user_id'])


def downgrade() -> None:
    op.drop_table('recommendations')
    op.drop_table('user_insights')
    op.drop_table('content_library')
