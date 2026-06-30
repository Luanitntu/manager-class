<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'dashboard' | 'stats' | 'grid' | 'table' | 'list' | 'calendar' | 'form' | 'detail';
  rows?: number;
  columns?: number;
  cards?: number;
}>(), {
  variant: 'list',
  rows: 5,
  columns: 4,
  cards: 6,
});
</script>

<template>
  <div class="app-skeleton" :class="`app-skeleton--${variant}`" aria-hidden="true">
    <template v-if="variant === 'dashboard'">
      <div class="app-skeleton__hero">
        <span />
        <strong />
        <p />
        <p />
      </div>
      <div class="app-skeleton__stats">
        <article v-for="item in 4" :key="item">
          <i />
          <strong />
          <span />
        </article>
      </div>
      <div class="app-skeleton__split">
        <section>
          <span v-for="item in 4" :key="item" />
        </section>
        <aside>
          <span v-for="item in 2" :key="item" />
        </aside>
      </div>
    </template>

    <template v-else-if="variant === 'stats'">
      <article v-for="item in cards" :key="item">
        <i />
        <strong />
        <span />
      </article>
    </template>

    <template v-else-if="variant === 'grid'">
      <article v-for="item in cards" :key="item">
        <i />
        <strong />
        <p />
        <p />
      </article>
    </template>

    <template v-else-if="variant === 'table'">
      <div class="app-skeleton__toolbar" />
      <table>
        <tbody>
          <tr v-for="row in rows" :key="row">
            <td v-for="col in columns" :key="col"><span /></td>
          </tr>
        </tbody>
      </table>
    </template>

    <template v-else-if="variant === 'calendar'">
      <div class="app-skeleton__toolbar" />
      <div class="app-skeleton__calendar-grid">
        <span v-for="item in 35" :key="item" />
      </div>
    </template>

    <template v-else-if="variant === 'form'">
      <span v-for="item in rows" :key="item" />
    </template>

    <template v-else-if="variant === 'detail'">
      <div class="app-skeleton__detail-head">
        <i />
        <div><strong /><span /></div>
      </div>
      <span v-for="item in rows" :key="item" />
    </template>

    <template v-else>
      <article v-for="item in rows" :key="item">
        <i />
        <div>
          <strong />
          <span />
        </div>
      </article>
    </template>
  </div>
</template>

<style scoped>
.app-skeleton {
  --sk-bg: #eef3fa;
  --sk-shine: #f8fbff;
  --sk-border: #e2e8f0;
  display: grid;
  gap: 16px;
  width: 100%;
}

.app-skeleton :is(span, strong, p, i, .app-skeleton__toolbar) {
  animation: skeletonShimmer 1.35s ease-in-out infinite;
  background: linear-gradient(90deg, var(--sk-bg), var(--sk-shine), var(--sk-bg));
  background-size: 220% 100%;
  border-radius: 8px;
  display: block;
}

.app-skeleton strong {
  height: 24px;
  width: 58%;
}

.app-skeleton p,
.app-skeleton span {
  height: 14px;
}

.app-skeleton i {
  border-radius: 10px;
  height: 44px;
  width: 44px;
}

.app-skeleton--dashboard {
  gap: 24px;
}

.app-skeleton__hero {
  background: #fff;
  border: 1px solid var(--sk-border);
  border-radius: 8px;
  display: grid;
  gap: 14px;
  min-height: 264px;
  padding: 32px;
}

.app-skeleton__hero span {
  height: 28px;
  width: 150px;
}

.app-skeleton__hero strong {
  height: 42px;
  width: min(520px, 70%);
}

.app-skeleton__hero p {
  height: 16px;
  width: min(680px, 90%);
}

.app-skeleton__hero p:last-child {
  width: min(420px, 72%);
}

.app-skeleton__stats,
.app-skeleton--stats,
.app-skeleton--grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

.app-skeleton__stats article,
.app-skeleton--stats article,
.app-skeleton--grid article {
  background: #fff;
  border: 1px solid var(--sk-border);
  border-radius: 10px;
  display: grid;
  gap: 14px;
  min-height: 150px;
  padding: 20px;
}

.app-skeleton--grid article {
  min-height: 190px;
}

.app-skeleton__split {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 34%);
}

.app-skeleton__split section,
.app-skeleton__split aside {
  background: #fff;
  border: 1px solid var(--sk-border);
  border-radius: 10px;
  display: grid;
  gap: 14px;
  padding: 20px;
}

.app-skeleton__split span {
  height: 56px;
}

.app-skeleton__toolbar {
  height: 56px;
}

.app-skeleton--table {
  background: #fff;
  border: 1px solid var(--sk-border);
  border-radius: 12px;
  overflow: hidden;
  padding: 16px;
}

.app-skeleton--table table {
  border-collapse: collapse;
  width: 100%;
}

.app-skeleton--table td {
  border-top: 1px solid #f1f5f9;
  padding: 16px 12px;
}

.app-skeleton--table td span {
  height: 18px;
  width: 100%;
}

.app-skeleton--calendar {
  background: #fff;
  border: 1px solid var(--sk-border);
  border-radius: 12px;
  overflow: hidden;
  padding: 16px;
}

.app-skeleton__calendar-grid {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin-top: 16px;
}

.app-skeleton__calendar-grid span {
  border-radius: 0;
  height: 104px;
}

.app-skeleton--form,
.app-skeleton--detail {
  background: #fff;
  border: 1px solid var(--sk-border);
  border-radius: 12px;
  padding: 20px;
}

.app-skeleton--form > span,
.app-skeleton--detail > span {
  height: 44px;
}

.app-skeleton__detail-head {
  align-items: center;
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
}

.app-skeleton__detail-head div {
  display: grid;
  flex: 1;
  gap: 8px;
}

.app-skeleton--list article {
  align-items: center;
  background: #fff;
  border: 1px solid var(--sk-border);
  border-radius: 10px;
  display: flex;
  gap: 14px;
  min-height: 76px;
  padding: 16px;
}

.app-skeleton--list article div {
  display: grid;
  flex: 1;
  gap: 10px;
}

.app-skeleton--list article span {
  width: 72%;
}

@keyframes skeletonShimmer {
  0% {
    background-position: 120% 0;
  }

  100% {
    background-position: -120% 0;
  }
}

@media (max-width: 880px) {
  .app-skeleton__split {
    grid-template-columns: 1fr;
  }
}
</style>
