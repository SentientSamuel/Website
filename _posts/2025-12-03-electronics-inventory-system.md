---
layout: default
title: "Building an Electronics Inventory Management System"
date: 2025-12-03 00:00:00 -0000
categories: webdev project
---

I've been working on a personal electronics inventory management system - a web-based tool to keep track of all my components, modules, and electronics projects. What started as a simple spreadsheet integration has evolved into a full-featured inventory system with some nice quality-of-life improvements.

## The Core Concept

The system connects to a Google Sheet that acts as the database, displaying inventory data in a clean, searchable interface. You can filter by status, search by name/model/tags, export data as CSV, and manage items directly from the web interface.

## Features

### Search and Filter

The inventory page includes:
- **Full-text search** across item names, models, and AI tags
- **Status filtering** - automatically calculated based on quantity available (0 = "In Use", otherwise "Available")
- **URL parameter support** - you can link directly to specific items using `?id=ITEMID`

### Smart Form Inputs

The "Add Item" form uses intelligent dropdowns that populate from existing inventory data:
- **Auto-complete dropdowns** for Item ID, Name, Category, Model, and Location
- **"Other / Add New" option** - when you enter a new value, it automatically appears in the dropdown for future entries
- **Multi-select tag inputs** for "Currently Used In" and "AI Tags" with suggestion support

This means you can quickly select existing values or easily add new ones, and the system learns from your inventory over time.

### Data Management

Full CRUD operations:
- **Add items** with comprehensive metadata
- **Edit existing items** with a click of the pencil icon
- **Delete items** with confirmation dialog
- **Export filtered results** to CSV for AI model integration (one of the original goals)

### Automatic Status Calculation

Instead of manually setting status, the system automatically determines if an item is "Available" or "In Use" based on the "Quantity Available" field. This prevents inconsistencies and keeps the data accurate.

### Dark Mode Support

The inventory page integrates seamlessly with the site's dark mode system, so it matches the rest of the website's aesthetic.

## Technical Implementation

### Google Sheets Integration

The system uses Google Sheets as the backend database:
- **Read access**: Fetches data via CSV export URL
- **Write access**: Uses Google Apps Script web app to handle add/edit/delete operations

The write operations use a form-based submission approach (hidden iframe) to bypass CORS restrictions, which was one of the more interesting technical challenges.

### Client-Side Processing

All data processing happens client-side:
- CSV parsing with proper handling of quoted fields (important for comma-separated tags)
- Real-time filtering and search
- Dynamic table rendering

### Error Handling

Added comprehensive error handling:
- Detects 403 permission errors from Google Apps Script
- Shows helpful error messages with guidance
- Graceful degradation if the backend is unavailable
- Manual refresh button to sync data

## Lessons Learned

### CSV Parsing is Trickier Than It Looks

Initially, the CSV parser was using a simple `split(',')` which broke when fields contained commas (like AI tags). Had to implement a proper CSV parser that respects quoted fields and handles escaped quotes.

### CORS Workarounds

Google Apps Script web apps don't easily allow CORS for JSON requests from external domains. Solved this by using form-based submission to a hidden iframe, which bypasses CORS restrictions since it's treated as a traditional form submission.

### Dropdown Duplication Bug

Found an interesting bug where dropdown options were duplicating when the form was opened multiple times. The `populateDropdowns()` function was adding new options without clearing existing ones. Fixed by implementing a proper clearing mechanism that preserves default options (placeholder and "Other") while removing data options.

## Future Enhancements

Some ideas for future improvements:
- **URL auto-fill**: Paste an Amazon or Elegoo product URL and automatically extract product information to populate the form
- **Offline support**: Cache inventory data and allow offline viewing
- **Bulk operations**: Select multiple items for batch edits
- **Image support**: Upload photos of components
- **Barcode scanning**: Use phone camera to scan barcodes

The inventory system has been really useful for keeping track of my electronics collection, and the CSV export feature makes it easy to query my inventory when working on new projects. It's always satisfying when a tool you built yourself becomes part of your regular workflow.



