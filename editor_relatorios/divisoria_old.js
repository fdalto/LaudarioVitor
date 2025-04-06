document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("menu");
    const editor = document.getElementById("relatorio");
    const container = document.getElementById("container");
  
    if (!menu || !editor || !container) return;
  
    const resizer = document.createElement("div");
  
    // Estilo da divisória
    Object.assign(resizer.style, {
      width: "5px",
      cursor: "col-resize",
      background: "#ccc",
      position: "absolute",
      top: "0",
      bottom: "0",
      zIndex: "10"
    });
  
    resizer.id = "resizer";
  
    // Container pai precisa ser relativo
    container.style.position = "relative";
    container.appendChild(resizer);
  
    // Aplicar largura salva
    const savedWidth = localStorage.getItem("menuWidth");
    if (savedWidth) {
      menu.style.width = savedWidth;
    }
  
    // Posicionar a divisória
    function positionResizer() {
      resizer.style.left = menu.offsetWidth + "px";
    }
    positionResizer();
  
    let isResizing = false;
  
    resizer.addEventListener("mousedown", (e) => {
      isResizing = true;
      document.body.style.cursor = "col-resize";
      e.preventDefault();
    });
  
    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      const containerRect = container.getBoundingClientRect();
      let newWidth = e.clientX - containerRect.left;
      if (newWidth < 100) newWidth = 100;
      if (newWidth > 500) newWidth = 500;
  
      menu.style.width = newWidth + "px";
      positionResizer();
    });
  
    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false;
        localStorage.setItem("menuWidth", menu.style.width);
        document.body.style.cursor = "default";
      }
    });
  });
  