---
phase: 05-verification-cleanup
artifact: static-scans
plan: 01
status: complete
created: 2026-07-01
requirements: [VER-05]
---

# Phase 05 Static Scans

Phase 5 Plan 01 ran the static scans from `05-UI-SPEC.md` from the repo root. No app source files were edited.

## Scan Results

| Scan | Command | Exit code | Result | Stdout/stderr summary |
| --- | --- | ---: | --- | --- |
| Target smoke scan | `$lt=[char]60; rg -n "(($lt)/?v-[a-z]\|($lt)style\|lang=\`"scss\`"\|\.scss\|:deep\(\.v-)" client/app/layouts/default.vue client/app/pages/calendar.vue client/app/components/calendar client/app/pages/assistants/index.vue client/app/pages/assistants/[id].vue client/app/pages/audit-logs.vue client/app/pages/profile.vue client/app/components/ui` | 1 | PASS | No matches. `rg` exit code 1 means no matches. |
| UI-kit boundary scan | `rg -n "(useApi\|useAuthStore\|useSessions\|useStudents\|useAssistants\|useAuditLogs\|useClasses\|fetch\(|\`$fetch)" client/app/components/ui` | 1 | PASS | No matches. `rg` exit code 1 means no matches. |
| Package/config scan | `rg -n "(vuetify\|sass\|scss)" client/package.json client/nuxt.config.ts` | 1 | PASS | No matches. `rg` exit code 1 means no matches. |
| Broad client/app scan | `$lt=[char]60; rg -n "(($lt)/?v-[a-z]\|($lt)style\|lang=\`"scss\`"\|\.scss\|:deep\(\.v-)" client/app` | 0 | PASS WITH CLASSIFIED DEBT | Matches remain outside the target smoke scan scope and are classified below. |

## Broad Scan Classification

| File | Match lines | Classification | Reason |
| --- | --- | --- | --- |
| `client/app/components/AppInitialLoader.vue` | 48 | retained with reason | Active app bootstrap loader, referenced by `client/app/app.vue:36`; no code cleanup in Plan 01. |
| `client/app/components/TeacherDashboard.vue` | 154,159,160,161,175,176,177,178,182,183,184,193,196,197,198,199,200,201,205,206,207,209,211,212,220,221,227,230,232,233,236,238,241,244,246,247,252,253,256,257,260,264,265,284,286,288,292,293,294,300,301,302,306 | safe-to-remove candidate | Legacy alternate dashboard; `dashboard.vue` uses `TeacherWorkspaceDashboard`; reference proof in `05-CLEANUP.md`. Not removed in Plan 01. |
| `client/app/components/dashboard/AdminWorkspaceDashboard.vue` | 108,109,110,112,113,114,120,121,122,125,126,127,130,131,132,133,136,137,138,139,142,143,144,146,147,148,150,151,152,158,159,160,161,163,164,165,171,172,173,175,186,188,191,202,204,205,206,209,211,212,214,219,220,224,225,227,228,230,248,249,250,251,255,256,257,258,260,262,263,267,268,269,271,273,278 | deferred admin/center old UI outside v1.1 | Admin dashboard is outside teacher/student priority smoke scope. |
| `client/app/components/landing/LandingFeatures.vue` | 17 | retained with reason | Active public landing route through `client/app/pages/index.vue`; not teacher/student smoke target. |
| `client/app/components/landing/LandingFooter.vue` | 10,15,16 | retained with reason | Active public landing route through `client/app/pages/index.vue`; not teacher/student smoke target. |
| `client/app/components/landing/LandingHeader.vue` | 9 | retained with reason | Active public landing route through `client/app/pages/index.vue`; not teacher/student smoke target. |
| `client/app/components/landing/LandingHero.vue` | 28,31,38,49 | retained with reason | Active public landing route through `client/app/pages/index.vue`; not teacher/student smoke target. |
| `client/app/components/landing/LandingShowcase.vue` | 19,25 | retained with reason | Active public landing route through `client/app/pages/index.vue`; not teacher/student smoke target. |
| `client/app/components/landing/LandingTopbar.vue` | 8,10 | retained with reason | Active public landing route through `client/app/pages/index.vue`; not teacher/student smoke target. |
| `client/app/pages/admin/health.vue` | 36,38,41,43,46,47,48,50,51,58,63,65,67,68,72,74,84,86,94,95,98,99,106,113,119,120,121,124,125,127,136,137,138,139,146,149,156,175,179 | deferred admin/center old UI outside v1.1 | Admin route outside Phase 5 Plan 01 cleanup scope. |
| `client/app/pages/admin/settings.vue` | 122,124,125,127,129,131,132,134,135,136,142,150,153,154,155,156,157,165,172,175,177,178,179,185,188,190,198,208,216,219,224,231,238,241,246,247,254,258,260,261,263,265,273,281,283,284,287,288,293,294,295,301,302,303,305,309,310,311,314,316 | deferred admin/center old UI outside v1.1 | Admin route outside Phase 5 Plan 01 cleanup scope. |
| `client/app/pages/admin/users/[id].vue` | 38,40,44,45,47,52,53,56,58,59,61,67,69,71,80,82,86,87,91,92,94,96,98,101,104,106,108,113,114,115,118,119,121,122,125,126,129,130,133,134,137,138,141,142,143,144,146,149,151,152,170,171,173,174,175,178,179,180,181,182,183,184,185,186,187,188,190,191,192,193 | deferred admin/center old UI outside v1.1 | Admin route outside Phase 5 Plan 01 cleanup scope. |
| `client/app/pages/admin/users/index.vue` | 124,129,138,139,142,143,157,158,160,169,172,175,176,177,181,182,186,187,188,192,194,199,200,201,202,203,204,209,210,211,212,213,214,215,216,217,221,222,223,224,227,228,229,230,231,232,233,234,239,240,241,242,243,244,245,246,249,250,251,252,254,255,256,257,258,259,260,261,262,263 | deferred admin/center old UI outside v1.1 | Admin route outside Phase 5 Plan 01 cleanup scope. |
| `client/app/pages/classes.vue` | 110,119,120,122,126,128,148,150,158,159,160,166,167,172,176,206,213,216,217,219,222,223,224,225,226,228,229,230,231,232,233,234,235,236,237,238,239,240,244 | deferred general old UI outside v1.1 | General teacher page; future full-product UI polish. |
| `client/app/pages/classes/[id].vue` | 322,324,327,328,329,334,335,337,340,342,343,365,372,378,380,383,385,387,388,390,391,393,395,399,400,404,406,409,413,422,423,432,433,440,449,458,459,467,468,470,473,476,477,484,485,486,488,489,491,499,500,504,514,516,521,522,525,526,529,538,540,558,560,561,563,566,576,577,586,595,596,597,598,601,602,603,604,605,607,608,609,610,616,625,626,627,628,629,637,643,652,654,655,657,658,660,661,662,663,664,665,666,667,669,670,671,672,675,676,677,678,679,681,682,689,696,697,698,699,700,707,708,709,710,713,714,715,716,717,719,720,721,722,723,724,725,726,733,734,735,736,739,740,741,742,743,745,749,750,751,752,753,754,755,762,763,764,765,768,769,770,771,772,774,776,777,778,779,780,781,782,783,784,791,792,793,794 | deferred general old UI outside v1.1 | General teacher page; future full-product UI polish. |
| `client/app/pages/classes/index.vue` | 146,155,159,160,161,167,169,170,172,180,181,182,183,189,190,198,199,201,204,205,207,210,211,226,235,239,246,248,257,260,261,262,264,266,271,272,273,274,275,277,278,279,280,288,299,300,301,302,303,311,317,326,328,329,331,332,334,341,343,344,345,346,347,348,355,356,357,358,362 | deferred general old UI outside v1.1 | General teacher page; future full-product UI polish. |
| `client/app/pages/documents.vue` | 169,170,172,190,201,203,209,221,224,226,234,235,241,247,253,260,261,278,282,290,298,299,300,301,302,304,305,306,307,308,309,310,311,317,318,319,320,321,322,329,330,331,332,335,336,337,338,339,341,342,343,344,345,346,354,362,363,364,365,366,373,374,375,376,380 | deferred general old UI outside v1.1 | General teacher page; future full-product UI polish. |
| `client/app/pages/index.vue` | 16,27 | retained with reason | Active public landing entry; not teacher/student smoke target. |
| `client/app/pages/maintenance.vue` | 6,7,8,9,14 | retained with reason | Active maintenance route referenced by auth middleware/settings; not teacher/student smoke target. |
| `client/app/pages/payments.vue` | 171,172,174,175,176,178,186,193,200,211,221,257,267,281,291,292,293,294,295,297,298,299,300,301,302,303,304,305,306,307,314,315,316,317,320,321,322,327,328,345,347,349,350,357,358,360,386,387,388,398,399,400,401,402,404,408 | deferred general old UI outside v1.1 | General teacher page; future full-product UI polish. |
| `client/app/pages/reports.vue` | 78,80,85,96,106,114,116,121,132,145,153,155,160,168,176,178,184,304,311,316,324,343,350 | deferred general old UI outside v1.1 | General teacher page; future full-product UI polish. |
| `client/app/pages/student/assignments.vue` | 95,122,135,139,143,147,172 | deferred general old UI outside v1.1 | Student low-priority page outside v1.1 smoke priority. |
| `client/app/pages/student/classes.vue` | 66,80,87,94,101,103,120,130,134,144,156,161,168,175 | deferred general old UI outside v1.1 | Student low-priority page outside v1.1 smoke priority. |
| `client/app/pages/student/documents.vue` | 79,90,92,105,108,110,118,119,126,133,134,151,155,163,171 | deferred general old UI outside v1.1 | Student low-priority page outside v1.1 smoke priority. |
| `client/app/pages/student/grades.vue` | 121,123,133,141,173,180,188 | deferred general old UI outside v1.1 | Student low-priority page outside v1.1 smoke priority. |
| `client/app/pages/student/tests.vue` | 108,122,129,136,143,164,166,182,186,195,206,213 | deferred general old UI outside v1.1 | Student low-priority page outside v1.1 smoke priority. |
| `client/app/pages/students.vue` | 65,66,68,69,70,72,79,107,108,110,120,122,130,143,156,175,176,177,178,179,181,182,183,184,185,186,187,188,189,190,197,198,199,200,204,413,436 | deferred general old UI outside v1.1 | General teacher page; future full-product UI polish. |
| `client/app/pages/students/[id].vue` | 249,251,254,255,257,261,262,271,272,282,283,289,296,297,298,306,307,310,311,314,315,318,319,320,322,323,324,325,326,327,328,329,331,332,334,335,336,337,338,339,340,341,342,344,346,348,351,352,353,354,357,358,359,360,363,364,365,366,369,370,371,372,375,376,377,378,381,382,383,386,396,404,405,406,407,408,410,412,433,440,441,444,446,454,461,463,464,470,471,473,476,477,478,479,482,483,484,485,488,489,490,491,494,495,496,500,502,506,510,519,530,536,549,558,559,569,570,572,573,574,576,577,586,588,591,594,595,596,608,609,611,612,613,614,617,618,619,620,621,623,624,632,633,634,635,636,637,638,639,646,647,648,649,652,653,654,655,656,658,662,663,664,665,666,667,668,675,676,677,678,681,682,683,684,685,687,691,692,693,694,695,696,697,698,699,706,707,708,709,713,716 | deferred general old UI outside v1.1 | General teacher page; future full-product UI polish. |
| `client/app/pages/students/index.vue` | 80,82,84,86,88,95,96,97,99,103,105,116,130,131,133,142,145,150,159,164,166,169,171,173,174,175,176,177,184,185,191,192,196,205,208,209,210,211,212,214,215,216,217,218,219,220,221,222,223,230,231,232,233 | deferred general old UI outside v1.1 | General teacher page; future full-product UI polish. |
| `client/app/styles/calendar/board.css` | 62,73,183,246 | safe-to-remove candidate | Stale style file; no imports/references found by cleanup proof command. Not removed in Plan 01. |
| `client/app/styles/calendar/board.scss` | 60,71,184,246 | safe-to-remove candidate | Stale style file; no imports/references found by cleanup proof command. Not removed in Plan 01. |
| `client/app/styles/dashboard/admin.css` | 1 | deferred admin/center old UI outside v1.1 | Admin dashboard style reference remains tied to admin surface. |
| `client/app/styles/dashboard/admin.scss` | 2 | deferred admin/center old UI outside v1.1 | Admin style source is outside teacher/student priority scope. |
| `client/app/styles/dashboard/teacher.css` | 370,374,380 | safe-to-remove candidate | Stale style file; no imports/references found by cleanup proof command. Not removed in Plan 01. |
| `client/app/styles/dashboard/teacher.scss` | 368,372,378 | safe-to-remove candidate | Stale style file; no imports/references found by cleanup proof command. Not removed in Plan 01. |
| `client/app/styles/register/form-pane.css` | 70,78,82,87,91,95,101,110,115,122,126,132,189,199,249 | safe-to-remove candidate | Stale style file; no imports/references found by cleanup proof command. Not removed in Plan 01. |
| `client/app/styles/register/page.css` | 11 | safe-to-remove candidate | Stale style file; no imports/references found by cleanup proof command. Not removed in Plan 01. |
| `client/app/styles/register/visual.css` | 17 | safe-to-remove candidate | Stale style file; no imports/references found by cleanup proof command. Not removed in Plan 01. |

## VER-05 Conclusion

The v1.1 smoke target surface is scan-clean for forbidden old UI markers. Remaining old markers are either safe-to-remove candidates intentionally not touched in Plan 01, active low-risk public/utility surfaces retained with reason, or admin/general/student surfaces deferred outside the v1.1 priority smoke scope.
