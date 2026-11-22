import os
from PIL import Image, ImageOps, ImageDraw, ImageFont

def add_border_and_label(img, label_text=None, border_color=(200, 205, 215), border_width=2):
    # Add thin border
    bordered = ImageOps.expand(img, border=border_width, fill=border_color)
    if not label_text:
        return bordered
    
    # Add a top or bottom label banner
    # Let's create a new image with extra height at the bottom for the label
    banner_height = 80
    new_img = Image.new('RGB', (bordered.width, bordered.height + banner_height), (245, 247, 250))
    new_img.paste(bordered, (0, 0))
    
    draw = ImageDraw.Draw(new_img)
    # Simple clean default font scaled or drawn
    # We can draw clean text
    # Pillow default font is small, let's draw rectangle and text
    try:
        # Try finding Arial or standard TTF on Windows
        font = ImageFont.truetype("arial.ttf", 42)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position
    bbox = draw.textbbox((0, 0), label_text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = (new_img.width - text_w) // 2
    text_y = bordered.height + (banner_height - text_h) // 2
    draw.text((text_x, text_y), label_text, fill=(30, 41, 59), font=font)
    
    # Add outer border
    final = ImageOps.expand(new_img, border=1, fill=(210, 215, 225))
    return final

def create_figures():
    os.makedirs('extracted_assets/figures', exist_ok=True)
    
    # 1. Figure 4.1: Studio 16:9 Canvas Editor
    print("Generating Figure 4.1 (Studio Editor)...")
    im_editor = Image.open('report_screenshots_2/5_editor_split.png')
    # Add clean border
    fig_4_1 = ImageOps.expand(im_editor, border=3, fill=(180, 190, 205))
    fig_4_1.save('extracted_assets/figures/fig_4_1.png', quality=95)
    print("Saved fig_4_1.png")
    
    # 2. Figure 4.2: Studio Dashboard (a) and Presenter Mode (b) side-by-side
    print("Generating Figure 4.2 (Dashboard + Presenter)...")
    im_dash = Image.open('report_screenshots_2/3_dashboard.png')
    im_pres = Image.open('report_screenshots_2/6_present_mode.png')
    
    p1 = add_border_and_label(im_dash, "(a) Studio Projects Dashboard & Deck Management")
    p2 = add_border_and_label(im_pres, "(b) Phase 4 Fullscreen Presenter Mode with Pacing HUD")
    
    # Combine side-by-side with padding
    gap = 40
    combo_w = p1.width + p2.width + gap
    combo_h = max(p1.height, p2.height)
    fig_4_2 = Image.new('RGB', (combo_w, combo_h), (255, 255, 255))
    fig_4_2.paste(p1, (0, 0))
    fig_4_2.paste(p2, (p1.width + gap, 0))
    fig_4_2.save('extracted_assets/figures/fig_4_2.png', quality=95)
    print("Saved fig_4_2.png")
    
    # 3. Figure 5.3: AI Topic Modal (a) and In-Browser Export Modal (b)
    print("Generating Figure 5.3 (AI Modal + Export Modal)...")
    im_ai = Image.open('report_screenshots_2/4_ai_modal.png')
    im_exp = Image.open('report_screenshots_2/7_export_modal.png')
    
    e1 = add_border_and_label(im_ai, "(a) Natural Language Topic & Slide Count Intake Modal")
    e2 = add_border_and_label(im_exp, "(b) Client-Side In-Browser Multi-Format Export Engine")
    
    fig_5_3 = Image.new('RGB', (combo_w, combo_h), (255, 255, 255))
    fig_5_3.paste(e1, (0, 0))
    fig_5_3.paste(e2, (e1.width + gap, 0))
    fig_5_3.save('extracted_assets/figures/fig_5_3.png', quality=95)
    print("Saved fig_5_3.png")

if __name__ == '__main__':
    create_figures()
