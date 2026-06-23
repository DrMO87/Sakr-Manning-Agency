import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from django.apps import apps
Document = apps.get_model('api', 'Document')

data = [
    {"name": "MAHMOUD ALI MAHMOUD MOUSAA HOZAIN", "email": "mahmoud.a@example.com", "phone": "+201023456781", "position": "Master"},
    {"name": "SABRY NAEIM AMIN OSMAN", "email": "sabry.n@example.com", "phone": "+201123456782", "position": "Electrician"},
    {"name": "IBRAHIM DESOUKY ELSAYED NASSAR", "email": "ibrahim.d@example.com", "phone": "+201223456783", "position": "Oiler"},
    {"name": "SAID MOHAMED ABD EL KAREM", "email": "said.m@example.com", "phone": "+201523456784", "position": "Electrician"},
    {"name": "WALID ALY EL-SAYED", "email": "walid.a@example.com", "phone": "+201023456785", "position": "Bosun"},
    {"name": "ABD EL GHANY GAFFAR", "email": "abdel.g@example.com", "phone": "+201123456786", "position": "Master"},
    {"name": "Mohammed Mustafa AL said", "email": "mohammed.m@example.com", "phone": "+201223456787", "position": "Bosun"},
    {"name": "MOHAMED MAHMOUD SHEHATA", "email": "mohamed.sh@example.com", "phone": "+201523456788", "position": "Bosun"},
    {"name": "MOHAMED MOUSTAFA AWAD", "email": "mohamed.aw@example.com", "phone": "+201023456789", "position": "Second Officer"},
    {"name": "ABDELMABOUD MAHMOUD", "email": "abdelmaboud.m@example.com", "phone": "+201123456790", "position": "Master"}
]

print("Deleting old documents...")
Document.objects.all().delete()

print("Seeding new documents...")
Users = apps.get_model('api', 'Users')
from django.contrib.auth.hashers import make_password

for i, d in enumerate(data):
    status = "Pending"
    if i % 3 == 1:
        status = "Active"
    elif i % 3 == 2:
        status = "Blacklist"
    
    parts = d['name'].split(' ', 1)
    first_name = parts[0]
    middle_name = parts[1] if len(parts) > 1 else ''
    
    user, _ = Users.objects.get_or_create(
        email=d['email'],
        defaults={
            'first_name': first_name,
            'middle_name': middle_name,
            'role': 'Employee',
            'password': make_password('password123'),
            'user_status': 'Active'
        }
    )
    
    Document.objects.create(
        user=user,
        title=f"CV_{d['name'].replace(' ', '_')}.pdf",
        name=d['name'],
        email=d['email'],
        phone_number=d['phone'],
        position=d['position'],
        status=status,
    )

print("Done seeding Documents.")
