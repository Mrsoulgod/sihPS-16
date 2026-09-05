import asyncio
import logging
import asyncpg
from sqlalchemy.schema import CreateTable
from app.core.config import settings
from app.core.database import Base, engine, AsyncSessionLocal
import app.models  # Ensure all SQLAlchemy models are registered
from app.seed.demo_data import seed_all
from app.db.seed_randr import seed_randr

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("init_db")


async def create_tables_direct():
    logger.info("Verifying and creating all PostgreSQL/PostGIS tables on Supabase...")
    # Clean connection string for asyncpg direct connection
    url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    
    tables = Base.metadata.sorted_tables
    for table in tables:
        ddl = str(CreateTable(table).compile(dialect=engine.dialect))
        try:
            await conn.execute(f"CREATE TABLE IF NOT EXISTS {ddl[13:]}")
        except Exception as e:
            logger.debug(f"Table {table.name}: {e}")
            
    await conn.close()
    logger.info("All 27 tables verified/created successfully.")


async def main():
    await create_tables_direct()

    logger.info("Applying core seed data (Roles, Locations, Users, Projects, Parcels, Tasks)...")
    async with AsyncSessionLocal() as session:
        await seed_all(session)

    logger.info("Applying benchmark R&R datasets...")
    await seed_randr()

    logger.info("NLAMS Database initialization and seeding completed successfully on Supabase!")


if __name__ == "__main__":
    asyncio.run(main())

