# Schedule Teacher UI Kit

Phase 2 shared UI primitives live here. They are Vue 3/Nuxt components styled only with Tailwind utilities and existing `--st-*` tokens from `client/app/assets/css/main.css`.

## Source Rules

- `Ui*` names are design-system primitives: layout, controls, data display, feedback, overlay foundations.
- `App*` names stay app infrastructure: `AppIcon`, `AppToast`, `AppSkeleton`, loaders, and shell singletons.
- `--st-*` tokens in `client/app/assets/css/main.css` are the token source for color, radius, font, content width, focus, spacing, and text sizing.
- Use Tailwind arbitrary token values such as `max-w-[var(--st-content-max)]`, `rounded-[var(--st-radius)]`, and `text-[var(--st-text)]`.
- No SCSS, scoped CSS, CSS modules, component CSS, page CSS, global helper classes, Vuetify wrappers, shadcn, Radix, Headless UI, DaisyUI, Flowbite, or other UI registries.
- Components are slot-first. Props cover only repeated visual state: `variant`, `tone`, `size`, `loading`, `disabled`, `error`, `hint`, `required`.
- Components do not call APIs, stores, auth helpers, route-owned feature composables, or data-fetching utilities.
- Pages and feature composables keep validation, mutation, tenant-scoped data, filtering, sorting, and formatting ownership.
- Preserve visual parity during migration: same workflow, readable text, stable dimensions, no overlap, no clipping, no card-in-card layouts.

## Typography And Spacing

- Use 14px label text, 16px body text, 20px section/dialog headings, and 24px page titles.
- Use font weights 400 and 600 in new primitives.
- Letter spacing is 0 and font size must not scale with viewport width.
- Interactive controls are 44px minimum by default. Compact controls can be 36px only in dense filters and pagination.
- Cards use `rounded-[var(--st-radius)]` and never wrap another card surface.

## Component Inventory

| Group | Components |
| --- | --- |
| Layout | `UiPage`, `UiPageHeader`, `UiToolbar`, `UiSection`, `UiCard` |
| Controls | `UiButton`, `UiIconButton`, `UiSpinner`, `UiInput`, `UiTextarea`, `UiSelect`, `UiCheckbox`, `UiSegmentedControl`, `UiActionGroup` |
| Data display | `UiTable`, `UiList`, `UiListItem`, `UiBadge`, `UiAvatar`, `UiMetricCard`, `UiStatusDot`, `UiPagination` |
| Feedback | `UiAlert`, `UiToast`, `UiSkeleton`, `UiEmptyState`, `UiProgress` |
| Overlay | `UiDialog`, `UiConfirmDialog`, `UiTabs` |
| Proof wrappers | `TablePager`, `AppSkeleton`, `AppToast`, `ClassLocation` |

## Variants

| Component | Variants |
| --- | --- |
| `UiButton` | `primary`, `secondary`, `ghost`, `danger`; sizes `sm`, `md`, `lg`, `icon` |
| `UiIconButton` | sizes `md`, `compact`; requires an accessible label |
| `UiCard` | `default`, `soft`, `outlined`; padding `none`, `sm`, `md`, `lg` |
| `UiBadge` | tones `neutral`, `primary`, `info`, `success`, `warning`, `danger`; sizes `sm`, `md` |
| `UiAlert` | tones `info`, `success`, `warning`, `error` |
| `UiInput`, `UiTextarea`, `UiSelect` | external `error`, `hint`, `disabled`, `required`, `loading` state |
| `UiDialog` | sizes `sm`, `md`, `lg`, `xl`; caller-owned body/footer content |
| `UiSkeleton` | `dashboard`, `stats`, `grid`, `table`, `list`, `calendar`, `form`, `detail` |

## D-21 Migration Map

| Old pattern | New primitive |
| --- | --- |
| `v-btn`, icon button | `UiButton`, `UiIconButton`, `AppIcon` |
| `v-text-field`, `v-textarea` | `UiInput`, `UiTextarea` |
| `v-select`, `v-autocomplete` | `UiSelect`; autocomplete remains page-owned unless Phase 4 scopes it |
| `v-btn-toggle` | `UiSegmentedControl` |
| `v-card`, `v-sheet` | `UiCard`, `UiSection` |
| `v-table` | `UiTable` |
| `v-list`, `v-list-item` | `UiList`, `UiListItem` |
| `v-chip` | `UiBadge` |
| `v-avatar`, avatar `v-img` usage | `UiAvatar` |
| `v-alert` | `UiAlert` |
| `v-snackbar`, toast surface | `AppToast` using `UiToast` |
| `v-dialog` | `UiDialog`, `UiConfirmDialog` |
| `v-tabs`, `v-window` | `UiTabs`, with panel ownership in caller |
| `v-progress-linear` | `UiProgress` |
| `AppSkeleton` styled with CSS | `AppSkeleton` wrapper over `UiSkeleton` |
| `TablePager` | `TablePager` wrapper over `UiPagination` |
| `ClassLocation` chip/icon | `UiBadge` plus `AppIcon` |

## Adoption Notes

- Phase 3 should use these primitives for shell/shared surfaces while preserving calendar-first teacher navigation.
- Phase 4 should consume these primitives for `/assistants`, `/assistants/[id]`, `/audit-logs`, and `/profile`.
- `SessionDialog`, `StudentDetailDialog`, and `AssistantDetailDialog` are consumers of the dialog/form/table primitives, not Phase 2 rewrites.
- UIKIT-00 through UIKIT-05 require static scans: no component CSS, no Vuetify tags, no direct feature composable ownership inside `client/app/components/ui`.
