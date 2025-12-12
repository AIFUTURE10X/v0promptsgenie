# v0 Prompts Genie - Project Notes

## 🚀 Deployment Workflow

### Branches
- **`master`** - Production branch (Vercel deploys from here)
- **`Main-GeniePrompts`** - Backup/sync branch

### To Deploy to Production
```bash
git add .
git commit -m "your commit message"
git push origin master:master
```

### Required Vercel Environment Variables
These MUST be set in Vercel → Settings → Environment Variables (for ALL environments: Production, Preview, Development):

| Variable | Description |
|----------|-------------|
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string |
| `REPLICATE_API_TOKEN` | Replicate API key |
| `GOOGLE_AI_API_KEY` | Google Gemini API key |

### Deployment Checklist
1. ✅ Test locally with `npm run build`
2. ✅ Commit changes to `master`
3. ✅ Push to `origin master:master`
4. ✅ Check Vercel dashboard for successful build
5. ✅ Hard refresh (Ctrl+Shift+R) to see changes

---

## Mockup Photo Generator



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

