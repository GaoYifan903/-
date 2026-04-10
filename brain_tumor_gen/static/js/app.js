/**
 * 主应用逻辑：收集参数，调用后端，渲染结果
 */
document.getElementById("generateBtn").addEventListener("click", async () => {
  const btn = document.getElementById("generateBtn");
  const btnText = document.getElementById("btnText");
  const spinner = document.getElementById("btnSpinner");

  // 收集参数
  const payload = {
    mask_b64: window.getMaskBase64(),
    size_cm: parseFloat(document.getElementById("sizeSlider").value),
    shape: document.querySelector('input[name="shape"]:checked').value,
    grade: parseInt(document.getElementById("gradeSlider").value),
    edema_range: parseFloat(document.getElementById("edemaSlider").value),
    enhancement: document.getElementById("enhancementCheck").checked,
  };

  // 加载状态
  btn.disabled = true;
  btnText.textContent = "生成中...";
  spinner.classList.remove("hidden");

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.status !== "ok") {
      throw new Error(data.message || "生成失败");
    }

    // 渲染图像
    setImage("outputImg", data.image_b64);
    setImage("invasionImg", data.invasion_map_b64);
    setImage("heatmapImg", data.heatmap_b64);

    // 渲染报告
    renderReport(data.report);

  } catch (err) {
    alert("生成出错：" + err.message);
  } finally {
    btn.disabled = false;
    btnText.textContent = "生成图像";
    spinner.classList.add("hidden");
  }
});

function setImage(id, b64) {
  document.getElementById(id).src = "data:image/png;base64," + b64;
}

function renderReport(report) {
  const container = document.getElementById("reportContent");
  if (!report) return;

  const concepts = report["概念分析"] || {};
  const summary = report["生成条件摘要"] || {};
  const notes = report["注意事项"] || [];

  const conceptLabels = {
    "肿瘤核心活性": "tumor_core",
    "坏死程度": "necrosis",
    "水肿范围": "edema",
    "强化环特征": "enhancement_ring",
    "边界清晰度": "boundary_clarity",
    "占位效应": "mass_effect",
  };

  const conceptBars = Object.entries(concepts)
    .map(([name, val]) => {
      const pct = Math.round(parseFloat(val) * 100);
      return `
        <div class="concept-bar">
          <span class="label">${name}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="val">${pct}%</span>
        </div>`;
    })
    .join("");

  const risk = summary["侵袭风险"] || "";
  const metaRows = Object.entries(summary)
    .map(([k, v]) => {
      const display =
        k === "侵袭风险"
          ? `<span class="risk-badge risk-${v}">${v}</span>`
          : v;
      return `<div class="meta-row"><span class="key">${k}</span><span>${display}</span></div>`;
    })
    .join("");

  const noteItems = notes.map((n) => `<li>${n}</li>`).join("");

  container.innerHTML = `
    <div class="report-grid">
      <div class="report-card">
        <h4>概念分析</h4>
        ${conceptBars}
      </div>
      <div class="report-card">
        <h4>生成条件摘要</h4>
        ${metaRows}
      </div>
      <div class="report-card full">
        <h4>注意事项</h4>
        <ul class="notes-list">${noteItems}</ul>
      </div>
    </div>`;
}
