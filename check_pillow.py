import sys
try:
    from PIL import Image
    print("Pillow is installed and works!")
except Exception as e:
    print(f"Error: {e}")
