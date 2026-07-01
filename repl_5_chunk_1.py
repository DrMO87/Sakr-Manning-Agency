                # --- Case C: Table Cell is actually empty ---
                # Check if the extracted cell content is exactly the label text
                # This happens when PDF converts an empty table row into adjacent cells:
                # E.g. [ "Height Cm", "Height Cm" ] instead of [ "Height Cm", "" ]
                import re
                c_clean = re.sub(r'[^a-z0-9]', '', cell.lower())
                l_clean = re.sub(r'[^a-z0-9]', '', label_lower)
                if c_clean and l_clean and (c_clean == l_clean or c_clean in l_clean or l_clean in c_clean):
                    if _is_valid_value("", labels): return ""
                    
                # Strict length constraint for Nearest Port to avoid massive bleed over
                if label_lower == "nearest port" and len(cell) > 40:
                    return ""
