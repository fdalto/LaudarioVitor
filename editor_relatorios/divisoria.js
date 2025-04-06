
document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  const resizer = document.getElementById("resizer");

  let isResizing = false;

  resizer.addEventListener("mousedown", (e) => {
    isResizing = true;
    document.body.style.cursor = "col-resize";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;

    let newWidth = e.clientX;
    const minWidth = 100;
    const maxWidth = 500;

    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;

    menu.style.width = newWidth + "px";
    localStorage.setItem("menuWidth", newWidth + "px");
  });

  document.addEventListener("mouseup", () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = "default";
    }
  });

  // Restaurar largura salva
  const savedWidth = localStorage.getItem("menuWidth");
  if (savedWidth) {
    menu.style.width = savedWidth;
  }
});
