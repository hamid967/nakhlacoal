/// <reference types="vite/client" />
/// <reference types="vite-imagetools/client" />


declare module "*&picture" {
  const out: {
    sources: Record<string, string>;
    img: { src: string; w: number; h: number };
  };
  export default out;
}
declare module "*?picture" {
  const out: {
    sources: Record<string, string>;
    img: { src: string; w: number; h: number };
  };
  export default out;
}
