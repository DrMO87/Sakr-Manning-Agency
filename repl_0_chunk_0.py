def _extract_application_meta(text: str) -> ApplicationMeta:
    from .schemas import ApplicationMeta
    return ApplicationMeta(
        application_for_position_as=_field(text, "Application For Position as", "Position Applied", "Rank"),
        register_code=_field(text, "Register Code", "Reg. Code"),
        other_position=_field(text, "Other Position (If Any)", "Other Position"),
        register_date=_field(text, "Register Date"),
        last_update_data=_field(text, "Last up Date Data", "Last Update Date"),
    )

def _extract_personal(text: str) -> PersonalDetails:
