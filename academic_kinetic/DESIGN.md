---
name: Academic Kinetic
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#5d3f40'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#916e6f'
  outline-variant: '#e6bcbd'
  surface-tint: '#be0036'
  primary: '#ba0034'
  on-primary: '#ffffff'
  primary-container: '#e51245'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb3b5'
  secondary: '#465f88'
  on-secondary: '#ffffff'
  secondary-container: '#b6d0ff'
  on-secondary-container: '#3f5881'
  tertiary: '#5a5c5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#737575'
  on-tertiary-container: '#fcfcfc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b5'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920027'
  secondary-fixed: '#d6e3ff'
  secondary-fixed-dim: '#aec7f6'
  on-secondary-fixed: '#001b3d'
  on-secondary-fixed-variant: '#2d476f'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter-xs: 0.5rem
  gutter-md: 1rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
  safe-area-bottom: 2rem
---

## Brand & Style

The design system is a high-end, utility-focused framework built for the modern university campus. It balances the prestigious heritage of Cairo University with the high-velocity energy of a tech startup. The aesthetic is a fusion of **Corporate Modern** and **Glassmorphism**, emphasizing clarity, depth, and effortless movement.

The UI should feel lightweight and "floating" over a map-centric background, using translucent layers to maintain spatial context. Every interaction is designed to evoke a sense of reliability and speed, ensuring students and visitors can navigate complex environments without cognitive friction.

## Colors

The palette centers on **Electric Pink** for high-priority actions and wayfinding paths, ensuring immediate visibility against map data. **University Blue** provides a grounded, authoritative anchor for secondary navigation and academic metadata. 

- **Primary (Electric Pink):** Use for active routes, "Get Directions" buttons, and critical status indicators.
- **Secondary (University Blue):** Use for headers, institutional branding, and informational labels.
- **Backgrounds:** Predominantly clean white or very light grey (#F9FAFB) to maintain a premium, airy feel.
- **Glass Effects:** Interactive cards use a semi-transparent white with a high-saturation background blur (20px-40px) to simulate depth.

## Typography

This design system utilizes **Inter** for its exceptional legibility and systematic feel. The type hierarchy prioritizes "scannability." 

- **Headlines:** Use heavy weights (SemiBold/Bold) with tight letter-spacing to create a strong visual impact for location names and directions.
- **Labels:** Use Medium weight and slight letter-spacing for UI micro-copy (e.g., distances, floor numbers).
- **Numbers:** Coordinate with the "Inter" tabular figures for time-to-arrival and distance metrics to ensure alignment in dynamic lists.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a heavy emphasis on bottom-anchored mobile interactions. 

- **Mobile:** All key navigational controls (Search, Route Options) should be positioned within the "Thumb Zone" at the bottom of the screen.
- **Desktop:** Uses a 12-column grid with a left-aligned floating sidebar (360px - 400px width) for search results and turn-by-turn instructions, leaving the map as the primary canvas.
- **Safe Zones:** Ensure a 16px minimum margin from screen edges for all floating cards to maintain the "hovering" aesthetic.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Glassmorphism** rather than traditional borders.

- **Level 1 (Map Icons):** Soft 2px blur shadow to separate icons from the map tile.
- **Level 2 (Active Cards):** Floating white cards with 15% opacity primary color shadows. This creates a "glow" effect that reinforces the brand.
- **Level 3 (Modal/Overlays):** Heavy backdrop blur (40px) with a subtle 1px white inner border to simulate the edge of a glass pane.
- **Dynamic Shadows:** Shadows should increase in spread when a card is dragged or active, simulating physical lift.

## Shapes

The shape language is friendly and approachable. 
- **Cards:** Use a 24px corner radius (`rounded-xl`) to create a soft, "pillowy" feel that aligns with modern mobile OS aesthetics.
- **Buttons:** Use fully rounded (Pill-shaped) ends for primary actions like "Start" or "Search."
- **Inputs:** Use 12px-16px radius for text fields to maintain consistency with the card containers.

## Components

### Buttons
- **Primary:** Pill-shaped, solid Electric Pink background, white text. Large tap target (min 48px height).
- **Secondary:** Transparent with a University Blue 2px border or glass effect.

### Floating Cards
- **Construction:** Background: `rgba(255, 255, 255, 0.85)`, Backdrop Blur: 20px, Corner Radius: 24px.
- **Shadow:** `0 10px 30px rgba(0, 0, 0, 0.08)`.

### Search Bar
- Floating design with an inset magnifying glass icon. Should transition into a full-screen glass overlay when focused on mobile.

### Wayfinding Markers
- **User Location:** Pulsing pink dot with a translucent outer ring.
- **POI Markers:** Circular white background with University Blue icons, using a small "tail" pointing to the map location.

### Progress Indicators
- **Route Line:** Thick (6px+) Electric Pink stroke with rounded caps and a subtle shadow to separate it from street lines.