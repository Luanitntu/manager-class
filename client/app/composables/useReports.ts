export function useReports() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();

  async function downloadReport(path: string, filename: string) {
    const blob = await $fetch<Blob>(path, {
      baseURL: config.public.apiBase,
      responseType: 'blob',
      headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {},
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return { downloadReport };
}
