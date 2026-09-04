import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath("."))

from sqlalchemy import text
from app.core.database import engine

DDL_STATEMENTS = [
    # ProjectStage extensions
    "ALTER TABLE project_stages ADD COLUMN IF NOT EXISTS assigned_role VARCHAR(36) REFERENCES roles(id) ON DELETE SET NULL;",
    "ALTER TABLE project_stages ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL;",
    "ALTER TABLE project_stages ADD COLUMN IF NOT EXISTS due_date DATE;",
    "ALTER TABLE project_stages ADD COLUMN IF NOT EXISTS comments TEXT;",
    "ALTER TABLE project_stages ADD COLUMN IF NOT EXISTS rejection_reason TEXT;",
    "ALTER TABLE project_stages ADD COLUMN IF NOT EXISTS required_documents JSONB;",
    
    # StageTransitionHistory extensions
    "ALTER TABLE stage_transition_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();",
    
    # Alert extensions
    "ALTER TABLE alerts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();",
    
    # WorkflowTask extensions
    "ALTER TABLE workflow_tasks ADD COLUMN IF NOT EXISTS parcel_id UUID REFERENCES land_parcels(id) ON DELETE CASCADE;",
    "ALTER TABLE workflow_tasks ADD COLUMN IF NOT EXISTS title VARCHAR(200);",
    "ALTER TABLE workflow_tasks ADD COLUMN IF NOT EXISTS description TEXT;",
    "ALTER TABLE workflow_tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();",
]

async def apply_ddl():
    async with engine.begin() as conn:
        for stmt in DDL_STATEMENTS:
            print(f"Executing: {stmt}")
            await conn.execute(text(stmt))
    print("All Phase 4 DDL statements successfully applied.")

if __name__ == "__main__":
    asyncio.run(apply_ddl())
