---
layout: default
title: "Carbon Copy: A Digital Life Counter for Magic: The Gathering"
date: 2025-12-13 00:00:00 -0000
categories: project webdev mobile
---

I've been working on **Carbon Copy** - a faithful recreation of the Carbon life counter app for Magic: The Gathering and other multiplayer card games. It's a cross-platform mobile app built with React, TypeScript, and Capacitor that provides an intuitive interface for tracking life totals, counters, commander damage, and more.

## Why Build This?

The original Carbon app was my go-to life counter for years, but it's no longer available on newer Adnroid devices. Rather than settle for alternatives that didn't quite match the experience, I decided to recreate it myself. The goal was to build something that captures the same intuitive feel, beautiful design, and smooth gameplay experience (with a few tweaks that I wanted all along).

## Features That Make It Special

### Flexible Player Setup

The app supports 1-6 players with multiple table arrangement options:
- **1 Player**: Fullscreen layout
- **2 Players**: Face-to-face setup
- **3-6 Players**: Various asymmetric and grid layouts

Each layout automatically rotates content so it's readable from the player's perspective - a detail that makes a huge difference during gameplay.

### Interactive Player Selection

One of my favorite features is the **Player Chooser** screen. Instead of manually selecting who goes first, all players touch the screen simultaneously. After a 3-second countdown with pulsing visual feedback, a random winner is selected with a full-screen color flash. The winner automatically becomes Player 1. It's a small touch that adds a lot of personality to the game setup.

### Comprehensive Counter System

Each player module tracks:
- **Life Total**: Tap the top half to increase, bottom half to decrease. The large, readable numbers with heart icons make it easy to see at a glance.
- **Poison Counters**: Visual tendril indicator tracks poison from 0-10
- **Commander Damage**: Track damage from each commander/opponent separately
- **Generic Counters**: Add unlimited generic counters for any purpose (experience, energy, etc.)

### Element-Based Color System

The app uses 11 distinct element colors (excluding white) that are automatically distributed to maximize visual distinction between players:
- Neon (Pink/Red)
- Silicon (Blue)
- Oxygen (Yellow)
- Chlorine (Teal-Green)
- Helium (Orange-Red)
- And more...

Players can change colors during gameplay, and the system ensures colors are visually distinct.

### Game Menu Features

A centered menu button provides access to:
- **History**: View all game events with timestamps - perfect for checking what happened when
- **Dice Roller**: Custom dice with min/max values for any game situation
- **Player Names**: Edit names and toggle name display on/off
- **Reset Options**: Soft reset (life totals only) or hard reset (everything)
- **Exit Game**: Return to home screen to start fresh

## Technical Stack

Built with modern web technologies:
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **React Router** for navigation between game screens
- **Tailwind CSS** for styling with a custom design system
- **Capacitor** for cross-platform deployment (iOS, Android, Web)
- **shadcn/ui** components for polished UI elements

## The Development Process

### Layout System

One of the trickier aspects was implementing the rotation system. Each player module needs to be rotated based on its position around the table, ensuring the content is always readable from that player's perspective. This required careful CSS transforms and positioning calculations.

### Touch Interactions

Getting the touch interactions right was crucial:
- **Life changes**: Split each module into top/bottom zones for increase/decrease
- **Drawer access**: Swipe up or tap to access detailed counters
- **Menu access**: Centered button that's always accessible

The touch targets needed to be large enough for reliable interaction, even on smaller devices.

### State Management

The game state tracks a lot of information:
- Life totals for each player
- Poison counters
- Commander damage matrices (damage from each player to each other player)
- Generic counters (unlimited per player)
- Game history with timestamps
- Player configurations (names, colors, positions)

All of this needed to be managed cleanly and persist across app restarts.

## Mobile Deployment

Using Capacitor makes deployment straightforward:
- Build the React app as a standard web app
- Sync with Capacitor to generate native projects
- Build and deploy to iOS App Store and Google Play Store (maybe, I am thinking about it)

The web version also works great for quick games on any device.

## Future Enhancements

Some ideas I'm considering:
- **Tutorial Mode**: Interactive tutorial for new users
- **Theme Options**: Different visual themes beyond the default
- **Statistics**: Track game history across sessions
- **Online Multiplayer**: Sync games across devices (future consideration)

## Credits

This project is a recreation/remake of the original Carbon app by nanotube. Carbon Copy is my attempt to preserve and continue that excellent user experience. All rights to the original Carbon app belong to their respective owners.

Carbon Copy is available now and ready for your next game night!

