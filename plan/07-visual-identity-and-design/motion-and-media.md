# Motion And Media

## Motion Source

`prompt-design.md` is the motion and interaction baseline. Use its Framer Motion entrance animations, blur-in text, full-height public sections, layered foreground cards, and custom JavaScript video crossfade pattern where they support the updated learning-oriented identity.

Do not copy the prompt's black palette, space-travel content, serif type treatment, or heavy cinematic darkness.

## Motion Principles

- Motion should feel smooth, optimistic, premium, and calm.
- Use animation to orient the user, not to entertain.
- Avoid constant motion in dense dashboard areas.
- Respect reduced-motion preferences.
- Public marketing sections may be more motion-forward than authenticated workspace screens.

## Entrance Animations

Use Framer Motion-style entrances for:

- Public landing hero copy.
- Auth panels and invitation acceptance.
- Dashboard sections on first load.
- Empty states.
- Modals and command panels.

Default animation:

- Start with slight blur, low opacity, and small vertical offset.
- Animate to clear, visible, and aligned.
- Keep duration short enough for productivity screens.
- Stagger hero elements and public landing cards when it improves reading rhythm.

## Blur Text

Word-by-word or line-by-line entrance patterns can be used only for:

- Landing hero headline.
- Invitation welcome headline.
- Major onboarding moments.

Do not use giant italic animated serif copy. Do not use word-by-word animation for dashboard headings, tables, forms, or repeated UI. Keep Portuguese text legible; if the headline becomes too large or cramped, reduce type scale before changing the content.

## Video Usage

Full-bleed video is allowed for:

- Landing.
- Login.
- Invitation acceptance.
- First-run onboarding.

Avoid dark atmospheric media that makes the product feel heavy. Prefer learning-oriented visuals: study environments, collaborative sessions, diagrams, code, notes, or abstract progress. Avoid full-bleed video behind operational dashboards. If media appears in the app, keep it contained and non-distracting.

If no strong learning-oriented video asset exists yet, use animated abstract background elements rather than forcing generic stock video.

## Video Crossfade

If looping background video is implemented, follow the prompt's rule:

- Do not rely on CSS transitions for video opacity.
- Use requestAnimationFrame-driven opacity fades.
- Fade out shortly before video end.
- Restart video manually after ended.
- Clean up listeners and animation frames.

## Acceptance Criteria

- Motion does not block task completion.
- Reduced-motion users get an acceptable static experience.
- Video never reduces readability of primary actions.
- Public landing motion should feel related to `prompt-design.md` while remaining warm and learning-oriented.
