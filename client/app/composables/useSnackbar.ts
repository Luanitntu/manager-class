import { ref } from 'vue';

interface SnackbarState {
  show: boolean;
  text: string;
  color: 'success' | 'error' | 'info' | 'warning' | string;
}

const state = ref<SnackbarState>({
  show: false,
  text: '',
  color: 'success',
});

export function useSnackbar() {
  function show(text: string, color: SnackbarState['color'] = 'success') {
    state.value.text = text;
    state.value.color = color;
    state.value.show = true;
  }

  function success(text: string) {
    show(text, 'success');
  }

  function error(text: string) {
    show(text, 'error');
  }

  function warning(text: string) {
    show(text, 'warning');
  }

  function info(text: string) {
    show(text, 'info');
  }

  return {
    state,
    show,
    success,
    error,
    warning,
    info,
  };
}
