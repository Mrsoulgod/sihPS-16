"""add_phase6_randr_columns

Revision ID: 921f498c29e5
Revises: 3974f27fc3ae
Create Date: 2026-09-04 16:52:55.619267

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '921f498c29e5'
down_revision: Union[str, None] = '3974f27fc3ae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. randr_schemes updates
    op.add_column('randr_schemes', sa.Column('scheme_reference', sa.String(length=50), nullable=True))
    op.add_column('randr_schemes', sa.Column('scheme_type', sa.String(length=50), server_default='RESETTLEMENT_COLONY', nullable=False))
    op.add_column('randr_schemes', sa.Column('target_completion_date', sa.Date(), nullable=True))
    op.add_column('randr_schemes', sa.Column('approval_date', sa.Date(), nullable=True))
    op.add_column('randr_schemes', sa.Column('approved_by_user_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('randr_schemes', sa.Column('remarks', sa.Text(), nullable=True))
    op.create_unique_constraint('uq_randr_schemes_reference', 'randr_schemes', ['scheme_reference'])
    op.create_foreign_key('fk_randr_schemes_approved_by', 'randr_schemes', 'users', ['approved_by_user_id'], ['id'], ondelete='SET NULL')

    # 2. affected_families updates
    op.add_column('affected_families', sa.Column('family_reference_id', sa.String(length=50), nullable=True))
    op.add_column('affected_families', sa.Column('parcel_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('affected_families', sa.Column('land_owner_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('affected_families', sa.Column('village_name', sa.String(length=100), nullable=True))
    op.add_column('affected_families', sa.Column('displacement_category', sa.String(length=50), server_default='TITLEHOLDER_DISPLACED', nullable=False))
    op.add_column('affected_families', sa.Column('family_members_count', sa.Integer(), server_default='4', nullable=False))
    op.add_column('affected_families', sa.Column('contact_masked', sa.String(length=30), nullable=True))
    op.add_column('affected_families', sa.Column('eligibility_status', sa.String(length=30), server_default='PENDING', nullable=False))
    op.add_column('affected_families', sa.Column('eligibility_category', sa.String(length=50), nullable=True))
    op.add_column('affected_families', sa.Column('eligibility_assessment_date', sa.Date(), nullable=True))
    op.add_column('affected_families', sa.Column('assessing_authority', sa.String(length=100), nullable=True))
    op.add_column('affected_families', sa.Column('eligibility_basis', sa.Text(), nullable=True))
    op.add_column('affected_families', sa.Column('eligibility_remarks', sa.Text(), nullable=True))
    op.create_unique_constraint('uq_affected_families_reference', 'affected_families', ['family_reference_id'])
    op.create_index('ix_affected_families_parcel_id', 'affected_families', ['parcel_id'])
    op.create_index('ix_affected_families_land_owner_id', 'affected_families', ['land_owner_id'])
    op.create_index('ix_affected_families_eligibility_status', 'affected_families', ['eligibility_status'])
    op.create_foreign_key('fk_affected_families_parcel', 'affected_families', 'land_parcels', ['parcel_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_affected_families_owner', 'affected_families', 'land_owners', ['land_owner_id'], ['id'], ondelete='SET NULL')

    # 3. randr_allotments updates
    op.add_column('randr_allotments', sa.Column('scheme_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('randr_allotments', sa.Column('allotment_reference', sa.String(length=50), nullable=True))
    op.add_column('randr_allotments', sa.Column('entitlement_category', sa.String(length=50), server_default='HOUSING_RESETTLEMENT', nullable=False))
    op.add_column('randr_allotments', sa.Column('allocated_value_inr', sa.Numeric(precision=14, scale=2), server_default='0.0', nullable=False))
    op.add_column('randr_allotments', sa.Column('delivery_date', sa.Date(), nullable=True))
    op.add_column('randr_allotments', sa.Column('responsible_authority', sa.String(length=100), nullable=True))
    op.add_column('randr_allotments', sa.Column('remarks', sa.Text(), nullable=True))
    op.create_unique_constraint('uq_randr_allotments_reference', 'randr_allotments', ['allotment_reference'])
    op.create_index('ix_randr_allotments_scheme_id', 'randr_allotments', ['scheme_id'])
    op.create_foreign_key('fk_randr_allotments_scheme', 'randr_allotments', 'randr_schemes', ['scheme_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    # 3. randr_allotments
    op.drop_constraint('fk_randr_allotments_scheme', 'randr_allotments', type_='foreignkey')
    op.drop_index('ix_randr_allotments_scheme_id', table_name='randr_allotments')
    op.drop_constraint('uq_randr_allotments_reference', 'randr_allotments', type_='unique')
    op.drop_column('randr_allotments', 'remarks')
    op.drop_column('randr_allotments', 'responsible_authority')
    op.drop_column('randr_allotments', 'delivery_date')
    op.drop_column('randr_allotments', 'allocated_value_inr')
    op.drop_column('randr_allotments', 'entitlement_category')
    op.drop_column('randr_allotments', 'allotment_reference')
    op.drop_column('randr_allotments', 'scheme_id')

    # 2. affected_families
    op.drop_constraint('fk_affected_families_owner', 'affected_families', type_='foreignkey')
    op.drop_constraint('fk_affected_families_parcel', 'affected_families', type_='foreignkey')
    op.drop_index('ix_affected_families_eligibility_status', table_name='affected_families')
    op.drop_index('ix_affected_families_land_owner_id', table_name='affected_families')
    op.drop_index('ix_affected_families_parcel_id', table_name='affected_families')
    op.drop_constraint('uq_affected_families_reference', 'affected_families', type_='unique')
    op.drop_column('affected_families', 'eligibility_remarks')
    op.drop_column('affected_families', 'eligibility_basis')
    op.drop_column('affected_families', 'assessing_authority')
    op.drop_column('affected_families', 'eligibility_assessment_date')
    op.drop_column('affected_families', 'eligibility_category')
    op.drop_column('affected_families', 'eligibility_status')
    op.drop_column('affected_families', 'contact_masked')
    op.drop_column('affected_families', 'family_members_count')
    op.drop_column('affected_families', 'displacement_category')
    op.drop_column('affected_families', 'village_name')
    op.drop_column('affected_families', 'land_owner_id')
    op.drop_column('affected_families', 'parcel_id')
    op.drop_column('affected_families', 'family_reference_id')

    # 1. randr_schemes
    op.drop_constraint('fk_randr_schemes_approved_by', 'randr_schemes', type_='foreignkey')
    op.drop_constraint('uq_randr_schemes_reference', 'randr_schemes', type_='unique')
    op.drop_column('randr_schemes', 'remarks')
    op.drop_column('randr_schemes', 'approved_by_user_id')
    op.drop_column('randr_schemes', 'approval_date')
    op.drop_column('randr_schemes', 'target_completion_date')
    op.drop_column('randr_schemes', 'scheme_type')
    op.drop_column('randr_schemes', 'scheme_reference')

