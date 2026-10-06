// Keep this synchronous so the saved palette is applied before the first paint.
export const THEME_BOOTSTRAP = `try{var t=localStorage.getItem("portfolio-theme");if(["night","ocean","light","alien"].includes(t))document.documentElement.dataset.theme=t}catch{}`;
