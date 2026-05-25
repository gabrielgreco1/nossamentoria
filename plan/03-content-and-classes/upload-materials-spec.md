# Upload Materials Spec

Mentors must be able to upload files and attach them to mentorship work.

## Supported MVP Inputs

- `.html`
- `.pdf`
- `.md`
- `.txt`
- common image formats
- external URLs

Slides exported as HTML are a core use case.

## Upload Flow

1. Mentor opens content library.
2. Mentor chooses upload or link.
3. Mentor adds title, description, and tags.
4. System stores the file or URL.
5. Mentor can attach it to a plan, lesson, or session.

## Safety Rules

- Store files in Supabase Storage.
- Keep file ownership attached to the uploading user.
- Do not execute uploaded HTML inside privileged application context.
- Prefer opening uploaded HTML in a separate preview route or download mode.

## Acceptance Criteria

- Upload success and failure states are clear.
- Uploaded materials can be reused.
- Mentees can access only materials shared with their plan or lesson.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder adapts `prompt-design.md` into the official NossaMentoria visual identity: cinematic dark surfaces, liquid-glass components, Instrument Serif headings, Barlow operational text, restrained motion, and dashboard-first usability.
