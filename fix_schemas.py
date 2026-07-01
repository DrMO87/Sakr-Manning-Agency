import re
with open(r'd:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\ai_document\confidence_schemas.py', 'r') as f:
    content = f.read()

# Replace ExtractedField with ExtractedString and ExtractedBool
new_base = '''
class ExtractedString(BaseModel):
    value: Optional[str] = Field(default="", description="Value")
    confidence: float = Field(default=1.0)
    doubted: bool = Field(default=False)

class ExtractedBool(BaseModel):
    value: Optional[bool] = Field(default=False, description="Value")
    confidence: float = Field(default=1.0)
    doubted: bool = Field(default=False)
'''

content = re.sub(r'class ExtractedField\(BaseModel\):.*?doubted: bool = Field.*?\""\"\)\n', new_base, content, flags=re.DOTALL)

# Replace ExtractedField usage with ExtractedString
content = content.replace(': ExtractedField = Field(default_factory=ExtractedField)', ': ExtractedString = Field(default_factory=ExtractedString)')
content = content.replace(': ExtractedField = Field(default_factory=lambda: ExtractedField(value=False))', ': ExtractedBool = Field(default_factory=ExtractedBool)')
content = content.replace(': ExtractedField = Field(default_factory=lambda: ExtractedField(value=None))', ': ExtractedString = Field(default_factory=ExtractedString)')
content = content.replace(': ExtractedField = Field(default_factory=lambda: ExtractedField(value=""))', ': ExtractedString = Field(default_factory=ExtractedString)')
content = content.replace('ExtractedField', 'ExtractedString')

with open(r'd:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\ai_document\confidence_schemas.py', 'w') as f:
    f.write(content)

print("Replaced ExtractedField with ExtractedString/Bool.")
