---
layout: default
title: "Rafia: Code Cleanup and Balance Pass"
date: 2025-12-02 00:00:00 -0000
categories: gamedev project
---

Spent some time today cleaning up the Rafia codebase and rebalancing the game economy.

## Code Cleanup

The biggest change was extracting shared utilities into a new `GameUtils.gd` file. There was a lot of duplicate code - cost reduction calculations, number formatting, and GameManager lookups were scattered across multiple files. Now everything goes through centralized functions, which eliminated about 200 lines of duplicate code.

Also removed some legacy `ShopWindow` files that weren't being used anymore.

## Balance Adjustments

Did a pass on the game balance:

- **Generator costs**: Standardized cost multipliers to 1.08-1.09 across all generators for smoother scaling
- **Garbage Truck**: Reduced base cost from 75 to 65 (better payback time)
- **Recycling Plant**: Reduced base cost from 2000 to 1500 (was too expensive)
- **Click Power**: Reduced cost multiplier from 1.18 to 1.15 (was scaling too fast)
- **Prestige**: Fixed subsequent prestige threshold from 100 to 1500 trash (was way too low)
- **Prestige Currency**: Increased multiplier from 1.0 to 1.2 (better rewards)

## Bug Fixes

Fixed a few issues:

- **TPS calculation on load**: Timers were getting double-started when loading saves, causing trash to generate faster than displayed
- **Recycling Plant multiplier**: The global 2% bonus per plant wasn't being applied - now it works correctly
- **Trash label tooltip**: Added a tooltip showing the full number with commas when you hover over the trash counter
- **Timer management**: Improved start/stop logic to prevent issues on game load

The game should feel more balanced now, and the codebase is much cleaner and easier to maintain.

