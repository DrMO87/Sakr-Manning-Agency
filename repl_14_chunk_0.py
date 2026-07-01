    }

class _PersonalDetailsResult(BaseModel):
    personal_details: PersonalDetails

def _build_personal_details_prompt(text: str) -> str:
    """Build a compact LLM prompt for Personal Details extraction."""
    target_text = text[:3000]
    return f"""You are a maritime HR data extractor.
Extract ALL personal details from the top of this seafarer CV.
Focus on correctly associating data with labels, even if formatting is messy (e.g. empty checkboxes, misaligned table cells).
CRITICAL: For Marital Status, carefully identify which checkbox or label is actually filled or checked (e.g., [x], [v], tick) versus which one is empty (e.g., [ ]).
CRITICAL: Do not bleed unrelated fields together (e.g. do not put Passport info into Nearest Port, do not put Date of Birth into Height).

--- CV TEXT ---
{target_text}
"""

def _build_marine_courses_prompt(text: str, table: list) -> str:
