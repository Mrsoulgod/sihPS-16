import asyncio
import asyncpg
import json

async def check_reconciliation():
    conn = await asyncpg.connect('postgresql://postgres:postgrespassword@127.0.0.1:5432/nlams')
    
    # 1. Flagship Project info
    project = await conn.fetchrow("""
        SELECT id, code, name, state_id, district_id, status, total_land_required_ha, total_land_acquired_ha, estimated_budget_inr, disbursed_amount_inr
        FROM projects WHERE code = 'PRJ-NH48-DJE' OR code LIKE '%DJE%' OR id = 'PRJ-NH48-DJE' LIMIT 1;
    """)
    if not project:
        project = await conn.fetchrow("SELECT * FROM projects LIMIT 1;")
    print('=== FLAGSHIP PROJECT ===')
    print(dict(project))
    pid = str(project['id'])
    
    # 2. Land parcels
    parcels = await conn.fetch("SELECT status, count(*) as count, sum(area_ha) as total_ha FROM land_parcels WHERE project_id = $1 GROUP BY status;", pid)
    print('\n=== PARCELS BY STATUS ===')
    for p in parcels:
        print(dict(p))
        
    # 3. Compensation & Awards & Disbursements
    comp = await conn.fetchrow("SELECT count(*) as count, sum(total_compensation_amount) as total_comp FROM compensation_assessments WHERE project_id = $1;", pid)
    awards = await conn.fetchrow("SELECT count(*) as count, sum(total_award_amount) as total_awarded, sum(solatium_amount) as total_solatium FROM awards WHERE project_id = $1;", pid)
    disb = await conn.fetchrow("SELECT count(*) as count, sum(disbursed_amount) as total_disbursed FROM disbursements WHERE project_id = $1;", pid)
    print('\n=== FINANCIAL RECONCILIATION ===')
    print('Assessments:', dict(comp))
    print('Awards:', dict(awards))
    print('Disbursements:', dict(disb))
    
    # 4. Possession
    poss = await conn.fetchrow("SELECT count(*) as count, sum(area_taken_ha) as total_poss_ha FROM possession_records WHERE project_id = $1;", pid)
    print('\n=== POSSESSION ===')
    print(dict(poss))
    
    # 5. Affected Families & R&R
    families = await conn.fetchrow("SELECT count(*) as count, count(*) FILTER (WHERE is_displaced = true) as displaced, count(*) FILTER (WHERE eligibility_status = 'APPROVED') as eligible FROM affected_families WHERE project_id = $1;", pid)
    schemes = await conn.fetchrow("SELECT count(*) as count, sum(total_families_covered) as families_covered, sum(budget_allocated) as budget FROM randr_schemes WHERE project_id = $1;", pid)
    allotments = await conn.fetchrow("SELECT count(*) as count, count(*) FILTER (WHERE status = 'POSSESSION_HANDED_OVER' OR status = 'ALLOTTED') as completed FROM randr_allotments ra JOIN randr_schemes rs ON ra.scheme_id = rs.id WHERE rs.project_id = $1;", pid)
    print('\n=== R&R RECONCILIATION ===')
    print('Families:', dict(families))
    print('Schemes:', dict(schemes))
    print('Allotments:', dict(allotments))

    await conn.close()

if __name__ == '__main__':
    asyncio.run(check_reconciliation())
