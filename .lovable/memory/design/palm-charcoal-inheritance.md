---
name: Palm Charcoal design inheritance
description: Mandatory design-system contract for every new page/component/feature. References .lovable/design-system.md
type: constraint
---
Before generating any new page, component, edge function, image, or animation for the Palm Charcoal project, read `.lovable/design-system.md` and obey its Acceptance Checklist. Do not invent new colors, fonts, primitives, glass recipes, or motion timings. Reuse `src/components/ui-lux/*` and existing shared components first; extend tokens in `src/index.css` + `tailwind.config.ts` only when no existing primitive fits. New work must be visually indistinguishable from the existing site across emerald/noir/sand themes and AR/EN directions.
