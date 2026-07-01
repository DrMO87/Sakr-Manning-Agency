    _set_tables(tables)  # Thread-safe table store for _field() helpers

    app_meta = _extract_application_meta(text)
    personal = _extract_personal(text)
