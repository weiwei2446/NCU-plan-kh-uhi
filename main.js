require([
  "esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/TileLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageryLayer",
  "esri/widgets/Legend",
  "esri/widgets/Expand",
  "esri/widgets/Home",
  "esri/widgets/Fullscreen",
  "esri/widgets/Compass",
  "esri/widgets/ScaleBar"
], function (
  ArcGISMap,
  MapView,
  SceneView,
  TileLayer,
  FeatureLayer,
  ImageryLayer,
  Legend,
  Expand,
  Home,
  Fullscreen,
  Compass,
  ScaleBar
) {
  const kaohsiungCenter = [120.65, 22.75];
  const viewDivId = "viewDiv";

  // 如果 ArcGIS Online 的欄位名稱不同，只要修改這個欄位對應區即可。
  const fields = {
    districtName: "TOWNNAME",
    meanLst: "Mean_LST",
    maxLst: "Max_LST",
    minLst: "Min_LST",
    uhiMean: "UHI_Mean",
    meanNdvi: "Mean_NDVI",
    greenRate: "Green_Rate",
    buildingCover: "Bldg_Cover",
    buildingDensity: "Bldg_Density",
    gridId: "GRID_ID"
  };

  const layerConfigs = [
    {
      id: "uhiClass",
      title: "都市熱島分級圖",
      purpose: "主要展示圖層",
      url: "尚未製作",
      visible: true,
      opacity: 0.75
    },
    {
      id: "uhiIntensity",
      title: "都市熱島強度圖",
      purpose: "顯示熱島強弱連續分布",
      url: "https://tiles.arcgis.com/tiles/pWOzKKRuqCsyMitB/arcgis/rest/services/%E9%AB%98%E9%9B%84%E9%83%BD%E5%B8%82%E7%86%B1%E5%B3%B6%E5%9C%96/MapServer",
      visible: false,
      opacity: 0.65
    },
    {
      id: "ndvi",
      title: "NDVI 植被指數圖",
      purpose: "顯示植被分布",
      url: "https://tiles.arcgis.com/tiles/pWOzKKRuqCsyMitB/arcgis/rest/services/Kaohsiung_NDVI/MapServer",
      visible: false,
      opacity: 0.65
    },
    {
      id: "greenCoverage",
      title: "綠覆蓋率圖",
      purpose: "顯示高雄市綠覆蓋率",
      url: "https://tiles.arcgis.com/tiles/pWOzKKRuqCsyMitB/arcgis/rest/services/%E9%AB%98%E9%9B%84%E6%A4%8D%E6%8A%AB%E8%A6%86%E8%93%8B/MapServer",
      visible: false,
      opacity: 0.65
    },
    {
      id: "buildingDensity",
      title: "建物密度圖",
      purpose: "顯示建物覆蓋率或建物密度",
      url: "未製作",
      visible: false,
      opacity: 0.65,
      popupTemplateType: "building"
    },
    {
      id: "districtAverage",
      title: "行政區平均溫度圖",
      purpose: "點擊行政區後顯示平均地表溫度、熱島強度、NDVI、綠覆蓋率與建物密度等資訊",
      url: " https://services3.arcgis.com/pWOzKKRuqCsyMitB/arcgis/rest/services/kh_district_avg_c/FeatureServer",
      visible: true,
      opacity: 0.35,
      popupTemplateType: "district"
    }
  ];

  const map = new ArcGISMap({
    basemap: "gray-vector",
    ground: "world-elevation"
  });

  const layerRegistry = new Map();
  let currentView = null;
  let mapView = null;
  let sceneView = null;
  let savedViewpoint = null;
  let currentWidgets = [];
  let isSwitchingView = false;

  const switch2DButton = document.getElementById("switch2D");
  const switch3DButton = document.getElementById("switch3D");
  const layerControls = document.getElementById("layerControls");
  const viewStatus = document.getElementById("viewStatus");

  initializeLayers();
  initializeLayerControls();
  initialize2DView();

  switch2DButton.addEventListener("click", switchTo2D);
  switch3DButton.addEventListener("click", switchTo3D);

  function initializeLayers() {
    const operationalLayers = [];

    layerConfigs.forEach((config) => {
      const layer = createLayerFromUrl(config);

      if (!layer) {
        layerRegistry.set(config.id, {
          config: config,
          layer: null,
          available: false
        });
        return;
      }

      layer.when(() => {
        console.log(`${layer.title} 載入成功`);
      }).catch((error) => {
        console.error(`${layer.title} 載入失敗`, error);
      });

      operationalLayers.push(layer);
      layerRegistry.set(config.id, {
        config: config,
        layer: layer,
        available: true
      });
    });

    map.addMany(operationalLayers);
  }

  function createLayerFromUrl(config) {
    const rawUrl = typeof config.url === "string" ? config.url.trim() : "";

    if (!rawUrl || rawUrl === "尚未製作" || rawUrl === "未製作") {
      console.warn(`${config.title} 尚未設定有效圖層 URL，已略過此圖層。`);
      return null;
    }

    const commonOptions = {
      title: config.title,
      url: normalizeLayerUrl(rawUrl),
      visible: config.visible,
      opacity: config.opacity
    };

    if (/FeatureServer/i.test(rawUrl)) {
      return new FeatureLayer({
        ...commonOptions,
        outFields: ["*"],
        popupTemplate: getPopupTemplate(config.popupTemplateType)
      });
    }

    if (/ImageServer/i.test(rawUrl)) {
      return new ImageryLayer(commonOptions);
    }

    if (/MapServer/i.test(rawUrl)) {
      return new TileLayer(commonOptions);
    }

    console.warn(`${config.title} 的 URL 無法判斷圖層類型，已略過。URL: ${rawUrl}`);
    return null;
  }

  function normalizeLayerUrl(url) {
    const trimmedUrl = url.trim().replace(/\/$/, "");

    if (/FeatureServer/i.test(trimmedUrl) && !/FeatureServer\/\d+$/i.test(trimmedUrl)) {
      return `${trimmedUrl}/0`;
    }

    return trimmedUrl;
  }

  function getPopupTemplate(type) {
    if (type === "district") {
      return {
        title: `{${fields.districtName}}`,
        content: createDistrictPopupContent
      };
    }

    if (type === "building") {
      return {
        title: "建物密度資訊",
        content: createBuildingPopupContent
      };
    }

    return null;
  }

  function createDistrictPopupContent(event) {
    const attributes = event.graphic.attributes || {};

    return createPopupTable([
      ["行政區名稱", getAttributeValue(attributes, fields.districtName)],
      ["平均地表溫度", formatNumber(getAttributeValue(attributes, fields.meanLst), " °C")],
      ["最高地表溫度", formatNumber(getAttributeValue(attributes, fields.maxLst), " °C")],
      ["最低地表溫度", formatNumber(getAttributeValue(attributes, fields.minLst), " °C")],
      ["都市熱島強度", formatNumber(getAttributeValue(attributes, fields.uhiMean))],
      ["平均 NDVI", formatNumber(getAttributeValue(attributes, fields.meanNdvi))],
      ["綠覆蓋率", formatPercentLikeValue(getAttributeValue(attributes, fields.greenRate))],
      ["建物覆蓋率", formatPercentLikeValue(getAttributeValue(attributes, fields.buildingCover))],
      ["建物密度", formatNumber(getAttributeValue(attributes, fields.buildingDensity))]
    ]);
  }

  function createBuildingPopupContent(event) {
    const attributes = event.graphic.attributes || {};

    return createPopupTable([
      ["網格編號或行政區名稱", getFirstAvailableValue(attributes, [fields.gridId, fields.districtName])],
      ["建物覆蓋率", formatPercentLikeValue(getAttributeValue(attributes, fields.buildingCover))],
      ["建物密度", formatNumber(getAttributeValue(attributes, fields.buildingDensity))]
    ]);
  }

  function getAttributeValue(attributes, fieldName) {
    if (!fieldName || !Object.prototype.hasOwnProperty.call(attributes, fieldName)) {
      return null;
    }

    return attributes[fieldName];
  }

  function getFirstAvailableValue(attributes, fieldNames) {
    for (const fieldName of fieldNames) {
      const value = getAttributeValue(attributes, fieldName);
      if (value !== null && value !== undefined && value !== "") {
        return value;
      }
    }

    return null;
  }

  function formatNumber(value, suffix) {
    if (value === null || value === undefined || value === "") {
      return "無資料";
    }

    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) {
      return `${numberValue.toFixed(2)}${suffix || ""}`;
    }

    return String(value);
  }

  function formatPercentLikeValue(value) {
    if (value === null || value === undefined || value === "") {
      return "無資料";
    }

    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return String(value);
    }

    const percentValue = Math.abs(numberValue) <= 1 ? numberValue * 100 : numberValue;
    return `${percentValue.toFixed(2)}%`;
  }

  function createPopupTable(rows) {
    const tableRows = rows.map(([label, value]) => {
      return `
        <tr>
          <th>${escapeHtml(label)}</th>
          <td>${escapeHtml(value === null || value === undefined || value === "" ? "無資料" : value)}</td>
        </tr>
      `;
    });

    return `
      <table class="popupTable">
        <tbody>${tableRows.join("")}</tbody>
      </table>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initializeLayerControls() {
    const fragment = document.createDocumentFragment();

    layerConfigs.forEach((config) => {
      const registryItem = layerRegistry.get(config.id);
      fragment.appendChild(createLayerControl(config, registryItem ? registryItem.layer : null));
    });

    layerControls.appendChild(fragment);
  }

  function createLayerControl(config, layer) {
    const wrapper = document.createElement("div");
    wrapper.className = layer ? "layerControl" : "layerControl unavailable";

    const header = document.createElement("label");
    header.className = "layerHeader";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(config.visible && layer);
    checkbox.disabled = !layer;
    checkbox.setAttribute("aria-label", `${config.title} 顯示或隱藏`);

    const text = document.createElement("span");
    const title = document.createElement("span");
    title.className = "layerTitle";
    title.textContent = config.title;

    const purpose = document.createElement("span");
    purpose.className = "layerPurpose";
    purpose.textContent = config.purpose;

    text.appendChild(title);
    text.appendChild(purpose);

    if (!layer) {
      const unavailable = document.createElement("span");
      unavailable.className = "layerUnavailableText";
      unavailable.textContent = "尚未設定有效 URL";
      text.appendChild(unavailable);
    }

    header.appendChild(checkbox);
    header.appendChild(text);

    const opacityWrapper = document.createElement("div");
    opacityWrapper.className = "opacityControl";

    const opacityLabel = document.createElement("label");
    opacityLabel.textContent = "透明度";
    opacityLabel.setAttribute("for", `${config.id}Opacity`);

    const slider = document.createElement("input");
    slider.id = `${config.id}Opacity`;
    slider.type = "range";
    slider.min = "0";
    slider.max = "1";
    slider.step = "0.05";
    slider.value = String(config.opacity);
    slider.disabled = !layer;

    const opacityValue = document.createElement("span");
    opacityValue.className = "opacityValue";
    opacityValue.textContent = `${Math.round(config.opacity * 100)}%`;

    opacityWrapper.appendChild(opacityLabel);
    opacityWrapper.appendChild(slider);
    opacityWrapper.appendChild(opacityValue);
    wrapper.appendChild(header);
    wrapper.appendChild(opacityWrapper);

    if (layer) {
      checkbox.addEventListener("change", () => {
        const targetLayer = getLayerById(config.id);
        if (!targetLayer) {
          return;
        }

        targetLayer.visible = checkbox.checked;
      });

      slider.addEventListener("input", () => {
        const targetLayer = getLayerById(config.id);
        if (!targetLayer) {
          return;
        }

        const value = Number(slider.value);
        targetLayer.opacity = value;
        opacityValue.textContent = `${Math.round(value * 100)}%`;
      });
    }

    return wrapper;
  }

  function getLayerById(id) {
    const registryItem = layerRegistry.get(id);
    return registryItem && registryItem.layer ? registryItem.layer : null;
  }

  function initialize2DView(options) {
    mapView = new MapView({
      container: viewDivId,
      map: map,
      center: options && options.center ? options.center : kaohsiungCenter,
      zoom: options && options.zoom ? options.zoom : 10
    });

    currentView = mapView;
    mapView.when(() => {
      setupWidgets(mapView, "2d");
      setActiveMode("2d");
      hideStatusMessage();
    }).catch((error) => {
      console.error("2D MapView 建立失敗", error);
      showStatusMessage("2D 地圖載入失敗，請稍後重新整理頁面。");
    });

    return mapView;
  }

  function initialize3DView(options) {
    sceneView = new SceneView({
      container: viewDivId,
      map: map,
      qualityProfile: "medium",
      viewingMode: "local",
      camera: options && options.camera ? options.camera : {
        position: {
          longitude: kaohsiungCenter[0],
          latitude: kaohsiungCenter[1],
          z: 55000
        },
        tilt: 55,
        heading: 0
      },
      environment: {
        atmosphereEnabled: true,
        starsEnabled: false
      }
    });

    currentView = sceneView;
    sceneView.when(() => {
      setupWidgets(sceneView, "3d");
      setActiveMode("3d");
      hideStatusMessage();
    }).catch((error) => {
      console.error("3D SceneView 建立失敗", error);
      showStatusMessage("此裝置可能不支援 3D 模式，請使用 2D 平面地圖。");
      switchTo2D();
    });

    return sceneView;
  }

  async function switchTo3D() {
    if (isSwitchingView || currentView === sceneView) {
      return;
    }

    setSwitchingState(true);

    try {
      if (currentView) {
        savedViewpoint = currentView.viewpoint ? currentView.viewpoint.clone() : null;
        destroyCurrentView();
      }

      const targetCenter = getViewpointCenter(savedViewpoint);
      const camera = targetCenter ? {
        position: {
          longitude: targetCenter[0],
          latitude: targetCenter[1],
          z: 55000
        },
        tilt: 55,
        heading: 0
      } : null;

      const view = initialize3DView({ camera: camera });
      await view.when();
    } catch (error) {
      console.error("切換至 3D 模式失敗", error);
      showStatusMessage("此裝置可能不支援 3D 模式，請使用 2D 平面地圖。");
      destroyCurrentView();
      initialize2DView();
    } finally {
      setSwitchingState(false);
    }
  }

  async function switchTo2D() {
    if (isSwitchingView || currentView === mapView) {
      return;
    }

    setSwitchingState(true);

    try {
      let center = kaohsiungCenter;
      let zoom = 10;

      if (currentView) {
        if (currentView.center) {
          center = [currentView.center.longitude, currentView.center.latitude];
        }
        if (currentView.zoom && Number.isFinite(currentView.zoom)) {
          zoom = Math.round(currentView.zoom);
        }
        savedViewpoint = currentView.viewpoint ? currentView.viewpoint.clone() : null;
        destroyCurrentView();
      }

      const view = initialize2DView({ center: center, zoom: zoom });
      await view.when();
    } catch (error) {
      console.error("切換至 2D 模式失敗", error);
      showStatusMessage("2D 地圖載入失敗，請稍後重新整理頁面。");
    } finally {
      setSwitchingState(false);
    }
  }

  function destroyCurrentView() {
    if (!currentView) {
      return;
    }

    currentWidgets = [];

    // Preserve the shared map and layer state before destroying the old view.
    currentView.container = null;
    currentView.map = null;
    currentView.destroy();

    if (currentView === mapView) {
      mapView = null;
    }

    if (currentView === sceneView) {
      sceneView = null;
    }

    currentView = null;
  }

  function setupWidgets(view, mode) {
    view.ui.empty("top-right");
    view.ui.empty("bottom-left");
    view.ui.empty("bottom-right");

    const home = new Home({ view: view });
    const fullscreen = new Fullscreen({ view: view });
    const legend = new Legend({ view: view });
    const legendExpand = new Expand({
      view: view,
      content: legend,
      expanded: false,
      expandIcon: "legend",
      expandTooltip: "顯示圖例"
    });

    view.ui.add([home, fullscreen], "top-right");
    view.ui.add(legendExpand, "bottom-right");

    currentWidgets = [home, fullscreen, legend, legendExpand];

    if (mode === "3d") {
      const compass = new Compass({ view: view });
      view.ui.add(compass, "top-right");
      currentWidgets.push(compass);
    }

    if (mode === "2d") {
      const scaleBar = new ScaleBar({
        view: view,
        unit: "metric"
      });
      view.ui.add(scaleBar, "bottom-left");
      currentWidgets.push(scaleBar);
    }
  }

  function setActiveMode(mode) {
    switch2DButton.classList.toggle("active", mode === "2d");
    switch3DButton.classList.toggle("active", mode === "3d");
  }

  function setSwitchingState(isSwitching) {
    isSwitchingView = isSwitching;
    switch2DButton.disabled = isSwitching;
    switch3DButton.disabled = isSwitching;
  }

  function showStatusMessage(message) {
    viewStatus.textContent = message;
    viewStatus.classList.add("visible");
  }

  function hideStatusMessage() {
    viewStatus.textContent = "";
    viewStatus.classList.remove("visible");
  }

  function getViewpointCenter(viewpoint) {
    if (!viewpoint || !viewpoint.targetGeometry) {
      return null;
    }

    const geometry = viewpoint.targetGeometry;
    const center = geometry.extent ? geometry.extent.center : geometry;

    if (center && Number.isFinite(center.longitude) && Number.isFinite(center.latitude)) {
      return [center.longitude, center.latitude];
    }

    return null;
  }
});
