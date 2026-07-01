    val_clean = re.sub(r'[^a-z0-9\s]', '', val_lower).strip()
    val_clean = re.sub(r'\s+', ' ', val_clean)
    if val_clean in KNOWN_CV_LABELS:
        return False
        
    for lbl in KNOWN_CV_LABELS:
        if val_lower.startswith(lbl + " ") or val_lower.startswith(lbl + ":") or val_lower.startswith(lbl + "\n"):
            return False
