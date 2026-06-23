import os
import django
from datetime import date, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from api.models import Contract

def run():
    print("=== Updating Contract Expiry Dates ===")
    
    contracts = list(Contract.objects.filter(status__in=['Active', 'Signed', 'Pending Signature']))
    
    if not contracts:
        print("No active/signed contracts found to update.")
        return
        
    print(f"Found {len(contracts)} contracts. Updating sign_off_dates...")
    
    # We want a mix of:
    # 1. Critical (< 7 days) -> exp in 1 to 6 days
    # 2. Warning (<= 30 days) -> exp in 8 to 29 days
    # 3. Notice (<= 60 days) -> exp in 31 to 59 days
    # 4. Active (> 60 days) -> exp in 65+ days
    
    ranges = [
        (1, 5),   # Critical
        (10, 25), # Warning
        (35, 55), # Notice
        (70, 120) # Active
    ]
    
    for i, contract in enumerate(contracts):
        # Pick a range based on index to ensure we get a good mix
        r = ranges[i % len(ranges)]
        days_to_expire = random.randint(r[0], r[1])
        
        contract.sign_off_date = date.today() + timedelta(days=days_to_expire)
        contract.save()
        
        # Also let's update some user documents to expire soon for document tracking, if the notification bell tracks those too.
        # But for Contracts dashboard, sign_off_date is what's used.
        
        category = "Critical" if days_to_expire < 7 else "Warning" if days_to_expire <= 30 else "Notice" if days_to_expire <= 60 else "Active"
        print(f"Contract ID {contract.id} updated: Expires in {days_to_expire} days ({category})")

if __name__ == '__main__':
    run()
