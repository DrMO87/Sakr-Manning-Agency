import zipfile
import tempfile
import os
from PIL import Image

def analyze_images(docx_path):
    print(f"Analyzing {docx_path}")
    try:
        with zipfile.ZipFile(docx_path, 'r') as docx_zip:
            images = []
            for item in docx_zip.namelist():
                if item.startswith('word/media/') and item.lower().endswith(('.png', '.jpg', '.jpeg')):
                    images.append(item)
            
            if not images:
                print("No images found.")
                return

            temp_dir = tempfile.mkdtemp()
            for img_name in images:
                extracted = docx_zip.extract(img_name, temp_dir)
                try:
                    with Image.open(extracted) as img:
                        width, height = img.size
                        ratio = height / width if width else 0
                        area = width * height
                        
                        score = area
                        if ratio < 0.8:
                            score = area * 0.01
                        elif ratio > 2.0:
                            score = area * 0.01
                        else:
                            distance = abs(ratio - 1.33)
                            multiplier = 100.0 / (1.0 + distance * 10)
                            score = area * multiplier
                            
                        print(f"Image: {os.path.basename(img_name)} | Size: {width}x{height} | Ratio: {ratio:.2f} | Area: {area} | Score: {score:.2f}")
                except Exception as e:
                    print(f"Failed to open {img_name}: {e}")
    except Exception as e:
        print(f"Zip error: {e}")

if __name__ == '__main__':
    paths = [
        r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\media\tmp\A.C SABRY NAEIM AMIN OSMAN.docx",
        r"d:\M SQUARE (MSQ)\CODE SQUARE\Sakr-Manning-Agency-Backend-main\Sakr-Manning-Agency-Backend-main\media\tmp\WAITER SARA NASIEF KHEIRALLAH GERGES.docx"
    ]
    for p in paths:
        analyze_images(p)
