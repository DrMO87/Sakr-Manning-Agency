                        c_clean = re.sub(r'[^a-z0-9]', '', cell.lower())
                        l_clean = re.sub(r'[^a-z0-9]', '', label_lower)
                        if c_clean and l_clean and (c_clean == l_clean or c_clean in l_clean or l_clean in c_clean):
                            return ""
