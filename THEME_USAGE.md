# CSS Theme System Usage Guide

## Overview
The app now includes a comprehensive CSS-based theme system with custom properties and utility classes.

## CSS Custom Properties Available

### Color Variables
```css
/* Brand Colors */
--hop-green: #4A7C59
--hop-gold: #F4C430  
--hop-brown: #8B4513

/* Theme-aware Colors (change based on light/dark mode) */
--primary-bg, --secondary-bg, --accent-bg
--card-bg, --modal-bg, --overlay-bg
--primary-text, --secondary-text, --accent-text
--border-color, --shadow, --shadow-lg
--bg-gradient, --card-gradient
```

## CSS Component Classes

### Page Structure
```jsx
<div className="page-container">
  <header className="page-header">
    <h1 className="page-title">Title</h1>
    <p className="page-subtitle">Subtitle</p>
    <p className="page-description">Description</p>
  </header>
</div>
```

### Cards
```jsx
{/* Theme-aware card */}
<div className="theme-card">Content</div>

{/* Award-specific card */}
<div className="award-card">Award content</div>

{/* Team card */}
<div className="team-card">Team content</div>

{/* Division card */}
<div className="division-card">Division content</div>
```

### Buttons
```jsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-gold">Gold Action</button>
```

### Modal
```jsx
<div className="modal-overlay">
  <div className="theme-modal">
    <div className="modal-header">Header</div>
    <div>Content</div>
  </div>
</div>
```

### Rankings
```jsx
<div className="rank-badge rank-1">1</div>
<div className="rank-badge rank-2">2</div>
<div className="rank-badge rank-3">3</div>
<div className="rank-badge rank-other">4</div>
```

## Tailwind Integration

### New Tailwind Classes Available
```jsx
{/* Theme-aware backgrounds */}
<div className="bg-theme-primary-bg">
<div className="bg-theme-secondary-bg">
<div className="bg-theme-accent-bg">

{/* Theme-aware text colors */}
<p className="text-theme-primary-text">
<p className="text-theme-secondary-text">
<p className="text-theme-accent-text">

{/* Theme gradients */}
<div className="bg-theme-gradient">
<div className="bg-card-gradient">

{/* Theme shadows */}
<div className="shadow-theme">
<div className="shadow-theme-lg">

{/* Brand colors */}
<div className="bg-hop-green text-hop-gold border-hop-brown">
```

## Animations
```jsx
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-in">Slides in</div>
<div className="animate-bounce-subtle">Subtle bounce</div>
```

## Migration Examples

### Before (Tailwind only)
```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-hop-green">
```

### After (CSS classes)
```jsx
<div className="award-card">
```

### Before (Complex theme classes)
```jsx
<button className="bg-hop-green dark:bg-hop-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-hop-green/90 transition-colors">
```

### After (CSS classes)
```jsx
<button className="btn-primary">
```

## Benefits

1. **Cleaner JSX** - Reduced className clutter
2. **Consistent Design** - Centralized styling rules
3. **Better Performance** - Fewer repeated class combinations
4. **Easier Maintenance** - Change themes in one place
5. **Enhanced Animations** - Built-in transitions and effects
6. **Theme Variables** - Automatic light/dark mode switching

## Theme Switching
The theme automatically switches all CSS variables when the `.dark` class is added to the document element via the ThemeContext.