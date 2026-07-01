from ai_document.confidence_schemas import unwrap_confidence

test_data = {
    "1_personal_details": {
        "full_name": {"value": "John Doe", "confidence": 1.0, "doubted": False},
        "marital_status": {
            "single": {"value": True, "confidence": 1.0, "doubted": False}
        }
    }
}
print(unwrap_confidence(test_data))
