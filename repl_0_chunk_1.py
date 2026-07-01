                    company_name=_field(window, "Company", "Employer"),
                    rank=rank,
                    vessel_name=_field(window, "Vessel Name", "Vessel", "Ship", "MV", "MT"),
                    vessel_name_imo_number=_field(window, "Vessel Name", "Vessel", "Ship", "MV", "MT"),
                    flag=_field(window, "Flag"),
                    signed_on=dates[0],
                    signed_off=dates[1],
                    vessel_type=_field(window, "Vessel Type", "Ship Type", "Type"),
                    dwt=_field(window, "DWT", "DWT/GRT", "GRT"),
                    dwt_grt=_field(window, "DWT", "DWT/GRT", "GRT"),
                    engine_type=_field(window, "Engine Type", "Engine"),
                    bh=_field(window, "BH", "BHP", "KW", "BH/KW"),
                    kw=_field(window, "KW", "BH/KW", "BHP"),
                    bh_kw=_field(window, "BH/KW", "BHP", "KW"),
                    reason_for_sign_off=_field(window, "Reason", "Sign Off Reason"),
                ))

    return SeaServiceSection(applicant_info=info, service_records=records, specialised_experience=[])
