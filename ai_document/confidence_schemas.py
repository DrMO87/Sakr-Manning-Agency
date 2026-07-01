"""
Pydantic schemas for CV extraction with confidence scores and doubted flags.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict, Union


class ExtractedString(BaseModel):
    value: Optional[str] = Field(default="")
    confidence: float = Field(default=1.0)
    doubted: bool = Field(default=False)

class ExtractedBool(BaseModel):
    value: Optional[bool] = Field(default=False)
    confidence: float = Field(default=1.0)
    doubted: bool = Field(default=False)


class ApplicationMeta(BaseModel):
    application_for_position_as: ExtractedString = Field(default_factory=ExtractedString)
    register_code: ExtractedString = Field(default_factory=ExtractedString)
    other_position: ExtractedString = Field(default_factory=ExtractedString)
    register_date: ExtractedString = Field(default_factory=ExtractedString)
    last_update_data: ExtractedString = Field(default_factory=ExtractedString)


class MaritalStatus(BaseModel):
    single: ExtractedBool = Field(default_factory=ExtractedBool)
    married: ExtractedBool = Field(default_factory=ExtractedBool)


class PersonalDetails(BaseModel):
    full_name: ExtractedString = Field(default_factory=ExtractedString)
    date_of_birth: ExtractedString = Field(default_factory=ExtractedString)
    marital_status: MaritalStatus = Field(default_factory=MaritalStatus)
    nationality: ExtractedString = Field(default_factory=ExtractedString)
    height_cm: ExtractedString = Field(default_factory=ExtractedString)
    weight_kg: ExtractedString = Field(default_factory=ExtractedString)
    place_of_birth: ExtractedString = Field(default_factory=ExtractedString)
    overall_size: ExtractedString = Field(default_factory=ExtractedString)
    shirt_size: ExtractedString = Field(default_factory=ExtractedString)
    nearest_port: ExtractedString = Field(default_factory=ExtractedString)
    trouser_size: ExtractedString = Field(default_factory=ExtractedString)
    shoes_size: ExtractedString = Field(default_factory=ExtractedString)


class MarlineTest(BaseModel):
    issued_date: ExtractedString = Field(default_factory=ExtractedString)
    result_percentage: ExtractedString = Field(default_factory=ExtractedString)
    issued_by_authority: ExtractedString = Field(default_factory=ExtractedString)
    issued_at: ExtractedString = Field(default_factory=ExtractedString)


class LanguageLevel(BaseModel):
    fluent: ExtractedBool = Field(default_factory=ExtractedBool)
    good: ExtractedBool = Field(default_factory=ExtractedBool)
    average: ExtractedBool = Field(default_factory=ExtractedBool)
    poor: ExtractedBool = Field(default_factory=ExtractedBool)


class Education(BaseModel):
    college_school: ExtractedString = Field(default_factory=ExtractedString)
    marline_test: MarlineTest = Field(default_factory=MarlineTest)
    english_language: LanguageLevel = Field(default_factory=LanguageLevel)
    german_language: LanguageLevel = Field(default_factory=LanguageLevel)


class ContactDetails(BaseModel):
    home_address_city: ExtractedString = Field(default_factory=ExtractedString)
    e_mail: ExtractedString = Field(default_factory=ExtractedString)
    mobile_tel: ExtractedString = Field(default_factory=ExtractedString)


class TravelDocument(BaseModel):
    type: ExtractedString = Field(default_factory=ExtractedString)
    document_no: ExtractedString = Field(default_factory=ExtractedString)
    iss_date: ExtractedString = Field(default_factory=ExtractedString)
    exp_date: ExtractedString = Field(default_factory=ExtractedString)
    iss_by_authority: ExtractedString = Field(default_factory=ExtractedString)
    place_of_issue: ExtractedString = Field(default_factory=ExtractedString)


class ProfessionalQualification(BaseModel):
    certificate_name: ExtractedString = Field(default_factory=ExtractedString)
    number: ExtractedString = Field(default_factory=ExtractedString)
    issue_date: ExtractedString = Field(default_factory=ExtractedString)
    expiry_date: ExtractedString = Field(default_factory=ExtractedString)
    issued_by: ExtractedString = Field(default_factory=ExtractedString)
    issued_at: ExtractedString = Field(default_factory=ExtractedString)


class NextOfKin(BaseModel):
    full_name: ExtractedString = Field(default_factory=ExtractedString)
    relationship: ExtractedString = Field(default_factory=ExtractedString)
    address: ExtractedString = Field(default_factory=ExtractedString)
    tel_no: ExtractedString = Field(default_factory=ExtractedString)
    mobile: ExtractedString = Field(default_factory=ExtractedString)
    # Old fields kept optional
    address_country: ExtractedString = Field(default_factory=ExtractedString)
    tel_no_mobile: ExtractedString = Field(default_factory=ExtractedString)
    email: ExtractedString = Field(default_factory=ExtractedString)


class HealthCertificate(BaseModel):
    flag_state: ExtractedString = Field(default_factory=ExtractedString)
    number: ExtractedString = Field(default_factory=ExtractedString)
    issue_date: ExtractedString = Field(default_factory=ExtractedString)
    expiry_date: ExtractedString = Field(default_factory=ExtractedString)
    issued_by: ExtractedString = Field(default_factory=ExtractedString)
    issued_at: ExtractedString = Field(default_factory=ExtractedString)


class Covid19(BaseModel):
    vaccination_name: ExtractedString = Field(default_factory=ExtractedString)
    first_dose: ExtractedString = Field(default_factory=ExtractedString)
    second_dose: ExtractedString = Field(default_factory=ExtractedString)
    other_does_or_remarks: ExtractedString = Field(default_factory=ExtractedString)


class HealthSection(BaseModel):
    certificates: List[HealthCertificate] = []
    covid_19: Covid19 = Field(default_factory=Covid19)


class MarineCourse(BaseModel):
    course_name: ExtractedString = Field(default_factory=ExtractedString)
    number: ExtractedString = Field(default_factory=ExtractedString)
    issue_date: ExtractedString = Field(default_factory=ExtractedString)
    expiry_date: ExtractedString = Field(default_factory=ExtractedString)
    issued_by_at: ExtractedString = Field(default_factory=ExtractedString)


class ApplicantInfo(BaseModel):
    name: ExtractedString = Field(default_factory=ExtractedString)
    rank: ExtractedString = Field(default_factory=ExtractedString)
    register_code: ExtractedString = Field(default_factory=ExtractedString)


class ServiceRecord(BaseModel):
    company_name: ExtractedString = Field(default_factory=ExtractedString)
    rank: ExtractedString = Field(default_factory=ExtractedString)
    vessel_name: ExtractedString = Field(default_factory=ExtractedString)
    signed_on: ExtractedString = Field(default_factory=ExtractedString)
    signed_off: ExtractedString = Field(default_factory=ExtractedString)
    period: ExtractedString = Field(default_factory=ExtractedString)
    vessel_type: ExtractedString = Field(default_factory=ExtractedString)
    dwt: ExtractedString = Field(default_factory=ExtractedString)
    engine_type: ExtractedString = Field(default_factory=ExtractedString)
    bh: ExtractedString = Field(default_factory=ExtractedString)
    kw: ExtractedString = Field(default_factory=ExtractedString)
    # Old fields kept optional
    vessel_name_imo_number: ExtractedString = Field(default_factory=ExtractedString)
    flag: ExtractedString = Field(default_factory=ExtractedString)
    dwt_grt: ExtractedString = Field(default_factory=ExtractedString)
    bh_kw: ExtractedString = Field(default_factory=ExtractedString)
    reason_for_sign_off: ExtractedString = Field(default_factory=ExtractedString)


class SpecialisedExperience(BaseModel):
    name: ExtractedString = Field(default_factory=ExtractedString)
    type: ExtractedString = Field(default_factory=ExtractedString)
    from_date: ExtractedString = Field(default_factory=ExtractedString)
    to_date: ExtractedString = Field(default_factory=ExtractedString)
    comments: ExtractedString = Field(default_factory=ExtractedString)


class SeaServiceSection(BaseModel):
    applicant_info: ApplicantInfo = Field(default_factory=ApplicantInfo)
    service_records: List[ServiceRecord] = []
    specialised_experience: List[SpecialisedExperience] = []


class Reference(BaseModel):
    no: ExtractedString = Field(default_factory=ExtractedString)
    company_management_country: ExtractedString = Field(default_factory=ExtractedString)
    position: ExtractedString = Field(default_factory=ExtractedString)
    name: ExtractedString = Field(default_factory=ExtractedString)
    tel: ExtractedString = Field(default_factory=ExtractedString)
    email: ExtractedString = Field(default_factory=ExtractedString)


class DeclarationAnswer(BaseModel):
    answer: ExtractedString = Field(default_factory=lambda: ExtractedString(value="NO"))
    details: ExtractedString = Field(default_factory=ExtractedString)


class DeclarationQuestions(BaseModel):
    suffer_disease_unfit_for_sea: DeclarationAnswer = Field(default_factory=DeclarationAnswer)
    addicted_to_alcohol_or_drugs: DeclarationAnswer = Field(default_factory=DeclarationAnswer)
    suffer_accident_disabled: DeclarationAnswer = Field(default_factory=DeclarationAnswer)
    undergo_psychiatric_treatment: DeclarationAnswer = Field(default_factory=DeclarationAnswer)


class Declaration(BaseModel):
    questions: DeclarationQuestions = Field(default_factory=DeclarationQuestions)
    consent_statement: ExtractedString = Field(default_factory=ExtractedString)
    place: ExtractedString = Field(default_factory=ExtractedString)
    date: ExtractedString = Field(default_factory=ExtractedString)
    signature: ExtractedString = Field(default_factory=ExtractedString)


class ResponsiblePerson(BaseModel):
    name_signature: ExtractedString = Field(default_factory=ExtractedString)
    date: ExtractedString = Field(default_factory=ExtractedString)


class OfficeUseOnly(BaseModel):
    initial_assessment_of_applicant: ExtractedString = Field(default_factory=ExtractedString)
    comments: ExtractedString = Field(default_factory=ExtractedString)
    responsible_person: ResponsiblePerson = Field(default_factory=ResponsiblePerson)


class SeafarerApplicationWithConfidence(BaseModel):
    field_0_application_meta: ApplicationMeta = Field(default_factory=ApplicationMeta, alias="0_application_meta")
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
            "0_application_meta": self.field_0_application_meta.model_dump(),
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
    Recursively remove the ExtractedString wrapper and return just the values.
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
