# Phase 03 Migration Inventory

**Updated:** 2026-07-01T08:48:39+07:00  
**Scope:** Phase 3 app shell, auth, teacher calendar, SessionDialog, teacher dashboard, student dashboard/schedule, shared detail dialogs, and low-risk cleanup boundaries.

## Target-Scope Scan Results

Command:

```powershell
$lt=[char]60; rg -n "(($lt)/?v-[a-z]|($lt)style|lang=`"scss`"|\.scss|:deep\(\.v-)" client/app/layouts/default.vue client/app/layouts/auth.vue client/app/components/AuthShell.vue client/app/components/login/LoginFormPane.vue client/app/components/login/LoginVisual.vue client/app/components/register/RegisterFormPane.vue client/app/components/register/RegisterVisual.vue client/app/pages/forgot-password.vue client/app/pages/reset-password.vue client/app/pages/verify-email.vue client/app/components/calendar/TeacherCalendar.vue client/app/components/calendar/TeacherCalendarBoard.vue client/app/components/calendar/TeacherCalendarHeader.vue client/app/components/calendar/TeacherSessionDetail.vue client/app/components/calendar/StudentCalendar.vue client/app/components/dashboard/TeacherWorkspaceDashboard.vue client/app/components/dashboard/StudentWorkspaceDashboard.vue client/app/components/StudentSchedule.vue client/app/components/SessionDialog.vue client/app/components/StudentDetailDialog.vue client/app/components/AssistantDetailDialog.vue
```

Result: **PASS - no matches** on 2026-07-01T08:48:39+07:00.

Exact remaining markers in Phase 3 target scope: **none**. The target scope is scan-clean for `<v-*`, `</v-*`, `<style>`, `lang="scss"`, `.scss`, and `:deep(.v-)`.

## Scope Status By Area

| Area | Status | Evidence | Boundary |
| --- | --- | --- | --- |
| Shell/Auth | Complete | 03-01 migrated auth shell/forms/pages; target scan clean. | APP-01, APP-05. |
| Teacher Calendar | Complete | 03-02 migrated header, board, detail, teacher/student calendar feedback; target scan clean. | D-07, D-09, APP-04. |
| SessionDialog | Complete | 03-03 migrated full calendar-critical dialog; target scan clean. | D-04, D-05, APP-02. |
| Teacher Dashboard | Complete | 03-04 migrated `TeacherWorkspaceDashboard.vue`; target scan clean. | D-08, APP-04, APP-05. |
| Student Dashboard/Schedule | Complete | 03-05 migrated `StudentWorkspaceDashboard.vue` and `StudentSchedule.vue`; target scan clean. | D-01, D-08, APP-02. |
| Shared Detail Dialogs | Complete | 03-06 migrated `AssistantDetailDialog.vue` and `StudentDetailDialog.vue`; target scan clean. | D-06, APP-02. |
| Low-Risk Cleanup | Complete | No extra Phase 3 cleanup required after target scan. | D-02. |
| Out-of-Scope | Deferred | Broader client app scan still finds markers outside Phase 3 target scope. | D-01, D-03. |

## D-01 / D-03 / D-06 Traceability

- **D-01:** Phase 3 stayed limited to teacher, student, auth, and shared-surface blockers. Admin-heavy and center-adjacent page work is explicitly deferred.
- **D-03:** Main Phase 3 target scope is scan-clean. Remaining old markers are listed below with exact file and line references.
- **D-06:** Bounded dialog remainder is **none** for Phase 3 targets. `StudentDetailDialog.vue` and `AssistantDetailDialog.vue` were fully migrated in 03-06.

## Phase 4 page scope

These are priority old page redesigns and remain explicitly out of Phase 3 implementation scope: `/assistants`, `/assistants/[id]`, `/audit-logs`, `/profile`.

| Route | Classification | Exact remaining marker refs |
| --- | --- | --- |
| `/assistants` | Phase 4 page scope | `client/app/pages/assistants/index.vue:51,53,56,66,69,71,73,74,76,78,79,82,85,88,89,91,94,95,97,101,107,108,109,110,111,113,114,115,116,117,118,119,120,121,122,129,130,131,132` |
| `/assistants/[id]` | Phase 4 page scope | `client/app/pages/assistants/[id].vue:138,140,143,144,146,150,152,158,160,161,164,166,168,169,170,171,172,173,174,175,178,179,181,182,185,186,189,190,193,194,197,198,201,202,203,204,205,208,220,221,223,224,225,227,229,231,233,235,236,238,241,243,244,245,255,256,257,258,259,260,261,262,264,266,270,275,282,285,286,287,288,289,290,291,292,293,294,307,313,320,321,323,324,352,353,355,356,376,377,378,379,380,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397` |
| `/audit-logs` | Phase 4 page scope | `client/app/pages/audit-logs.vue:59,61,63,65,67,70,71,88,90,100,101` |
| `/profile` | Phase 4 page scope | `client/app/pages/profile.vue:67,68,70,71,73,75,76,77,78,79,82,84` |

## Admin/Center Out Of Scope

Admin and center-related cleanup is out of Phase 3 per D-01. Center role workflows remain deferred. No center implementation files were migrated in Phase 3.

| Surface | Classification | Exact remaining marker refs |
| --- | --- | --- |
| Admin dashboard | admin/center out of scope | `client/app/components/dashboard/AdminWorkspaceDashboard.vue:108,109,110,112,113,114,120,121,122,125,126,127,130,131,132,133,136,137,138,139,142,143,144,146,147,148,150,151,152,158,159,160,161,163,164,165,171,172,173,175,186,188,191,202,204,205,206,209,211,212,214,219,220,224,225,227,228,230,248,249,250,251,255,256,257,258,260,262,263,267,268,269,271,273,278` |
| Admin health | admin/center out of scope | `client/app/pages/admin/health.vue:36,38,41,43,46,47,48,50,51,58,63,65,67,68,72,74,84,86,94,95,98,99,106,113,119,120,121,124,125,127,136,137,138,139,146,149,156,175,179` |
| Admin settings | admin/center out of scope | `client/app/pages/admin/settings.vue:122,124,125,127,129,131,132,134,135,136,142,150,153,154,155,156,157,165,172,175,177,178,179,185,188,190,198,208,216,219,224,231,238,241,246,247,254,258,260,261,263,265,273,281,283,284,287,288,293,294,295,301,302,303,305,309,310,311,314,316` |
| Admin users detail | admin/center out of scope | `client/app/pages/admin/users/[id].vue:38,40,44,45,47,52,53,56,58,59,61,67,69,71,80,82,86,87,91,92,94,96,98,101,104,106,108,113,114,115,118,119,121,122,125,126,129,130,133,134,137,138,141,142,143,144,146,149,151,152,170,171,173,174,175,178,179,180,181,182,183,184,185,186,187,188,190,191,192,193` |
| Admin users index | admin/center out of scope | `client/app/pages/admin/users/index.vue:124,129,138,139,142,143,157,158,160,169,172,175,176,177,181,182,186,187,188,192,194,199,200,201,202,203,204,209,210,211,212,213,214,215,216,217,221,222,223,224,227,228,229,230,231,232,233,234,239,240,241,242,243,244,245,246,249,250,251,252,254,255,256,257,258,259,260,261,262,263` |

## Bounded Dialog Remainder

`bounded dialog remainder`: **none**.

- `client/app/components/AssistantDetailDialog.vue`: no old markers.
- `client/app/components/StudentDetailDialog.vue`: no old markers.

## Broader Client App Scan

Command:

```powershell
$lt=[char]60; rg -n "(($lt)/?v-[a-z]|($lt)style|lang=`"scss`"|\.scss|:deep\(\.v-)" client/app
```

Result: **old markers remain outside Phase 3 target scope** on 2026-07-01T08:48:39+07:00. These are deferred to Phase 4, Phase 5 cleanup, or later admin/center/general page work.

| File | Classification | Exact remaining marker refs |
| --- | --- | --- |
| `client/app/components/AppInitialLoader.vue` | Phase 5 cleanup | lines 48 |
| `client/app/components/TeacherDashboard.vue` | legacy alternate teacher dashboard, Phase 5 cleanup | lines 154,159,160,161,175,176,177,178,182,183,184,193,196,197,198,199,200,201,205,206,207,209,211,212,220,221,227,230,232,233,236,238,241,244,246,247,252,253,256,257,260,264,265,284,286,288,292,293,294,300,301,302,306 |
| `client/app/components/dashboard/AdminWorkspaceDashboard.vue` | admin/center out of scope | lines 108,109,110,112,113,114,120,121,122,125,126,127,130,131,132,133,136,137,138,139,142,143,144,146,147,148,150,151,152,158,159,160,161,163,164,165,171,172,173,175,186,188,191,202,204,205,206,209,211,212,214,219,220,224,225,227,228,230,248,249,250,251,255,256,257,258,260,262,263,267,268,269,271,273,278 |
| `client/app/components/landing/LandingFeatures.vue` | low-risk marketing cleanup, Phase 5 | lines 17 |
| `client/app/components/landing/LandingFooter.vue` | low-risk marketing cleanup, Phase 5 | lines 10,15,16 |
| `client/app/components/landing/LandingHeader.vue` | low-risk marketing cleanup, Phase 5 | lines 9 |
| `client/app/components/landing/LandingHero.vue` | low-risk marketing cleanup, Phase 5 | lines 28,31,38,49 |
| `client/app/components/landing/LandingShowcase.vue` | low-risk marketing cleanup, Phase 5 | lines 19,25 |
| `client/app/components/landing/LandingTopbar.vue` | low-risk marketing cleanup, Phase 5 | lines 8,10 |
| `client/app/pages/admin/health.vue` | admin/center out of scope | lines 36,38,41,43,46,47,48,50,51,58,63,65,67,68,72,74,84,86,94,95,98,99,106,113,119,120,121,124,125,127,136,137,138,139,146,149,156,175,179 |
| `client/app/pages/admin/settings.vue` | admin/center out of scope | lines 122,124,125,127,129,131,132,134,135,136,142,150,153,154,155,156,157,165,172,175,177,178,179,185,188,190,198,208,216,219,224,231,238,241,246,247,254,258,260,261,263,265,273,281,283,284,287,288,293,294,295,301,302,303,305,309,310,311,314,316 |
| `client/app/pages/admin/users/[id].vue` | admin/center out of scope | lines 38,40,44,45,47,52,53,56,58,59,61,67,69,71,80,82,86,87,91,92,94,96,98,101,104,106,108,113,114,115,118,119,121,122,125,126,129,130,133,134,137,138,141,142,143,144,146,149,151,152,170,171,173,174,175,178,179,180,181,182,183,184,185,186,187,188,190,191,192,193 |
| `client/app/pages/admin/users/index.vue` | admin/center out of scope | lines 124,129,138,139,142,143,157,158,160,169,172,175,176,177,181,182,186,187,188,192,194,199,200,201,202,203,204,209,210,211,212,213,214,215,216,217,221,222,223,224,227,228,229,230,231,232,233,234,239,240,241,242,243,244,245,246,249,250,251,252,254,255,256,257,258,259,260,261,262,263 |
| `client/app/pages/assistants/[id].vue` | Phase 4 page scope | lines 138,140,143,144,146,150,152,158,160,161,164,166,168,169,170,171,172,173,174,175,178,179,181,182,185,186,189,190,193,194,197,198,201,202,203,204,205,208,220,221,223,224,225,227,229,231,233,235,236,238,241,243,244,245,255,256,257,258,259,260,261,262,264,266,270,275,282,285,286,287,288,289,290,291,292,293,294,307,313,320,321,323,324,352,353,355,356,376,377,378,379,380,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397 |
| `client/app/pages/assistants/index.vue` | Phase 4 page scope | lines 51,53,56,66,69,71,73,74,76,78,79,82,85,88,89,91,94,95,97,101,107,108,109,110,111,113,114,115,116,117,118,119,120,121,122,129,130,131,132 |
| `client/app/pages/audit-logs.vue` | Phase 4 page scope | lines 59,61,63,65,67,70,71,88,90,100,101 |
| `client/app/pages/classes.vue` | general page scope, Phase 5 or later | lines 110,119,120,122,126,128,148,150,158,159,160,166,167,172,176,206,213,216,217,219,222,223,224,225,226,228,229,230,231,232,233,234,235,236,237,238,239,240,244 |
| `client/app/pages/classes/[id].vue` | general page scope, Phase 5 or later | lines 322,324,327,328,329,334,335,337,340,342,343,365,372,378,380,383,385,387,388,390,391,393,395,399,400,404,406,409,413,422,423,432,433,440,449,458,459,467,468,470,473,476,477,484,485,486,488,489,491,499,500,504,514,516,521,522,525,526,529,538,540,558,560,561,563,566,576,577,586,595,596,597,598,601,602,603,604,605,607,608,609,610,616,625,626,627,628,629,637,643,652,654,655,657,658,660,661,662,663,664,665,666,667,669,670,671,672,675,676,677,678,679,681,682,689,696,697,698,699,700,707,708,709,710,713,714,715,716,717,719,720,721,722,723,724,725,726,733,734,735,736,739,740,741,742,743,745,749,750,751,752,753,754,755,762,763,764,765,768,769,770,771,772,774,776,777,778,779,780,781,782,783,784,791,792,793,794 |
| `client/app/pages/classes/index.vue` | general page scope, Phase 5 or later | lines 146,155,159,160,161,167,169,170,172,180,181,182,183,189,190,198,199,201,204,205,207,210,211,226,235,239,246,248,257,260,261,262,264,266,271,272,273,274,275,277,278,279,280,288,299,300,301,302,303,311,317,326,328,329,331,332,334,341,343,344,345,346,347,348,355,356,357,358,362 |
| `client/app/pages/documents.vue` | general page scope, Phase 5 or later | lines 169,170,172,190,201,203,209,221,224,226,234,235,241,247,253,260,261,278,282,290,298,299,300,301,302,304,305,306,307,308,309,310,311,317,318,319,320,321,322,329,330,331,332,335,336,337,338,339,341,342,343,344,345,346,354,362,363,364,365,366,373,374,375,376,380 |
| `client/app/pages/index.vue` | public landing/app entry cleanup, Phase 5 | lines 16,27 |
| `client/app/pages/maintenance.vue` | low-risk utility page cleanup, Phase 5 | lines 6,7,8,9,14 |
| `client/app/pages/payments.vue` | general page scope, Phase 5 or later | lines 171,172,174,175,176,178,186,193,200,211,221,257,267,281,291,292,293,294,295,297,298,299,300,301,302,303,304,305,306,307,314,315,316,317,320,321,322,327,328,345,347,349,350,357,358,360,386,387,388,398,399,400,401,402,404,408 |
| `client/app/pages/profile.vue` | Phase 4 page scope | lines 67,68,70,71,73,75,76,77,78,79,82,84 |
| `client/app/pages/reports.vue` | general page scope, Phase 5 or later | lines 78,80,85,96,106,114,116,121,132,145,153,155,160,168,176,178,184,304,311,316,324,343,350 |
| `client/app/pages/student/assignments.vue` | student page scope outside Phase 3 shared surfaces | lines 95,122,135,139,143,147,172 |
| `client/app/pages/student/classes.vue` | student page scope outside Phase 3 shared surfaces | lines 66,80,87,94,101,103,120,130,134,144,156,161,168,175 |
| `client/app/pages/student/documents.vue` | student page scope outside Phase 3 shared surfaces | lines 79,90,92,105,108,110,118,119,126,133,134,151,155,163,171 |
| `client/app/pages/student/grades.vue` | student page scope outside Phase 3 shared surfaces | lines 121,123,133,141,173,180,188 |
| `client/app/pages/student/tests.vue` | student page scope outside Phase 3 shared surfaces | lines 108,122,129,136,143,164,166,182,186,195,206,213 |
| `client/app/pages/students.vue` | general teacher page scope, Phase 5 or later | lines 65,66,68,69,70,72,79,107,108,110,120,122,130,143,156,175,176,177,178,179,181,182,183,184,185,186,187,188,189,190,197,198,199,200,204,413,436 |
| `client/app/pages/students/[id].vue` | general teacher page scope, Phase 5 or later | lines 249,251,254,255,257,261,262,271,272,282,283,289,296,297,298,306,307,310,311,314,315,318,319,320,322,323,324,325,326,327,328,329,331,332,334,335,336,337,338,339,340,341,342,344,346,348,351,352,353,354,357,358,359,360,363,364,365,366,369,370,371,372,375,376,377,378,381,382,383,386,396,404,405,406,407,408,410,412,433,440,441,444,446,454,461,463,464,470,471,473,476,477,478,479,482,483,484,485,488,489,490,491,494,495,496,500,502,506,510,519,530,536,549,558,559,569,570,572,573,574,576,577,586,588,591,594,595,596,608,609,611,612,613,614,617,618,619,620,621,623,624,632,633,634,635,636,637,638,639,646,647,648,649,652,653,654,655,656,658,662,663,664,665,666,667,668,675,676,677,678,681,682,683,684,685,687,691,692,693,694,695,696,697,698,699,706,707,708,709,713,716 |
| `client/app/pages/students/index.vue` | general teacher page scope, Phase 5 or later | lines 80,82,84,86,88,95,96,97,99,103,105,116,130,131,133,142,145,150,159,164,166,169,171,173,174,175,176,177,184,185,191,192,196,205,208,209,210,211,212,214,215,216,217,218,219,220,221,222,223,230,231,232,233 |
| `client/app/styles/calendar/board.css` | stale style file cleanup, Phase 5 | lines 62,73,183,246 |
| `client/app/styles/calendar/board.scss` | stale style file cleanup, Phase 5 | lines 60,71,184,246 |
| `client/app/styles/dashboard/admin.css` | admin/center out of scope | lines 1 |
| `client/app/styles/dashboard/admin.scss` | admin/center out of scope | lines 2 |
| `client/app/styles/dashboard/teacher.css` | stale style file cleanup, Phase 5 | lines 370,374,380 |
| `client/app/styles/dashboard/teacher.scss` | stale style file cleanup, Phase 5 | lines 368,372,378 |
| `client/app/styles/register/form-pane.css` | stale style file cleanup, Phase 5 | lines 70,78,82,87,91,95,101,110,115,122,126,132,189,199,249 |
| `client/app/styles/register/page.css` | stale style file cleanup, Phase 5 | lines 11 |
| `client/app/styles/register/visual.css` | stale style file cleanup, Phase 5 | lines 17 |

## Backend Status

Backend untouched. No backend files were edited for Phase 3 Plan 07, so backend lint/build/test were not required.
