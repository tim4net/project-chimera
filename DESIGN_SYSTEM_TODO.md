# Design System Implementation TODO

## ✅ COMPLETED (Foundation)
- [x] Database tables for asset caching
- [x] Backend services (imageGeneration, textGeneration, styleConfig, assetCache)
- [x] API endpoints (/api/assets/*)
- [x] Tailwind config with BG3 theme
- [x] Google Fonts loaded (Cinzel, Inter, JetBrains Mono)
- [x] Initial Card component

## 🚧 IN PROGRESS - Visual UI Updates

### Immediate (Make it look good NOW)
1. **Update DashboardPage.tsx** - Replace gray/amber with BG3 theme
   - Change backgrounds from gray-900 to chimera-bg
   - Replace amber-600 with chimera-gold
   - Update all component styling with new design system
   - Add proper shadows and borders

2. **Update LoginPage.tsx** - Apply BG3 aesthetic
   - Dark fantasy login card
   - Styled GitHub button with proper colors
   - Better form inputs with chimera theme

3. **Update index.css** - Global styles
   - Apply base font families
   - Add scrollbar styling
   - Set global text colors

### Design System Components (Need to create)
4. **Button.tsx** - Primary, secondary, danger variants
5. **Typography.tsx** - Heading, Text, Label components
6. **Panel.tsx** - Collapsible panels for character sheet
7. **StatBar.tsx** - Health/Mana/Stamina bars with gradients
8. **Badge.tsx** - For levels, status effects
9. **Input.tsx** - Styled form inputs
10. **Modal.tsx** - For active phase combat
11. **Tooltip.tsx** - For item/ability descriptions

### AI Asset Integration
12. **Character Portrait Component** - Fetch AI-generated portraits
13. **BiomeTile Component** - Dynamic map tiles with cached images
14. **FlavorText Component** - Lazy-load AI narration
15. **Create asset fetch hook** - `useAssetGeneration()`

### Actual Image Generation (Placeholder currently)
16. **Connect to Local LLM** - Implement actual image generation
17. **Connect to Gemini Imagen** - Implement actual API calls
18. **Test generation pipeline** - End-to-end with real images

### Polish & Animation
19. **Loading states** - Skeleton loaders with glow effect
20. **Page transitions** - Fade/slide animations
21. **Hover effects** - Subtle glows on interactive elements
22. **Responsive breakpoints** - Mobile-first layouts

## Next Immediate Steps (Right Now)
1. Update DashboardPage with chimera theme
2. Update LoginPage with chimera theme
3. Update global CSS
4. Create Button and Typography components
5. Test in browser to see visual changes

## Estimated Time
- Visual updates (steps 1-3): 30 minutes
- Core components (steps 4-11): 2 hours
- AI integration (steps 12-15): 1.5 hours
- Real generation (steps 16-17): 2 hours
- Polish (steps 19-21): 1 hour

**Total: ~7 hours to complete full implementation**
