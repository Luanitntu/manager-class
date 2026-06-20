<script setup lang="ts">
import { type ClassItem, useClasses, useClassMutations } from '~/composables/useClasses';

const search = ref('');
const { data, isLoading } = useClasses(search);
const { create, update, remove } = useClassMutations();

const classes = computed(() => data.value?.data ?? []);

const dialog = ref(false);
const editing = ref<ClassItem | null>(null);
const error = ref<string | null>(null);
const form = reactive({ name: '', level: '', color: '#5D87FF', description: '' });

function openCreate() {
  editing.value = null;
  Object.assign(form, { name: '', level: '', color: '#5D87FF', description: '' });
  error.value = null;
  dialog.value = true;
}

function openEdit(item: ClassItem) {
  editing.value = item;
  Object.assign(form, {
    name: item.name,
    level: item.level ?? '',
    color: item.color ?? '#5D87FF',
    description: item.description ?? '',
  });
  error.value = null;
  dialog.value = true;
}

async function save() {
  error.value = null;
  try {
    const body = {
      name: form.name,
      level: form.level || undefined,
      color: form.color || undefined,
      description: form.description || undefined,
    };
    if (editing.value) {
      await update.mutateAsync({ id: editing.value.id, body });
    } else {
      await create.mutateAsync(body);
    }
    dialog.value = false;
  } catch (e) {
    error.value = extractApiError(e) ?? 'Could not save class';
  }
}

async function destroy(item: ClassItem) {
  if (!confirm(`Delete class "${item.name}"?`)) return;
  await remove.mutateAsync(item.id);
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Classes</h1>
        <p class="text-medium-emphasis ma-0">Courses that contain teaching sessions.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">New Class</v-btn>
    </div>

    <v-text-field
      v-model="search"
      placeholder="Search classes…"
      prepend-inner-icon="mdi-magnify"
      class="mb-4"
      clearable
      hide-details
      style="max-width: 360px"
    />

    <v-row v-if="classes.length">
      <v-col v-for="c in classes" :key="c.id" cols="12" sm="6" md="4">
        <v-card class="pa-4">
          <div class="d-flex align-center ga-3 mb-2">
            <v-avatar :color="c.color || 'primary'" size="36" rounded="lg">
              <v-icon color="white">mdi-google-classroom</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="font-weight-bold">{{ c.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ c.level || '—' }}</div>
            </div>
            <v-menu>
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" size="small" />
              </template>
              <v-list>
                <v-list-item title="Edit" prepend-icon="mdi-pencil" @click="openEdit(c)" />
                <v-list-item title="Delete" prepend-icon="mdi-delete" @click="destroy(c)" />
              </v-list>
            </v-menu>
          </div>
          <div class="d-flex ga-4 text-caption text-medium-emphasis">
            <span><v-icon size="14">mdi-account-school</v-icon> {{ c._count?.enrollments ?? 0 }} students</span>
            <span><v-icon size="14">mdi-calendar</v-icon> {{ c._count?.sessions ?? 0 }} sessions</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else-if="!isLoading" class="pa-12 text-center text-medium-emphasis">
      No classes yet. Create your first class to start scheduling.
    </v-card>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>{{ editing ? 'Edit class' : 'New class' }}</v-card-title>
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>
          <v-text-field v-model="form.name" label="Name" />
          <v-text-field v-model="form.level" label="Level (e.g. N5)" />
          <v-text-field v-model="form.color" label="Color" type="color" />
          <v-textarea v-model="form.description" label="Description" rows="2" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="create.isPending.value || update.isPending.value"
            :disabled="!form.name"
            @click="save"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
