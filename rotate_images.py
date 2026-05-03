from PIL import Image
import os

assets_dir = r"C:\Users\gorke\OneDrive\Masaüstü\Oziyama\src\assets"
front = os.path.join(assets_dir, "card frontside.jpeg")
back = os.path.join(assets_dir, "card backside.jpeg")

def rotate_img(path):
    if os.path.exists(path):
        img = Image.open(path)
        img_rotated = img.rotate(90, expand=True) # 90 degrees counter-clockwise (left)
        img_rotated.save(path)
        print(f"Rotated {path}")
    else:
        print(f"Not found: {path}")

rotate_img(front)
rotate_img(back)
