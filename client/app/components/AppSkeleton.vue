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

<style scoped lang="scss">
.app-skeleton {
  --sk-bg: #eef3fa;
  --sk-shine: #f8fbff;
  --sk-border: #e2e8f0;

  display: grid;
  gap: 16px;
  width: 100%;

  :is(span, strong, p, i, .app-skeleton__toolbar) {
    animation: skeletonShimmer 1.35s ease-in-out infinite;
    background: linear-gradient(90deg, var(--sk-bg), var(--sk-shine), var(--sk-bg));
    background-size: 220% 100%;
    border-radius: 8px;
    display: block;
  }

  strong {
    height: 24px;
    width: 58%;
  }

  p,
  span {
    height: 14px;
  }

  i {
    border-radius: 10px;
    height: 44px;
    width: 44px;
  }

  &--dashboard {
    gap: 24px;
  }

  &__hero {
    background: #fff;
    border: 1px solid var(--sk-border);
    border-radius: 8px;
    display: grid;
    gap: 14px;
    min-height: 264px;
    padding: 32px;

    span {
      height: 28px;
      width: 150px;
    }

    strong {
      height: 42px;
      width: min(520px, 70%);
    }

    p {
      height: 16px;
      width: min(680px, 90%);

      &:last-child {
        width: min(420px, 72%);
      }
    }
  }

  &__stats,
  &--stats,
  &--grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  }

  &__stats article,
  &--stats article,
  &--grid article {
    background: #fff;
    border: 1px solid var(--sk-border);
    border-radius: 10px;
    display: grid;
    gap: 14px;
    min-height: 150px;
    padding: 20px;
  }

  &--grid article {
    min-height: 190px;
  }

  &__split {
    display: grid;
    gap: 24px;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 34%);

    section,
    aside {
      background: #fff;
      border: 1px solid var(--sk-border);
      border-radius: 10px;
      display: grid;
      gap: 14px;
      padding: 20px;
    }

    span {
      height: 56px;
    }
  }

  &__toolbar {
    height: 56px;
  }

  &--table {
    background: #fff;
    border: 1px solid var(--sk-border);
    border-radius: 12px;
    overflow: hidden;
    padding: 16px;

    table {
      border-collapse: collapse;
      width: 100%;
    }

    td {
      border-top: 1px solid #f1f5f9;
      padding: 16px 12px;
    }

    td span {
      height: 18px;
      width: 100%;
    }
  }

  &--calendar {
    background: #fff;
    border: 1px solid var(--sk-border);
    border-radius: 12px;
    overflow: hidden;
    padding: 16px;
  }

  &__calendar-grid {
    display: grid;
    gap: 1px;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    margin-top: 16px;

    span {
      border-radius: 0;
      height: 104px;
    }
  }

  &--form,
  &--detail {
    background: #fff;
    border: 1px solid var(--sk-border);
    border-radius: 12px;
    padding: 20px;

    > span {
      height: 44px;
    }
  }

  &__detail-head {
    align-items: center;
    display: flex;
    gap: 12px;
    margin-bottom: 6px;

    div {
      display: grid;
      flex: 1;
      gap: 8px;
    }
  }

  &--list article {
    align-items: center;
    background: #fff;
    border: 1px solid var(--sk-border);
    border-radius: 10px;
    display: flex;
    gap: 14px;
    min-height: 76px;
    padding: 16px;

    div {
      display: grid;
      flex: 1;
      gap: 10px;
    }

    span {
      width: 72%;
    }
  }
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
