/**
 * 手绘 Mask 画布交互
 * 支持画笔、橡皮擦、清除
 */
(function () {
  const canvas = document.getElementById("maskCanvas");
  const ctx = canvas.getContext("2d");

  let isDrawing = false;
  let mode = "draw"; // "draw" | "erase"
  let brushSize = 18;

  // 初始化背景
  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ---- 工具按钮 ----
  document.getElementById("btnDraw").addEventListener("click", () => {
    mode = "draw";
    setActive("btnDraw");
  });

  document.getElementById("btnErase").addEventListener("click", () => {
    mode = "erase";
    setActive("btnErase");
  });

  document.getElementById("btnClear").addEventListener("click", () => {
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  function setActive(id) {
    ["btnDraw", "btnErase"].forEach((b) =>
      document.getElementById(b).classList.remove("active")
    );
    document.getElementById(id).classList.add("active");
  }

  // ---- 绘制逻辑 ----
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);

    ctx.beginPath();
    if (mode === "draw") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
    }
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  canvas.addEventListener("mousedown", (e) => { isDrawing = true; draw(e); });
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", () => (isDrawing = false));
  canvas.addEventListener("mouseleave", () => (isDrawing = false));

  // 触屏支持
  canvas.addEventListener("touchstart", (e) => { isDrawing = true; draw(e); }, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", () => (isDrawing = false));

  // 暴露获取 mask 的方法
  window.getMaskBase64 = function () {
    return canvas.toDataURL("image/png");
  };
})();
