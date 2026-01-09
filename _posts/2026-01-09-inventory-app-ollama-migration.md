---
layout: default
title: "Upgrading the Inventory System: From Google Sheets to Docker + Ollama"
date: 2026-01-09 00:00:00 -0000
categories: webdev project
---

I've taken my electronics inventory management system to the next level. What started as a Google Sheets integration has evolved into a full-featured web application running in Docker with AI-powered features via Ollama. This migration represents a significant upgrade in functionality, performance, and capabilities.

## Why Migrate?

The original Google Sheets-based system worked well, but had limitations:
- **No image support** - couldn't attach photos of components
- **No drag-and-drop reordering** - had to manually update sort orders
- **No AI integration** - couldn't leverage LLMs for auto-filling or suggestions
- **Limited offline capability** - dependent on Google's infrastructure
- **CORS workarounds** - had to use form submissions through hidden iframes

The new system addresses all of these while adding powerful new features.

## The New Architecture

### Dockerized Node.js Backend

The entire application now runs in Docker on my Mini PC:
- **Node.js/Express** API server
- **SQLite database** for local storage (can be moved to NAS partition)
- **Image storage** with upload/download endpoints
- **RESTful API** with proper error handling

This gives me full control over the data and eliminates dependency on external services.

### Ollama LLM Integration

The most exciting addition is integration with **Ollama** - a local LLM server that runs on my Mini PC. This enables two key features:

#### 1. Model Number Lookup (Manual Trigger)

When adding a new component, I can enter a model number and click "Lookup" to have the AI automatically fill in:
- Component name
- Category
- Typical use cases
- Technical specifications
- Description

The results are cached to avoid repeated API calls for the same model numbers. This saves significant time when adding multiple items.

#### 2. Periodic AI Suggestions (Automatic)

The system runs a background job daily at 2 AM (configurable) that analyzes the entire inventory and generates suggestions:
- **Project Ideas**: What can I build with my available components?
- **Upgrade Recommendations**: Items that could be upgraded or improved
- **Cost Optimization**: Ways to make projects cheaper using existing inventory
- **Replacement Suggestions**: Lower-cost alternatives for expensive parts

These suggestions are stored in the database and displayed in a dedicated "AI Suggestions" tab. I can also manually trigger generation anytime with a button click.

## Key Features

### Image Upload

Finally! I can attach photos to inventory items. Images are stored on the Mini PC (or can be mounted from a NAS partition) and served through the API. This is especially useful for identifying components that look similar.

### Drag-and-Drop Reordering

Using SortableJS, I can now drag items in the table to reorder them. The sort order is saved to the database, so my preferred organization persists.

### Full CRUD Operations

Complete create, read, update, and delete functionality with a clean, modern UI. The interface is responsive and works well on different screen sizes.

### Public Read-Only API

The website's inventory page now fetches data from the Mini PC via Tailscale, providing a read-only view for public access. This keeps the full management interface private while still showcasing the inventory.

## Technical Implementation

### Docker Setup

The application is containerized for easy deployment:
- **Dockerfile** with Node.js 18 Alpine base
- **docker-compose.yml** for orchestration
- **Volume mounts** for database and image persistence
- **Network configuration** to access Ollama on the host machine

### Database Schema

SQLite database with tables for:
- **Items**: Full inventory with all metadata
- **Projects**: Tracking parts in use
- **LLM Cache**: Cached model lookups to reduce API calls
- **Suggestions**: AI-generated recommendations

### API Endpoints

RESTful API with endpoints for:
- Items CRUD operations
- Image upload/download
- LLM model lookup
- Suggestions management
- Public read-only access

### Frontend

Modern vanilla JavaScript frontend with:
- Real-time search and filtering
- Modal-based add/edit forms
- Drag-and-drop table rows
- Image preview and upload
- AI suggestion display
- Responsive design

## Deployment

The app runs on my Mini PC and is accessible via:
- **Local network**: `http://localhost:3000`
- **Tailscale**: `http://[tailscale-ip]:3000` (for remote access)
- **Public website**: Read-only view via API

Ollama runs separately on the host machine, and the Docker container connects to it via `host.docker.internal:11434`.

## Lessons Learned

### Docker Networking

Getting Docker containers to communicate with services on the host machine required understanding Docker networking. On Windows, `host.docker.internal` works, but ensuring Ollama is accessible required proper configuration.

### Native Module Compilation

The `sqlite3` package is a native module that needs to be compiled for the target platform. When building the Docker image on Windows, it was compiling for Windows, but the container runs Linux. Fixed by ensuring build tools are available in the Alpine container and rebuilding inside Docker.

### LLM Prompt Engineering

Getting useful suggestions from the LLM required careful prompt engineering. The prompts need to be structured to return parseable JSON while still being flexible enough to handle edge cases.

### Background Jobs

Implementing the scheduled suggestions job with `node-cron` required understanding cron syntax and timezone handling. The job runs daily but can also be triggered manually.

## What's Next?

Some ideas for future enhancements:
- **Barcode scanning** integration
- **Multi-image support** per item
- **Export to various formats** (JSON, CSV, Excel)
- **Advanced analytics** and reporting
- **Integration with shopping lists** or project planning

The migration has been a great learning experience, and the new system is much more powerful and flexible than the original Google Sheets version. Having local control over the data and the ability to leverage AI for suggestions makes inventory management more efficient and enjoyable.

