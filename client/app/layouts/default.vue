<script setup lang="ts">
import { useDisplay } from 'vuetify';

const { mdAndUp } = useDisplay();
const drawer = ref(true);
const auth = useAuthStore();
const { logout } = useAuth();
const isStudentShell = computed(() => auth.role === 'STUDENT');

watch(mdAndUp, (isDesktop) => {
  drawer.value = isDesktop;
}, { immediate: true });

const navGroups = [
  {
    label: 'HẰNG NGÀY',
    items: [
      { title: 'Tổng quan', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
      { title: 'Lịch dạy', icon: 'mdi-calendar-month-outline', to: '/calendar' },
    ],
  },
  {
    label: 'GIẢNG DẠY',
    items: [
      { title: 'Lớp học', icon: 'mdi-book-open-page-variant-outline', to: '/classes' },
      { title: 'Học viên', icon: 'mdi-account-group-outline', to: '/students' },
      { title: 'Tài liệu', icon: 'mdi-file-document-outline', to: '/documents' },
    ],
  },
  {
    label: 'QUẢN LÝ',
    items: [
      { title: 'Học phí', icon: 'mdi-credit-card-outline', to: '/payments' },
      { title: 'Báo cáo', icon: 'mdi-chart-bar', to: '/reports' },
    ],
  },
];

const studentNavItems = [
  { title: 'Tổng quan', icon: 'mdi-view-dashboard-outline', to: '/dashboard', exact: true },
  { title: 'Lịch học', icon: 'mdi-calendar-month-outline', to: '/calendar' },
  { title: 'Lớp học', icon: 'mdi-book-open-variant-outline', to: '/student/classes' },
  { title: 'Tài liệu', icon: 'mdi-file-document-outline', to: '/student/documents' },
  { title: 'Bài tập', icon: 'mdi-clipboard-text-outline', to: '/student/assignments' },
  { title: 'Điểm số', icon: 'mdi-chart-line', to: '/student/grades' },
  { title: 'Bài kiểm tra', icon: 'mdi-clipboard-check-outline', to: '/student/tests' },
];
</script>

<template>
  <v-app :class="isStudentShell ? 'student-shell' : 'teacher-shell'">
    <template v-if="isStudentShell">
      <v-navigation-drawer
        v-model="drawer"
        class="student-shell__drawer"
        color="white"
        :permanent="mdAndUp"
        width="256"
      >
        <div class="student-shell__brand">
          <NuxtLink class="student-shell__brand-link" to="/dashboard">
            <v-icon size="30">mdi-headphones</v-icon>
            <span>Prep<span>Learn</span></span>
          </NuxtLink>
        </div>

        <nav class="student-shell__nav">
          <div class="student-shell__nav-label">KHÔNG GIAN HỌC TẬP</div>
          <v-list class="student-shell__nav-list" density="compact" nav>
            <v-list-item
              v-for="item in studentNavItems"
              :key="item.to"
              class="student-shell__nav-item"
              :exact="item.exact"
              :prepend-icon="item.icon"
              rounded="xl"
              :title="item.title"
              :to="item.to"
            />
          </v-list>
        </nav>

        <template #append>
          <div class="student-shell__help">
            <h4>Cần hỗ trợ?</h4>
            <p>Đội ngũ giáo vụ luôn sẵn sàng giúp đỡ bạn.</p>
            <button type="button">Chat với giáo vụ</button>
          </div>
        </template>
      </v-navigation-drawer>

      <v-app-bar class="student-shell__bar" color="white" flat height="64">
        <v-app-bar-nav-icon class="student-shell__menu" @click="drawer = !drawer" />

        <label class="student-shell__search" for="student-shell-search">
          <v-icon size="20">mdi-magnify</v-icon>
          <input id="student-shell-search" placeholder="Tìm kiếm lớp học, tài liệu..." type="search">
        </label>

        <v-spacer />

        <div class="student-shell__actions">
          <button class="student-shell__streak" type="button">
            <v-icon size="16">mdi-fire</v-icon>
            14 Ngày
          </button>
          <v-btn class="student-shell__icon-btn" icon variant="text">
            <v-badge color="error" dot floating>
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
          </v-btn>
          <div class="student-shell__divider" />
          <v-menu>
            <template #activator="{ props }">
              <button v-bind="props" class="student-shell__profile" type="button">
                <v-avatar class="student-shell__avatar" size="36">
                  <v-img
                    :alt="auth.user?.fullName ?? 'Student avatar'"
                    :src="auth.user?.avatarUrl || 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwc3R1ZGVudCUyMGJveXxlbnwwfHx8fDE3ODIxMDU5MTN8MA&ixlib=rb-4.1.0&q=80&w=1080'"
                  />
                </v-avatar>
                <span class="student-shell__profile-text">
                  <strong>{{ auth.user?.fullName ?? 'Tuấn Anh' }}</strong>
                  <small>Học viên</small>
                </span>
              </button>
            </template>
            <v-list>
              <v-list-item prepend-icon="mdi-account-outline" title="Hồ sơ cá nhân" to="/profile" />
              <v-list-item prepend-icon="mdi-cog-outline" title="Cài đặt" to="/profile" />
              <v-list-item prepend-icon="mdi-logout" title="Đăng xuất" @click="logout()" />
            </v-list>
          </v-menu>
        </div>
      </v-app-bar>

      <v-main class="student-shell__main">
        <div class="student-shell__content">
          <slot />
        </div>
      </v-main>
    </template>

    <template v-else>
    <v-navigation-drawer
      v-model="drawer"
      class="teacher-shell__drawer"
      color="white"
      :permanent="mdAndUp"
      width="256"
    >
      <div class="teacher-shell__brand">
        <span class="teacher-shell__brand-mark">
          <v-icon size="22">mdi-calendar-month</v-icon>
        </span>
        <span class="teacher-shell__brand-text">Schedule Teacher</span>
      </div>

      <div class="teacher-shell__nav">
        <section v-for="group in navGroups" :key="group.label" class="teacher-shell__nav-group">
          <div class="teacher-shell__nav-label">{{ group.label }}</div>
          <v-list class="teacher-shell__nav-list" density="compact" nav>
            <v-list-item
              v-for="item in group.items"
              :key="item.to"
              class="teacher-shell__nav-item"
              :prepend-icon="item.icon"
              rounded="lg"
              :title="item.title"
              :to="item.to"
            />
          </v-list>
        </section>
      </div>

      <template #append>
        <v-list class="teacher-shell__settings" density="compact" nav>
          <v-list-item
            class="teacher-shell__nav-item"
            prepend-icon="mdi-cog-outline"
            rounded="lg"
            title="Cài đặt"
            to="/profile"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-app-bar class="teacher-shell__bar" color="white" flat height="64">
      <v-app-bar-nav-icon class="teacher-shell__menu" @click="drawer = !drawer" />

      <div class="teacher-shell__search">
        <v-icon size="20">mdi-magnify</v-icon>
        <input aria-label="Search" placeholder="Tìm kiếm lớp học, học viên..." type="search">
      </div>

      <v-spacer />

      <div class="teacher-shell__actions">
        <v-chip class="teacher-shell__streak" color="warning" variant="tonal">
          <v-icon start size="16">mdi-fire</v-icon>
          14 Ngày
        </v-chip>
        <v-btn class="teacher-shell__icon-btn" icon variant="text">
          <v-badge color="error" dot floating>
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
        <v-btn class="teacher-shell__add-btn" color="primary" icon to="/calendar">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <div class="teacher-shell__divider" />
        <v-menu>
          <template #activator="{ props }">
            <button v-bind="props" class="teacher-shell__profile" type="button">
              <v-avatar class="teacher-shell__avatar" size="36">
                <v-img v-if="auth.user?.avatarUrl" :src="auth.user.avatarUrl" />
                <span v-else>{{ auth.user?.fullName?.[0] ?? 'U' }}</span>
              </v-avatar>
              <span class="teacher-shell__profile-text">
                <strong>{{ auth.user?.fullName ?? 'Co Mai' }}</strong>
                <small>{{ auth.role === 'STUDENT' ? 'Học viên' : 'Giáo viên' }}</small>
              </span>
            </button>
          </template>
          <v-list>
            <v-list-item prepend-icon="mdi-account" title="Profile" to="/profile" />
            <v-list-item prepend-icon="mdi-logout" title="Logout" @click="logout()" />
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main class="teacher-shell__main">
      <v-container fluid class="teacher-shell__content">
        <slot />
      </v-container>
    </v-main>
    </template>
  </v-app>
</template>

<style scoped lang="scss">
.teacher-shell {
  --shell-border: #e6ebf2;
  --shell-muted: #8a9ab2;
  --shell-text: #17233c;

  color: var(--shell-text);

  &__drawer {
    border-right: 1px solid var(--shell-border);
  }

  &__brand {
    align-items: center;
    border-bottom: 1px solid var(--shell-border);
    display: flex;
    gap: 10px;
    height: 64px;
    padding: 0 24px;
  }

  &__brand-mark {
    align-items: center;
    background: var(--st-primary);
    border-radius: 8px;
    box-shadow: none;
    color: #fff;
    display: inline-flex;
    height: 32px;
    justify-content: center;
    width: 32px;
  }

  &__brand-text {
    color: var(--st-primary-dark);
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0;
    white-space: nowrap;
  }

  &__nav {
    padding: 18px 12px;
  }

  &__nav-group + &__nav-group {
    margin-top: 24px;
  }

  &__nav-label {
    color: #97a5ba;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    margin: 0 12px 6px;
  }

  &__nav-list {
    padding: 0;
  }

  &__nav-item {
    color: #31425f;
    font-size: 14px;
    font-weight: 700;
    min-height: 42px;
    padding-inline: 12px;

    :deep(.v-list-item__prepend) {
      min-width: 0;
    }

    :deep(.v-list-item__spacer) {
      width: 12px;
    }

    :deep(.v-list-item__prepend > .v-icon) {
      color: #8fa1bd;
      opacity: 1;
      margin-inline-end: 0;
    }

    :deep(.v-list-item-title) {
      font-size: 14px;
      font-weight: 700;
      line-height: 1.2;
    }

    &.v-list-item--active {
      background: var(--st-bg-soft);
      color: var(--st-primary);

      :deep(.v-list-item__overlay) {
        opacity: 0;
      }

      :deep(.v-list-item__prepend > .v-icon) {
        color: var(--st-primary);
      }

      &::before {
        background: var(--st-primary);
        border-radius: 0 4px 4px 0;
        content: '';
        height: 32px;
        left: -12px;
        position: absolute;
        top: 5px;
        width: 4px;
      }
    }
  }

  &__settings {
    border-top: 1px solid var(--shell-border);
    padding: 14px 12px;
  }

  &__bar {
    border-bottom: 1px solid var(--shell-border);
  }

  &__menu {
    display: none;
  }

  &__search {
    align-items: center;
    background: #f8fbff;
    border: 1px solid #dce5f1;
    border-radius: 10px;
    color: #8aa0bb;
    display: flex;
    gap: 12px;
    height: 38px;
    margin-left: 24px;
    max-width: 448px;
    padding: 0 14px;
    width: min(448px, 36vw);

    input {
      color: #30415f;
      font-size: 14px;
      font-weight: 600;
      min-width: 0;
      outline: 0;
      width: 100%;

      &::placeholder {
        color: #9aa9bf;
      }
    }
  }

  &__actions {
    align-items: center;
    display: flex;
    gap: 16px;
    padding-right: 24px;
  }

  &__streak {
    background: #fff7ed !important;
    border: 1px solid #fed7aa;
    border-radius: 999px !important;
    color: #ff6100;
    flex: 0 0 104px;
    font-size: 14px;
    font-weight: 800;
    height: 34px !important;
    justify-content: center;
    letter-spacing: 0;
    min-width: 104px;
    padding: 0 !important;
    width: 104px;

    :deep(.v-chip__content) {
      align-items: center;
      gap: 6px;
      justify-content: center;
      line-height: 1;
      padding: 0;
      width: 100%;
    }

    :deep(.v-icon) {
      color: #ff6100;
      margin-inline: 0;
      opacity: 1;
    }
  }

  &__icon-btn {
    color: #7f90aa;
  }

  &__add-btn {
    background: var(--st-primary) !important;
    border-radius: 50% !important;
    color: #fff !important;
    flex: 0 0 40px;
    height: 40px !important;
    min-height: 40px;
    min-width: 40px !important;
    padding: 0 !important;
    width: 40px !important;
    box-shadow: none;

    :deep(.v-btn__content) {
      height: 40px;
      width: 40px;
    }

    :deep(.v-icon) {
      font-size: 24px;
      height: 24px;
      width: 24px;
    }
  }

  &__divider {
    background: var(--shell-border);
    height: 32px;
    width: 1px;
  }

  &__profile {
    align-items: center;
    display: flex;
    gap: 10px;
    min-width: 126px;
    text-align: left;
  }

  &__avatar {
    background: var(--st-bg-soft);
    color: var(--st-primary);
    font-weight: 800;
  }

  &__profile-text {
    display: grid;
    line-height: 1.1;

    strong {
      color: #1d2c47;
      font-size: 14px;
      font-weight: 800;
      max-width: 86px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      color: #60718c;
      font-size: 12px;
      font-weight: 700;
      margin-top: 3px;
    }
  }

  &__main {
    background: #f5f8fc;
  }

  &__content {
    margin: 0;
    max-width: none;
    padding: 32px;
  }
}

.student-shell {
  --student-shell-blue: #0071f9;
  --student-shell-text: #0f172a;
  --student-shell-muted: #64748b;
  --student-shell-border: #e2e8f0;

  color: var(--student-shell-text);
  font-family: Nunito, Roboto, sans-serif;

  &__drawer {
    border-right: 1px solid var(--student-shell-border);
    bottom: 0 !important;
    height: 100vh !important;
    left: 0 !important;
    position: fixed !important;
    top: 0 !important;
    z-index: 1006 !important;
  }

  &__brand {
    align-items: center;
    border-bottom: 1px solid var(--student-shell-border);
    display: flex;
    height: 64px;
    padding: 0 24px;
  }

  &__brand-link {
    align-items: center;
    color: var(--student-shell-blue);
    display: flex;
    gap: 8px;
    text-decoration: none;

    > span {
      color: var(--student-shell-blue);
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0;
      line-height: 1;

      span {
        color: #0f172a;
      }
    }
  }

  &__nav {
    padding: 24px 12px;
  }

  &__nav-label {
    color: #94a3b8;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.04em;
    margin: 0 12px 10px;
  }

  &__nav-list {
    display: grid;
    gap: 6px;
    padding: 0;
  }

  &__nav-item {
    color: #50627d;
    font-size: 16px;
    font-weight: 800;
    min-height: 44px;
    padding-inline: 12px;

    :deep(.v-list-item__prepend) {
      min-width: 0;
    }

    :deep(.v-list-item__spacer) {
      width: 14px;
    }

    :deep(.v-list-item__prepend > .v-icon) {
      color: #64748b;
      opacity: 1;
    }

    :deep(.v-list-item-title) {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0;
    }

    &.v-list-item--active {
      background: #eff6ff;
      color: var(--student-shell-blue);

      :deep(.v-list-item__overlay) {
        opacity: 0;
      }

      :deep(.v-list-item__prepend > .v-icon) {
        color: var(--student-shell-blue);
      }
    }
  }

  &__help {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 12px;
    margin: 16px;
    padding: 16px;

    h4 {
      color: #0f172a;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0;
      margin-bottom: 6px;
    }

    p {
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.45;
      margin: 0 0 13px;
    }

    button {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgb(15 23 42 / 8%);
      color: var(--student-shell-blue);
      cursor: pointer;
      font-size: 12px;
      font-weight: 900;
      height: 33px;
      width: 100%;
    }
  }

  &__bar {
    border-bottom: 1px solid var(--student-shell-border);
    left: 256px !important;
    width: calc(100% - 256px) !important;
  }

  &__menu {
    display: none;
  }

  &__search {
    align-items: center;
    background: #f8fafc;
    border: 1px solid #dbe4ef;
    border-radius: 10px;
    color: #8ba0bb;
    display: flex;
    gap: 12px;
    height: 40px;
    margin-left: 24px;
    max-width: 448px;
    padding: 0 12px;
    width: min(448px, 40vw);

    input {
      color: #334155;
      font-size: 14px;
      font-weight: 500;
      min-width: 0;
      outline: 0;
      width: 100%;

      &::placeholder {
        color: #94a3b8;
      }
    }
  }

  &__actions {
    align-items: center;
    display: flex;
    gap: 16px;
    padding-right: 24px;
  }

  &__streak {
    align-items: center;
    background: #fff7ed;
    border: 1px solid #ffedd5;
    border-radius: 999px;
    color: #ea580c;
    cursor: pointer;
    display: flex;
    font-size: 14px;
    font-weight: 900;
    gap: 6px;
    height: 34px;
    justify-content: center;
    padding: 0 14px;

    .v-icon {
      color: #f97316;
    }
  }

  &__icon-btn {
    color: #94a3b8;
  }

  &__divider {
    background: var(--student-shell-border);
    height: 32px;
    width: 1px;
  }

  &__profile {
    align-items: center;
    cursor: pointer;
    display: flex;
    gap: 10px;
    min-width: 124px;
    text-align: left;
  }

  &__avatar {
    border: 1px solid var(--student-shell-border);
  }

  &__profile-text {
    display: grid;
    line-height: 1.1;

    strong {
      color: #0f172a;
      font-size: 14px;
      font-weight: 900;
      max-width: 92px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      color: #64748b;
      font-size: 12px;
      font-weight: 600;
      margin-top: 4px;
    }
  }

  &__main {
    background: #f8fafc;
    padding-left: 256px !important;
    padding-top: 64px !important;
  }

  &__content {
    padding: 32px;
  }
}

@media (max-width: 960px) {
  .teacher-shell {
    &__menu {
      display: inline-flex;
      margin-left: 8px;
    }

    &__search {
      margin-left: 8px;
      width: min(420px, 54vw);
    }

    &__profile-text,
    &__divider {
      display: none;
    }

    &__profile {
      min-width: auto;
    }
  }

  .student-shell {
    &__bar {
      left: 0 !important;
      width: 100% !important;
    }

    &__main {
      padding-left: 0 !important;
    }

    &__menu {
      display: inline-flex;
      margin-left: 8px;
    }

    &__search {
      margin-left: 8px;
      width: min(420px, 54vw);
    }

    &__profile-text,
    &__divider {
      display: none;
    }

    &__profile {
      min-width: auto;
    }
  }
}

@media (max-width: 720px) {
  .teacher-shell {
    &__search,
    &__streak {
      display: none;
    }

    &__actions {
      gap: 6px;
      padding-right: 10px;
    }

    &__content {
      padding: 18px;
    }
  }

  .student-shell {
    &__search,
    &__streak {
      display: none;
    }

    &__actions {
      gap: 6px;
      padding-right: 10px;
    }

    &__content {
      padding: 16px;
    }
  }
}
</style>
