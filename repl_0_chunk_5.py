    return {
        "0_application_meta": app_meta.model_dump(),
        "1_personal_details": personal.model_dump(),
        "2_education": education.model_dump(),
        "3_contact_details": contact.model_dump(),
        "4_travel_documents": [d.model_dump() for d in travel],
        "5_professional_qualification_certificate_of_competency": [
            q.model_dump() for q in qualifications
        ],
        "6_next_of_kin_emergency_contact": nok.model_dump(),
        "7_health_certificates_and_vaccinations": health.model_dump(),
        "8_marine_courses": [c.model_dump() for c in marine_courses],
        "9_complete_sea_service_details": sea_service.model_dump(),
        "10_references": [r.model_dump() for r in references],
        "11_declaration": declaration.model_dump(),
        "12_for_office_use_only": office.model_dump(),
    }
