class _SeaServiceResult(BaseModel):
    applicant_name: str = ""
    rank: str = ""
    register_code: str = ""
    service_records: List[_ServiceRecordItem] = Field(default_factory=list)
    specialised_experience: List[_SpecialisedExperienceItem] = Field(default_factory=list)
