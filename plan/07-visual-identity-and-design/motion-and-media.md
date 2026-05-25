# Motion And Media

## Motion Source

`prompt-design.md` specifies Framer Motion entrance animations, blur-in text, and custom JavaScript video crossfades. Use these as the reference for the platform's motion language.

## Motion Principles

- Motion should feel smooth, premium, and calm.
- Use animation to orient the user, not to entertain.
- Avoid constant motion in dense dashboard areas.
- Respect reduced-motion preferences.

## Entrance Animations

Use Framer Motion-style entrances for:

- Public/onboarding hero copy.
- Auth panels.
- Dashboard sections on first load.
- Empty states.
- Modals and command panels.

Default animation:

- Start with slight blur, low opacity, and small vertical offset.
- Animate to clear, visible, and aligned.
- Keep duration short enough for productivity screens.

## Blur Text

The word-by-word blur-in pattern from the prompt can be used only for:

- Landing hero headline.
- Invitation welcome headline.
- Major onboarding moments.

Do not use word-by-word animation for dashboard headings, tables, forms, or repeated UI.

## Video Usage

Full-bleed video is allowed for:

- Landing.
- Login.
- Invitation acceptance.
- First-run onboarding.

Avoid full-bleed video behind operational dashboards. If media appears in the app, keep it contained and non-distracting.

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
