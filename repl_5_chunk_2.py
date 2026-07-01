    # Explicitly find checkboxes near the words
    import re
    checked_match = re.search(r'\[\s*[xXvV✓☑☒]\s*\]|☒|☑|✓', ms_raw)
    if checked_match:
        x_idx = checked_match.start()
        m_idx = ms_raw.lower().find("married")
        s_idx = ms_raw.lower().find("single")
        
        if m_idx != -1 and s_idx != -1:
            if abs(x_idx - m_idx) < abs(x_idx - s_idx):
                is_married = True
                is_single = False
            else:
                is_single = True
                is_married = False
        elif m_idx != -1:
            is_married = True
            is_single = False
        elif s_idx != -1:
            is_single = True
            is_married = False
    else:
        if is_married and is_single:
            is_married = False
            is_single = False
