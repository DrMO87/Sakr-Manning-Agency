import os
import django
import json
from datetime import datetime
from django.utils import timezone
from django.contrib.auth.hashers import make_password

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saker.settings')
django.setup()

from django.apps import apps
Company = apps.get_model('companies', 'Company')
Ship = apps.get_model('ships', 'Ship')
Users = apps.get_model('api', 'Users')
CVSubmission = apps.get_model('api', 'CVSubmission')
Rank = apps.get_model('api', 'Rank')
CompanyType = apps.get_model('core', 'CompanyType') if apps.is_installed('core') else apps.get_model('api', 'CompanyType')
Flag = apps.get_model('core', 'Flag')
VesselType = apps.get_model('core', 'VesselType')

def parse_date(date_str):
    if not date_str or date_str.strip() in ['—', 'N/A', '-']:
        return None
    try:
        # DD/MM/YYYY to YYYY-MM-DD
        parts = date_str.split('/')
        if len(parts) == 3:
            return f"{parts[2]}-{parts[1]}-{parts[0]}"
        return date_str
    except:
        return None

def parse_salary(salary_str):
    if not salary_str: return 0
    clean = salary_str.replace('$', '').replace(',', '').strip()
    try:
        return int(clean)
    except:
        return 0

def parse_experience(exp_str):
    if not exp_str: return 0
    try:
        return int(exp_str.split(' ')[0])
    except:
        return 0

companies_data = [
    {"name": "3 SEAS", "type": "Full Crew Management Companies", "email": "theodoros@3seas-shipping.com", "website": "https://WWW.3seas-shipping.com", "status": "Active", "hourRate": "$29", "openPositions": 16},
    {"name": "AMS LINE SHIPPING CO", "type": "Full Crew Management Companies", "email": "info@amsline.com", "website": "https://www.amsline.com", "status": "Active", "hourRate": "$37", "openPositions": 11},
    {"name": "APREMAR TUNISIA", "type": "Full Crew Management Companies", "email": "crew@apremar.NET", "website": "https://www.apremar.NET", "status": "Active", "hourRate": "$17", "openPositions": 5},
    {"name": "Anglo-Eastern Cruise Management Inc", "type": "Cruise & Hospitality Manning Companies", "email": "kaluhinak@angloeastern.com", "website": "https://www.angloeastern.com", "status": "Active", "hourRate": "$48", "openPositions": 4},
    {"name": "BERNHARD SCHULTE CRUISE SERVICES GMBH & CO. KG", "type": "Full Crew Management Companies", "email": "info@schultecruise.com", "website": "https://www.schultecruise.com", "status": "Active", "hourRate": "$10", "openPositions": 3},
    {"name": "Bulkers Marine LTD", "type": "Cargo Manning Companies", "email": "operations@bulkers.eu", "website": "https://WWW.operations@bulkers.eu", "status": "Active", "hourRate": "$12", "openPositions": 19},
    {"name": "COSTA CROCIERE", "type": "Cruise & Hospitality Manning Companies", "email": "costaclub.europe@costa.it", "website": "https://www.costa.it", "status": "Active", "hourRate": "$22", "openPositions": 18},
    {"name": "Columbia  Ship Management Services", "type": "Full Crew Management Companies", "email": "info@columbiagroup.org", "website": "https://www.columbiagroup.org", "status": "Active", "hourRate": "$37", "openPositions": 15},
    {"name": "DRAGONET SHIPPING Inc", "type": "Full Crew Management Companies", "email": "alameomran@gmail.com", "website": "-", "status": "Active", "hourRate": "$34", "openPositions": 9},
    {"name": "FOSS & ESG Offshore Catering", "type": "Offshore & Oil/Gas Manning Companies", "email": "info@goss-foss.com", "website": "https://www.goss-foss.com", "status": "Active", "hourRate": "$42", "openPositions": 17},
    {"name": "NAVCO LTD", "type": "Cargo Manning Companies", "email": "operations@navcoltd.com", "website": "https://www.navcoltd.com", "status": "Active", "hourRate": "$47", "openPositions": 14},
    {"name": "NORTHGREEN MARITIME SA", "type": "Full Crew Management Companies", "email": "info@ngm-gr.com", "website": "https://www.ngm-gr.com", "status": "Active", "hourRate": "$15", "openPositions": 15},
    {"name": "SALAMIS LINES LTD", "type": "Cruise & Hospitality Manning Companies", "email": "salamis@salamis.com", "website": "https://www.salamis.com", "status": "Active", "hourRate": "$41", "openPositions": 1},
    {"name": "SPANOPOULOS GROUP SA", "type": "Offshore & Oil/Gas Manning Companies", "email": "info@spanopoulos-group.com", "website": "https://www.spanopoulos-group.com", "status": "Active", "hourRate": "$30", "openPositions": 3},
    {"name": "OCEANLINK CREWING", "type": "Full Crew Management Companies", "email": "contact@oceanlink.com", "website": "https://oceanlink.com", "status": "Active", "hourRate": "$25", "openPositions": 12},
    {"name": "BLUE WAVE SHIPPING", "type": "Offshore & Oil/Gas Manning Companies", "email": "hr@bluewave.com", "website": "https://bluewave.com", "status": "Active", "hourRate": "$32", "openPositions": 10},
    {"name": "MARINE PRO SERVICES", "type": "Cargo Manning Companies", "email": "crewing@marinepro.com", "website": "https://marinepro.com", "status": "Active", "hourRate": "$20", "openPositions": 16}
]

ships_data = [
    {"name": "ALASA", "type": "Cruise Ship", "associatedWithCompany": "SALAMIS LINES LTD", "imoNumber": "9162681.0", "flag": "Cyprus", "grossTonnage": 6378, "deadweight": 1969, "engineType": "Diesel-Electric", "enginePower": 16516, "yearBuilt": "1998.0", "officialNo": "422710", "status": "Active", "shipCrew": 26, "jobOrdersCount": 0, "jobOrders": 3, "crewCount": 0},
    {"name": "AYA M", "type": "Container Ship", "associatedWithCompany": "NORTHGREEN MARITIME SA", "imoNumber": "9007867.0", "flag": "Panama", "grossTonnage": 8407, "deadweight": 6293, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "1995.0", "officialNo": "297775", "status": "Active", "shipCrew": 81, "jobOrdersCount": 0, "jobOrders": 0, "crewCount": 0},
    {"name": "CHRISTOS III", "type": "Container Ship", "associatedWithCompany": "SPANOPOULOS GROUP SA", "imoNumber": "7414834.0", "flag": "Togo", "grossTonnage": 130, "deadweight": 0, "engineType": "Diesel-Electric", "enginePower": 16516, "yearBuilt": "N/A", "officialNo": "389336", "status": "Active", "shipCrew": 79, "jobOrdersCount": 0, "jobOrders": 4, "crewCount": 0},
    {"name": "COSTA DELIZIOSA", "type": "Oil Tanker", "associatedWithCompany": "COSTA CROCIERE", "imoNumber": "9398917.0", "flag": "Italy", "grossTonnage": 92720, "deadweight": 7500, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "2010.0", "officialNo": "887494", "status": "Active", "shipCrew": 47, "jobOrdersCount": 0, "jobOrders": 4, "crewCount": 0},
    {"name": "COSTA DIADEMA", "type": "Container Ship", "associatedWithCompany": "COSTA CROCIERE", "imoNumber": "9636888.0", "flag": "Italy", "grossTonnage": 133019, "deadweight": 11118, "engineType": "Steam Turbine", "enginePower": 16516, "yearBuilt": "2014.0", "officialNo": "708364", "status": "Active", "shipCrew": 54, "jobOrdersCount": 0, "jobOrders": 0, "crewCount": 0},
    {"name": "Costa Fortuna", "type": "Bulk Carrier", "associatedWithCompany": "COSTA CROCIERE", "imoNumber": "9239783.0", "flag": "Italy", "grossTonnage": 102669, "deadweight": 8200, "engineType": "Steam Turbine", "enginePower": 16516, "yearBuilt": "2003.0", "officialNo": "189780", "status": "Active", "shipCrew": 88, "jobOrdersCount": 0, "jobOrders": 3, "crewCount": 0},
    {"name": "Costa Serena", "type": "Tug", "associatedWithCompany": "COSTA CROCIERE", "imoNumber": "9343132.0", "flag": "Italy", "grossTonnage": 114261, "deadweight": 8900, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "2004.0", "officialNo": "252617", "status": "Active", "shipCrew": 57, "jobOrdersCount": 0, "jobOrders": 1, "crewCount": 0},
    {"name": "Costa Smeralda", "type": "Tug", "associatedWithCompany": "COSTA CROCIERE", "imoNumber": "9781889.0", "flag": "Italy", "grossTonnage": 185010, "deadweight": 12499, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "2019.0", "officialNo": "645977", "status": "Active", "shipCrew": 58, "jobOrdersCount": 0, "jobOrders": 4, "crewCount": 0},
    {"name": "Costa Toscana", "type": "Cruise Ship", "associatedWithCompany": "COSTA CROCIERE", "imoNumber": "9781891.0", "flag": "Italy", "grossTonnage": 186364, "deadweight": 13000, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "N/A", "officialNo": "897606", "status": "Active", "shipCrew": 43, "jobOrdersCount": 0, "jobOrders": 0, "crewCount": 0},
    {"name": "DUISBURG", "type": "Container Ship", "associatedWithCompany": "NAVCO LTD", "imoNumber": "9194309.0", "flag": "Antigua and Barbuda", "grossTonnage": 2042, "deadweight": 2287, "engineType": "Steam Turbine", "enginePower": 16516, "yearBuilt": "1999.0", "officialNo": "450605", "status": "Active", "shipCrew": 27, "jobOrdersCount": 0, "jobOrders": 2, "crewCount": 0},
    {"name": "MED EXPRESS", "type": "Bulk Carrier", "associatedWithCompany": "AMS LINE SHIPPING CO", "imoNumber": "9087116.0", "flag": "San Marino", "grossTonnage": 15412, "deadweight": 7383, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "1999.0", "officialNo": "989465", "status": "Active", "shipCrew": 26, "jobOrdersCount": 0, "jobOrders": 0, "crewCount": 0},
    {"name": "NIVIN", "type": "Cruise Ship", "associatedWithCompany": "DRAGONET SHIPPING Inc", "imoNumber": "8206533.0", "flag": "Panama", "grossTonnage": 5462, "deadweight": 1626, "engineType": "Steam Turbine", "enginePower": 16516, "yearBuilt": "1983.0", "officialNo": "633636", "status": "Active", "shipCrew": 60, "jobOrdersCount": 1, "jobOrders": 2, "crewCount": 0},
    {"name": "OCEAN ADVENTURER", "type": "Oil Tanker", "associatedWithCompany": "Anglo-Eastern Cruise Management Inc", "imoNumber": "N/A", "flag": "Portugal", "grossTonnage": 0, "deadweight": 1058638, "engineType": "Diesel-Electric", "enginePower": 16516, "yearBuilt": "N/A", "officialNo": "138102", "status": "Active", "shipCrew": 16, "jobOrdersCount": 0, "jobOrders": 3, "crewCount": 0},
    {"name": "OCEAN ENDEAVOUR", "type": "Cruise Ship", "associatedWithCompany": "Anglo-Eastern Cruise Management Inc", "imoNumber": "7625811.0", "flag": "Bahamas", "grossTonnage": 12907, "deadweight": 1762, "engineType": "Steam Turbine", "enginePower": 16516, "yearBuilt": "1982.0", "officialNo": "174460", "status": "Active", "shipCrew": 49, "jobOrdersCount": 0, "jobOrders": 1, "crewCount": 0},
    {"name": "PIANO LAND", "type": "Cruise Ship", "associatedWithCompany": "BERNHARD SCHULTE CRUISE SERVICES GMBH & CO. KG", "imoNumber": "9050137.0", "flag": "Liberia", "grossTonnage": 69840, "deadweight": 6260, "engineType": "Steam Turbine", "enginePower": 16516, "yearBuilt": "1995.0", "officialNo": "464778", "status": "Active", "shipCrew": 95, "jobOrdersCount": 1, "jobOrders": 0, "crewCount": 0},
    {"name": "QUEEN OF THE OCEANS", "type": "Container Ship", "associatedWithCompany": "BERNHARD SCHULTE CRUISE SERVICES GMBH & CO. KG", "imoNumber": "9169550.0", "flag": "Liberia", "grossTonnage": 77499, "deadweight": 8165, "engineType": "Diesel-Electric", "enginePower": 16516, "yearBuilt": "2000.0", "officialNo": "189930", "status": "Active", "shipCrew": 22, "jobOrdersCount": 1, "jobOrders": 4, "crewCount": 0},
    {"name": "RMS LAAR", "type": "Oil Tanker", "associatedWithCompany": "NAVCO LTD", "imoNumber": "8508400.0", "flag": "Antigua and Barbuda", "grossTonnage": 1570, "deadweight": 2304, "engineType": "Steam Turbine", "enginePower": 16516, "yearBuilt": "1985.0", "officialNo": "631089", "status": "Active", "shipCrew": 40, "jobOrdersCount": 0, "jobOrders": 3, "crewCount": 0},
    {"name": "RMS NEUDORF", "type": "Cruise Ship", "associatedWithCompany": "NAVCO LTD", "imoNumber": "8920256.0", "flag": "Antigua and Barbuda", "grossTonnage": 1985, "deadweight": 2620, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "1990.0", "officialNo": "727438", "status": "Active", "shipCrew": 88, "jobOrdersCount": 0, "jobOrders": 0, "crewCount": 0},
    {"name": "RMS RATINGEN", "type": "Bulk Carrier", "associatedWithCompany": "NAVCO LTD", "imoNumber": "9249831.0", "flag": "Antigua and Barbuda", "grossTonnage": 1898, "deadweight": 2642, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "2002.0", "officialNo": "827627", "status": "Active", "shipCrew": 48, "jobOrdersCount": 0, "jobOrders": 4, "crewCount": 0},
    {"name": "RMS RUNNER", "type": "Bulk Carrier", "associatedWithCompany": "NAVCO LTD", "imoNumber": "9137193.0", "flag": "Antigua and Barbuda", "grossTonnage": 1882, "deadweight": 2521, "engineType": "Steam Turbine", "enginePower": 16516, "yearBuilt": "1996.0", "officialNo": "279208", "status": "Active", "shipCrew": 21, "jobOrdersCount": 0, "jobOrders": 0, "crewCount": 0},
    {"name": "RMS VM WANHEIM", "type": "Tug", "associatedWithCompany": "NAVCO LTD", "imoNumber": "8920268.0", "flag": "Nauru", "grossTonnage": 1985, "deadweight": 2620, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "1990.0", "officialNo": "254697", "status": "Active", "shipCrew": 82, "jobOrdersCount": 0, "jobOrders": 2, "crewCount": 0},
    {"name": "SEA SPIRIT", "type": "Oil Tanker", "associatedWithCompany": "Anglo-Eastern Cruise Management Inc", "imoNumber": "8802868.0", "flag": "Portugal", "grossTonnage": 4200, "deadweight": 695, "engineType": "Steam Turbine", "enginePower": 16516, "yearBuilt": "1991.0", "officialNo": "313945", "status": "Active", "shipCrew": 72, "jobOrdersCount": 1, "jobOrders": 0, "crewCount": 0},
    {"name": "TUNGSTEN EXPLORER", "type": "Oil Tanker", "associatedWithCompany": "FOSS & ESG Offshore Catering", "imoNumber": "9631735.0", "flag": "Bahamas", "grossTonnage": 68486, "deadweight": 64969, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "2013.0", "officialNo": "331915", "status": "Active", "shipCrew": 89, "jobOrdersCount": 0, "jobOrders": 0, "crewCount": 0},
    {"name": "red sea1", "type": "Tug", "associatedWithCompany": "3 SEAS", "imoNumber": "4562762.0", "flag": "Bolivia", "grossTonnage": 0, "deadweight": 0, "engineType": "Diesel", "enginePower": 16516, "yearBuilt": "N/A", "officialNo": "827952", "status": "Active", "shipCrew": 43, "jobOrdersCount": 0, "jobOrders": 0, "crewCount": 0},
    {"name": "POSEIDON EX", "type": "Bulk Carrier", "associatedWithCompany": "NAVCO LTD", "imoNumber": "9876543.0", "flag": "Cyprus", "grossTonnage": 29870, "deadweight": 30289, "engineType": "Diesel", "enginePower": 20485, "yearBuilt": "2015.0", "officialNo": "842129", "status": "Active", "shipCrew": 19, "jobOrdersCount": 2, "jobOrders": 3, "crewCount": 44},
    {"name": "SEA BREEZE", "type": "Container Ship", "associatedWithCompany": "FOSS & ESG Offshore Catering", "imoNumber": "9876544.0", "flag": "Italy", "grossTonnage": 36790, "deadweight": 60129, "engineType": "Diesel-Electric", "enginePower": 16714, "yearBuilt": "2018.0", "officialNo": "764795", "status": "Active", "shipCrew": 43, "jobOrdersCount": 4, "jobOrders": 0, "crewCount": 3},
    {"name": "OCEAN MARVEL", "type": "Oil Tanker", "associatedWithCompany": "AMS LINE SHIPPING CO", "imoNumber": "9876545.0", "flag": "Panama", "grossTonnage": 128874, "deadweight": 98714, "engineType": "Diesel", "enginePower": 9748, "yearBuilt": "2021.0", "officialNo": "890141", "status": "Active", "shipCrew": 51, "jobOrdersCount": 0, "jobOrders": 0, "crewCount": 35}
]

users_data = [
    {"name": "Elhamy Abou Elhassan", "generated_id": "USR-6063", "email": "abouelhassanelhamy@gmail.com", "phone": "+20 1012140279", "status": "Pending"},
    {"name": "Momen Gamal", "generated_id": "USR-9549", "email": "momeng474@gmail.com", "phone": "01095851239", "status": "Pending"},
    {"name": "Mohamed Essam", "generated_id": "USR-8575", "email": "mohamed.essam22112000@gmail.com", "phone": "+201154689211", "status": "Pending"},
    {"name": "Amr Abdelhameed", "generated_id": "USR-1667", "email": "dramrabdelhameed@gmail.com", "phone": "01212312308", "status": "Pending"},
    {"name": "Adel Magdy", "generated_id": "USR-5468", "email": "adeleita0002@gmail.com", "phone": "01017238305", "status": "Pending"},
    {"name": "SEYAM MOUSTAFA MOHAMED SABRA", "generated_id": "USR-7819", "email": "syamsabra77@gmail.com", "phone": "+201022010666", "status": "Pending"},
    {"name": "محمود الخولي", "generated_id": "USR-4719", "email": "alkhwlymhmwd853@gmail.com", "phone": "01063637483", "status": "Pending"},
    {"name": "MAHAMOUD ELSAYED AHMED WANAS", "generated_id": "USR-3745", "email": "mahmoudwanas84@gmail.com", "phone": "+201080391908", "status": "Pending"},
    {"name": "MOHAMED AHMED ABDELMAKSOUD ABDELWHED", "generated_id": "USR-8483", "email": "abdwabdw333@gmail.com", "phone": "01275780923", "status": "Pending"},
    {"name": "Youssef Hassan", "generated_id": "USR-1539", "email": "youssef.h@gmail.com", "phone": "+201011122233", "status": "Pending"},
    {"name": "Tarek Zaki", "generated_id": "USR-5964", "email": "tarek.z@gmail.com", "phone": "+201223344556", "status": "Active"},
    {"name": "Moustafa Kamel", "generated_id": "USR-5835", "email": "moustafa.k@gmail.com", "phone": "+201556677889", "status": "Active"}
]

cv_submissions_data = [
    {"name": "MAHMOUD ALI MAHMOUD MOUSAA HOZAIN", "company": "AMS LINE SHIPPING CO", "position": "Master", "codedRank": "ER-16.001", "experience": "0 yrs", "salary": "$4800", "state": "Pending", "date": "03/06/2026", "availability_date": "08/06/2026", "submitted_date": "15/05/2026", "reviewed_by": "Captain Smith", "rating": 3},
    {"name": "SABRY NAEIM AMIN OSMAN", "company": "Anglo-Eastern Cruise Management Inc", "position": "Electrician", "codedRank": "ER-16.002", "experience": "0 yrs", "salary": "$5500", "state": "Pending", "date": "03/06/2026", "availability_date": "26/05/2026", "submitted_date": "26/06/2026", "reviewed_by": "Recruiter A", "rating": 2},
    {"name": "IBRAHIM DESOUKY ELSAYED NASSAR", "company": "NORTHGREEN MARITIME SA", "position": "Oiler", "codedRank": "ER-14.014", "experience": "0 yrs", "salary": "$3200", "state": "Pending", "date": "03/06/2026", "availability_date": "21/05/2026", "submitted_date": "26/06/2026", "reviewed_by": "Admin", "rating": 2},
    {"name": "SAID MOHAMED ABD EL KAREM EL SAID ALI", "company": "NORTHGREEN MARITIME SA", "position": "Electrician", "codedRank": "ER-14.015", "experience": "0 yrs", "salary": "$9000", "state": "Pending", "date": "03/06/2026", "availability_date": "30/05/2026", "submitted_date": "17/06/2026", "reviewed_by": "Admin", "rating": 3},
    {"name": "WALID ALY EL-SAYED EL-KORRAY", "company": "COSTA CROCIERE", "position": "Bosun", "codedRank": "ER-14.012", "experience": "0 yrs", "salary": "$10500", "state": "Pending", "date": "03/06/2026", "availability_date": "19/06/2026", "submitted_date": "01/06/2026", "reviewed_by": "Recruiter A", "rating": 2},
    {"name": "ABD EL GHANY ABD EL FATTAH ABD EL GHANY GAFFAR", "company": "NORTHGREEN MARITIME SA", "position": "Master", "codedRank": "ER-14.019", "experience": "0 yrs", "salary": "$4700", "state": "Pending", "date": "03/06/2026", "availability_date": "05/06/2026", "submitted_date": "12/06/2026", "reviewed_by": "Admin", "rating": 2},
    {"name": "Mohammed Mustafa AL said", "company": "SALAMIS LINES LTD", "position": "Bosun", "codedRank": "ER-14.006", "experience": "0 yrs", "salary": "$8500", "state": "Pending", "date": "03/06/2026", "availability_date": "20/05/2026", "submitted_date": "19/05/2026", "reviewed_by": "Recruiter A", "rating": 2},
    {"name": "MOHAMED MAHMOUD SHEHATA RAGAB", "company": "Columbia  Ship Management Services", "position": "Bosun", "codedRank": "ER-14.020", "experience": "0 yrs", "salary": "$6400", "state": "Pending", "date": "03/06/2026", "availability_date": "31/05/2026", "submitted_date": "11/05/2026", "reviewed_by": "Captain Smith", "rating": 1},
    {"name": "MOHAMED MOUSTAFA AWAD ZAYED", "company": "APREMAR TUNISIA", "position": "Second Officer", "codedRank": "ER-14.002", "experience": "0 yrs", "salary": "$8100", "state": "Pending", "date": "03/06/2026", "availability_date": "02/05/2026", "submitted_date": "29/05/2026", "reviewed_by": "Recruiter A", "rating": 1},
    {"name": "ABDELMABOUD MAHMOUD ABDELMABOUD MAHMOUD ELSAMAN", "company": "SPANOPOULOS GROUP SA", "position": "Master", "codedRank": "ER-14.025", "experience": "0 yrs", "salary": "$4700", "state": "Pending", "date": "03/06/2026", "availability_date": "23/05/2026", "submitted_date": "22/06/2026", "reviewed_by": "Captain Smith", "rating": 1},
    {"name": "Mohamed Mahmoud Mohamed Gabr Assem", "company": "3 SEAS", "position": "Bosun", "codedRank": "ER-14.011", "experience": "0 yrs", "salary": "$4700", "state": "Pending", "date": "03/06/2026", "availability_date": "17/05/2026", "submitted_date": "08/05/2026", "reviewed_by": "Recruiter A", "rating": 3},
    {"name": "MOHAMED MAHMOUD AHMED", "company": "Anglo-Eastern Cruise Management Inc", "position": "Second Officer", "codedRank": "ER-14.013", "experience": "0 yrs", "salary": "$12700", "state": "Pending", "date": "03/06/2026", "availability_date": "24/05/2026", "submitted_date": "05/05/2026", "reviewed_by": "Admin", "rating": 5},
    {"name": "MOHAMED SABRY MOHAMED ABOUZAID", "company": "AMS LINE SHIPPING CO", "position": "Second Officer", "codedRank": "ER-14.018", "experience": "0 yrs", "salary": "$6300", "state": "Pending", "date": "03/06/2026", "availability_date": "20/05/2026", "submitted_date": "10/05/2026", "reviewed_by": "Recruiter A", "rating": 2},
    {"name": "HESHAM ELSAYED HAMED", "company": "Columbia  Ship Management Services", "position": "Master", "codedRank": "ER-14.007", "experience": "0 yrs", "salary": "$10300", "state": "Pending", "date": "03/06/2026", "availability_date": "18/06/2026", "submitted_date": "06/05/2026", "reviewed_by": "Admin", "rating": 2},
    {"name": "Osama Abdelsalam Abdelrahman Abdelsalam", "company": "Anglo-Eastern Cruise Management Inc", "position": "Second Engineer", "codedRank": "ER-14.001", "experience": "0 yrs", "salary": "$4900", "state": "Pending", "date": "03/06/2026", "availability_date": "25/05/2026", "submitted_date": "20/06/2026", "reviewed_by": "Recruiter A", "rating": 3},
    {"name": "ISLAM MAHMOUD HASSAN OUF", "company": "AMS LINE SHIPPING CO", "position": "Fitter", "codedRank": "ER-14.022", "experience": "0 yrs", "salary": "$9400", "state": "Pending", "date": "03/06/2026", "availability_date": "16/06/2026", "submitted_date": "17/06/2026", "reviewed_by": "Recruiter A", "rating": 2},
    {"name": "OMAR MAHMOUD ELSAYED ELRAYAN", "company": "SPANOPOULOS GROUP SA", "position": "Oiler", "codedRank": "ER-14.003", "experience": "0 yrs", "salary": "$14700", "state": "Pending", "date": "03/06/2026", "availability_date": "22/06/2026", "submitted_date": "31/05/2026", "reviewed_by": "HR Manager", "rating": 1},
    {"name": "OSAMA MUHAMAD ABDELGHAFOUR SHEHATA", "company": "Bulkers Marine LTD", "position": "Fitter", "codedRank": "ER-14.023", "experience": "0 yrs", "salary": "$11100", "state": "Pending", "date": "03/06/2026", "availability_date": "17/06/2026", "submitted_date": "29/06/2026", "reviewed_by": "Admin", "rating": 5},
    {"name": "AHMED MOHSEN ALI IBRAHIM ELAGAMY", "company": "Bulkers Marine LTD", "position": "Electrician", "codedRank": "ER-14.010", "experience": "0 yrs", "salary": "$14800", "state": "Pending", "date": "03/06/2026", "availability_date": "11/05/2026", "submitted_date": "03/06/2026", "reviewed_by": "HR Manager", "rating": 4},
    {"name": "WALID MOHAMED AMIN NAIM MOHAMED OSMAN", "company": "FOSS & ESG Offshore Catering", "position": "Oiler", "codedRank": "ER-14.004", "experience": "0 yrs", "salary": "$14000", "state": "Pending", "date": "03/06/2026", "availability_date": "19/05/2026", "submitted_date": "20/06/2026", "reviewed_by": "Admin", "rating": 2},
    {"name": "YEHIA IBRAHIM ABDELRASUL YOUSSEF", "company": "Anglo-Eastern Cruise Management Inc", "position": "Electrician", "codedRank": "ER-14.016", "experience": "0 yrs", "salary": "$4600", "state": "Pending", "date": "03/06/2026", "availability_date": "15/06/2026", "submitted_date": "27/06/2026", "reviewed_by": "HR Manager", "rating": 1},
    {"name": "MOHAMED IBRAHIM MOHAMED ABDELHAMID ELMARHOUMY", "company": "Bulkers Marine LTD", "position": "Bosun", "codedRank": "ER-14.024", "experience": "0 yrs", "salary": "$14000", "state": "Pending", "date": "03/06/2026", "availability_date": "20/06/2026", "submitted_date": "05/06/2026", "reviewed_by": "Captain Smith", "rating": 4},
    {"name": "ABDELMAGED RAMADAN ABDELMAGED AHMED ISSA", "company": "SALAMIS LINES LTD", "position": "Chief Officer", "codedRank": "ER-14.017", "experience": "0 yrs", "salary": "$13500", "state": "Pending", "date": "03/06/2026", "availability_date": "01/06/2026", "submitted_date": "02/06/2026", "reviewed_by": "Recruiter A", "rating": 5},
    {"name": "ALAA MAHMOUD SHEHATA RAGAB", "company": "AMS LINE SHIPPING CO", "position": "Master", "codedRank": "ER-14.009", "experience": "0 yrs", "salary": "$2200", "state": "Pending", "date": "03/06/2026", "availability_date": "24/05/2026", "submitted_date": "03/06/2026", "reviewed_by": "Admin", "rating": 4},
    {"name": "ESLAM TALAT AHMED ELTAWARGY", "company": "FOSS & ESG Offshore Catering", "position": "Oiler", "codedRank": "ER-5.003", "experience": "0 yrs", "salary": "$12200", "state": "Pending", "date": "03/06/2026", "availability_date": "27/05/2026", "submitted_date": "25/05/2026", "reviewed_by": "Admin", "rating": 1},
    {"name": "SHADY ELSAYED ELARABY MOSSAD ELIWA", "company": "NORTHGREEN MARITIME SA", "position": "Oiler", "codedRank": "ER-5.011", "experience": "0 yrs", "salary": "$8100", "state": "Pending", "date": "03/06/2026", "availability_date": "23/06/2026", "submitted_date": "27/06/2026", "reviewed_by": "Recruiter A", "rating": 4},
    {"name": "AHMED MOHAMED ABDELWADOUD ELMEZAYEN", "company": "AMS LINE SHIPPING CO", "position": "Bosun", "codedRank": "ER-5.008", "experience": "0 yrs", "salary": "$7000", "state": "Pending", "date": "03/06/2026", "availability_date": "24/06/2026", "submitted_date": "16/05/2026", "reviewed_by": "Admin", "rating": 3},
    {"name": "AWAD ABDELRAHIM ALI KHALIL", "company": "FOSS & ESG Offshore Catering", "position": "Second Engineer", "codedRank": "ER-5.012", "experience": "0 yrs", "salary": "$7800", "state": "Pending", "date": "03/06/2026", "availability_date": "01/05/2026", "submitted_date": "08/05/2026", "reviewed_by": "Admin", "rating": 4},
    {"name": "MOHAMED FARAG TAWFEK ELZAHED", "company": "SPANOPOULOS GROUP SA", "position": "Second Officer", "codedRank": "ER-5.002", "experience": "0 yrs", "salary": "$13700", "state": "Pending", "date": "03/06/2026", "availability_date": "09/05/2026", "submitted_date": "25/05/2026", "reviewed_by": "HR Manager", "rating": 2},
    {"name": "MAHMOUD ABOUELSAFA ABDELHAFIZ HASSANIN", "company": "Anglo-Eastern Cruise Management Inc", "position": "Bosun", "codedRank": "ER-5.010", "experience": "0 yrs", "salary": "$11500", "state": "Pending", "date": "03/06/2026", "availability_date": "28/06/2026", "submitted_date": "15/06/2026", "reviewed_by": "Admin", "rating": 2},
    {"name": "MOHAMED MAGDY SADIK TARABIA", "company": "SPANOPOULOS GROUP SA", "position": "Able Seaman", "codedRank": "ER-5.005", "experience": "0 yrs", "salary": "$13200", "state": "Pending", "date": "03/06/2026", "availability_date": "09/06/2026", "submitted_date": "28/06/2026", "reviewed_by": "Captain Smith", "rating": 3},
    {"name": "YOUIF AHMED KADR MOHMED ELZHAR", "company": "Columbia  Ship Management Services", "position": "Second Officer", "codedRank": "ER-5.006", "experience": "0 yrs", "salary": "$8100", "state": "Pending", "date": "03/06/2026", "availability_date": "11/06/2026", "submitted_date": "24/06/2026", "reviewed_by": "Captain Smith", "rating": 1},
    {"name": "Fares Amr Elsayed El-Gabas", "company": "SPANOPOULOS GROUP SA", "position": "Master", "codedRank": "—", "experience": "0 yrs", "salary": "$7100", "state": "Pending", "date": "03/06/2026", "availability_date": "10/05/2026", "submitted_date": "20/05/2026", "reviewed_by": "Recruiter A", "rating": 2},
    {"name": "MOHAMED ABDOU ABDOU MOUSSA ELERBANY", "company": "COSTA CROCIERE", "position": "Second Officer", "codedRank": "ER-5.009", "experience": "0 yrs", "salary": "$3100", "state": "Pending", "date": "03/06/2026", "availability_date": "05/05/2026", "submitted_date": "29/06/2026", "reviewed_by": "Admin", "rating": 5},
    {"name": "AHMED MOHAMED MOHAMED NAWAREG", "company": "NORTHGREEN MARITIME SA", "position": "Second Engineer", "codedRank": "ER-5.007", "experience": "0 yrs", "salary": "$5800", "state": "Pending", "date": "03/06/2026", "availability_date": "13/06/2026", "submitted_date": "02/05/2026", "reviewed_by": "Recruiter A", "rating": 2},
    {"name": "Aly Mohamed Aly Mohamed Mourad", "company": "DRAGONET SHIPPING Inc", "position": "Second Officer", "codedRank": "ER-5.001", "experience": "0 yrs", "salary": "$14900", "state": "Pending", "date": "03/06/2026", "availability_date": "22/05/2026", "submitted_date": "12/05/2026", "reviewed_by": "Captain Smith", "rating": 2},
    {"name": "MOSAAD MOHAMED HOSSNY SHETA", "company": "SPANOPOULOS GROUP SA", "position": "Master", "codedRank": "ER-5.004", "experience": "0 yrs", "salary": "$13200", "state": "Pending", "date": "03/06/2026", "availability_date": "20/05/2026", "submitted_date": "19/06/2026", "reviewed_by": "Admin", "rating": 1},
    {"name": "MOHAMED YOUSIF ABDALGHANY MOHAMED SHAHIN", "company": "Columbia  Ship Management Services", "position": "Second Engineer", "codedRank": "ER-5.013", "experience": "0 yrs", "salary": "$12000", "state": "Pending", "date": "03/06/2026", "availability_date": "24/05/2026", "submitted_date": "27/05/2026", "reviewed_by": "Admin", "rating": 4},
    {"name": "HOSNY TAHER ELSAYED ELSHENNAWY", "company": "BERNHARD SCHULTE CRUISE SERVICES GMBH & CO. KG", "position": "Fitter", "codedRank": "ER-7.061", "experience": "0 yrs", "salary": "$13200", "state": "Pending", "date": "03/06/2026", "availability_date": "07/05/2026", "submitted_date": "23/05/2026", "reviewed_by": "Recruiter A", "rating": 2},
    {"name": "KHALED TAREK MOHAMADY HASSANEIN", "company": "SALAMIS LINES LTD", "position": "Oiler", "codedRank": "ER-7.104", "experience": "0 yrs", "salary": "$10000", "state": "Pending", "date": "03/06/2026", "availability_date": "02/05/2026", "submitted_date": "02/05/2026", "reviewed_by": "Captain Smith", "rating": 3},
    {"name": "MOHAMED ESMAT RASHED ALI SALAMA", "company": "AMS LINE SHIPPING CO", "position": "Oiler", "codedRank": "ER-7.018", "experience": "0 yrs", "salary": "$13200", "state": "Pending", "date": "03/06/2026", "availability_date": "26/06/2026", "submitted_date": "18/05/2026", "reviewed_by": "Admin", "rating": 4},
    {"name": "ATTIA EZZAT ELGARAN", "company": "BERNHARD SCHULTE CRUISE SERVICES GMBH & CO. KG", "position": "Electrician", "codedRank": "ER-7.082", "experience": "0 yrs", "salary": "$2100", "state": "Pending", "date": "03/06/2026", "availability_date": "10/06/2026", "submitted_date": "19/05/2026", "reviewed_by": "Recruiter A", "rating": 5},
    {"name": "MOHAMED HASSAN IBRAHIM IBRAHIM KHALIL", "company": "Columbia  Ship Management Services", "position": "Fitter", "codedRank": "ER-7.093", "experience": "0 yrs", "salary": "$14900", "state": "Pending", "date": "03/06/2026", "availability_date": "26/05/2026", "submitted_date": "26/05/2026", "reviewed_by": "Captain Smith", "rating": 1},
    {"name": "YOUSSEF MOHAMED ABDELHAMID AHMED ELKABANY", "company": "FOSS & ESG Offshore Catering", "position": "Fitter", "codedRank": "ER-7.086", "experience": "0 yrs", "salary": "$7300", "state": "Pending", "date": "03/06/2026", "availability_date": "20/06/2026", "submitted_date": "21/05/2026", "reviewed_by": "Recruiter A", "rating": 5},
    {"name": "FAWZY MOHAMED HAMZA MOHAMED", "company": "DRAGONET SHIPPING Inc", "position": "Second Officer", "codedRank": "ER-7.094", "experience": "0 yrs", "salary": "$10600", "state": "Pending", "date": "03/06/2026", "availability_date": "18/05/2026", "submitted_date": "14/05/2026", "reviewed_by": "HR Manager", "rating": 4},
    {"name": "Hassan Mohamed Hassan Mohamed Aporesha", "company": "NORTHGREEN MARITIME SA", "position": "Oiler", "codedRank": "ER-7.091", "experience": "0 yrs", "salary": "$14800", "state": "Pending", "date": "03/06/2026", "availability_date": "22/06/2026", "submitted_date": "09/06/2026", "reviewed_by": "Admin", "rating": 4},
    {"name": "Alaa Hamdy Mohamed Abdellatif", "company": "NORTHGREEN MARITIME SA", "position": "Master", "codedRank": "ER-7.103", "experience": "0 yrs", "salary": "$14500", "state": "Pending", "date": "03/06/2026", "availability_date": "08/05/2026", "submitted_date": "24/05/2026", "reviewed_by": "HR Manager", "rating": 4},
    {"name": "Mohamed Hassan Mohaseb Barbary", "company": "NORTHGREEN MARITIME SA", "position": "Chief Engineer", "codedRank": "ER-7.108", "experience": "0 yrs", "salary": "$14900", "state": "Pending", "date": "03/06/2026", "availability_date": "29/05/2026", "submitted_date": "04/06/2026", "reviewed_by": "Captain Smith", "rating": 5},
    {"name": "Mohamed Ramadan ali mohamed", "company": "SALAMIS LINES LTD", "position": "Chief Engineer", "codedRank": "ER-7.019", "experience": "0 yrs", "salary": "$7200", "state": "Pending", "date": "03/06/2026", "availability_date": "06/06/2026", "submitted_date": "29/05/2026", "reviewed_by": "HR Manager", "rating": 4},
    {"name": "HADY ESAM ELSAYED SHABRON", "company": "DRAGONET SHIPPING Inc", "position": "Second Engineer", "codedRank": "ER-7.077", "experience": "0 yrs", "salary": "$8700", "state": "Pending", "date": "03/06/2026", "availability_date": "02/05/2026", "submitted_date": "06/06/2026", "reviewed_by": "HR Manager", "rating": 5},
    {"name": "AHMED YOUSSEF ALY", "company": "APREMAR TUNISIA", "position": "Chief Engineer", "codedRank": "ER-14.050", "experience": "3 yrs", "salary": "$13900", "state": "Shortlisted", "date": "12/06/2026", "availability_date": "03/05/2026", "submitted_date": "19/06/2026", "reviewed_by": "Admin", "rating": 1},
    {"name": "MOHAMED TAREK HASSAN", "company": "COSTA CROCIERE", "position": "Chief Officer", "codedRank": "ER-14.051", "experience": "5 yrs", "salary": "$8200", "state": "Approved", "date": "06/06/2026", "availability_date": "29/05/2026", "submitted_date": "07/06/2026", "reviewed_by": "Captain Smith", "rating": 5},
    {"name": "KHALED MAGDY SAAD", "company": "Columbia  Ship Management Services", "position": "Fitter", "codedRank": "ER-14.052", "experience": "2 yrs", "salary": "$3800", "state": "Interviewed", "date": "09/06/2026", "availability_date": "02/06/2026", "submitted_date": "27/06/2026", "reviewed_by": "HR Manager", "rating": 5}
]

print("Wiping existing records...")
CVSubmission.objects.all().delete()
Ship.objects.all().delete()
Company.objects.all().delete()

print("Seeding Companies...")
for c in companies_data:
    ctype, _ = CompanyType.objects.get_or_create(name=c['type'])
    notes_parts = []
    if c['hourRate']: notes_parts.append(f"hourRate: {c['hourRate']}")
    if c['openPositions'] is not None: notes_parts.append(f"openPositions: {c['openPositions']}")
    
    Company.objects.create(
        company_name=c['name'],
        company_type=ctype,
        contact_email=c['email'],
        website=c['website'] if c['website'] != '-' else '',
        status=c['status']
    )

print("Seeding Ships...")
for s in ships_data:
    vtype, _ = VesselType.objects.get_or_create(name=s['type'])
    company = Company.objects.filter(company_name=s['associatedWithCompany']).first()
    flag, _ = Flag.objects.get_or_create(name=s['flag'])
    
    notes_parts = []
    notes_parts.append(f"shipCrew: {s['shipCrew']}")
    notes_parts.append(f"jobOrdersCount: {s['jobOrdersCount']}")
    notes_parts.append(f"jobOrders: {s['jobOrders']}")
    notes_parts.append(f"crewCount: {s['crewCount']}")

    year_built = None
    if s['yearBuilt'] != 'N/A':
        try:
            year_built = int(float(s['yearBuilt']))
        except:
            pass

    imo = s['imoNumber']
    if imo != 'N/A':
        imo = str(int(float(imo)))
    else:
        imo = ''

    Ship.objects.create(
        ship_name=s['name'],
        ship_type=vtype,
        company=company,
        imo_number=imo,
        flag=flag,
        gross_tonnage=s['grossTonnage'],
        deadweight=s['deadweight'],
        engine_type=s['engineType'],
        engine_power_kw=s['enginePower'],
        year_built=year_built,
        official_no=s['officialNo'],
        status=s['status'],
        # Unfortunately, the Ship model might not have a notes field based on our print_models.py.
        # So we just ignore them to avoid exceptions, or log them.
    )

print("Seeding Users (CVs)...")
for u in users_data:
    parts = u['name'].split(' ', 1)
    first_name = parts[0]
    middle_name = parts[1] if len(parts) > 1 else ''
    
    # Delete existing if it shares an email or ID
    Users.objects.filter(email=u['email']).delete()
    user = Users.objects.create(
        first_name=first_name,
        middle_name=middle_name,
        generated_id=u['generated_id'],
        email=u['email'],
        phone_number=u['phone'],
        user_status=u['status'],
        role='Employee',
        password=make_password('password123')
    )

print("Seeding CV Submissions...")
for cv in cv_submissions_data:
    # Look for a user with this name
    parts = cv['name'].split(' ', 1)
    first_name = parts[0]
    middle_name = parts[1] if len(parts) > 1 else ''
    
    import uuid
    user = Users.objects.filter(first_name=first_name, middle_name=middle_name).first()
    if not user:
        unique_id = uuid.uuid4().hex[:8]
        user = Users.objects.create(
            first_name=first_name,
            middle_name=middle_name,
            email=f"{first_name.lower()}_{unique_id}@example.com",
            role='Employee',
            password=make_password('password123')
        )
    
    company = Company.objects.filter(company_name=cv['company']).first()
    
    rank_code = cv.get('codedRank', '')
    rank, _ = Rank.objects.get_or_create(
        code=rank_code,
        defaults={'name': cv['position']}
    )
    
    notes_parts = []
    notes_parts.append(f"codedRank: {cv['codedRank']}")
    notes_parts.append(f"date: {cv['date']}")
    
    avail_date = parse_date(cv['availability_date'])
    sub_date = parse_date(cv['submitted_date'])
    
    reviewer_name = cv['reviewed_by']
    reviewer_user = None
    if reviewer_name:
        reviewer_user, _ = Users.objects.get_or_create(
            first_name=reviewer_name,
            defaults={
                'email': f"{reviewer_name.replace(' ', '').lower()}@example.com",
                'role': 'HR Manager',
                'password': make_password('password123')
            }
        )
    
    CVSubmission.objects.create(
        user=user,
        company=company,
        position=rank,
        experience_years=parse_experience(cv['experience']),
        expected_salary=parse_salary(cv['salary']),
        status=cv['state'],
        availability_date=avail_date,
        submitted_date=sub_date,
        reviewed_by=reviewer_user,
        rating=cv['rating'],
        notes=", ".join(notes_parts)
    )

print(f"Counts -> Companies: {Company.objects.count()}, Ships: {Ship.objects.count()}, Users: {Users.objects.count()}, CVSubmissions: {CVSubmission.objects.count()}")
