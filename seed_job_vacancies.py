import os
import django
from datetime import datetime, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from django.apps import apps
from django.utils import timezone

JobOrder = apps.get_model('companies', 'JobOrder')
JobOrderPosition = apps.get_model('companies', 'JobOrderPosition')
Company = apps.get_model('companies', 'Company')
Ship = apps.get_model('ships', 'Ship')
Rank = apps.get_model('api', 'Rank')

print("Wiping existing job orders...")
JobOrder.objects.all().delete()

companies = list(Company.objects.all()[:5])
ranks = list(Rank.objects.all()[:10])

if not companies or not ranks:
    print("No companies or ranks found. Please seed them first.")
    exit(1)

vacancies_data = [
    {"rank_idx": 0, "quantity": 2, "salary_min": 4500, "salary_max": 5000, "duration": 6, "remarks": "Urgent requirement"},
    {"rank_idx": 1, "quantity": 1, "salary_min": 3000, "salary_max": 3500, "duration": 4, "remarks": "Previous experience required"},
    {"rank_idx": 2, "quantity": 3, "salary_min": 2500, "salary_max": 2800, "duration": 6, "remarks": "English proficiency mandatory"},
    {"rank_idx": 3, "quantity": 1, "salary_min": 6000, "salary_max": 6500, "duration": 3, "remarks": "ASAP joining"},
    {"rank_idx": 4, "quantity": 2, "salary_min": 3500, "salary_max": 4000, "duration": 5, "remarks": "Valid US visa preferred"},
    {"rank_idx": 5, "quantity": 4, "salary_min": 2000, "salary_max": 2200, "duration": 6, "remarks": "Minimum 2 contracts in rank"},
    {"rank_idx": 6, "quantity": 1, "salary_min": 5500, "salary_max": 6000, "duration": 4, "remarks": "Offshore experience needed"},
    {"rank_idx": 7, "quantity": 2, "salary_min": 2800, "salary_max": 3200, "duration": 6, "remarks": ""},
]

print("Seeding job orders and positions...")

today = timezone.now().date()

for i, v_data in enumerate(vacancies_data):
    company = companies[i % len(companies)]
    ship = Ship.objects.filter(company=company).first()
    
    # if company has no ship, just pick the first ship
    if not ship:
        ship = Ship.objects.first()

    status = "Open"
    if i == 7:
        status = "Closed"

    job_order = JobOrder.objects.create(
        company=company,
        ship=ship,
        reference_number=f"JO-{company.id}-{1000+i}",
        request_date=today - timedelta(days=random.randint(1, 10)),
        target_joining_date=today + timedelta(days=random.randint(5, 30)),
        vessel_type_override=ship.ship_type.name if ship and ship.ship_type else "General Cargo",
        trading_area="Worldwide",
        status=status,
        notes="Created via automated seeder"
    )

    rank = ranks[v_data["rank_idx"] % len(ranks)]

    JobOrderPosition.objects.create(
        job_order=job_order,
        rank=rank,
        quantity=v_data["quantity"],
        salary_min=v_data["salary_min"],
        salary_max=v_data["salary_max"],
        currency="USD",
        contract_duration_months=v_data["duration"],
        remarks=v_data["remarks"]
    )

print(f"Done seeding {JobOrderPosition.objects.count()} job positions.")
