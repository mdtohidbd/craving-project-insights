import os
import glob
import re

admin_dir = "e:/Skybridge Digital/craving-project-insights/src/pages/admin"
tsx_files = glob.glob(os.path.join(admin_dir, "*.tsx"))

replacements = {
    "bg-emerald-500": "bg-primary",
    "hover:bg-emerald-600": "hover:bg-primary/90",
    "bg-emerald-600": "bg-primary/90",
    "text-emerald-500": "text-primary",
    "text-emerald-600": "text-primary",
    "border-emerald-500": "border-primary",
    "ring-emerald-500": "ring-primary",
    "text-emerald-700": "text-primary",
    "bg-emerald-50": "bg-primary/10",
    "border-emerald-200": "border-primary/30",
    
    # Switch gray to neutral for warmer premium feel
    "bg-gray-50": "bg-neutral-50",
    "bg-gray-100": "bg-neutral-100",
    "bg-gray-200": "bg-neutral-200",
    "border-gray-100": "border-neutral-100",
    "border-gray-200": "border-neutral-200",
    "border-gray-300": "border-neutral-300",
    "text-gray-400": "text-neutral-400",
    "text-gray-500": "text-neutral-500",
    "text-gray-600": "text-neutral-600",
    "text-gray-700": "text-neutral-700",
    "text-gray-800": "text-neutral-800",
    "text-gray-900": "text-neutral-900",

    # Soften border radii across the board to match the modern, sharper premium look (e.g., 4px)
    "rounded-lg": "rounded-[4px]",
    "rounded-md": "rounded-[4px]",
    "rounded-xl": "rounded-[8px]",
    "rounded-2xl": "rounded-[12px]",
    "rounded-3xl": "rounded-[16px]",
}

for file_path in tsx_files:
    # Skip AdminPOS.tsx as we already processed it extensively
    if "AdminPOS.tsx" in file_path:
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {os.path.basename(file_path)}")

print("All admin modules updated to premium theme.")
