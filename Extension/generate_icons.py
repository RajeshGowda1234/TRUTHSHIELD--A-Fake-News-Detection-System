from PIL import Image
import os

source_path = r"c:\Users\rajes\Desktop\PROJECT\TruthShield_Extension\icon128.png"
dest_dir = r"c:\Users\rajes\Desktop\PROJECT\TruthShield_Extension"

try:
    img = Image.open(source_path)
    
    # Save 48x48
    img.resize((48, 48), Image.Resampling.LANCZOS).save(os.path.join(dest_dir, "icon48.png"))
    
    # Save 16x16
    img.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(dest_dir, "icon16.png"))
    
    print("Icons generated successfully")
except Exception as e:
    print(f"Error generating icons: {e}")
