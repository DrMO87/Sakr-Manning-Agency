"""
Pydantic schemas for CV extraction with confidence scores and doubted flags.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict, Union


class ExtractedField(BaseModel):
    """Wrapper for any extracted field to include confidence tracking."""
    value: Union[str, bool, None] = Field(description="The extracted value. Use empty string or None if missing.")
    confidence: float = Field(default=1.0, description="Confidence score of the extraction from 0.0 to 1.0. Lower it if the text was ambiguous or hard to read.")
    doubted: bool = Field(default=False, description="Set to true if you are unsure about the extraction, if it might be a hallucination, or if the source text was ambiguous.")


class MaritalStatus(BaseModel):
    single: ExtractedField = Field(default_factory=lambda: ExtractedField(value=False))
    married: ExtractedField = Field(default_factory=lambda: ExtractedField(value=False))


class PersonalDetails(BaseModel):
    full_name: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    date_of_birth: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    marital_status: MaritalStatus = Field(default_factory=MaritalStatus)
    nationality: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    height_cm: ExtractedField = Field(default_factory=lambda: ExtractedField(value=None))
    weight_kg: ExtractedField = Field(default_factory=lambda: ExtractedField(value=None))
    place_of_birth: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    overall_size: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    shirt_size: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    nearest_port: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    trouser_size: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    shoes_size: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class MarlineTest(BaseModel):
    issued_date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    result_percentage: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    issued_by_authority: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    issued_at: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class LanguageLevel(BaseModel):
    fluent: ExtractedField = Field(default_factory=lambda: ExtractedField(value=False))
    good: ExtractedField = Field(default_factory=lambda: ExtractedField(value=False))
    average: ExtractedField = Field(default_factory=lambda: ExtractedField(value=False))
    poor: ExtractedField = Field(default_factory=lambda: ExtractedField(value=False))


class Education(BaseModel):
    college_school: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    marline_test: MarlineTest = Field(default_factory=MarlineTest)
    english_language: LanguageLevel = Field(default_factory=LanguageLevel)
    german_language: LanguageLevel = Field(default_factory=LanguageLevel)


class ContactDetails(BaseModel):
    home_address_city: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    e_mail: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    mobile_tel: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class TravelDocument(BaseModel):
    type: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    document_no: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    iss_date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    exp_date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    iss_by_authority: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    place_of_issue: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class ProfessionalQualification(BaseModel):
    certificate_name: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    number: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    issue_date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    expiry_date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    issued_by: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    issued_at: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class NextOfKin(BaseModel):
    full_name: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    address_country: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    tel_no_mobile: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    relationship: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    email: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class HealthCertificate(BaseModel):
    flag_state: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    number: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    issue_date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    expiry_date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    issued_by: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    issued_at: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class Covid19(BaseModel):
    vaccination_name: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    first_dose: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    second_dose: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    other_does_or_remarks: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class HealthSection(BaseModel):
    certificates: List[HealthCertificate] = []
    covid_19: Covid19 = Field(default_factory=Covid19)


class MarineCourse(BaseModel):
    course_name: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    number: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    issue_date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    expiry_date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    issued_by_at: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class ApplicantInfo(BaseModel):
    name: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    rank: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    register_code: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class ServiceRecord(BaseModel):
    company_name: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    rank: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    vessel_name_imo_number: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    flag: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    signed_on: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    signed_off: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    period: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    vessel_type: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    dwt_grt: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    engine_type: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    bh_kw: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    reason_for_sign_off: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class SeaServiceSection(BaseModel):
    applicant_info: ApplicantInfo = Field(default_factory=ApplicantInfo)
    service_records: List[ServiceRecord] = []


class Reference(BaseModel):
    no: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    company_management_country: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    position: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    name: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    tel: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    email: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class DeclarationAnswer(BaseModel):
    answer: ExtractedField = Field(default_factory=lambda: ExtractedField(value="NO"))
    details: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class DeclarationQuestions(BaseModel):
    suffer_disease_unfit_for_sea: DeclarationAnswer = Field(default_factory=DeclarationAnswer)
    addicted_to_alcohol_or_drugs: DeclarationAnswer = Field(default_factory=DeclarationAnswer)
    suffer_accident_disabled: DeclarationAnswer = Field(default_factory=DeclarationAnswer)
    undergo_psychiatric_treatment: DeclarationAnswer = Field(default_factory=DeclarationAnswer)


class Declaration(BaseModel):
    questions: DeclarationQuestions = Field(default_factory=DeclarationQuestions)
    consent_statement: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    place: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    signature: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class ResponsiblePerson(BaseModel):
    name_signature: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    date: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))


class OfficeUseOnly(BaseModel):
    initial_assessment_of_applicant: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    comments: ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))
    responsible_person: ResponsiblePerson = Field(default_factory=ResponsiblePerson)


class SeafarerApplicationWithConfidence(BaseModel):
    field_1_personal_details: PersonalDetails = Field(default_factory=PersonalDetails, alias="1_personal_details")
    field_2_education: Education = Field(default_factory=Education, alias="2_education")
    field_3_contact_details: ContactDetails = Field(default_factory=ContactDetails, alias="3_contact_details")
    field_4_travel_documents: List[TravelDocument] = Field(default_factory=list, alias="4_travel_documents")
    field_5_professional_qualifications: List[ProfessionalQualification] = Field(default_factory=list, alias="5_professional_qualification_certificate_of_competency")
    field_6_next_of_kin: NextOfKin = Field(default_factory=NextOfKin, alias="6_next_of_kin_emergency_contact")
    field_7_health: HealthSection = Field(default_factory=HealthSection, alias="7_health_certificates_and_vaccinations")
    field_8_marine_courses: List[MarineCourse] = Field(default_factory=list, alias="8_marine_courses")
    field_9_sea_service: SeaServiceSection = Field(default_factory=SeaServiceSection, alias="9_complete_sea_service_details")
    field_10_references: List[Reference] = Field(default_factory=list, alias="10_references")
    field_11_declaration: Declaration = Field(default_factory=Declaration, alias="11_declaration")
    field_12_office_use: OfficeUseOnly = Field(default_factory=OfficeUseOnly, alias="12_for_office_use_only")

    model_config = {"populate_by_name": True}

    def to_numbered_dict(self) -> dict:
        """Export with the numbered key names."""
        return {
            "1_personal_details": self.field_1_personal_details.model_dump(),
            "2_education": self.field_2_education.model_dump(),
            "3_contact_details": self.field_3_contact_details.model_dump(),
            "4_travel_documents": [d.model_dump() for d in self.field_4_travel_documents],
            "5_professional_qualification_certificate_of_competency": [
                q.model_dump() for q in self.field_5_professional_qualifications
            ],
            "6_next_of_kin_emergency_contact": self.field_6_next_of_kin.model_dump(),
            "7_health_certificates_and_vaccinations": self.field_7_health.model_dump(),
            "8_marine_courses": [c.model_dump() for c in self.field_8_marine_courses],
            "9_complete_sea_service_details": self.field_9_sea_service.model_dump(),
            "10_references": [r.model_dump() for r in self.field_10_references],
            "11_declaration": self.field_11_declaration.model_dump(),
            "12_for_office_use_only": self.field_12_office_use.model_dump(),
        }

def unwrap_confidence(data: Any) -> Any:
    """
    Recursively remove the ExtractedField wrapper and return just the values.
    This is used before saving to the database so the DB schema remains unchanged.
    """
    if isinstance(data, dict):
        if "value" in data and "confidence" in data and "doubted" in data:
            return data["value"]
        return {k: unwrap_confidence(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [unwrap_confidence(item) for item in data]
    return data

def get_doubted_fields(data, prefix=""):
    doubted = []
    if isinstance(data, dict):
        if "value" in data and "confidence" in data and "doubted" in data:
            if data["doubted"] or data["confidence"] < 0.7:
                doubted.append(prefix.strip("."))
        else:
            for k, v in data.items():
                new_prefix = f"{prefix}.{k}" if prefix else str(k)
                doubted.extend(get_doubted_fields(v, new_prefix))
    elif isinstance(data, list):
        for i, item in enumerate(data):
            new_prefix = f"{prefix}[{i}]"
            doubted.extend(get_doubted_fields(item, new_prefix))
    return doubted
