/** 成功したデータは共有し、HTTP・JSON読み込み失敗時は次のfetchで再試行する。 */
export function createAstroPreviewLoader<T>(url: string) {
  let pending: Promise<T> | undefined;
  return () => pending ??= fetch(url, { cache: 'no-store' }).then(async response => {
    if (!response.ok) throw new Error(`Astroプレビューの読み込みに失敗しました: ${response.status}`);
    return await response.json() as T;
  }).catch(error => { pending = undefined; throw error; });
}
