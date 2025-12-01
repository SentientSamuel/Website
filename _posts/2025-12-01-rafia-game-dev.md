---
layout: default
title: "Building Rafia: My First Idle Game"
date: 2025-12-01 00:00:00 -0000
categories: gamedev project
---

## Late Night Game Dev Sessions

So I've been spending my evenings working on a little idle game called **Rafia** - it's a trash-collecting clicker game built in Godot 4. Think Cookie Clicker, but with raccoons rummaging through garbage.

### The Premise

You click to collect trash. You hire raccoons to collect trash for you. Eventually you're running a whole operation with garbage trucks, landfills, and recycling plants. 

### What I've Been Working On

Just finished a pretty big refactoring session. The codebase was getting messy - classic "God Object" problem where one script was doing way too much. So I broke it apart:

- **GeneratorConfig** - All the generator stats in one place (costs, yields, etc.)
- **GeneratorManager** - Handles spawning and tracking all the raccoons, trash cans, and such
- **Cleaned up GameManager** - Now it just coordinates everything instead of doing everything

Also added some quality-of-life stuff:
- A trash-per-second display so you can see your empire grow
- Cookie Clicker-style shop unlocks (items stay hidden until you can afford them)
- Fancy popup animations when you find rare items - the screen flashes gold when you find a Legendary

### The Prestige System

Once you've collected enough trash, you can reset everything and earn "Stars" that give you permanent upgrades. Stuff like production bonus, cost cutting, and auto-recycle

### What's Next

Still need to:
- Add more item types and rarities
- Maybe some achievements?
- Sound effects (the game is eerily quiet right now)
- A proper tutorial for new players

It's been a fun project for learning Godot and idle game design patterns. 

