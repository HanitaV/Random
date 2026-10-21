# LOVE CASE

React + TypeScript + Vite, Tailwind CSS, Zustand, Motion and Lucide. Static frontend, Vietnamese UI, offline SVG avatars. No API key or server required.

## Run

Node 22 or later:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

## Try the complete flow

1. Open Ban tổ chức → Dữ liệu Preview → KHỞI TẠO DỮ LIỆU PREVIEW. Creates 10 males and 10 females. Repeated clicks do not duplicate IDs.
2. Click Chạy thử vòng quay, then MỞ HÒM TÌNH YÊU. Male portrait roulette runs first (3–6 seconds), highlights the selected male and waits indefinitely. Press TIẾP TỤC CHỌN BẠN NỮ to run female portrait roulette. Refresh or leaving/returning while waiting preserves the same selected male and pending female winner without committing a result. Both predetermined IDs are saved together before either animation, and committed once after both finish. Both the male and female are sampled randomly from unmatched participants; no manual selection is required. The ordinary public journey always uses random matching, regardless of retained admin preset settings. Admin Test PRESET remains a separate explicit test. Animation translates actual portrait cards under a fixed center marker.
3. After reveal save PNG, continue pairing or open the couple gallery. Gift status is editable.
4. Reset kết quả Preview to replay; Thiết lập ghép đôi → Preset → choose a female for a male → Test PRESET → open the case. The winner is resolved before animation; no image swaps after landing.
5. Preview cleanup removes demo participants and related pairs/results only. Mixed real-demo pairs count as related; unrelated real results stay intact.
6. Add/edit real participants, upload JPG/PNG/WebP, mark Nhân vật thật to protect converted demo records. Images are resized to 1000 pixels and stored as IndexedDB blobs.
7. Export a full JSON backup before the event. It includes uploaded images, participants, presets, results and settings. Import validates the data and asks before replacing local records.

## Event operation

Use one organizer laptop connected to a projector. Fullscreen button enables presentation. Data is device/browser specific (LocalStorage + IndexedDB); it is not shared among visitors. Admin is a control screen, not password security. A static frontend cannot conceal presets from source or DevTools. Preset mode is organizer pairing, not an independently fair random draw.

The event date is optional and starts blank. Set a date in organizer settings to display a countdown. Reduced-motion respects both system preferences and admin settings. Sound begins on user action; disable or adjust its volume in admin.

A pending spin is saved before moving. Refresh while choosing the male or waiting for the Continue button restores the same male and waits. Refresh during the female spin finalizes the original predetermined pair once, without starting a new random draw. Browser storage deletion removes event data; retain backups. Two simultaneous tabs should not organize concurrent spins.

## GitHub Pages

Push this project to a GitHub repository with the default branch `main`. In repository Settings → Pages → Source select GitHub Actions. The included `.github/workflows/deploy.yml` installs, tests, builds and deploys `dist`. Vite `base: './'` plus hash navigation supports repository paths without server rewrite configuration. Do not commit node_modules. The `.openai/hosting.json` file is only for the hosted preview and can be removed from your GitHub copy.

## Source

- `src/main.tsx`: public journey, admin, roulette integration, backup and PNG export.
- `src/data.ts`: typed data, Zustand persistence, SVG generator and IndexedDB photos.
- `src/engine.js`: isolated matching, exact target calculation, idempotent commits, cleanup and validation.
- `src/style.css`: responsive visual system and CSS case illustration.
- `tests/engine.test.mjs`: matching, landing, recovery, cleanup and backup tests.

## Verification and limits

Tests and production build are run during delivery. No browser automation is available in this environment; actual visual/interaction QA, PNG download, offline reload and projector behavior still require manual verification. Preview SVG portraits are stylized illustrations. Fonts use local system fallbacks, so Vietnamese characters work offline. Optional photo crop/reposition and searchable photo selectors are not implemented; uploaded portraits use centered cover framing. Pairing editor has independent male search and female portrait picker search, both accepting Vietnamese without accents and participant IDs. Choose/replace/remove assignments with immediate persistence. Completed and pending participants are locked; conflicting female assignments show their reason. Test PRESET does not change the saved mode and is blocked until a pending spin is finished. Participant JSON arrays can be imported separately; IDs must not collide. No claim of multi-device synchronization or secure admin access.

## Import attendance CSV

Open **Ban tổ chức → Nhập CSV** (also available from the overview and participant lists). Select a UTF-8 CSV using the columns in `example/`: `Dấu thời gian,Họ và Tên,Ban,Giới tính`. Column order may vary. Gender must be `Nam` or `Nữ`. Review the list, then click **Thêm … người tham gia**. Invalid rows block import with a detailed error list. Records with the same timestamp, name, department and gender are skipped, including on subsequent imports. Existing participants, photos, results and pairing settings are preserved. Imported participants are real records with generated offline avatars; department and attendance timestamp are retained in JSON backups. Finish a pending spin before importing.
