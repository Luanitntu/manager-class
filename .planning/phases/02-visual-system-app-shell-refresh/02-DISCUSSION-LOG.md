# Phase 2: Visual System & App Shell Refresh - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-21
**Phase:** 2-Visual System & App Shell Refresh
**Areas discussed:** Shell & Navigation, Visual Language, State System, Responsive Layout

---

## Shell & Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Teacher lands on calendar | Keeps teacher workflow calendar-first. | yes |
| Teacher lands on dashboard | Better overview first, calendar one click away. | |
| Remember last page | Convenient, but adds state complexity. | |

**User's choice:** Teacher should land on calendar after login.
**Notes:** This preserves the product's calendar-first teacher workflow.

| Option | Description | Selected |
|--------|-------------|----------|
| Student dashboard first | Summarizes schedule, documents, scores, and payments. | yes |
| Student calendar first | Goes straight to schedule. | |
| Student classes first | Organizes around enrolled classes. | |

**User's choice:** Student navigation should prioritize the student dashboard.
**Notes:** Student dashboard should become the primary student summary surface.

| Option | Description | Selected |
|--------|-------------|----------|
| Hide unusable role items | Students do not see teacher/admin-only sections. | yes |
| Show disabled items | Makes features visible but adds noise. | |
| Shared minimal menu | Simpler, but weakens teacher shortcuts. | |

**User's choice:** Hide menu items the current role cannot use.
**Notes:** This avoids confusing student users with teacher/admin concepts.

| Option | Description | Selected |
|--------|-------------|----------|
| User + role + profile/logout | Clear role context and standard account actions. | yes |
| Role-specific quick action | Convenient if it reuses existing flows. | yes |
| Avatar-only topbar | Clean but lacks role context. | |

**User's choice:** Use both identity/role controls and role-specific quick action.
**Notes:** Quick action must not add new scope. It should reuse existing session/schedule flows.

| Option | Description | Selected |
|--------|-------------|----------|
| Temporary drawer on mobile | Simple and familiar. | |
| Bottom navigation on mobile | Better mobile ergonomics for main role routes. | yes |
| Icon-only sidebar on mobile | Better for desktop than phone. | |

**User's choice:** Mobile should use bottom navigation for primary items.
**Notes:** Cap to roughly four or five role-specific items.

| Option | Description | Selected |
|--------|-------------|----------|
| Group desktop menu by work area | Easier to scan for daily teacher work. | yes |
| Keep flat list | Simple but long and role-mixed. | |
| Primary + More | Cleaner but may hide functions. | |

**User's choice:** Group desktop menu by work area.
**Notes:** Suggested groups include daily work, teaching, and admin.

| Option | Description | Selected |
|--------|-------------|----------|
| Clear but light active state | Subtle background, primary text/icon, left indicator. | yes |
| Strong filled active state | Very visible but visually heavy. | |
| Minimal color-only active state | Clean but weak. | |

**User's choice:** Use a clear but light active state.
**Notes:** Avoid heavy filled pills.

---

## Visual Language

| Option | Description | Selected |
|--------|-------------|----------|
| Clean, bright, friendly | Professional education SaaS. | |
| Very minimal | Elegant but less warm. | |
| Colorful and energetic | More lively, must stay organized. | yes |

**User's choice:** Colorful and energetic.
**Notes:** Must remain usable for dashboard, calendar, forms, and tables.

| Option | Description | Selected |
|--------|-------------|----------|
| Blue + teal/green + orange | Fresh, education-friendly, distinct from PREP. | yes |
| Purple/blue + pink | Modern but risks one-note palette. | |
| Orange/yellow + green | Warm but may feel too childlike. | |

**User's choice:** Blue plus teal/green plus orange accents.
**Notes:** Original palette required; PREP is inspiration only.

| Option | Description | Selected |
|--------|-------------|----------|
| Moderate density, easy scan | Daily-use balance. | yes |
| Spacious | Pretty but inefficient. | |
| Dense | Power-user efficient but less friendly. | |

**User's choice:** Moderate density, easy to scan, but must still look beautiful.
**Notes:** Avoid a dry enterprise look.

| Option | Description | Selected |
|--------|-------------|----------|
| Light radius + thin border + subtle shadow | Clean and modern. | yes |
| Large radius + soft shadow | Friendly but may feel like mobile/landing UI. | |
| Squarer + minimal shadow | Professional but colder. | |

**User's choice:** Light radius, thin borders, very subtle shadows.
**Notes:** Avoid card-heavy decoration.

---

## State System

| Option | Description | Selected |
|--------|-------------|----------|
| Useful empty state + clear action | Practical and concise. | |
| Minimal empty notice | Simple but less helpful. | |
| Friendly illustrated empty state | More delightful, needs lightweight assets. | yes |

**User's choice:** Friendly illustrated empty states.
**Notes:** Keep assets lightweight and original.

| Option | Description | Selected |
|--------|-------------|----------|
| Layout skeletons | Stable and polished. | |
| Center spinner | Easy but dated. | |
| Top progress + light skeleton | Dynamic and stable. | yes |

**User's choice:** Top progress plus lightweight skeletons.
**Notes:** Should reduce layout jump during data loads.

| Option | Description | Selected |
|--------|-------------|----------|
| Clear cause + next step | Friendly and actionable. | yes |
| Technical error details | Better for debug, worse for users. | |
| Very soft generic copy | Comfortable but less actionable. | |

**User's choice:** Error/forbidden states should explain cause and next step.
**Notes:** Use plain language for teachers and students.

| Option | Description | Selected |
|--------|-------------|----------|
| Separate loading/empty/error/forbidden | Prevents UI from hiding API/role bugs. | yes |
| Empty + error only | Simpler but masks role/API differences. | |
| Per-page decisions | Flexible but inconsistent. | |

**User's choice:** Always distinguish loading, empty, error, and forbidden states.
**Notes:** This directly supports Phase 1 data-display findings.

---

## Responsive Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Max width around 1400px | Keeps dashboard and tables readable. | yes |
| Full width | Better for large tables/calendar, can feel loose. | |
| Page-specific width | Best UX but needs more page rules. | |

**User's choice:** Keep desktop content max width around `1400px`.
**Notes:** Calendar can still receive special treatment later if needed.

| Option | Description | Selected |
|--------|-------------|----------|
| Usable and polished basics | No broken layout, usable nav, readable controls. | yes |
| Strong mobile-first redesign | Larger scope. | |
| Only prevent breakage | Fast but under-polished. | |

**User's choice:** Mobile should be usable and polished at a basic level.
**Notes:** Phase 2 should not become a full mobile redesign.

| Option | Description | Selected |
|--------|-------------|----------|
| Tables become card/list on mobile | Better phone readability. | yes |
| Horizontal scroll | Less work, weaker UX. | |
| Hide lower-priority columns | Good but needs page-by-page rules. | |

**User's choice:** Mobile tables should become cards/lists.
**Notes:** Prefer readable role-appropriate summaries.

| Option | Description | Selected |
|--------|-------------|----------|
| Mobile calendar agenda/list view | Easy to read classes on phone. | yes |
| Shrunk month/week grid | Desktop-like but cramped. | |
| Mobile view-only, edit on desktop | Lower scope, less useful for teachers. | |

**User's choice:** Mobile calendar should prioritize agenda/list view.
**Notes:** Desktop can preserve full calendar-first workflow.

---

## the agent's Discretion

- Exact token names, Vuetify defaults, CSS variables, and component boundaries.
- Exact role-specific quick action labels and whether a quick action is safe for the student shell.
- Exact lightweight illustration approach for empty states.

## Deferred Ideas

- Full teacher workflow/data fixes remain Phase 3.
- Full student portal/data fixes remain Phase 4.
- Center role navigation remains v2 scope.
