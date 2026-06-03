# Refactoring TODO

## Offen

- [x] **`updateInterval` / `tokenRefreshTimer` als Klassenvariablen**
  `main.ts` Zeilen 17–18: Module-level `let`-Variablen in private Klassenvariablen von `MidasAquatemp` umwandeln

- [x] **`getSettings.ts` eliminieren**
  `getPowerMode` als `private static`-Methode direkt in `DeviceController` verschieben, Datei löschen

- [x] **`axios.ts` → `ApiClient`-Klasse**
  `request()` bekommt `adapter` bei jedem Aufruf als erstes Argument. Klasse mit `Store` im Konstruktor bauen — entfernt
  den Parameter aus allen ~8 `request()`-Aufrufen in `DeviceController`

- [ ] **`endPoints.ts` → Methoden auf `Store`**
  Alle Endpoint-Funktionen lesen nur aus `Store` — könnten direkt `Store`-Methoden werden (optional, Geschmackssache)

---

## Tests

- [ ] **Tests für `DeviceController` anpassen / ergänzen**
  Alte Standalone-Files wurden gelöscht, Tests existieren noch nicht für die neue Klasse

- [ ] **Tests für `TokenManager` erstellen**
  `fetchToken`, `updateToken`, `resetToken`, `getValidTokenOrNull`

---

## Erledigt

- [x] `utils.test.ts` — Kommentare korrigiert ("returns null" → "returns 0")
- [x] `getSettings.test.ts` — `getPowerMode` vollständig getestet
- [x] `store.test.ts` — `getDpRoot`, `encryptedPassword`, `setMode/getMode`, `isValidMode`, Konstruktor-Defaults,
  `resetOnErrorHandler`
- [x] `axiosParameter.test.ts` — Payload-Builder für v2/v3, Poolsana vs. generisch
- [x] `endPoints.test.ts` — URL-Mapping für alle Endpoints, v2 vs. v3
- [x] `DeviceController`-Klasse erstellt (`updateDevicePower`, `updateDeviceSetTemp`, `updateDeviceSilent`,
  `updateDeviceStatus`, `updateDeviceDetails`, `updateDeviceID`)
- [x] `TokenManager`-Klasse erstellt (`fetchToken`, `updateToken`, `resetToken`, `getValidTokenOrNull`)
- [x] `main.ts` auf `DeviceController` und `TokenManager` umgestellt
- [x] Alte Standalone-Files gelöscht
- [x] `clearStateValues` in `Store` verschoben
- [x] Redundante Konstruktor-Assignments in `Store` entfernt