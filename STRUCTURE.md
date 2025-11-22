# Project Structure

```
OdontPage/
├── app/
│   ├── layout.tsx          # Root layout with Playfair Display & Inter fonts
│   ├── page.tsx            # Main page with hero, services, about, CTA sections
│   └── globals.css         # Global styles with Tailwind
│
├── components/
│   ├── Hero3D.tsx          # Hero section component with React Three Fiber Canvas
│   │                       # Handles scroll progress tracking and hover state
│   └── Scene.tsx           # 3D scene component with procedural geometric shapes
│                           # Generates floating white shapes representing enamel
│                           # Implements scroll and hover interactions
│
├── package.json            # Dependencies: Next.js, R3F, Drei, Three.js, Tailwind
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind config with Medical Purity theme
├── postcss.config.mjs      # PostCSS configuration
├── next.config.js          # Next.js configuration
├── .gitignore              # Git ignore file
└── README.md               # Project documentation
```

## Key Files

### `app/page.tsx`
Main page component with:
- Hero section with 3D scene overlay
- Services section (Implantology, Orthodontics, Rehabilitation)
- About section
- CTA section
- Footer

### `components/Hero3D.tsx`
- Sets up React Three Fiber Canvas
- Tracks scroll progress
- Manages hover state for interactive shapes
- Implements PerspectiveCamera and OrbitControls from Drei

### `components/Scene.tsx`
- Generates procedural floating geometric shapes (octahedrons, tetrahedrons, icosahedrons)
- Implements hyper-realistic lighting setup (ambient, directional, point, spot lights)
- Uses Environment from Drei for realistic reflections
- Shapes react to scroll (position and rotation) and hover (scale)

## Typography
- **Headings**: Playfair Display (serif) - elegant and sophisticated
- **Body**: Inter (sans-serif) - clean and readable

## Design Theme: Medical Purity
- Bright white background
- Soft gray accents
- Hyper-realistic lighting
- Polished white geometric shapes
- Responsive across all devices
