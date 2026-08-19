# Korean 2000 Study Tool – Audio + Typing updates

## What this package gives you

1. **data.js** – All 1429 cards with `audio` filenames filled in (from your Anki deck).
2. **app.js** – Improved Typing mode (type the Korean answer, press Enter to check, green/red feedback, like hunterw204.github.io style).
3. **style.css** – Small CSS additions for correct/wrong typing states.
4. **korean-audio.tar** (in parent folder) – All 1429 pronunciation MP3s.

## How to use on your GitHub Pages site (zaofu.github.io)

1. Download `korean-audio.tar` and extract it:
   ```bash
   tar -xf korean-audio.tar
   # results in audio_out/ with files named like 1455547243256.mp3
   ```

2. In your repo root (same place as index.html):
   - Replace `data.js` with the new one.
   - Replace `app.js` with the new one.
   - Replace (or merge) `style.css`.
   - Create folder `audio/` and move all the `.mp3` files from `audio_out/` into it:
     ```bash
     mkdir -p audio
     mv audio_out/*.mp3 audio/
     ```

3. Commit and push. The site will now play real Naver pronunciations and Typing mode will work properly.

## Typing mode tips

- Switch mode dropdown to **Typing**.
- English prompt appears → type the Korean word.
- Press **Enter** to check. Green = correct, red = wrong.
- Press Enter again (or click ✓ Got it) after correct.
- Or click **Check answer** / Space to force reveal.
- Audio still works with the 🔊 button or **A** key.

Your existing progress in localStorage is kept.
