name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking First

Before writing a single line of code, commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme and own it — brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian. Execute with precision, not timidity.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Bold maximalism and refined minimalism both work — the key is intentionality. Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations. Minimalist designs need restraint, precise spacing, and subtle details. Elegance comes from executing the vision well, not from intensity alone.

Then implement working code (HTML/CSS/JS, React, etc.) that is production-grade, visually striking, cohesive, and meticulously refined in every detail.

---

## Tactical Design Rules (Apply These)

### Typography
- Large text (70px+) needs **letter-spacing tightened**: aim for `-2%` to `-4%` tracking. Default spacing looks disjointed at large sizes.
- Choose fonts that are beautiful, unique, and interesting. Pair a distinctive **display font** with a refined **body font**.
- NEVER use Inter, Roboto, Arial, or system fonts. NEVER use Space Grotesk.

### Color Palettes
- Build palettes using HSB logic: start with a base color, then for each darker shade **increase saturation ~20, decrease brightness ~10**, and optionally shift hue ~20 points toward blue/purple for darker tones (or yellow/red for lighter ones).
- For backgrounds: never use pure black or white. Use a very dark blue or deep tinted neutral for dark mode; a very light warm tint for light mode.
- Use pre-built systems (Tailwind palette) as a shortcut: `50`/`500` for light themes, `300`/`950` for dark themes.
- Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

### Backgrounds & Depth
- Create atmosphere — gradient meshes, noise textures, geometric patterns, layered transparencies, grain overlays.
- **Dark mode depth**: Shadows don't read well on dark. Instead, layer cards by bumping brightness up `4–6` points and saturation down `10–20` points from the base background color for each successive layer.

### Rounded Corners
- When nesting rounded corners, **the inner radius should be smaller**: `inner_radius = outer_radius - gap_between_elements`. A 16px outer radius with 8px of padding means an 8px inner radius — not another 16px.
- For a modern feel, apply iOS-style corner smoothing (squircle curves) that taper before hitting the full curve.

### Layout & Cards
- Go beyond linear lists. Rank information by importance. Stack key elements, right-align secondary info, use icons to replace labels when context is clear.
- Remove redundant labels whenever the UI implies them. Group related data together.
- Use asymmetry, overlap, diagonal flow, and grid-breaking elements to create visual interest.

### Spacing
- Adopt an **8px base grid** for all spacing decisions. Use 4px for micro-gaps. For larger sizes, round to the nearest multiple of 8 (or 5/10 at large scales where precision matters less).
- Consistent spacing alone dramatically improves perceived quality.

### Lines & Dividers
- Remove lines whenever possible — they add visual noise. Use spacing to separate items instead.
- If tight spacing forces separation, use **subtle alternating row backgrounds** rather than lines.

### Motion
- Prioritize CSS-only animations for HTML. Use Motion library for React.
- One well-orchestrated **page load with staggered reveals** (`animation-delay`) beats scattered micro-interactions.
- Add scroll-triggered animations and hover states that genuinely surprise.

---

## What to Avoid

- Generic AI aesthetics: purple gradients on white, predictable card grids, forgettable layouts.
- Cookie-cutter patterns that could apply to any project — design for THIS context.
- Fonts: Inter, Roboto, Arial, Space Grotesk, or any system font stack.
- Pure black (`#000`) or pure white (`#fff`) as primary backgrounds.
- Nested corners with equal radii.
- Lines as dividers when spacing would suffice.

---

Interpret creatively. Make unexpected choices that feel genuinely designed for the context. No two designs should look alike — vary light/dark themes, font pairings, layouts, and palettes freely. Claude is capable of extraordinary creative work. Don't hold back.
