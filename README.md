# OdontPage - Advanced Dental Portfolio

A high-end portfolio website for a dentist specializing in implantology, orthodontics, and rehabilitation. Built with Next.js, Tailwind CSS, and React Three Fiber.

## Features

- **3D Hero Section**: Procedural abstract geometric shapes representing enamel and dental structures
- **Interactive 3D Scene**: Shapes react to mouse hover and scrolling
- **Medical Purity Theme**: Bright, light-mode interface with hyper-realistic lighting
- **Responsive Design**: Fully responsive across all devices
- **Elegant Typography**: Playfair Display for headings, clean sans-serif for body text

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **React Three Fiber**: React renderer for Three.js
- **Drei**: Useful helpers for React Three Fiber

## Getting Started

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
OdontPage/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── Hero3D.tsx          # Hero section with 3D canvas
│   └── Scene.tsx           # 3D scene with procedural shapes
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Key Components

### Hero3D
The main hero component that sets up the React Three Fiber Canvas and manages scroll/hover interactions.

### Scene
Contains the procedural 3D geometry generation, lighting setup, and shape animations. Creates floating white geometric shapes that represent dental enamel and structure.

## Customization

- Modify colors in `tailwind.config.ts`
- Adjust 3D shapes in `components/Scene.tsx`
- Update content in `app/page.tsx`

## License

Private project
