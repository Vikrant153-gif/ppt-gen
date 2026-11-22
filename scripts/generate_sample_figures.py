import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs('extracted_assets/figures', exist_ok=True)

# 1. Figure 3.1: Three-tier Architecture Diagram
def create_fig_3_1():
    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)
    ax.axis('off')

    # Draw boxes
    # Presentation Tier
    rect_pres = patches.FancyBboxPatch((0.05, 0.1), 0.22, 0.8, boxstyle="round,pad=0.02,rounding_size=0.03",
                                        facecolor="#f0f7ff", edgecolor="#3b82f6", linewidth=1.5)
    ax.add_patch(rect_pres)
    ax.text(0.16, 0.85, "PRESENTATION TIER", ha='center', va='center', fontsize=9, fontweight='bold', color="#1e3a8a")
    ax.text(0.16, 0.80, "React 19 + Vite SPA", ha='center', va='center', fontsize=7.5, color="#475569")
    
    pres_components = ["Dashboard (/projects)", "16:9 Slide Editor", "Present Mode (HUD)", "Multi-Export Engine", "Auth (Login/Signup)"]
    for i, c in enumerate(pres_components):
        r = patches.FancyBboxPatch((0.07, 0.65 - i*0.11), 0.18, 0.08, boxstyle="round,pad=0.01,rounding_size=0.02",
                                    facecolor="#ffffff", edgecolor="#93c5fd", linewidth=1)
        ax.add_patch(r)
        ax.text(0.16, 0.69 - i*0.11, c, ha='center', va='center', fontsize=7.5, color="#0f172a")

    # Application Tier
    rect_app = patches.FancyBboxPatch((0.39, 0.1), 0.24, 0.8, boxstyle="round,pad=0.02,rounding_size=0.03",
                                       facecolor="#f0fdf4", edgecolor="#22c55e", linewidth=1.5)
    ax.add_patch(rect_app)
    ax.text(0.51, 0.85, "APPLICATION TIER", ha='center', va='center', fontsize=9, fontweight='bold', color="#14532d")
    ax.text(0.51, 0.80, "Node.js + Express.js", ha='center', va='center', fontsize=7.5, color="#475569")
    
    app_components = ["JWT Auth Middleware", "REST Projects API", "Gemini Prompt Engine", "Unsplash Parallel Client", "Error Handling & CORS"]
    for i, c in enumerate(app_components):
        r = patches.FancyBboxPatch((0.41, 0.65 - i*0.11), 0.20, 0.08, boxstyle="round,pad=0.01,rounding_size=0.02",
                                    facecolor="#ffffff", edgecolor="#86efac", linewidth=1)
        ax.add_patch(r)
        ax.text(0.51, 0.69 - i*0.11, c, ha='center', va='center', fontsize=7.5, color="#0f172a")

    # Data Tier
    rect_data = patches.FancyBboxPatch((0.74, 0.55), 0.22, 0.35, boxstyle="round,pad=0.02,rounding_size=0.03",
                                        facecolor="#fefce8", edgecolor="#eab308", linewidth=1.5)
    ax.add_patch(rect_data)
    ax.text(0.85, 0.85, "DATA TIER", ha='center', va='center', fontsize=9, fontweight='bold', color="#713f12")
    ax.text(0.85, 0.80, "MongoDB Atlas", ha='center', va='center', fontsize=7.5, color="#475569")
    r_u = patches.FancyBboxPatch((0.76, 0.62), 0.08, 0.09, boxstyle="round,pad=0.01", facecolor="#ffffff", edgecolor="#fde047")
    r_p = patches.FancyBboxPatch((0.86, 0.62), 0.08, 0.09, boxstyle="round,pad=0.01", facecolor="#ffffff", edgecolor="#fde047")
    ax.add_patch(r_u); ax.text(0.80, 0.665, "users", ha='center', va='center', fontsize=7.5)
    ax.add_patch(r_p); ax.text(0.90, 0.665, "projects", ha='center', va='center', fontsize=7.5)

    # External AI Services
    rect_ai = patches.FancyBboxPatch((0.74, 0.1), 0.22, 0.35, boxstyle="round,pad=0.02,rounding_size=0.03",
                                      facecolor="#fdf2f8", edgecolor="#ec4899", linewidth=1.5)
    ax.add_patch(rect_ai)
    ax.text(0.85, 0.40, "EXTERNAL CLOUD AI", ha='center', va='center', fontsize=8.5, fontweight='bold', color="#831843")
    ax.text(0.85, 0.33, "Google Gemini API\n(@google/genai)", ha='center', va='center', fontsize=7.5, color="#475569")
    ax.text(0.85, 0.20, "Unsplash Media REST API", ha='center', va='center', fontsize=7.5, color="#475569")

    # Connectors
    # Pres <-> App
    ax.annotate('', xy=(0.39, 0.5), xytext=(0.27, 0.5), arrowprops=dict(arrowstyle="<->", color="#64748b", lw=1.5))
    ax.text(0.33, 0.53, "HTTPS / JSON\n+ JWT", ha='center', va='center', fontsize=7, color="#475569")

    # App <-> Data
    ax.annotate('', xy=(0.74, 0.72), xytext=(0.63, 0.72), arrowprops=dict(arrowstyle="<->", color="#64748b", lw=1.5))
    ax.text(0.685, 0.75, "Mongoose\nODM", ha='center', va='center', fontsize=7, color="#475569")

    # App <-> AI
    ax.annotate('', xy=(0.74, 0.28), xytext=(0.63, 0.28), arrowprops=dict(arrowstyle="<->", color="#64748b", lw=1.5))
    ax.text(0.685, 0.32, "Prompt / API\nPromise.all", ha='center', va='center', fontsize=7, color="#475569")

    plt.tight_layout()
    plt.savefig('extracted_assets/figures/fig_3_1.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig_3_1.png")

# 2. Figure 3.2: AI Generation Pipeline
def create_fig_3_2():
    fig, ax = plt.subplots(figsize=(8.5, 1.8), dpi=300)
    ax.axis('off')

    steps = [
        ("User enters\ntopic & slides", "#ffffff", "#2563eb"),
        ("Express API\nJWT validation", "#ffffff", "#2563eb"),
        ("Gemini 3 Flash\nStructured JSON", "#ffffff", "#dc2626"),
        ("Unsplash API\nPromise.all", "#ffffff", "#9333ea"),
        ("Schema\nAssembly", "#ffffff", "#2563eb"),
        ("Client review\n& 16:9 Editor", "#ffffff", "#2563eb"),
        ("Saved to\nMongoDB Atlas", "#ffffff", "#2563eb")
    ]

    for i, (text, bg, border) in enumerate(steps):
        x = 0.02 + i * 0.14
        r = patches.FancyBboxPatch((x, 0.2), 0.115, 0.6, boxstyle="round,pad=0.01,rounding_size=0.03",
                                    facecolor=bg, edgecolor=border, linewidth=1.5)
        ax.add_patch(r)
        ax.text(x + 0.0575, 0.5, text, ha='center', va='center', fontsize=6.8, fontweight='medium', color="#0f172a")

        if i < len(steps) - 1:
            ax.annotate('', xy=(x + 0.14, 0.5), xytext=(x + 0.115, 0.5),
                        arrowprops=dict(arrowstyle="-|>", color="#64748b", lw=1.2, mutation_scale=10))

    plt.tight_layout()
    plt.savefig('extracted_assets/figures/fig_3_2.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig_3_2.png")

# 3. Figure 5.1: Average Deck-Creation Time Chart
def create_fig_5_1():
    fig, ax = plt.subplots(figsize=(5, 3.2), dpi=300)
    
    categories = ['Traditional manual\nauthoring apps', 'PPT-GEN\n(AI generation)']
    values = [94.2, 11.4]
    colors = ['#94a3b8', '#1e40af']
    
    bars = ax.bar(categories, values, color=colors, width=0.35, edgecolor='#334155', linewidth=0.8)
    
    ax.set_ylabel('Average authoring time (seconds)', fontsize=8, fontname='Times New Roman')
    ax.set_ylim(0, 110)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.tick_params(axis='both', which='major', labelsize=8)
    
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:.1f} s',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=8, fontname='Times New Roman')

    plt.tight_layout()
    plt.savefig('extracted_assets/figures/fig_5_1.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig_5_1.png")

# 4. Figure 5.2: Latency Benchmarks Chart
def create_fig_5_2():
    fig, ax = plt.subplots(figsize=(6, 3.4), dpi=300)
    
    topics = ['AI History\n(8 slides)', 'Quantum Comp.\n(8 slides)', 'Deep Space\n(8 slides)', 'Climate Tech\n(8 slides)']
    x = range(len(topics))
    width = 0.28
    
    target_vals = [2.5, 2.5, 2.5, 2.5]
    actual_vals = [1.88, 1.95, 2.05, 1.82]
    
    ax.bar([i - width/2 for i in x], target_vals, width=width, label='SLA Target (s)', color='#94a3b8', edgecolor='#334155', linewidth=0.8)
    ax.bar([i + width/2 for i in x], actual_vals, width=width, label='Gemini 3 Flash Actual (s)', color='#1e40af', edgecolor='#334155', linewidth=0.8)
    
    ax.set_ylabel('Generation Latency (seconds)', fontsize=8, fontname='Times New Roman')
    ax.set_xticks(list(x))
    ax.set_xticklabels(topics, fontsize=7.5, fontname='Times New Roman')
    ax.set_ylim(0, 3.5)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.legend(frameon=False, fontsize=7.5)
    ax.tick_params(axis='both', which='major', labelsize=8)

    plt.tight_layout()
    plt.savefig('extracted_assets/figures/fig_5_2.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Created fig_5_2.png")

create_fig_3_1()
create_fig_3_2()
create_fig_5_1()
create_fig_5_2()
