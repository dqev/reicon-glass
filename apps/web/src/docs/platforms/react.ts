import type { PlatformDoc } from "./types";

export const reactDoc: PlatformDoc = {
  id: "react",
  name: "React",
  badge: "React",
  tagline: "Official React package with full TypeScript support, tree-shaking, and SSR compatibility for Next.js, Remix, and Vite.",
  pkg: "reicon-react",
  install: "npm install reicon-react",
  basicUsage: `import { Home, ShieldCheck, Bell } from 'reicon-react';

export default function App() {
  return (
    <div className="flex items-center gap-4">
      <Home size={24} />
      <ShieldCheck size={24} color="#9B8AFB" />
      <Bell size={24} weight="Filled" />
    </div>
  );
}`,
  customization: `// Size
<Home size={16} />
<Home size={24} />
<Home size={32} />

// Color
<Heart color="#ef4444" />
<Heart color="rgb(99, 102, 241)" />

// Weight (Outline default vs Filled)
<Star />
<Star weight="Filled" />

// Tailwind CSS integration
<Home className="text-gray-500 hover:text-gray-700 w-6 h-6 transition-colors" />`,
  directImport: `// Direct path imports for maximum tree-shaking precision
import Home from 'reicon-react/icons/Home';
import ShieldCheck from 'reicon-react/icons/ShieldCheck';`,
  extraTitle: "Next.js & Server Components (RSC)",
  extraCode: `// Reicon icons are SSR-compatible out of the box in App Router
import { ShieldCheck } from 'reicon-react';

export default function Page() {
  return <ShieldCheck size={20} color="#9B8AFB" />;
}`,
  notes: [
    "All icon components render clean, accessible inline SVG elements.",
    "Default color inherits text color (currentColor) for instant styling with Tailwind or CSS.",
    "Full TypeScript autocompletion for 2,600+ icons."
  ]
};
