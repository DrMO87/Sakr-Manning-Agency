with open(r'd:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\ai_document\confidence_schemas.py', 'r') as f:
    content = f.read()

# Replace ExtractedField definition completely
content = content.replace('''class ExtractedField(BaseModel):
    """Wrapper for any extracted field to include confidence tracking."""
    value: Union[str, bool, None] = Field(description="The extracted value. Use empty string or None if missing.")
    confidence: float = Field(default=1.0, description="Confidence score of the extraction from 0.0 to 1.0. Lower it if the text was ambiguous or hard to read.")
    doubted: bool = Field(default=False, description="Set to true if you are unsure about the extraction, if it might be a hallucination, or if the source text was ambiguous.")''', 
'''class ExtractedString(BaseModel):
    value: Optional[str] = Field(default="")
    confidence: float = Field(default=1.0)
    doubted: bool = Field(default=False)

class ExtractedBool(BaseModel):
    value: Optional[bool] = Field(default=False)
    confidence: float = Field(default=1.0)
    doubted: bool = Field(default=False)''')

content = content.replace(': ExtractedField = Field(default_factory=ExtractedField)', ': ExtractedString = Field(default_factory=ExtractedString)')
content = content.replace(': ExtractedField = Field(default_factory=lambda: ExtractedField(value=False))', ': ExtractedBool = Field(default_factory=ExtractedBool)')
content = content.replace(': ExtractedField = Field(default_factory=lambda: ExtractedField(value=None))', ': ExtractedString = Field(default_factory=ExtractedString)')
content = content.replace(': ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))', ': ExtractedString = Field(default_factory=ExtractedString)')
content = content.replace('ExtractedField', 'ExtractedString')

with open(r'd:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\ai_document\confidence_schemas.py', 'w') as f:
    f.write(content)
