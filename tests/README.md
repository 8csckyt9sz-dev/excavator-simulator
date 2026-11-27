# Visual verification

The public simulator is unchanged until the review branch passes visual inspection.

Open the game with `?verify=1` to enable the deterministic rendering API in a browser.
Use `earthVerify.show({machine:3,attachment:0,cab:true})` and
`earthVerify.step({a:-.44,k:-.75,b:-.094},110)`.
`earthVerify.inspect()` reports geometry, joint alignment, WebGL errors and payload.
`earthVerify.screenshot()` returns a PNG of the actual rendered canvas.

The Playwright test checks all seven machines and eight attachments, takes outside/cab/dig/portrait screenshots, and exports a JSON report and contact sheet to GitHub Actions artifacts.
The log contains a base64 JPEG preview for the assistant to inspect.

To run locally:
```sh
npm install --no-save playwright three@0.160.1 sharp
npx playwright install chromium
node tests/visual-verify.mjs
```
A passing technical test is not proof of photorealism. Inspect the images before merging to main.
