# Cyber-neon sound and motion upgrade

## Goal
Transform OpenChat into a fast, theatrical cyber-neon glass experience while preserving chat, uploads, presence, admin tools, video calls, disguises, and roulette behavior. Apply the same experience to the online app and the downloaded standalone HTML.

## Visual upgrade
- Restyle the existing interface around the selected cyber-neon glass direction: sharper glass panels, cyan/fuchsia status lighting, stronger hierarchy, compact controls, and a subtle technical-grid/scanline atmosphere.
- Keep the current chat-first layout and make it adapt cleanly to Chromebook, tablet, and phone widths.
- Give active tabs, online presence, admin mode, uploads, and video-call controls distinct animated states.
- Make overlays enter with a glass-panel snap, background blur, and focused edge glow instead of abruptly appearing.

## Motion system
- Animate new messages with a short pop-and-settle entrance; animate system messages as a scanning status pulse.
- Add tactile press, shimmer, and recoil feedback to send, upload, tab, username, download, and admin controls.
- Add a brief connection pulse when users join or leave and a stronger success/error treatment for corner notifications.
- Turn roulette into the main spectacle: phase-change sweeps, urgent countdown pulses, energized link/vote rows, accelerating wheel motion, tick feedback, winner flash, and a target-selection blast animation.
- Keep ambient animation subtle and pause decorative motion for reduced-motion users.

## Sound effects
- Build a lightweight local Web Audio sound engine, so no external sound files or extra downloads are required.
- Add distinct cues for send, receive, user presence, tab switch, successful admin action, warning/error, roulette submit, vote, countdown urgency, wheel ticks, winner, and final blast.
- Add a visible sound toggle; remember its setting locally. Start safely muted until the first user interaction permits audio, then honor the saved preference.
- Keep sounds short and arcade-like, with volume balanced to avoid stacking or becoming disruptive.

## Standalone HTML parity
- Port the full token palette, visual states, animation keyframes, sound engine, toggle, and roulette effects into the generated HTML.
- Preserve online synchronization and all existing standalone-only roulette behavior.
- Ensure the file remains self-contained apart from its existing online chat connection and opens directly on a Chromebook.

## Validation
- Verify chat sending, image upload controls, online list, name editing, admin access and panel, tab switching, and HTML download still work.
- Exercise a roulette phase transition and confirm the overlay, countdown, spin, winner, and target-selection states remain usable.
- Download a fresh HTML copy and run it in a separate browser context to confirm chat synchronization, timer motion, and saved sound preference.
- Check desktop and mobile layouts, reduced-motion behavior, console errors, and app-specific browser metadata.

## Technical notes
- Reuse semantic color and shadow tokens rather than hardcoded component colors.
- Keep the React app and generated HTML visually aligned, while leaving roulette logic in the standalone HTML where it currently exists.
- No database or permission changes are needed.
