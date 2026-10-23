# Product Vision

NossaMentoria is a private mentorship platform for technology learning. It helps mentors organize mentees, learning plans, classes, materials, schedules, and progress in one place.

Before users reach the platform workspace, the product must establish trust through a public landing page and authenticated entry flow. The first impression should communicate learning, momentum, clarity, and human mentorship rather than dropping visitors directly into an internal dashboard.

The first audience is Gabriel and his friends, but the platform must not be built as a personal spreadsheet. It must support multiple mentors and multiple mentees from the MVP.

## Problem

Mentorship usually starts informally: messages, calls, links, slides, and tasks scattered across different tools. This makes it hard to know what was taught, what comes next, whether the mentee is progressing, and which materials belong to each plan.

## MVP Goal

Create a free platform where:

- Visitors first see a landing page that explains the mentorship offer, learning outcomes, and available account types.
- Mentors and mentees can create complete accounts with verified email, password, and knowledge areas; academic formation is required only for mentors.
- Invited users can also accept mentor/mentee relationships, while administrative accounts require an administrator invitation.
- Unauthenticated users cannot reach private product surfaces, and users cannot self-assign administrative access.

Inside the authenticated platform, mentors can:

- Invite or pick mentees.
- Create a mentorship plan for each mentee.
- Define duration, goals, main content, and topics.
- Organize lessons and materials.
- Schedule classes.
- Mark classes as completed.
- Record what was applied and what should happen next.

Mentees should be able to see their plan, lessons, materials, calendar, progress, and notes relevant to them.

## Non-Goals

- No payment, subscription, checkout, invoicing, or monetization.
- No public marketplace in MVP.
- No algorithmic matching requirement in MVP.
- No complex LMS features such as graded exams or certificates.

## Product Principles

- Keep mentorship practical and trackable.
- Make the mentor dashboard fast to scan.
- Prefer structured plans over loose notes.
- Preserve history so every class has context.
- Support growth to more mentors without overbuilding social features.
- Express the product through an optimistic learning identity defined in `plan/07-visual-identity-and-design/`: warm, clear, modern, and energizing, with restrained depth and glass only where it improves hierarchy.

## Global Design Direction

All UI-facing implementation from this spec must follow `plan/07-visual-identity-and-design/`. That folder is the official NossaMentoria visual identity: warm light surfaces, learning-oriented accents, Sora headings, Inter operational text, restrained motion, landing-first public entry, and dashboard-first private usability.
