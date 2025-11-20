// Allow importing SVG files as URLs in TypeScript/Vue files
// Usage: import logoUrl from '@/assets/foo.svg'
declare module '*.svg' {
  const src: string
  export default src
}
