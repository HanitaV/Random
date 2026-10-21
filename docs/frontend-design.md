# Frontend design

This is a preservation redesign of the Vietnamese LOVE CASE event app. Routes, navigation labels, data storage, pairing controls, and roulette behavior stay intact.

The original interface used pink/purple/gold gradients, illuminated borders, very small uppercase labels, a floating CSS suitcase, and nested decorative panels. The new interface uses neutral silver surfaces, one rose accent, native system typography with Vietnamese support, flatter grouping, and readable secondary text. The public hero keeps the gift-case idea through a single still-life image. Organizer layouts keep their functional structure.

Design variance: 5. Decorative motion: 3. Visual density: 4. Native CSS is the styling foundation, with the project's existing Lucide icons and Motion. Controls have a 6px radius, image and dialog surfaces have an 8–10px radius. Light and dark modes follow the system preference. Roulette movement communicates the draw; reveal motion and confetti communicate the result. Both system and organizer reduced-motion preferences disable reveal effects.

## Hero asset

`public/images/love-case-gift.jpg` was generated with the built-in ImageGen tool and encoded as JPEG at quality 88. It is illustrative event imagery, not a photograph of a supplied physical gift.

Prompt:

> Use case: product-mockup. Asset type: square website hero photograph for LOVE CASE, a Vietnamese gift pairing event. One closed brushed silver aluminum gift case with rounded corners, a small handle and two practical clasps, loosely tied with a deep rose pink satin ribbon. A single pink carnation lies beside it. Honest editorial still-life photography, tangible brushed metal, fabric weave, slightly imperfect ribbon, soft natural window light from left, subtle grounded shadow. Seamless cool light gray backdrop, spacious composition with the case centered filling 70 percent of width, camera three-quarter front angle, photograph not 3D illustration. No words, no letters, no logo, no hearts drawn on case, no floating objects, no glitter, no neon, no gradients, no watermark. 1024 square.

## Verification

The existing 26 behavior tests pass, TypeScript checks pass, and the production build succeeds. Tested shared text and button color combinations exceed 4.5:1 contrast. Roulette card widths and the 16px strip gap remain consistent with the landing calculation. Mobile layout rules collapse at 767px; fullscreen retains its larger roulette geometry.

No browser was connected in this session, so rendered visual QA, Lighthouse, and interactive desktop/mobile verification remain unperformed.

The attendance CSV importer follows the existing silver/rose system, with a labeled file control, validation, counts, and a scrollable preview table. Seasonal date copy has been replaced with general connection and gift wording.
