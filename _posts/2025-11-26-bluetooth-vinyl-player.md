---
layout: default
title: "DIY Project: Bluetooth Vinyl Player"
date: 2025-11-26 10:00:00 -0000
categories: project hardware
---

I'm working on a special Christmas gift for a friend: modifying a **Crosley Voyager** vinyl player to transmit audio via Bluetooth!

While the player has vintage charm, I wanted to give it modern utility. Using an **ESP32**, I'm intercepting the analog audio, converting it to digital with a high-quality **PCM1808 ADC**, and streaming it to Bluetooth speakers using the A2DP profile.

### The Plan
- **Brain**: ESP32 microcontroller.
- **Ears**: PCM1808 I2S ADC for clear audio capture.
- **Logic**: A custom "Smart Pair" feature that automatically connects to popular speaker brands (JBL, Bose, Sony) when a button is pressed.
- **Mute**: A relay circuit to silence the internal speakers when Bluetooth is active.

I've open-sourced the code and wiring plans. You can check out the project repository here:  
[**BT-Vinyl-Player on GitHub**](https://github.com/SentientSamuel/BT-Vinyl-Player)

Stay tuned for updates on the build process!

