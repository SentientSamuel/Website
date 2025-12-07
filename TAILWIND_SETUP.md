# Tailwind CSS Setup & Build Instructions

This website has been migrated from Bootstrap to Tailwind CSS.

## Quick Start (Current - Using CDN)

The site currently uses Tailwind's CDN for quick development. This works out of the box - just open `index.html` or run Jekyll.

## Production Build (Recommended)

For production, you should build the Tailwind CSS file to reduce file size and improve performance.

### Prerequisites

1. Install Node.js (if not already installed):
   - Download from https://nodejs.org/
   - This includes npm (Node Package Manager)

### Build Steps

1. **Install dependencies:**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   ```

2. **Build the CSS:**
   ```bash
   npm run build:css
   ```
   This creates `css/tailwind.output.css` from `css/tailwind.css`.

3. **Update HTML files to use built CSS:**
   - In `index.html`, replace the CDN script with:
     ```html
     <link href="css/tailwind.output.css" rel="stylesheet">
     ```
   - Do the same in `_layouts/default.html`

4. **For development with auto-rebuild:**
   ```bash
   npm run watch:css
   ```
   This watches for changes and rebuilds automatically.

## Adding Projects

Projects are stored in `js/projects-data.json`. To add a new project:

1. Open `js/projects-data.json`
2. Find the skill category (e.g., "Python", "JavaScript")
3. Add a new project object:
   ```json
   {
     "name": "Project Name",
     "description": "Project description here"
   }
   ```
4. Save and push - the changes will appear automatically!

## File Structure

- `css/tailwind.css` - Tailwind source file with custom components
- `css/tailwind.output.css` - Built CSS file (generated, don't edit)
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `js/projects-data.json` - Project data (easily editable)

## Jekyll Integration

The site works with Jekyll. When building:

1. Build Tailwind CSS first: `npm run build:css`
2. Then build Jekyll: `bundle exec jekyll build` or `bundle exec jekyll serve`

## Notes

- The inventory system (`inventory/index.html`) still uses Bootstrap - it can be converted later if needed
- Dark mode uses Tailwind's `dark:` variant with class-based toggling
- All custom animations are in `css/tailwind.css` under `@layer components`

