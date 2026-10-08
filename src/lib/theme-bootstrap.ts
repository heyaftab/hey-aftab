// Apply a saved palette before first paint; new visitors start in the white theme.
// Accept the legacy spider alias but normalize it to the canonical ocean theme id.
export const THEME_BOOTSTRAP = `try{var t=localStorage.getItem("portfolio-theme");if(t==="spider")t="ocean";if(["night","ocean","light","alien"].includes(t))document.documentElement.dataset.theme=t}catch{}`;
