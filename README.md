# 高雄市都市熱島效應互動地圖

這是一個可直接部署到 GitHub Pages 的靜態互動地圖網站，主題為「高雄市都市熱島效應」。網站預設載入 2D 平面地圖，並提供使用者手動切換到 3D 地圖的功能，以降低手機或低效能電腦一開始載入時的負擔。

## 專案說明

網站使用 ArcGIS Maps SDK for JavaScript 顯示高雄市的都市熱島、NDVI、綠覆蓋率、建物密度與行政區平均溫度等圖層。左側面板提供自訂圖層控制，可開關圖層並即時調整透明度；地圖右下角提供圖例，FeatureLayer 可點擊顯示 popup 屬性資料。

熱島強度、NDVI 與綠覆蓋圖層已更新為新的服務 URL。網站底圖使用 OpenStreetMap `WebTileLayer`，地圖初始視角聚焦高雄西側與台南交界附近，方便看見綠覆蓋與 NDVI 的有效資料範圍，並透過 `MapView.constraints` 將可瀏覽範圍限制在台灣附近，避免使用者滑到太遠的區域。

目前「都市熱島分級圖」與「建物密度圖」的 URL 尚未製作，因此程式會在 console 顯示警告並略過該圖層。日後補上有效 ArcGIS REST URL 後，控制列會自動啟用。

## 使用技術

- HTML
- CSS
- JavaScript
- ArcGIS Maps SDK for JavaScript 4.33 CDN
- ArcGIS `MapView`
- ArcGIS `SceneView`
- ArcGIS `TileLayer`
- ArcGIS `FeatureLayer`
- ArcGIS `ImageryLayer`

## 檔案結構

```text
kaohsiung-uhi-web/
├─ index.html
├─ style.css
├─ main.js
└─ README.md
```

## 如何在本機執行

建議使用 VS Code Live Server：

1. 用 VS Code 開啟 `kaohsiung-uhi-web` 資料夾。
2. 安裝或啟用 Live Server 擴充套件。
3. 在 `index.html` 上按右鍵。
4. 選擇 `Open with Live Server`。
5. 瀏覽器會開啟本機網址並載入地圖。

也可以直接開啟 `index.html`，但部分瀏覽器在本機檔案模式下可能限制外部資源或安全性行為，因此建議使用 Live Server。

## 如何替換 ArcGIS 圖層 URL

打開 `main.js`，找到 `layerConfigs` 區塊：

```javascript
const layerConfigs = [
  {
    id: "uhiClass",
    title: "都市熱島分級圖",
    url: "尚未製作"
  }
];
```

把 `url` 改成有效的 ArcGIS REST service URL 即可。程式會依 URL 自動判斷圖層類型：

- URL 包含 `FeatureServer`：使用 `FeatureLayer`
- URL 包含 `MapServer`：使用 `TileLayer`
- URL 包含 `ImageServer`：使用 `ImageryLayer`

若 `FeatureServer` URL 沒有 `/0`，程式會自動補上 `/0`。

## 如何修改 popup 欄位名稱

打開 `main.js`，找到 `fields` 區塊：

```javascript
const fields = {
  districtName: "TOWNNAME",
  meanLst: "Mean_LST",
  maxLst: "Max_LST",
  minLst: "Min_LST",
  uhiMean: "UHI_Mean",
  meanNdvi: "Mean_NDVI",
  greenRate: "Green_Rate",
  buildingCover: "Bldg_Cover",
  buildingDensity: "Bldg_Density"
};
```

如果 ArcGIS Online 圖層的實際欄位名稱不同，只要修改這裡的對應值，不需要改 popup 產生邏輯。

## 如何部署到 GitHub Pages

1. 建立 GitHub repository。
2. 上傳 `index.html`、`style.css`、`main.js`、`README.md`。
3. 到 repository 的 `Settings`。
4. 點選 `Pages`。
5. `Source` 選 `Deploy from a branch`。
6. `Branch` 選 `main`。
7. `Folder` 選 `/root`。
8. 按下 `Save`。
9. 等待 GitHub 產生 Pages 網址。

## 2D / 3D 切換說明

網站開啟時只建立 ArcGIS `MapView`，不會預先建立 `SceneView`。當使用者點擊「3D 地圖」按鈕時，才會建立 `SceneView` 並切換到 3D camera。切回「2D 平面地圖」時，會銷毀 3D view 並重新建立 2D view。

圖層都掛在同一個 `Map` 物件上，因此切換 2D / 3D 時，圖層顯示狀態與透明度設定會保留。

## 為何預設使用 2D，而不是直接使用 3D

3D 地圖需要較高的 GPU 與記憶體資源，部分手機、平板或低效能電腦可能載入較慢，甚至無法順利顯示。都市熱島圖層主要是平面空間資訊，使用 2D 地圖可以更快載入、更穩定，也更適合大多數使用者先瀏覽資料。

因此本專案預設使用 2D `MapView`，並把 3D `SceneView` 設計為使用者可自行啟用的進階功能。若裝置不支援 3D，網站會顯示提示並保留 2D 地圖可用。
