<script setup lang="ts">
import { showcaseRows } from '../../consts/landing/content';
</script>

<template>
  <section class="showcase-section">
    <div class="section-inner">
      <div
        v-for="(row, index) in showcaseRows"
        :key="row.title"
        :class="['showcase-row', { 'showcase-row--second': index === showcaseRows.length - 1 }]"
      >
        <div v-if="row.imageFirst" :class="['showcase-image', `showcase-image--${row.tone}`]">
          <img :src="row.image" :alt="row.imageAlt">
        </div>

        <div class="showcase-copy">
          <div :class="['showcase-copy__icon', `showcase-copy__icon--${row.tone}`]">
            <v-icon :icon="row.icon" size="24" />
          </div>
          <h2>{{ row.title }}</h2>
          <p>{{ row.description }}</p>
          <ul>
            <li v-for="item in row.benefits" :key="item">
              <v-icon
                icon="mdi-check-circle"
                :class="[
                  'showcase-copy__check',
                  `showcase-copy__check--${row.tone === 'blue' ? 'orange' : 'blue'}`,
                ]"
                size="20"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <div v-if="!row.imageFirst" :class="['showcase-image', `showcase-image--${row.tone}`]">
          <img :src="row.image" :alt="row.imageAlt">
        </div>
      </div>
    </div>
  </section>
</template>
