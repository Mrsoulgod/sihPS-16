import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath("."))

from sqlalchemy import text
from app.core.database import engine

DDL_STATEMENTS = [
    # 1. compensation_assessments extensions
    "ALTER TABLE compensation_assessments ADD COLUMN IF NOT EXISTS assessment_reference VARCHAR(100);",
    "ALTER TABLE compensation_assessments ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'APPROVED';",
    "ALTER TABLE compensation_assessments ADD COLUMN IF NOT EXISTS assessing_officer_id UUID REFERENCES users(id) ON DELETE SET NULL;",
    "ALTER TABLE compensation_assessments ADD COLUMN IF NOT EXISTS remarks TEXT;",
    "ALTER TABLE compensation_assessments ADD COLUMN IF NOT EXISTS award_id UUID REFERENCES awards(id) ON DELETE SET NULL;",
    "CREATE INDEX IF NOT EXISTS ix_compensation_assessments_ref ON compensation_assessments(assessment_reference);",
    "CREATE INDEX IF NOT EXISTS ix_compensation_assessments_status ON compensation_assessments(status);",
    "CREATE INDEX IF NOT EXISTS ix_compensation_assessments_award_id ON compensation_assessments(award_id);",

    # 2. awards extensions
    "ALTER TABLE awards ADD COLUMN IF NOT EXISTS remarks TEXT;",
    "ALTER TABLE awards ADD COLUMN IF NOT EXISTS approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;",
    "ALTER TABLE awards ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ;",

    # 3. disbursements extensions
    "ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS disbursement_reference VARCHAR(100);",
    "ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'PFMS_DBT';",
    "ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS remarks TEXT;",
    "ALTER TABLE disbursements ADD COLUMN IF NOT EXISTS processed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;",
    "CREATE INDEX IF NOT EXISTS ix_disbursements_ref ON disbursements(disbursement_reference);",

    # 4. possessions extensions
    "ALTER TABLE possessions ADD COLUMN IF NOT EXISTS possession_reference VARCHAR(100);",
    "ALTER TABLE possessions ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'TAKEN';",
    "ALTER TABLE possessions ADD COLUMN IF NOT EXISTS award_id UUID REFERENCES awards(id) ON DELETE SET NULL;",
    "ALTER TABLE possessions ADD COLUMN IF NOT EXISTS remarks TEXT;",
    "CREATE INDEX IF NOT EXISTS ix_possessions_ref ON possessions(possession_reference);",
    "CREATE INDEX IF NOT EXISTS ix_possessions_status ON possessions(status);",
]

async def apply_ddl():
    async with engine.begin() as conn:
        for stmt in DDL_STATEMENTS:
            print(f"Executing: {stmt}")
            await conn.execute(text(stmt))
    print("All Phase 5 DDL statements successfully applied.")

if __name__ == "__main__":
    asyncio.run(apply_ddl())
