export function _updateLegend() {
  if (!this.indicatorsDiv) return;

  this._series.forEach(({ def, enabled }) => {
    const itemId = `chart-indicators-item-${def.id}`;
    let item = document.getElementById(itemId);

    const opacity = enabled ? "1" : "0.4";
    const title = enabled ? "click to hide" : "click to show";
    const innerHTML =
      `<div class="chart-indicators-item-dot" style="background:${def.color}"></div>` +
      `<span>${def.label}</span>`;

    if (item) {
      item.style.opacity = opacity;
      item.title = title;
      item.innerHTML = innerHTML;
    } else {
      item = document.createElement("div");
      item.id = itemId;
      item.className = "chart-indicators-item";
      item.style.cursor = "pointer";
      item.style.opacity = opacity;
      item.title = title;
      item.innerHTML = innerHTML;

      item.addEventListener("click", () => {
        this.toggleSeries(def.id);
      });

      this.indicatorsDiv.appendChild(item);
    }
  });
}
