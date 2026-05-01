import re

file_path = "e:/Skybridge Digital/craving-project-insights/src/pages/admin/AdminPOS.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Revert hardcoded hex colors to Tailwind variables for consistency
content = content.replace("bg-[#f9f9f8]", "bg-neutral-50")
content = content.replace("bg-[#edeeed]", "bg-neutral-100")
content = content.replace("bg-[#e1e3e2]", "bg-neutral-200")
content = content.replace("border-[#e1e3e2]", "border-neutral-200")
content = content.replace("border-[#edeeed]", "border-neutral-100")

content = content.replace("bg-[#C5A059]", "bg-primary")
content = content.replace("text-[#C5A059]", "text-primary")
content = content.replace("border-[#C5A059]", "border-primary")
content = content.replace("ring-[#C5A059]", "ring-primary")
content = content.replace("text-[#C5A059]-foreground", "text-primary-foreground")

# Layout changes for item cards
# Change grid density to make cards more compact
content = content.replace(
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4",
    "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3"
)

# Change image height to make it more compact
content = content.replace(
    "className=\"h-32 bg-[#edeeed] overflow-hidden\"",
    "className=\"h-24 bg-neutral-100 overflow-hidden\""
)
content = content.replace(
    "className=\"h-32 bg-neutral-100 overflow-hidden\"",
    "className=\"h-24 bg-neutral-100 overflow-hidden\""
)

# Change padding in card to be more compact
content = content.replace(
    "className=\"p-3 flex flex-col flex-1 justify-between\"",
    "className=\"p-2.5 flex flex-col flex-1 justify-between\""
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied layout and color changes")
