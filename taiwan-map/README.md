# 臺灣熱環境與綠覆蓋圖台

以 114 個公開 ArcGIS Online Hosted Tile Layers，呈現台灣本島 19
縣市的 Landsat 8–9 地表溫度、相對熱異常、NDVI 與植物覆蓋率成果。

這是零建置靜態網站；正式檔案包含：

- `index.html`
- `app.js`
- `src/styles.css`
- `vendor/leaflet.css`
- `vendor/leaflet.js`
- `vendor/images/`
- `vendor/LEAFLET-LICENSE.txt`

Leaflet 1.9.4 已隨網站自託管，避免外部 CDN 被瀏覽器擴充功能或網路政策阻擋時造成圖磚錯位。

## 本機預覽

在本資料夾啟動任一靜態 HTTP server，例如：

```bash
python -m http.server 4173
```

再開啟 `http://127.0.0.1:4173/`。

## GitHub Pages

將上述檔案連同相對路徑放入 Pages 來源分支的 `taiwan-map/`
子資料夾即可；網站不需要 Node.js 或建置步驟。

網站不包含任何 ArcGIS Online 帳號、密碼或 token。
