def _phone(text: str) -> str:
    """Return the first phone number found, scrubbed to only digits/plus."""
    patterns = [
        r"\+\d{1,3}[\s\-]?\d[\d\s\-]{6,15}",
        r"\b0\d[\d\s\-]{8,15}\b",
    ]
    for p in patterns:
        import re
        m = re.search(p, text)
        if m:
            # Clean up the matched phone number to only contain + and digits
            return re.sub(r'[^\d\+]', '', m.group(0))
    return ""
