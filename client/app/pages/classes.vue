<script setup lang="ts">
import { type ClassItem, useClasses, useClassMutations } from '~/composables/useClasses';
import { useSnackbar } from '~/composables/useSnackbar';

const search = ref('');
const { data, isLoading, error, refetch } = useClasses(search);
const { create, update, remove } = useClassMutations();
const { success: showSuccess, error: showError } = useSnackbar();

const classes = computed(() => data.value?.data ?? []);

const dialog = ref(false);
const editing = ref<ClassItem | null>(null);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const form = reactive({ name: '', level: '', color: '#5D87FF', description: '' });

const rules = {
  required: (v: unknown) => !!v || 'Field is required',
};

function openCreate() {
  editing.value = null;
  Object.assign(form, { name: '', level: '', color: '#5D87FF', description: '' });
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
  dialog.value = true;
}

async function save() {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  try {
    const body = {
      name: form.name,
      level: form.level || undefined,
      color: form.color || undefined,
      description: form.description || undefined,
    };
    if (editing.value) {
      await update.mutateAsync({ id: editing.value.id, body });
      showSuccess('Class updated successfully.');
    } else {
      await create.mutateAsync(body);
      showSuccess('Class created successfully.');
    }
    dialog.value = false;
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not save class');
  }
}

async function destroy(item: ClassItem) {
  if (!confirm(`Delete class "${item.name}"?`)) return;
  try {
    await remove.mutateAsync(item.id);
    showSuccess('Class deleted successfully.');
  } catch (e) {
    showError(extractApiError(e) ?? 'Could not delete class');
  }
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Classes"
      subtitle="Courses that contain teaching sessions."
      icon="mdi-google-classroom"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">New Class</v-btn>
      </template>
    </AppPageHeader>

    <div class="mb-4 d-flex align-center justify-space-between ga-4">
      <v-text-field
        v-model="search"
        placeholder="Search classes…"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        style="max-width: 360px"
      />
    </div>

    <AppState
      v-if="isLoading"
      variant="loading"
      title="Loading classes"
      body="Fetching your class list..."
    />

    <AppState
      v-else-if="error"
      variant="error"
      title="Could not load classes"
      body="Failed to load your classes. Please check your network connection."
      action-label="Try again"
      @action="refetch()"
    />

    <template v-else>
      <v-row v-if="classes.length">
        <v-col v-for="c in classes" :key="c.id" cols="12" sm="6" md="4">
          <v-card class="pa-4 st-card-soft">
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
              <span><v-icon size="14" class="mr-1">mdi-account-school</v-icon>{{ c._count?.enrollments ?? 0 }} students</span>
              <span><v-icon size="14" class="mr-1">mdi-calendar</v-icon>{{ c._count?.sessions ?? 0 }} sessions</span>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <AppState
        v-else
        variant="empty"
        title="No classes yet"
        body="Create your first class to start scheduling sessions."
        action-label="New Class"
        @action="openCreate"
      />
    </template>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>{{ editing ? 'Edit class' : 'New class' }}</v-card-title>
        <v-form ref="formRef" @submit.prevent="save">
          <v-card-text>
            <v-text-field v-model="form.name" label="Name" :rules="[rules.required]" class="mb-2" />
            <v-text-field v-model="form.level" label="Level (e.g. N5)" class="mb-2" />
            <v-text-field v-model="form.color" label="Color" type="color" class="mb-2" />
            <v-textarea v-model="form.description" label="Description" rows="2" />
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="create.isPending.value || update.isPending.value"
              :disabled="!form.name"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>
