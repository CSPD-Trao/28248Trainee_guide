# LiquidZulu Website Style Guide

## Overview
A modern, dark-themed educational website with sophisticated animations, gradient effects, and interactive components. Built with Astro, Tailwind CSS, and DaisyUI.

---

## Core Technology Stack

### Framework & Build Tools
- **Astro 4.10.1** - Static site generator with island architecture
- **Tailwind CSS 3.4.4** - Utility-first CSS framework
- **DaisyUI 4.12.2** - Component library plugin for Tailwind
- **Vite** - Build tool (via Astro)

### JavaScript & Styling
- **PostCSS 8.4.38** - CSS transformation
- **Autoprefixer 10.4.19** - Browser prefix handling
- **Sass 1.77.4** - Advanced CSS preprocessing (via dev dependencies)

### Content & Markdown
- **@astrojs/mdx 3.1.0** - MDX support for React-like components in Markdown
- **@astrojs/markdoc 0.11.0** - Markdoc integration
- **Remark plugins** - Markdown transformation (remark-gfm, remark-footnotes, etc.)

### Integrations
- **Motion Canvas** (@motion-canvas/2d, @motion-canvas/core, @motion-canvas/player) - Advanced animation library
- **Astro Icon** 1.1.0 - SVG icon system
- **Astro SEO** 0.7.6 - SEO meta tag management
- **Astro Prefetch** 0.1.2 - Link prefetching for faster navigation

---

## Color Palette

### Primary Colors (Dark Theme)
- **Background**: `slate-900` (#0f172a) and `bg-slate-900` for main surfaces
- **Alternate Background**: `#0B0F13` (darker variant, used in BrainLayout)
- **Card/Panel**: `stroke-gray-700` (ring color), `bg-slate-800` for card backgrounds
- **Text Primary**: `text-slate-50` (off-white)
- **Text Secondary**: `text-slate-300`, `text-slate-400`, `text-zinc-400`

### Accent Colors
- **Primary Accent**: Orange to Amber gradient
  - `from-orange-500 to-amber-500` (used for emphasis, buttons, CTAs)
- **Secondary Accent (MCAS)**: Lime to Emerald gradient
  - `from-lime-500 to-emerald-500` (used for alternative emphasis)
- **Success/Free**: `from-lime-500 to-green-500` with `animate-pulse`

### Gradient Backgrounds
- **Blob 1**: `from-violet-900 to-fuchsia-900` (main animated blob)
- **Blob 2**: `from-pink-900 to-rose-900` (secondary animated blob)

### Border & Shadow Colors
- **Ring/Border**: `ring-slate-700`, `border-slate-700`
- **Scrollbar**: White (`scrollbar-color: white`)

---

## Typography

### Font Families
1. **Cubano** - Custom script font for headlines and emphasis
   - Used with `.cubano` class or `font-family: Cubano`
   - Appears to be a system font or pre-installed
   
2. **Bebas Neue** - Heavy sans-serif headline font
   - Google Fonts import: `family=Bebas+Neue`
   - Used with `.bebas` class
   
3. **Oswald** - Condensed sans-serif
   - Google Fonts import
   - Used with `.oswald` class
   
4. **Phudu** - Display font
   - Google Fonts import
   - Used with `.phudu` class

5. **System Default** - Regular text (Apple system fonts via Tailwind)

### Font Imports
```html
<link href="https://fonts.googleapis.com/css2?family=Oswald&family=Phudu&family=Bebas+Neue&display=swap" rel="stylesheet">
```

### Font Weights & Sizes
- `font-black` - Ultra heavy (for emphasis and headlines)
- `font-medium` - Regular weight text
- `text-6xl` - Major headlines
- `text-4xl`, `text-3xl`, `text-2xl` - Secondary/tertiary headings
- `text-lg` - Body text emphasis
- Standard body text sizes via Tailwind defaults

---

## CSS Utilities & Custom Classes

### Gradient Text Effect
```css
.gradient-text {
    color: rgba(0, 0, 0, 0);
    @apply bg-clip-text;
}
```
Creates text with gradient fills using `bg-gradient-to-*` classes with extended transparency.

### Emphasis Classes
- `.emphasis` - Orange-to-amber gradient, all-caps, heavy font, using Cubano font
- `.mcas-emphasis` - Alternative green gradient for specific sections
- Applied with `@apply bg-gradient-to-t from-orange-500 to-amber-500 uppercase`

### Grid Lines Background Pattern
```css
.gridlines {
    --size: 32px;
    --bg-size: var(--size) var(--size), var(--size) var(--size);
    --grid-color: rgba(255, 255, 255, 0.015);
    
    background-image: linear-gradient(var(--grid-color) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
    background-size: var(--bg-size);
}
```
Subtle white grid overlay pattern using SVG-like linear gradients.

### Noise Texture Overlay
Applied via `.noise-panel:before` pseudo-element:
- Uses `background-image: url(/noise.webp)`
- `opacity: 0.6`
- `mix-blend-mode: overlay`
- Applied to card components for tactile texture

### Drop Shadow Effects
- **Glow**: `drop-shadow-glow` - Custom `0 0px 65px rgba(255, 255,255, 0.2)`
- **Standard**: `drop-shadow-2xl` (Tailwind default)
- **Footer**: `.footer-shadow` - `box-shadow: 0 0 10vh 10vh black` (vignette effect)

---

## Animation System

### Keyframe Animations

#### Bounce Animations
```css
@keyframes bounce-left {
    0%, 100% {
        transform: translateX(-25%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
        transform: translateX(0);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
}

@keyframes bounce-right {
    /* Mirror of bounce-left with +25% translation */
}
```

#### Blob Rotation
```css
@keyframes blob-rotate {
    from { rotate: 0deg; }
    50% { scale: 1 1.3; }
    to { rotate: 360deg; }
}
```
20-second continuous rotation with scale breathing effect.

### Custom Animation Classes
- `.animation-bounce-left` - 1s infinite bounce towards left
- `.animation-bounce-right` - 1s infinite bounce towards right
- Applied to emoji/icon elements for visual engagement

### Scroll-Triggered Animations
Via JavaScript Intersection Observer:
```javascript
.scroll-show-hidden {
    opacity: 0;
    translate: 0% 50%;
    filter: blur(2px);
    transition: all 0.8s;
}

.scroll-show-show {
    opacity: 1;
    filter: blur(0);
    translate: 0% 0%;
}
```
Elements fade in, blur fades, and slide up when scrolled into view (0.8s duration).

### Marquee Animation
```css
@keyframes scroll {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-100% - var(--gap))); }
}
```
Infinite horizontal scrolling for content carousels.

### Motion Canvas Integration
- Advanced animation library for frame-by-frame control
- Located in `/animation` subdirectory
- Integrated via custom Astro integration at `src/integrations/motionCanvas.mjs`
- Built with Motion Canvas 3.17.2 ecosystem

---

## Component Design System

### Card Component
- **Base**: `NoisePanel` wrapper with noise texture
- **Ring**: `ring-2 ring-slate-700`
- **Background**: `bg-slate-800`
- **Shadow**: `drop-shadow-2xl`
- **Border Radius**: Standard Tailwind default (0.5rem)
- **Hover State**: 
  - `hover:ring hover:ring-offset-2 hover:ring-offset-transparent hover:ring-orange-500 hover:scale-105`
  - Interactive ring expansion and scale transform

### Buttons
- **Style**: Tailwind `btn` class (DaisyUI)
- **Colors**: `bg-gradient-to-r from-orange-500 to-amber-500`
- **Border**: `border-none`
- **Text**: `text-white text-lg cubano` (bold display font)
- **Hover**: `hover:scale-105`
- **Transition**: Smooth scale animations

### Navigation Breadcrumbs
- Uses DaisyUI breadcrumb component
- Text size: `text-sm`
- Positioned absolutely at top of pages
- Divided into left (breadcrumb) and right (action button) sections

### Testimonial Stack Component (Web Component)
- **Element**: `<testimonial-card>` in card stack layout
- **Loading Bar**: Animated width bar for timing/duration
- **Transition**: 1-second cubic-ease transitions
- **Duration**: Variable per testimonial (stored in data)
- **Interactive**: Rotates testimonials on timer

### Footer
- **Background**: `bg-zinc-900` (optional)
- **Shadow**: VignetteFade via `.footer-shadow`
- **Spacing**: `py-16 px-16`
- **Layout**: Grid center with 12-unit gap spacing
- **Social Icons**: Flex row with 0.75rem spacing

---

## Layout & Spacing

### Container Sizing
- **Full Width**: `w-screen`
- **Full Height**: `h-[100svh]` and `h-[100vh]` (small viewport height and viewport height)
- **Responsive Widths**: 
  - `lg:w-[60vw]` - Large screens
  - `md:w-[70vw]` - Medium screens
  - `w-[90vw]` - Mobile/small screens

### Gaps & Spacing
- **Space Between Elements**: `space-y-5`, `space-y-12`, `space-x-3`
- **Padding**: `px-[2vw] py-[1vh]` for navigation
- **Margin**: Standard Tailwind spacing scale

### Custom Breakpoints (Tailwind Config)
- `kofi-logo: 864px` - Ko-fi button responsiveness
- `table-of-contents: 1132px` - TOC display toggle

### Grid & Flexbox
- **Center Alignment**: `grid place-items-center`
- **Flex Alignment**: `flex flex-wrap justify-center items-center`
- **Content Distribution**: `place-items-end` for end alignment

---

## Responsive Design

### Mobile-First Approach
- Base styles apply to all screen sizes
- Prefixes: `md:` (768px+), `lg:` (1024px+), `min-[1250px]:` (custom breakpoint)

### Visibility Toggles
- `hidden min-[1250px]:grid` - Hide on mobile, show on wide screens
- `md:overflow-x-visible` vs `overflow-x-hidden` - Overflow handling

### Font Size Scaling
```
text-6xl          # Base (mobile)
md:text-5xl       # Medium screens
lg:text-7xl       # Large screens
```

---

## Visual Effects & Polish

### Blur & Blur Gradient
- **Backdrop Filter**: `backdrop-filter: blur(500vmax)` (Blob component blur)
- **Element Blur**: `filter blur(2px)` for scroll animations

### Opacity & Transitions
- **Default Transition**: `transition-all ease-in-out duration-1000`
- **Custom Durations**: Duration classes and inline `style` attributes
- **Opacity Classes**: `opacity-[0.015]` for logo watermark

### Scale Transforms
- **Hover Scale**: `hover:scale-105` (5% increase)
- **Blob Scale**: `scale: 1.2 0.9` and `scale: 1.2 1.1` (aspect ratios)
- **Logo**: `-rotate-12` (12-degree rotation)

### Scrollbar Styling
- **Color**: `scrollbar-color: white !important`
- **Color Scheme**: `color-scheme: light` for consistency

### SVG Customizations
- **Icon Fill**: `!fill-slate-50` (SVG logo watermark)
- **Wave Background**: SVG file `/layered-waves-haikei.svg` for decorative breaks
- **Noise Texture**: `/noise.webp` webp image file

---

## Advanced Features

### Sticky Positioning
- Navigation: `absolute px-[2vw] py-[1vh]` with `z-50`
- Scroll-up button: Fixed positioning with high z-index

### Box Shadows & Depth
- **Inset Shadow**: `box-shadow: inset 0 0 1rem -0.1rem rgba(0, 0, 0, 1)`
- **Drop Shadow**: `drop-shadow-2xl` (Tailwind)
- **Footer Vignette**: `box-shadow: 0 0 10vh 10vh black`

### Focus Management
- Skip-to-content link: `focus` state brings element into view
- Keyboard navigation support with focus states

### Motion Preferences
- Animations wrapped in `@media (prefers-reduced-motion: no-preference)`
- Respects user accessibility preferences

### VH Units & Viewport-Relative Sizing
- `h-[100svh]` - Small viewport height (excludes browser UI)
- `w-[300vmin]` - Minimum of width/height (for blob sizing)
- Creates responsive layouts that adapt to viewport

---

## SEO & Meta Tags

### Implementation
- **Library**: `astro-seo` 0.7.6
- **Features**:
  - Open Graph metadata (OG:image, OG:type, OG:title)
  - Twitter card metadata (Twitter:image, Twitter:card)
  - Custom meta viewport and generator tags
  - MathJax support for mathematical content
  - Thumbnail images at `/images/thumb/{slug}.webp`

### Transitions
- Astro view transitions: `transition:animate="fade"`
- Smooth page transitions between navigations

---

## File Structure for Styles

```
src/
├── css/
│   └── global.css          # All custom utilities, animations, classes
├── components/
│   ├── Layout.astro         # Main layout wrapper (dark mode base)
│   ├── BrainLayout.astro    # Alternative darker layout
│   ├── Navbar.astro         # Navigation with breadcrumbs
│   ├── Footer.astro         # Footer with socials
│   ├── Card.astro           # Content cards with hover states
│   ├── NoisePanel.astro     # Noise texture wrapper
│   ├── Blob.astro           # Animated blob backgrounds
│   ├── ScrollShow.astro     # Scroll animation wrapper
│   ├── Marquee.astro        # Infinite scroll carousel
│   └── SkipToContent.astro  # Keyboard navigation
└── pages/
    └── index.astro           # Homepage with all effects
```

---

## Configuration Files

### Tailwind Configuration (`tailwind.config.cjs`)
```javascript
{
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      screens: {
        'kofi-logo': '864px',
        'table-of-contents': '1132px',
      },
      dropShadow: {
        glow: '0 0px 65px rgba(255, 255,255, 0.2)',
      },
    },
  },
  plugins: [require('daisyui')],
}
```

### Astro Configuration (`astro.config.mjs`)
- Integrations: Tailwind, Prefetch, Icon, Markdoc, MDX
- Motion Canvas custom integration
- Markdown plugins for content transformation
- Remark plugins for wiki-links and Obsidian vault support

---

## Accessibility Features

### ARIA Labels
- Descriptive `aria-label` attributes on interactive elements
- Alt text on images
- Semantic HTML structure

### Keyboard Navigation
- Skip-to-content link with focus management
- Breadcrumb navigation support
- Link prefetching with `rel="prefetch"`

### Focus States
- Skip-to-content: Visible on focus with `translate-y-0` and transition
- Button focus: Ring and scale effects

### Color Contrast
- Light text on dark backgrounds (WCAG AA compliant)
- High-contrast gradients for emphasis

---

## Performance Optimizations

### Image Handling
- **WebP Format**: Lazy-loaded images with `.webp` extension
- **Thumbnails**: Generated at `/images/thumb/` for social sharing
- **Assets**: Configured with `assetsInlineLimit: 0` to prevent inline embedding

### Prefetching
- `@astrojs/prefetch` enabled for link preloading
- Reduces perceived navigation latency

### Code Splitting
- Astro islands architecture
- Component-level hydration
- Motion Canvas assets built separately

---

## Copy & Rebuild Instructions

To rebuild this exact style with different content:

1. **Setup Framework**: Create Astro project with `npm create astro@latest`

2. **Install Dependencies**:
```bash
npm install tailwindcss daisyui postcss autoprefixer
npm install @astrojs/tailwind @astrojs/prefetch astro-icon astro-seo
npm install @astrojs/mdx @astrojs/markdoc
```

3. **Configure Files**: Copy the configurations from:
   - `tailwind.config.cjs` 
   - `astro.config.mjs`
   - `tsconfig.json`

4. **Create Global CSS**: Copy `/src/css/global.css` exactly

5. **Build Component Library**: Create components using the component specs above
   - Match Tailwind class patterns
   - Replicate hover/transition states
   - Include noise texture and gradient patterns

6. **Add Google Fonts**: Add the link tag with Oswald, Phudu, Bebas Neue

7. **Assets**: Create/include:
   - `/public/noise.webp` (noise texture)
   - `/public/layered-waves-haikei.svg` (wave divider)
   - `/public/tailwind-blur.png` (blur backdrop)
   - `/public/logo.svg` (site logo)

8. **Layouts**: Build main Layout and BrainLayout components with the exact classes

9. **Testing**: Test responsive breakpoints and animations across devices

---

## Key Design Principles

1. **Dark Mode First** - Deep slate/zinc backgrounds with white text
2. **Gradient-Heavy** - Orange-amber accents with purple/pink blob gradients
3. **Motion-Focused** - Continuous animations, scroll triggers, interactive elements
4. **Layered Depth** - Blurred backgrounds, noise overlays, box shadows
5. **Typography-Driven** - Large, bold headlines with gradient emphasis
6. **Accessibility-Conscious** - Focus states, keyboard navigation, reduced-motion support
7. **Responsive Fluidity** - VH/VW units for viewport-relative sizing
8. **Texture-Rich** - Noise overlays, grid patterns, gradient meshes
