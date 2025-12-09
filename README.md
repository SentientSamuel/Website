# Samuel Lamb's Portfolio Website

My portfolio website showcasing projects, skills, and blog posts. Built with Jekyll and Tailwind CSS.

## Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - Toggle between light and dark themes
- **Interactive Skills Section** - Click skills to see related projects
- **Dev Blog** - Jekyll-powered blog for development updates
- **Electronics Inventory** - Full CRUD inventory management system

## Tech Stack

- **Jekyll** - Static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **Vanilla JavaScript** - No framework dependencies
- **Google Sheets API** - Backend for inventory system

## Quick Start

### Development (Using Tailwind CDN)

1. Clone the repository
2. Install Jekyll: `bundle install`
3. Serve locally: `bundle exec jekyll serve`
4. Open `http://localhost:4000`


## Adding Projects

Projects are easily editable in `js/projects-data.json`:

1. Open `js/projects-data.json`
2. Find or add a skill category
3. Add a project:
   ```json
   {
     "name": "Project Name",
     "description": "Project description"
   }
   ```
4. Save and push - changes appear automatically!

## Project Structure

- `index.html` - Main landing page
- `_layouts/` - Jekyll layouts
- `_posts/` - Blog posts (Markdown)
- `inventory/` - Electronics inventory system
- `js/` - JavaScript files
- `css/` - Stylesheets
- `js/projects-data.json` - Project data (easily editable)

## Notes

- The inventory system (`inventory/index.html`) currently uses Bootstrap and works independently
- Dark mode preference is saved in localStorage
- All Tailwind customizations are in `css/tailwind.css`
