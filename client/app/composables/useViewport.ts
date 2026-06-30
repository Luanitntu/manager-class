interface ViewportQuery {
  key: 'smAndUp' | 'mdAndUp' | 'lgAndUp' | 'xlAndUp';
  query: string;
}

const queries: ViewportQuery[] = [
  { key: 'smAndUp', query: '(min-width: 640px)' },
  { key: 'mdAndUp', query: '(min-width: 768px)' },
  { key: 'lgAndUp', query: '(min-width: 1024px)' },
  { key: 'xlAndUp', query: '(min-width: 1280px)' },
];

export function useViewport() {
  const smAndUp = ref(false);
  const mdAndUp = ref(false);
  const lgAndUp = ref(false);
  const xlAndUp = ref(false);

  const state = { smAndUp, mdAndUp, lgAndUp, xlAndUp };
  const cleanups: Array<() => void> = [];

  onMounted(() => {
    for (const { key, query } of queries) {
      const media = window.matchMedia(query);
      const update = () => {
        state[key].value = media.matches;
      };

      update();
      media.addEventListener('change', update);
      cleanups.push(() => media.removeEventListener('change', update));
    }
  });

  onUnmounted(() => {
    while (cleanups.length > 0) {
      cleanups.pop()?.();
    }
  });

  return {
    smAndUp: readonly(smAndUp),
    mdAndUp: readonly(mdAndUp),
    lgAndUp: readonly(lgAndUp),
    xlAndUp: readonly(xlAndUp),
  };
}
