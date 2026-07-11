# Portfolio Fix Goals

## Phase 1 — Active Fixes ✅

### Game Integration
- [x] Re-export Godot game (generate `.html`, `.wasm`, `.pck`) and place in `VolleyBeach/exports/VolleyBeach/`
- [x] Wire `openGame()` to the game thumbnail — replace itch.io direct link with in-page iframe
- [x] Bind P2 smash key in `Player_Right.gd` (fix `trigger_action_ball_?` action name)
- [x] Update controls overlay `[?]` → `[/]` in `index.html`
- [x] Fix race condition in game overlay close → open (clear timer on reopen)

### Content
- [x] Update copyright `2025` → `2026` in footer

### Cleanup
- [x] Delete orphaned `assets/video-thumb-1.png` and `assets/video-thumb-2.png`
- [x] Remove 5 dead CSS abstract classes (`.abstract-tech`, `.abstract-proj1`, `.abstract-proj2`, `.abstract-godot`, `.abstract-contact`)
- [x] Create `project.godot` config file for VolleyBeach
- [x] Copy missing `Sprites/` assets from backup (`Beach.png`, `Player.png`, `VolleyBall.png`, etc.)
- [x] Update `vercel.json` with proper config (security headers for game + site)

---

## Phase 2 — Future Polish

### Visual
- [ ] Add images to nav frames 1 (About), 5 (Data Platform), 7 (Experiments) for consistency
- [ ] Refactor inline `style="..."` attributes into CSS classes (~25 instances)
- [ ] Tune `scroll-snap-type` from `y mandatory` to `y proximity` for smoother scrolling
- [ ] Make video overlay height adaptive instead of fixed `80vh`

### Animation
- [ ] Add fade-up animation when sections scroll into view (currently always opaque)
- [ ] Tune hero `fadeIn` timing if needed

### Code Quality
- [ ] Extract portfolio content into a data file (JSON/JS) for easier editing
- [ ] Review Cloudinary URL dependency — consider local fallbacks
- [ ] Add `.gitignore`

### Game Enhancements
- [ ] Full P2 smash implementation (not just action name fix)
- [ ] Add proper menu scene
- [ ] Add audio/sound effects
- [ ] Mobile touch controls for the web build
