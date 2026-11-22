import os
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter

def smart_crop_and_frame(img, crop_box=None, label_text=None, target_height=1200):
    if crop_box:
        cropped = img.crop(crop_box)
    else:
        cropped = img
        
    # Apply subtle sharpening to make UI text pop
    sharpened = cropped.filter(ImageFilter.UnsharpMask(radius=1.5, percent=140, threshold=2))
    
    # Scale to target height preserving aspect ratio with high quality LANCZOS
    aspect = sharpened.width / sharpened.height
    new_w = int(target_height * aspect)
    scaled = sharpened.resize((new_w, target_height), Image.Resampling.LANCZOS)
    
    # Add thin modern border
    bordered = ImageOps.expand(scaled, border=3, fill=(180, 195, 215))
    
    if label_text:
        banner_height = 70
        new_img = Image.new('RGB', (bordered.width, bordered.height + banner_height), (245, 248, 252))
        new_img.paste(bordered, (0, 0))
        
        draw = ImageDraw.Draw(new_img)
        try:
            font = ImageFont.truetype("arialbd.ttf", 34) # Arial Bold
        except:
            try:
                font = ImageFont.truetype("arial.ttf", 34)
            except:
                font = ImageFont.load_default()
                
        bbox = draw.textbbox((0, 0), label_text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        text_x = (new_img.width - text_w) // 2
        text_y = bordered.height + (banner_height - text_h) // 2
        draw.text((text_x, text_y), label_text, fill=(15, 23, 42), font=font)
        
        outer = ImageOps.expand(new_img, border=1, fill=(203, 213, 225))
        return outer
        
    return bordered

def build_upscaled_figures():
    os.makedirs('extracted_assets/figures', exist_ok=True)
    
    # =========================================================================
    # 1. Figure 4.1: Studio 16:9 Split Canvas Editor
    # =========================================================================
    print("Upscaling Figure 4.1 (Studio Editor)...")
    im_editor = Image.open('report_screenshots_2/5_editor_split.png')
    # Slight sharpening and clean border, 300 DPI
    fig_4_1 = im_editor.filter(ImageFilter.UnsharpMask(radius=1.2, percent=130, threshold=2))
    fig_4_1_bordered = ImageOps.expand(fig_4_1, border=3, fill=(180, 195, 215))
    fig_4_1_bordered.save('extracted_assets/figures/fig_4_1.png', dpi=(300, 300), quality=100)
    print("Saved upscaled fig_4_1.png")
    
    # =========================================================================
    # 2. Figure 4.2: Studio Dashboard (a) and Presenter Mode (b)
    # =========================================================================
    print("Upscaling Figure 4.2 (Dashboard + Presenter)...")
    # Dashboard: crop top section with header, user, buttons, and deck card
    im_dash = Image.open('report_screenshots_2/3_dashboard.png')
    # active region: x=120 to 1400, y=20 to 740
    p1 = smart_crop_and_frame(im_dash, crop_box=(120, 20, 1400, 740), 
                              label_text="(a) Studio Projects Dashboard & Deck Management", 
                              target_height=1100)
    
    # Presenter mode: crop slide card + HUD
    im_pres = Image.open('report_screenshots_2/6_present_mode.png')
    # present mode active region: x=80 to 2800, y=70 to 1750
    p2 = smart_crop_and_frame(im_pres, crop_box=(80, 70, 2800, 1750), 
                              label_text="(b) Phase 4 Fullscreen Presenter Mode with Pacing HUD", 
                              target_height=1100)
    
    # Combine side-by-side
    gap = 40
    combo_w = p1.width + p2.width + gap
    combo_h = max(p1.height, p2.height)
    fig_4_2 = Image.new('RGB', (combo_w, combo_h), (255, 255, 255))
    fig_4_2.paste(p1, (0, 0))
    fig_4_2.paste(p2, (p1.width + gap, 0))
    fig_4_2.save('extracted_assets/figures/fig_4_2.png', dpi=(300, 300), quality=100)
    print("Saved upscaled fig_4_2.png with dimensions:", fig_4_2.size)
    
    # =========================================================================
    # 3. Figure 5.3: AI Topic Modal (a) and In-Browser Export Modal (b)
    # =========================================================================
    print("Upscaling Figure 5.3 (AI Modal + Export Modal)...")
    im_ai = Image.open('report_screenshots_2/4_ai_modal.png')
    # AI modal is located at x=880 to 2000, y=400 to 1400 (with surrounding dark backdrop padding)
    e1 = smart_crop_and_frame(im_ai, crop_box=(860, 380, 2020, 1420), 
                              label_text="(a) Natural Language Topic & Slide Count Intake Modal", 
                              target_height=1200)
    
    im_exp = Image.open('report_screenshots_2/7_export_modal.png')
    # Export modal is located at x=720 to 2160, y=180 to 1620
    e2 = smart_crop_and_frame(im_exp, crop_box=(700, 160, 2180, 1640), 
                              label_text="(b) Client-Side In-Browser Multi-Format Export Engine", 
                              target_height=1200)
    
    combo_w = e1.width + e2.width + gap
    combo_h = max(e1.height, e2.height)
    fig_5_3 = Image.new('RGB', (combo_w, combo_h), (255, 255, 255))
    fig_5_3.paste(e1, (0, 0))
    fig_5_3.paste(e2, (e1.width + gap, 0))
    fig_5_3.save('extracted_assets/figures/fig_5_3.png', dpi=(300, 300), quality=100)
    print("Saved upscaled fig_5_3.png with dimensions:", fig_5_3.size)

if __name__ == '__main__':
    build_upscaled_figures()
