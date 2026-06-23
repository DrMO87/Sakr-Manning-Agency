import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from api.models import Users, Contract
from companies.models import Company, JobOrder

user = Users.objects.first()
if user:
    print("User keys:", [f.name for f in user._meta.fields])

company = Company.objects.first()
if company:
    print("Company keys:", [f.name for f in company._meta.fields])

contract = Contract.objects.first()
if contract:
    print("Contract keys:", [f.name for f in contract._meta.fields])
