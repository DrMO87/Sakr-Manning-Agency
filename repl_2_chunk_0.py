                        # Case B: Horizontal Table (Header row, Value row immediately below)
                        if r_idx + 1 < len(table) and c_idx < len(table[r_idx + 1]):
                            val = table[r_idx + 1][c_idx].strip()
                            if val and _is_valid_value(val, labels) and val.upper() != cell.strip().upper():
                                return val

                        # Case C: Empty cell definitively found
                        # If the cell text is almost EXACTLY the label, and we found no value, return ""
                        # to prevent greedy regex fallback from grabbing neighboring sections.
                        c_clean = re.sub(r'[^a-z0-9]', '', cell.lower())
                        l_clean = re.sub(r'[^a-z0-9]', '', label_lower)
                        if l_clean == c_clean or l_clean in c_clean.replace("cm", "").replace("kg", ""):
                            return ""
