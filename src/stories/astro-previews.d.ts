declare module 'virtual:tkw-astro-logos' {
  const previews: import('./astro-logo-previews').AstroLogoPreviews;
  export default previews;
}

declare module 'virtual:tkw-astro-icons' {
  const previews: import('./components/astro-preview').AstroIconPreviews;
  export default previews;
}

declare module 'virtual:tkw-astro-brands' {
  const previews: import('./astro-brand-previews').AstroBrandPreviews;
  export default previews;
}
