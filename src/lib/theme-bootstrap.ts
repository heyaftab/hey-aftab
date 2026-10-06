// Keep this synchronous so the saved palette is applied before the first paint.
// Accept the legacy spider alias but normalize it back to the canonical ocean theme id.
export const THEME_BOOTSTRAP = `try{var t=localStorage.getItem("portfolio-theme");if(t==="spider")t="ocean";if(["night","ocean","light","alien"].includes(t))document.documentElement.dataset.theme=t}catch{}`;
