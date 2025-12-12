\# v0 Prompts Genie - Project Notes



&nbsp; ## Mockup Photo Generator



&nbsp; ### Location

&nbsp; - API: `app/api/generate-mockup-photos/route.ts`

&nbsp; - UI: `app/image-studio/components/Logo/MockupPreview/MockupPhotoGenerator.tsx`



&nbsp; ### Structure

&nbsp; - \*\*Clothing\*\* (5 items × 18 colors × 3 views = 270 photos)

&nbsp;   - tshirt, longsleeve, tanktop, hoodie, ziphoodie

&nbsp;   - Views: front, back, side



&nbsp; - \*\*Hats\*\* (2 items × 18 colors = 36 photos)

&nbsp;   - hat (baseball cap), beanie



&nbsp; - \*\*Other Products\*\* (various colors)

&nbsp;   - Mugs, tumblers, tote bags, pillows, phone cases, etc.



&nbsp; ### 18 Color Palette

&nbsp; black, white, charcoal, gray, heather, navy, royal, sky, red, burgundy, coral, forest, olive, teal, purple, pink, orange, yellow



&nbsp; ### UI Features

&nbsp; - All categories use collapsible dropdowns

&nbsp; - Color swatches show actual colors on buttons

&nbsp; - "Generate All" processes everything with 1-second delays



&nbsp; ### To Add New Products

&nbsp; 1. Add prompts to `PRODUCT\_PROMPTS` in the API route

&nbsp; 2. Add to `CLOTHING\_WITH\_VIEWS`, `HATS\_CATEGORY`, or `OTHER\_PRODUCTS` in the UI

&nbsp; 3. Add hex color to `COLOR\_HEX\_MAP` if using new colors

