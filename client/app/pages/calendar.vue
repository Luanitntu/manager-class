<script setup lang="ts">
import StudentCalendar from '~/components/calendar/StudentCalendar.vue';
import TeacherCalendar from '~/components/calendar/TeacherCalendar.vue';

const auth = useAuthStore();

const isStudentCalendar = computed(() => auth.role === 'STUDENT');
const canEditTeacherCalendar = computed(() => auth.role === 'TEACHER');
</script>

<template>
  <StudentCalendar v-if="isStudentCalendar" />
  <TeacherCalendar v-else :can-edit="canEditTeacherCalendar" />
</template>
