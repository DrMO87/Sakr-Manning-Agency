import os
import django
import random
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from api.models import Users, Contract, Rank
from companies.models import Company, JobOrder, JobOrderPosition
from ships.models import Ship

def run():
    print("=== Starting Full Work Cycle Simulation ===")
    
    # Get job vacancies that have quantity > 0
    open_positions = JobOrderPosition.objects.filter(quantity__gt=0)
    
    if not open_positions.exists():
        print("No open job positions found. Creating a new simulated Job Order to provide vacancies...")
        company = Company.objects.first()
        ship = Ship.objects.first()
        rank = Rank.objects.first()
        job_order = JobOrder.objects.create(
            company=company,
            ship=ship,
            reference_number=f"SIM-JO-{random.randint(1000, 9999)}",
            request_date=date.today(),
            target_joining_date=date.today() + timedelta(days=30),
            status='Open'
        )
        jop = JobOrderPosition.objects.create(
            job_order=job_order,
            rank=rank,
            quantity=5,
            salary_min=1500,
            salary_max=2500
        )
        # re-fetch
        open_positions = JobOrderPosition.objects.filter(id=jop.id)
    
    contracts_created = 0
    
    for pos in list(open_positions):
        print(f"\nProcessing JobOrder: {pos.job_order.reference_number} - Rank: {pos.rank.name if pos.rank else 'Unspecified'}")
        print(f"Initial Vacancies: {pos.quantity}")
        
        # Determine how many we want to fill for this simulation (up to 3)
        to_fill = min(pos.quantity, random.randint(1, 3))
        
        for _ in range(to_fill):
            # Find a random user to assign
            user = Users.objects.filter(role='Employee').order_by('?').first()
            if not user:
                print("No employee users found in the database. Cannot create contract.")
                break
                
            job_order = pos.job_order
            company = job_order.company
            ship = job_order.ship
            
            # Create a contract
            Contract.objects.create(
                user=user,
                ship=ship,
                company=company,
                rank=pos.rank,
                job_position=pos,
                sign_on_date=date.today() + timedelta(days=random.randint(5, 30)),
                salary=pos.salary_min or 1500.00,
                currency='USD',
                status=random.choice(['Signed', 'Active', 'Pending Signature', 'Draft'])
            )
            
            # Subtract from vacancies
            pos.quantity -= 1
            pos.save()
            
            # Subtract from company's overall open positions if applicable
            if company and company.open_positions > 0:
                company.open_positions -= 1
                company.save()
                
            contracts_created += 1
            print(f" -> Assigned User: {user.email}")
            print(f" -> Created Contract")
            print(f" -> Subtracted 1 from Job Vacancies. Remaining for this position: {pos.quantity}")
            
        # Check if the entire job order is fulfilled
        job_order = pos.job_order
        all_filled = all(p.quantity == 0 for p in job_order.positions.all())
        if all_filled and job_order.status != 'Fulfilled':
            job_order.status = 'Fulfilled'
            job_order.save()
            print(f" -> [STATUS UPDATE] Job Order {job_order.reference_number} is now fully Fulfilled.")

    print(f"\n=== Simulation Complete ===")
    print(f"Total Contracts Created: {contracts_created}")

if __name__ == '__main__':
    run()
