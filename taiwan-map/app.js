(() => {
  "use strict";

  const ARCGIS_ORG_KEY = "pWOzKKRuqCsyMitB";
  const TILE_SERVICE_ROOT =
    `https://tiles.arcgis.com/tiles/${ARCGIS_ORG_KEY}/arcgis/rest/services`;
  const COUNTY_BOUNDARY_URL =
    `https://services3.arcgis.com/${ARCGIS_ORG_KEY}/arcgis/rest/services/` +
    "TW_MainIsland_County_Boundaries/FeatureServer/0/query" +
    "?where=1%3D1&outFields=COUNTY_ID%2CCOUNTY_NAME%2CCOUNTY_SLUG%2CAREA_KM2" +
    "&returnGeometry=true&outSR=4326&f=geojson";
  const TAIWAN_BOUNDS = [
    [21.72, 119.88],
    [25.48, 122.18]
  ];
  const TRANSPARENT_TILE =
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  const COUNTIES = [
    { name: "臺北市", slug: "Taipei_City", code: "63000" },
    { name: "新北市", slug: "New_Taipei_City", code: "65000" },
    { name: "基隆市", slug: "Keelung_City", code: "10017" },
    { name: "桃園市", slug: "Taoyuan_City", code: "68000" },
    { name: "新竹市", slug: "Hsinchu_City", code: "10018" },
    { name: "新竹縣", slug: "Hsinchu_County", code: "10004" },
    { name: "苗栗縣", slug: "Miaoli_County", code: "10005" },
    { name: "臺中市", slug: "Taichung_City", code: "66000" },
    { name: "彰化縣", slug: "Changhua_County", code: "10007" },
    { name: "南投縣", slug: "Nantou_County", code: "10008" },
    { name: "雲林縣", slug: "Yunlin_County", code: "10009" },
    { name: "嘉義市", slug: "Chiayi_City", code: "10020" },
    { name: "嘉義縣", slug: "Chiayi_County", code: "10010" },
    { name: "臺南市", slug: "Tainan_City", code: "67000" },
    { name: "高雄市", slug: "Kaohsiung_City", code: "64000" },
    { name: "屏東縣", slug: "Pingtung_County", code: "10013" },
    { name: "宜蘭縣", slug: "Yilan_County", code: "10002" },
    { name: "花蓮縣", slug: "Hualien_County", code: "10015" },
    { name: "臺東縣", slug: "Taitung_County", code: "10014" }
  ];

  const LAYERS = [
    {
      id: "LST",
      title: "2025年夏季地表溫度合成圖",
      shortTitle: "地表溫度",
      category: "heat",
      description:
        "Landsat 8–9 Collection 2 Level-2 地表溫度夏季合成，單位為攝氏度。",
      unit: "°C",
      serviceSuffix: "LST",
      defaultOpacity: 0.78,
      gradient:
        "linear-gradient(90deg,#243c88 0%,#3187bc 22%,#68c4b8 42%,#f2df70 63%,#ef8b45 82%,#bb2633 100%)",
      scaleLabels: ["較低", "中等", "較高"]
    },
    {
      id: "RELATIVE_HEAT",
      title: "相對地表熱異常",
      shortTitle: "相對熱異常",
      category: "heat",
      description:
        "以各景平均地表溫度與標準差標準化的相對熱異常，0 為各景平均。",
      unit: "Z",
      serviceSuffix: "RELATIVE_HEAT",
      defaultOpacity: 0.72,
      gradient:
        "linear-gradient(90deg,#254b9b 0%,#7db6d8 27%,#f7f7f2 50%,#f3a05b 73%,#b62932 100%)",
      scaleLabels: ["低於平均", "0", "高於平均"]
    },
    {
      id: "HEAT_CLASS",
      title: "相對地表熱異常分級",
      shortTitle: "熱異常分級",
      category: "heat",
      description:
        "依相對地表熱異常 Z 值分為五級；數值越高代表相對熱異常越強。",
      unit: "級",
      serviceSuffix: "HEAT_CLASS",
      defaultOpacity: 0.76,
      classes: [
        { color: "#2f7fb5", label: "1｜無明顯熱異常" },
        { color: "#82bdd4", label: "2｜輕微熱異常" },
        { color: "#f4d980", label: "3｜中度熱異常" },
        { color: "#ef764d", label: "4｜高度熱異常" },
        { color: "#b3132b", label: "5｜極高度熱異常" }
      ]
    },
    {
      id: "NDVI",
      title: "2025年夏季NDVI合成圖",
      shortTitle: "NDVI",
      category: "vegetation",
      description:
        "由 Landsat 地表反射率估算的常態化差異植生指數，值域為 -1 至 1。",
      unit: "NDVI",
      serviceSuffix: "NDVI",
      defaultOpacity: 0.78,
      gradient:
        "linear-gradient(90deg,#8e5b3c 0%,#d8b86a 24%,#ece8ba 45%,#8fc46a 68%,#1f6a3a 100%)",
      scaleLabels: ["-1", "0", "1"]
    },
    {
      id: "FVC_PERCENT",
      title: "2025年夏季植物覆蓋率估算",
      shortTitle: "植物覆蓋率",
      category: "vegetation",
      description:
        "由 NDVI 像元二分模型估算的植物覆蓋率；屬遙測估算值，非地面實測。",
      unit: "%",
      serviceSuffix: "FVC_PERCENT",
      defaultOpacity: 0.76,
      gradient:
        "linear-gradient(90deg,#f2e7b5 0%,#c8da8a 25%,#87bf64 50%,#3f9850 75%,#0f5f3b 100%)",
      scaleLabels: ["0%", "50%", "100%"]
    },
    {
      id: "FVC_CLASS",
      title: "植物覆蓋率分級",
      shortTitle: "覆蓋率分級",
      category: "vegetation",
      description:
        "將估算植物覆蓋率依 20% 間距分為五級，數值越高代表覆蓋率越高。",
      unit: "級",
      serviceSuffix: "FVC_CLASS",
      defaultOpacity: 0.78,
      classes: [
        { color: "#e8d9a8", label: "1｜極低（0–20%）" },
        { color: "#bed07c", label: "2｜低（>20–40%）" },
        { color: "#80b95f", label: "3｜中等（>40–60%）" },
        { color: "#3f914d", label: "4｜高（>60–80%）" },
        { color: "#145b38", label: "5｜極高（>80–100%）" }
      ]
    }
  ];

  const BASEMAPS = [
    {
      id: "topographic",
      title: "地形底圖",
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/" +
        "MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles © Esri"
    },
    {
      id: "light",
      title: "淺色底圖",
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/" +
        "World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles © Esri"
    },
    {
      id: "imagery",
      title: "衛星影像",
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/" +
        "MapServer/tile/{z}/{y}/{x}",
      attribution: "Imagery © Esri"
    },
    {
      id: "streets",
      title: "街道底圖",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors"
    }
  ];

  const query = new URLSearchParams(window.location.search);
  const requestedRegion = query.get("region");
  const requestedLayers = (query.get("layers") || "LST").split(",");
  const defaultOpacity = Object.fromEntries(
    LAYERS.map((layer) => [layer.id, layer.defaultOpacity])
  );

  const state = {
    regionSlug:
      requestedRegion &&
      COUNTIES.some((county) => county.slug === requestedRegion)
        ? requestedRegion
        : "taiwan",
    activeLayers: requestedLayers.filter((id, index, values) => {
      return LAYERS.some((layer) => layer.id === id) &&
        values.indexOf(id) === index;
    }),
    opacity: { ...defaultOpacity },
    basemapId: "topographic",
    panelOpen: true,
    panelTab: "catalog",
    expandedLayer: "LST",
    sectionOpen: { heat: true, vegetation: true },
    boundaryReady: false,
    boundaryError: false
  };
  if (!state.activeLayers.length) state.activeLayers = ["LST"];

  const workspace = document.getElementById("workspace");
  const panel = document.getElementById("layer-panel");
  const panelToggle = document.getElementById("panel-toggle");
  const basemapSelect = document.getElementById("basemap-select");
  const mapStatusText = document.getElementById("map-status-text");
  const aboutModal = document.getElementById("about-modal");

  let map;
  let basemapLayer;
  let boundaryLayer;
  let tileGeneration = 0;
  let tileLoadTimer;
  let renderedRegion = null;
  const countyBounds = new Map();
  const operationalLayers = new Map();

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function layerById(id) {
    return LAYERS.find((layer) => layer.id === id);
  }

  function selectedCounty() {
    return COUNTIES.find((county) => county.slug === state.regionSlug);
  }

  function serviceName(countySlug, layer) {
    return `TW_${countySlug}_${layer.serviceSuffix}_2025`;
  }

  function tileUrl(countySlug, layer) {
    return (
      `${TILE_SERVICE_ROOT}/${serviceName(countySlug, layer)}` +
      "/MapServer/tile/{z}/{y}/{x}"
    );
  }

  function iconForCategory(category) {
    return category === "heat" ? "♨" : "⌁";
  }

  function legendHtml(layer) {
    if (layer.classes) {
      return `
        <div class="class-legend" aria-label="${escapeHtml(layer.shortTitle)}圖例">
          ${layer.classes
            .map(
              (entry) => `
                <div class="legend-class-row">
                  <span class="legend-swatch" style="background-color:${entry.color}"></span>
                  <span>${escapeHtml(entry.label)}</span>
                </div>`
            )
            .join("")}
          <div class="legend-nodata">
            <span class="nodata-swatch"></span>
            NoData／雲遮罩：透明
          </div>
        </div>`;
    }

    return `
      <div class="gradient-legend" aria-label="${escapeHtml(layer.shortTitle)}圖例">
        <div class="gradient-ramp" style="background-image:${layer.gradient}"></div>
        <div class="gradient-labels">
          ${layer.scaleLabels
            .map((label) => `<span>${escapeHtml(label)}</span>`)
            .join("")}
        </div>
        <div class="legend-nodata">
          <span class="nodata-swatch"></span>
          NoData／雲遮罩：透明
        </div>
      </div>`;
  }

  function layerItemHtml(layer) {
    const active = state.activeLayers.includes(layer.id);
    const expanded = state.expandedLayer === layer.id;
    return `
      <article class="layer-item ${active ? "is-active" : ""}">
        <div class="layer-item-main">
          <label class="layer-check">
            <input
              type="checkbox"
              data-input="toggle-layer"
              data-layer="${layer.id}"
              ${active ? "checked" : ""}
            />
            <span class="custom-check">${active ? "✓" : ""}</span>
            <span class="layer-glyph ${layer.category}" aria-hidden="true">
              ${iconForCategory(layer.category)}
            </span>
            <span class="layer-copy">
              <strong>${escapeHtml(layer.shortTitle)}</strong>
              <small>${escapeHtml(layer.title)}</small>
            </span>
          </label>
          <button
            type="button"
            class="expand-layer"
            data-action="expand-layer"
            data-layer="${layer.id}"
            aria-expanded="${expanded}"
            aria-label="展開${escapeHtml(layer.shortTitle)}說明"
          >⌄</button>
        </div>
        ${
          expanded
            ? `<div class="layer-detail">
                <p>${escapeHtml(layer.description)}</p>
                ${legendHtml(layer)}
                ${
                  active
                    ? `<label class="opacity-control">
                        <span>
                          圖層不透明度
                          <strong data-opacity-value="${layer.id}">${Math.round(
                            state.opacity[layer.id] * 100
                          )}%</strong>
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value="${Math.round(state.opacity[layer.id] * 100)}"
                          data-input="opacity"
                          data-layer="${layer.id}"
                          aria-label="${escapeHtml(layer.shortTitle)}不透明度"
                        />
                      </label>`
                    : ""
                }
              </div>`
            : ""
        }
      </article>`;
  }

  function sectionHtml(category, title, subtitle) {
    const open = state.sectionOpen[category];
    return `
      <section class="layer-section">
        <button
          type="button"
          class="section-heading"
          data-action="toggle-section"
          data-section="${category}"
          aria-expanded="${open}"
        >
          <span class="section-icon ${category}" aria-hidden="true">
            ${iconForCategory(category)}
          </span>
          <span>
            <strong>${title}</strong>
            <small>${subtitle}</small>
          </span>
          <span class="${open ? "rotated" : ""}" aria-hidden="true">⌃</span>
        </button>
        ${
          open
            ? `<div class="section-layers">
                ${LAYERS.filter((layer) => layer.category === category)
                  .map(layerItemHtml)
                  .join("")}
              </div>`
            : ""
        }
      </section>`;
  }

  function selectedLayerHtml(layer) {
    const index = state.activeLayers.indexOf(layer.id);
    return `
      <article class="selected-card">
        <div class="selected-card-heading">
          <span class="layer-glyph ${layer.category}" aria-hidden="true">
            ${iconForCategory(layer.category)}
          </span>
          <div>
            <strong>${escapeHtml(layer.shortTitle)}</strong>
            <small>${escapeHtml(layer.unit)}</small>
          </div>
          <div class="order-controls">
            <button
              type="button"
              data-action="move-layer"
              data-layer="${layer.id}"
              data-direction="1"
              ${index === state.activeLayers.length - 1 ? "disabled" : ""}
              aria-label="將${escapeHtml(layer.shortTitle)}上移"
            >↑</button>
            <button
              type="button"
              data-action="move-layer"
              data-layer="${layer.id}"
              data-direction="-1"
              ${index === 0 ? "disabled" : ""}
              aria-label="將${escapeHtml(layer.shortTitle)}下移"
            >↓</button>
            <button
              type="button"
              data-action="remove-layer"
              data-layer="${layer.id}"
              aria-label="移除${escapeHtml(layer.shortTitle)}"
            >×</button>
          </div>
        </div>
        ${legendHtml(layer)}
        <label class="opacity-control selected-opacity">
          <span>
            圖層不透明度
            <strong data-opacity-value="${layer.id}">${Math.round(
              state.opacity[layer.id] * 100
            )}%</strong>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value="${Math.round(state.opacity[layer.id] * 100)}"
            data-input="opacity"
            data-layer="${layer.id}"
            aria-label="${escapeHtml(layer.shortTitle)}不透明度"
          />
        </label>
      </article>`;
  }

  function renderPanel() {
    const county = selectedCounty();
    const selectedLayers = state.activeLayers
      .map(layerById)
      .filter(Boolean)
      .reverse();

    panel.innerHTML = `
      <div class="panel-handle" aria-hidden="true"></div>
      <div class="panel-header">
        <div>
          <span class="panel-kicker">瀏覽範圍</span>
          <h2><span aria-hidden="true">⌖</span>${escapeHtml(
            county ? county.name : "台灣本島"
          )}</h2>
        </div>
        <button
          type="button"
          class="icon-ghost panel-close-mobile"
          data-action="toggle-panel"
          aria-label="關閉圖層面板"
        >×</button>
      </div>

      <div class="region-switcher">
        <button
          type="button"
          class="${state.regionSlug === "taiwan" ? "active" : ""}"
          data-action="set-region"
          data-region="taiwan"
        >全台灣本島</button>
        <button
          type="button"
          class="${state.regionSlug !== "taiwan" ? "active" : ""}"
          data-action="county-mode"
        >選擇縣市</button>
      </div>

      <label class="county-select">
        <span>行政區</span>
        <select data-input="region" aria-label="選擇台灣本島行政區">
          <option value="taiwan" ${
            state.regionSlug === "taiwan" ? "selected" : ""
          }>全台灣本島（19 縣市）</option>
          ${COUNTIES.map(
            (item) =>
              `<option value="${item.slug}" ${
                item.slug === state.regionSlug ? "selected" : ""
              }>${escapeHtml(item.name)}</option>`
          ).join("")}
        </select>
      </label>

      <div class="panel-tabs">
        <button
          type="button"
          aria-pressed="${state.panelTab === "catalog"}"
          class="${state.panelTab === "catalog" ? "active" : ""}"
          data-action="set-tab"
          data-tab="catalog"
        >
          <span aria-hidden="true">▱</span>
          圖層選擇
        </button>
        <button
          type="button"
          aria-pressed="${state.panelTab === "selected"}"
          class="${state.panelTab === "selected" ? "active" : ""}"
          data-action="set-tab"
          data-tab="selected"
        >
          <span aria-hidden="true">☷</span>
          已選圖層
          <span class="count-badge">${state.activeLayers.length}</span>
        </button>
      </div>

      <div class="panel-scroll">
        ${
          state.activeLayers.length > 2
            ? `<div class="overlay-tip">
                <span aria-hidden="true">ⓘ</span>
                已套疊 ${state.activeLayers.length} 層。若下方圖層不明顯，請降低上層不透明度。
              </div>`
            : ""
        }
        ${
          state.panelTab === "catalog"
            ? `<div class="catalog-view">
                ${sectionHtml(
                  "heat",
                  "溫度與熱異常",
                  "地表溫度、相對熱異常與五級分級"
                )}
                ${sectionHtml(
                  "vegetation",
                  "植生與綠覆蓋",
                  "NDVI、植物覆蓋率估算與五級分級"
                )}
                <div class="source-card">
                  <span aria-hidden="true">▦</span>
                  <div>
                    <strong>資料來源與範圍</strong>
                    <p>
                      USGS Landsat 8–9 Collection 2 Level-2，2025/06–09；
                      僅呈現台灣本島，雲、雲影、水體與原始缺值維持透明。
                    </p>
                  </div>
                </div>
              </div>`
            : `<div class="selected-view">
                <div class="selected-toolbar">
                  <span>最上方圖層會優先顯示</span>
                  <button
                    type="button"
                    data-action="clear-layers"
                    ${state.activeLayers.length ? "" : "disabled"}
                  >⌫ 全部清除</button>
                </div>
                ${
                  selectedLayers.length
                    ? `<div class="selected-list">
                        ${selectedLayers.map(selectedLayerHtml).join("")}
                      </div>`
                    : `<div class="empty-state">
                        <span class="empty-state-icon" aria-hidden="true">▱</span>
                        <strong>尚未選擇圖層</strong>
                        <p>回到「圖層選擇」勾選想要觀看的資料。</p>
                        <button type="button" data-action="set-tab" data-tab="catalog">
                          開始選擇圖層
                        </button>
                      </div>`
                }
              </div>`
        }
      </div>

      <div class="panel-footer">
        <span class="${state.boundaryReady ? "ready" : ""}">
          <span class="status-dot"></span>
          ${
            state.boundaryReady
              ? "縣市界已連線"
              : state.boundaryError
                ? "縣市界連線失敗"
                : "縣市界連線中"
          }
        </span>
        <button
          type="button"
          data-action="${state.boundaryError ? "reload-page" : "reset"}"
        >↻ ${state.boundaryError ? "重試連線" : "重設"}</button>
      </div>`;
  }

  function updateUrl() {
    const params = new URLSearchParams(window.location.search);
    if (state.regionSlug === "taiwan") params.delete("region");
    else params.set("region", state.regionSlug);
    if (
      state.activeLayers.length === 1 &&
      state.activeLayers[0] === "LST"
    ) {
      params.delete("layers");
    } else {
      params.set("layers", state.activeLayers.join(","));
    }
    const value = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${value ? `?${value}` : ""}`
    );
  }

  function viewPadding() {
    if (window.innerWidth < 768 && state.panelOpen) {
      const panelHeight =
        panel.getBoundingClientRect().height || window.innerHeight * 0.58;
      return {
        paddingTopLeft: [18, 18],
        paddingBottomRight: [
          18,
          Math.min(panelHeight + 18, window.innerHeight * 0.72)
        ]
      };
    }
    if (window.innerWidth < 1100 && state.panelOpen) {
      const panelWidth = panel.getBoundingClientRect().width || 390;
      return {
        paddingTopLeft: [20, 20],
        paddingBottomRight: [panelWidth + 12, 35]
      };
    }
    return { paddingTopLeft: [22, 22], paddingBottomRight: [22, 40] };
  }

  function fitRegion(slug = state.regionSlug) {
    if (!map) return;
    const target =
      slug === "taiwan"
        ? boundaryLayer && boundaryLayer.getBounds()
        : countyBounds.get(slug);
    const padding = viewPadding();
    if (target && target.isValid()) {
      map.fitBounds(target.pad(slug === "taiwan" ? 0.055 : 0.13), {
        ...padding,
        maxZoom: slug === "taiwan" ? 8.25 : 11.5
      });
    } else {
      map.fitBounds(TAIWAN_BOUNDS, { ...padding, maxZoom: 8 });
    }
  }

  function updatePanelState() {
    if (!state.panelOpen && panel.contains(document.activeElement)) {
      panelToggle.focus();
    }
    workspace.classList.toggle("panel-is-open", state.panelOpen);
    panel.classList.toggle("is-open", state.panelOpen);
    panelToggle.classList.toggle("is-open", state.panelOpen);
    panelToggle.setAttribute(
      "aria-label",
      state.panelOpen ? "收合圖層面板" : "展開圖層面板"
    );
    panelToggle.setAttribute("aria-expanded", String(state.panelOpen));
    panel.setAttribute("aria-hidden", String(!state.panelOpen));
    panel.inert = !state.panelOpen;
    panelToggle.firstElementChild.textContent = state.panelOpen ? "›" : "‹";
    window.setTimeout(() => {
      map.invalidateSize({ pan: false });
      fitRegion();
    }, 280);
  }

  function setMapStatus(text) {
    mapStatusText.textContent = text;
  }

  function setRegion(slug) {
    if (
      slug !== "taiwan" &&
      !COUNTIES.some((county) => county.slug === slug)
    ) {
      return;
    }
    state.regionSlug = slug;
    renderPanel();
    updateUrl();
    updateOperationalLayers();
    window.setTimeout(() => fitRegion(), 50);
  }

  function updateBasemap() {
    if (!map) return;
    const definition = BASEMAPS.find(
      (basemap) => basemap.id === state.basemapId
    );
    if (!definition) return;
    if (basemapLayer) map.removeLayer(basemapLayer);
    basemapLayer = L.tileLayer(definition.url, {
      minZoom: 7,
      maxZoom: 18,
      maxNativeZoom: 18,
      attribution: definition.attribution
    }).addTo(map);
    basemapLayer.bringToBack();
  }

  function updateOperationalLayers() {
    if (!map) return;
    if (!state.boundaryReady) {
      setMapStatus("正在連線縣市界…");
      return;
    }
    tileGeneration += 1;
    const generation = tileGeneration;
    window.clearTimeout(tileLoadTimer);

    const regionChanged = renderedRegion !== state.regionSlug;
    if (regionChanged) {
      operationalLayers.forEach((layers) => {
        layers.forEach((layer) => map.removeLayer(layer));
      });
      operationalLayers.clear();
      renderedRegion = state.regionSlug;
    }

    if (!state.activeLayers.length) {
      operationalLayers.forEach((layers) => {
        layers.forEach((layer) => map.removeLayer(layer));
      });
      operationalLayers.clear();
      setMapStatus("尚未選擇分析圖層");
      return;
    }

    const desiredLayers = new Set(state.activeLayers);
    operationalLayers.forEach((layers, layerId) => {
      if (!desiredLayers.has(layerId)) {
        layers.forEach((layer) => map.removeLayer(layer));
        operationalLayers.delete(layerId);
      }
    });

    const counties =
      state.regionSlug === "taiwan"
        ? COUNTIES
        : COUNTIES.filter((county) => county.slug === state.regionSlug);
    let tileSuccesses = 0;
    let tileErrors = 0;
    let addedLayerTypes = 0;

    state.activeLayers.forEach((layerId, order) => {
      const definition = layerById(layerId);
      if (!definition) return;
      const paneName = `raster-${layerId.toLowerCase()}`;
      let pane = map.getPane(paneName);
      if (!pane) pane = map.createPane(paneName);
      pane.style.zIndex = String(330 + order * 20);
      pane.style.pointerEvents = "none";

      if (operationalLayers.has(layerId)) {
        operationalLayers
          .get(layerId)
          .forEach((layer) => layer.setOpacity(state.opacity[layerId]));
        return;
      }

      addedLayerTypes += 1;
      const layers = counties.map((county) => {
        const bounds = countyBounds.get(county.slug);
        const tileLayer = L.tileLayer(tileUrl(county.slug, definition), {
          pane: paneName,
          opacity: state.opacity[layerId],
          bounds,
          minZoom: 7,
          maxZoom: 16,
          minNativeZoom: 8,
          maxNativeZoom: 13,
          tileSize: 256,
          errorTileUrl: TRANSPARENT_TILE,
          updateWhenIdle: true,
          keepBuffer: 1,
          attribution: "USGS Landsat 8–9 · 本專案分析"
        });
        tileLayer.on("tileload", () => {
          if (generation !== tileGeneration) return;
          tileSuccesses += 1;
          if (tileSuccesses === 1) {
            setMapStatus(
              state.regionSlug === "taiwan"
                ? `正在顯示全台圖磚 · ${state.activeLayers.length} 個主題`
                : `正在顯示${county.name}圖磚`
            );
          }
        });
        tileLayer.on("tileerror", () => {
          if (generation === tileGeneration) tileErrors += 1;
        });
        tileLayer.addTo(map);
        return tileLayer;
      });
      operationalLayers.set(layerId, layers);
    });

    if (addedLayerTypes > 0) {
      setMapStatus("正在載入公開圖磚…");
      tileLoadTimer = window.setTimeout(() => {
        if (generation !== tileGeneration) return;
        if (tileSuccesses > 0) {
          setMapStatus(
            tileErrors > 0
              ? `圖磚已顯示 · ${tileErrors} 個快取請求未取得`
              : `圖磚已顯示 · ${state.activeLayers.length} 個主題`
          );
        } else {
          setMapStatus("公開圖磚尚未回應，請稍後重新勾選圖層");
        }
      }, 6000);
    } else {
      setMapStatus(`已顯示 ${state.activeLayers.length} 個主題`);
    }

    if (boundaryLayer) boundaryLayer.bringToFront();
  }

  function updateLayerOrder() {
    if (!map) return;
    state.activeLayers.forEach((layerId, order) => {
      const pane = map.getPane(`raster-${layerId.toLowerCase()}`);
      if (pane) pane.style.zIndex = String(330 + order * 20);
    });
    boundaryLayer?.bringToFront();
    setMapStatus(`已調整 ${state.activeLayers.length} 個圖層的套疊順序`);
  }

  function setLayerOpacity(layerId, value) {
    state.opacity[layerId] = value;
    const layers = operationalLayers.get(layerId) || [];
    layers.forEach((layer) => layer.setOpacity(value));
    document
      .querySelectorAll(`[data-opacity-value="${layerId}"]`)
      .forEach((node) => {
        node.textContent = `${Math.round(value * 100)}%`;
      });
  }

  function toggleLayer(layerId) {
    if (state.activeLayers.includes(layerId)) {
      state.activeLayers = state.activeLayers.filter((id) => id !== layerId);
    } else {
      state.activeLayers.push(layerId);
    }
    state.expandedLayer = layerId;
    renderPanel();
    updateUrl();
    updateOperationalLayers();
  }

  function moveLayer(layerId, direction) {
    const index = state.activeLayers.indexOf(layerId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= state.activeLayers.length) {
      return;
    }
    const next = [...state.activeLayers];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    state.activeLayers = next;
    renderPanel();
    updateUrl();
    updateLayerOrder();
  }

  function resetState() {
    state.regionSlug = "taiwan";
    state.activeLayers = ["LST"];
    state.opacity = { ...defaultOpacity };
    state.basemapId = "topographic";
    state.panelTab = "catalog";
    state.expandedLayer = "LST";
    basemapSelect.value = state.basemapId;
    renderPanel();
    updateUrl();
    updateBasemap();
    updateOperationalLayers();
    fitRegion("taiwan");
  }

  function openAbout() {
    aboutModal.hidden = false;
    document.body.dataset.modalOpen = "true";
    document.querySelector(".site-header").inert = true;
    workspace.inert = true;
    aboutModal.querySelector(".modal-close").focus();
  }

  function closeAbout() {
    aboutModal.hidden = true;
    delete document.body.dataset.modalOpen;
    document.querySelector(".site-header").inert = false;
    workspace.inert = false;
    document.querySelector('[data-action="about"]')?.focus();
  }

  function handleAction(button) {
    const action = button.dataset.action;
    if (action === "toggle-panel") {
      state.panelOpen = !state.panelOpen;
      updatePanelState();
      return;
    }
    if (action === "fit-taiwan") {
      fitRegion("taiwan");
      return;
    }
    if (action === "fit-region") {
      fitRegion();
      return;
    }
    if (action === "about") {
      openAbout();
      return;
    }
    if (action === "close-about") {
      closeAbout();
      return;
    }
    if (action === "set-region") {
      setRegion(button.dataset.region);
      return;
    }
    if (action === "county-mode") {
      setRegion(
        state.regionSlug === "taiwan" ? "Taipei_City" : state.regionSlug
      );
      return;
    }
    if (action === "set-tab") {
      state.panelTab = button.dataset.tab;
      renderPanel();
      return;
    }
    if (action === "toggle-section") {
      const section = button.dataset.section;
      state.sectionOpen[section] = !state.sectionOpen[section];
      renderPanel();
      return;
    }
    if (action === "expand-layer") {
      const layerId = button.dataset.layer;
      state.expandedLayer =
        state.expandedLayer === layerId ? null : layerId;
      renderPanel();
      return;
    }
    if (action === "remove-layer") {
      toggleLayer(button.dataset.layer);
      return;
    }
    if (action === "move-layer") {
      moveLayer(button.dataset.layer, Number(button.dataset.direction));
      return;
    }
    if (action === "clear-layers") {
      state.activeLayers = [];
      renderPanel();
      updateUrl();
      updateOperationalLayers();
      return;
    }
    if (action === "reset") {
      resetState();
      return;
    }
    if (action === "reload-page") {
      window.location.reload();
    }
  }

  function initializeMap() {
    if (!window.L) {
      document.getElementById("map").innerHTML =
        '<div class="map-load-error">地圖程式載入失敗，請確認網路連線後重新整理。</div>';
      setMapStatus("地圖程式載入失敗");
      return;
    }

    map = L.map("map", {
      center: [23.72, 120.96],
      zoom: 8,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      minZoom: 7,
      maxZoom: 16,
      maxBounds: TAIWAN_BOUNDS,
      maxBoundsViscosity: 1,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true
    });
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    L.control
      .scale({
        position: "bottomleft",
        metric: true,
        imperial: false,
        maxWidth: 150
      })
      .addTo(map);

    const boundaryPane = map.createPane("boundary");
    boundaryPane.style.zIndex = "650";
    map.fitBounds(TAIWAN_BOUNDS, { padding: [20, 20], maxZoom: 8 });

    updateBasemap();
    setMapStatus("正在連線縣市界…");

    fetch(COUNTY_BOUNDARY_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Boundary service returned ${response.status}`);
        }
        return response.json();
      })
      .then((featureCollection) => {
        boundaryLayer = L.geoJSON(featureCollection, {
          pane: "boundary",
          style: {
            color: "#123b54",
            weight: 1.15,
            opacity: 0.86,
            fillColor: "#6ed7cf",
            fillOpacity: 0.015
          },
          onEachFeature: (feature, layer) => {
            const properties = feature.properties || {};
            const normalizedName = String(
              properties.COUNTY_NAME || ""
            ).replace("台", "臺");
            const slug =
              properties.COUNTY_SLUG ||
              COUNTIES.find((county) => county.name === normalizedName)?.slug;
            const county = COUNTIES.find((item) => item.slug === slug);
            const name = properties.COUNTY_NAME || county?.name || "行政區";
            const area = Number(properties.AREA_KM2);
            layer.bindTooltip(
              `<strong>${escapeHtml(name)}</strong>${
                Number.isFinite(area)
                  ? `<br><span>${area.toLocaleString("zh-TW", {
                      maximumFractionDigits: 1
                    })} km²</span>`
                  : ""
              }`,
              { sticky: true, className: "county-tooltip" }
            );
            layer.on("click", () => {
              if (slug) setRegion(slug);
            });
            if (slug && typeof layer.getBounds === "function") {
              countyBounds.set(slug, layer.getBounds());
            }
          }
        }).addTo(map);
        if (countyBounds.size !== COUNTIES.length) {
          map.removeLayer(boundaryLayer);
          boundaryLayer = null;
          throw new Error(
            `County boundary service returned ${countyBounds.size} of ${COUNTIES.length} counties`
          );
        }
        state.boundaryReady = true;
        state.boundaryError = false;
        renderPanel();
        updateOperationalLayers();
        fitRegion();
      })
      .catch((error) => {
        console.warn("County boundary unavailable:", error);
        state.boundaryReady = false;
        state.boundaryError = true;
        renderPanel();
        setMapStatus("縣市界載入失敗，請重新整理後再試");
      });
  }

  BASEMAPS.forEach((basemap) => {
    const option = document.createElement("option");
    option.value = basemap.id;
    option.textContent = basemap.title;
    basemapSelect.append(option);
  });
  basemapSelect.value = state.basemapId;
  basemapSelect.addEventListener("change", (event) => {
    state.basemapId = event.target.value;
    updateBasemap();
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (button) handleAction(button);
  });

  panel.addEventListener("change", (event) => {
    const target = event.target;
    if (target.dataset.input === "toggle-layer") {
      toggleLayer(target.dataset.layer);
    } else if (target.dataset.input === "region") {
      setRegion(target.value);
    }
  });

  panel.addEventListener("input", (event) => {
    const target = event.target;
    if (target.dataset.input === "opacity") {
      setLayerOpacity(target.dataset.layer, Number(target.value) / 100);
    }
  });

  aboutModal.addEventListener("mousedown", (event) => {
    if (event.target === aboutModal) closeAbout();
  });

  window.addEventListener("keydown", (event) => {
    if (aboutModal.hidden) return;
    if (event.key === "Escape") {
      closeAbout();
      return;
    }
    if (event.key === "Tab") {
      const focusable = Array.from(
        aboutModal.querySelectorAll(
          'button:not([disabled]), a[href], select:not([disabled]), input:not([disabled])'
        )
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    window.clearTimeout(window.__taiwanMapResizeTimer);
    window.__taiwanMapResizeTimer = window.setTimeout(() => {
      map?.invalidateSize({ pan: false });
    }, 120);
  });

  renderPanel();
  initializeMap();
})();
