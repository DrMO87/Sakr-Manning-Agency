class _ServiceRecordItem(BaseModel):
    company_name: str = ""
    rank: str = ""
    vessel_name: str = ""
    signed_on: str = ""
    signed_off: str = ""
    period: str = ""
    vessel_type: str = ""
    dwt: str = ""
    engine_type: str = ""
    bh: str = ""
    kw: str = ""
    
class _SpecialisedExperienceItem(BaseModel):
    name: str = ""
    type: str = ""
    from_date: str = ""
    to_date: str = ""
    comments: str = ""
