import os
import sys
import django
import random
from datetime import timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from api.models import Users, Rank, Interview
from companies.models import Company

def seed_interviews():
    # 1. Delete existing interviews to clear dummy data
    print("Deleting existing interviews...")
    Interview.objects.all().delete()
    
    # 2. Get candidates (filter out "Dummy" and "Admin")
    candidates = Users.objects.filter(is_superuser=False, role='Employee').exclude(first_name__icontains='Dummy').exclude(email__icontains='dummy')
    if not candidates.exists():
        candidates = Users.objects.filter(is_superuser=False, role='Employee')
        
    candidates = list(candidates)
    
    # 3. Get companies and ranks
    companies = list(Company.objects.all())
    ranks = list(Rank.objects.all())
    
    if not candidates:
        print("No candidates found. Please ensure you have some users.")
        return
        
    print(f"Found {len(candidates)} candidates, {len(companies)} companies, {len(ranks)} ranks.")
    
    # 4. Create new simulated interviews
    interviews_to_create = []
    
    interview_types = ['Phone', 'Video', 'In-Person', 'Technical']
    statuses = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show']
    results = ['Pending', 'Passed', 'Failed', 'On Hold']
    
    now = timezone.now()
    
    for _ in range(40):
        candidate = random.choice(candidates)
        company = random.choice(companies) if companies else None
        position = random.choice(ranks) if ranks else None
        i_type = random.choice(interview_types)
        status = random.choice(statuses)
        
        # If scheduled in future, it's mostly "Scheduled" or "Rescheduled", result is "Pending"
        is_future = random.choice([True, False])
        
        if is_future:
            scheduled_date = now + timedelta(days=random.randint(1, 30), hours=random.randint(9, 16))
            status = random.choice(['Scheduled', 'Rescheduled'])
            result = 'Pending'
        else:
            scheduled_date = now - timedelta(days=random.randint(1, 60), hours=random.randint(9, 16))
            if status in ['Scheduled', 'Rescheduled']:
                status = 'Completed' # Since it's in the past
            
            if status == 'Completed':
                result = random.choice(['Passed', 'Failed', 'Passed', 'On Hold'])
            elif status in ['Cancelled', 'No Show']:
                result = 'Failed'
            else:
                result = 'Pending'
                
        interview = Interview(
            candidate=candidate,
            company=company,
            position=position,
            interview_type=i_type,
            scheduled_date=scheduled_date.date(),
            scheduled_time=scheduled_date.time(),
            duration_minutes=random.choice([30, 45, 60]),
            status=status,
            result=result,
            interviewer_name=f"HR {random.choice(['Manager', 'Lead', 'Specialist'])}",
            interviewer_email="hr@sakrmanning.com",
            meeting_link="https://meet.google.com/abc-defg-hij" if i_type == 'Video' else None,
            location="Main Office" if i_type == 'In-Person' else None,
            feedback="Good technical skills but needs better communication." if status == 'Completed' else ""
        )
        interviews_to_create.append(interview)
        
    Interview.objects.bulk_create(interviews_to_create)
    print(f"Successfully created {len(interviews_to_create)} realistic interviews.")

if __name__ == '__main__':
    seed_interviews()
