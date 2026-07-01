    ms_raw = _field(text, "Marital Status", "Marital_Status", "Status", "Marital").lower()
    
    # Fuzzy check: if the extracted value contains keywords, set the bools
    is_married = any(kw in ms_raw for kw in ["married", "widow", "divorce"])
    is_single = any(kw in ms_raw for kw in ["single", "unmarried", "bachelor"])
    
    # In some layouts, the [x] is what we look for. 
    # If the text is "[x] Single [ ] Married", both keywords exist.
    import re
    checked_match = re.search(r'\[\s*[xXvV✓☑☒]\s*\]|☒|☑|✓', ms_raw)
    if checked_match:
        x_idx = checked_match.start()
        m_idx = ms_raw.find("married")
        s_idx = ms_raw.find("single")
        
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

    marital = MaritalStatus(single=is_single, married=is_married)
