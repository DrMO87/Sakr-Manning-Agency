import os
import django
from django.utils import timezone
import random
from datetime import timedelta
from django.contrib.auth.hashers import make_password
from django.apps import apps

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

def seed_data():
    print("Starting database seeding...")
    
    # Get models correctly
    Rank = apps.get_model('api', 'Rank')
    Company = apps.get_model('companies', 'Company')
    Users = apps.get_model('api', 'Users')
    CVSubmission = apps.get_model('api', 'CVSubmission')
    Interview = apps.get_model('api', 'Interview')

    # Ensure Ranks
    ranks = [
        ("MST", "Master"),
        ("CO", "Chief Officer"),
        ("2O", "Second Officer"),
        ("CE", "Chief Engineer"),
        ("2E", "Second Engineer")
    ]
    rank_objs = []
    for code, name in ranks:
        r, _ = Rank.objects.get_or_create(code=code, defaults={"name": name})
        rank_objs.append(r)

    # Get CompanyType model
    try:
        CompanyType = apps.get_model('core', 'CompanyType')
    except LookupError:
        CompanyType = apps.get_model('api', 'CompanyType')

    # Companies
    company_types = ['Ship Owner', 'Ship Manager', 'Charterer', 'Other']
    company_statuses = ['Active', 'Inactive', 'Pending', 'Blacklisted']
    
    company_objs = []
    for ct_str in company_types:
        ct, _ = CompanyType.objects.get_or_create(name=ct_str)
        for status in company_statuses:
            name = f"Dummy {ct_str} {status} Ltd."
            c, _ = Company.objects.get_or_create(
                company_name=name,
                defaults={
                    "company_type": ct,
                    "status": status,
                    "contact_email": f"contact@{name.replace(' ', '').lower()}.com",
                    "contact_phone": "+1234567890"
                }
            )
            company_objs.append(c)

    print(f"Created {len(company_objs)} companies.")

    # Users
    roles = ['Admin', 'HR Manager', 'Recruiter', 'Employee', 'Company Admin', 'Viewer']
    user_statuses = ['ON_SITE', 'VECATION', 'MEDICAL VECATION', 'RESIGNED', 'TERMINATED']
    
    user_objs = []
    counter = 1
    for role in roles:
        for status in user_statuses:
            email = f"dummy_{role.replace(' ', '_').lower()}_{status.lower()}@example.com"
            u, created = Users.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": "Dummy",
                    "middle_name": f"{role} {status}",
                    "password": make_password("password123"),
                    "role": role,
                    "user_status": status,
                }
            )
            user_objs.append(u)
            counter += 1

    print(f"Created {len(user_objs)} users.")

    employee_users = [u for u in user_objs if u.role == 'Employee']
    if not employee_users:
        employee_users = user_objs  # Fallback

    # CV Submissions
    cv_statuses = ['Pending', 'Under Review', 'Interviewed', 'Shortlisted', 'Approved', 'Rejected', 'Hired']
    for status in cv_statuses:
        CVSubmission.objects.create(
            user=random.choice(employee_users),
            company=random.choice(company_objs),
            position=random.choice(rank_objs),
            experience_years=random.randint(1, 15),
            expected_salary=random.randint(3000, 15000),
            status=status,
            notes=f"This is a dummy CV submission with status: {status}"
        )

    print(f"Created {len(cv_statuses)} CV Submissions.")

    # Interviews
    interview_types = ['Phone', 'Video', 'In-Person', 'Technical']
    interview_statuses = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show']
    interview_results = ['Pending', 'Passed', 'Failed', 'On Hold']

    for i_type in interview_types:
        for status in interview_statuses:
            for result in interview_results:
                Interview.objects.create(
                    candidate=random.choice(employee_users),
                    company=random.choice(company_objs),
                    position=random.choice(rank_objs),
                    scheduled_date=timezone.now().date() + timedelta(days=random.randint(-10, 10)),
                    scheduled_time=timezone.now().time(),
                    duration_minutes=random.choice([30, 45, 60]),
                    interview_type=i_type,
                    status=status,
                    result=result,
                    interviewer_name="John Doe",
                    interviewer_email="johndoe@example.com",
                    notes=f"Dummy interview {i_type} - {status} - {result}"
                )

    print("Created Interviews.")
    print("Seeding complete.")

if __name__ == '__main__':
    seed_data()
