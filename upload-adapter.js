// Prepared FilePond adapter. Requires a real, reviewed upload backend.
export async function mountCargoUploader(input, serverAdapter, locale = 'ru') {
  if (!input || !serverAdapter?.process || !serverAdapter?.revert) {
    throw new Error('A file input and process/revert server adapter are required.');
  }
  if (!window.FilePond) {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'vendor/filepond/filepond.min.css';
    document.head.append(css);
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/filepond/filepond.min.js';
      script.onload = resolve; script.onerror = reject; document.head.append(script);
    });
  }
  return window.FilePond.create(input, {
    server: serverAdapter, allowMultiple: true, maxFiles: 5, instantUpload: false,
    labelIdle: locale === 'uz' ? 'Fayllarni shu yerga tashlang yoki <span class="filepond--label-action">tanlang</span>' : 'Перетащите файлы или <span class="filepond--label-action">выберите</span>',
    credits: false
  });
}
