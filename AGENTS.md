# Project

A Chinese, illustration-first introduction to *Attention Is All You Need*.

## Running

Open `index.html` directly, keeping `styles.css`, `app.js`, and `assets/` beside it. No build or runtime packages are required for the page.

For a local HTTP preview, run `npm run dev` and visit `http://127.0.0.1:3000`. Use `npm run dev -- --port 3001` to select another port. The preview server binds to loopback by default.

## Lessons

- Keep the page dependency-free and use relative assets plus a classic script; both HTTP and direct `file:` opening have been smoke-checked in Chromium.
- Source: https://arxiv.org/pdf/1706.03762. The original base model has six encoder/decoder layers and eight attention heads. The 28.4 English–German BLEU result and 3.5-day, eight-P100 training setup describe the big model; do not attribute them to the base model.
- The attention playground uses explicitly labeled, hand-authored teaching weights, not model inference. Every displayed row is normalized. The translation demonstration is also a fixed teaching example.
- Parallel layer computation does not imply parallel autoregressive generation. Preserve this distinction and the caveat that attention alone does not explain model decisions.
- Anchor the architecture connector to actual element bounds with `ResizeObserver`; fixed pixel offsets point to the wrong decoder block when the layout changes.
- A skip link needs a focusable target (`tabindex="-1"` on `main`), not just a fragment identifier.
- Real-browser smoke covered fourteen attention/context states, word-order swapping, six-step generation and reset, quiz feedback, mobile menu/keyboard behavior, and reading navigation. Layout was inspected at 390px mobile and 1440px desktop; overflow checks also covered 320px, 768px, and 1024px widths.
