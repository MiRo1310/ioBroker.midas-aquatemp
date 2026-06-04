# Refactoring TODO

## Offen

### Code

- [x] **`axiosParameter.ts` — Verantwortung klären**
  Alle Funktionen nehmen `Store` als Parameter. Optionen:
    - Als Methoden in `Store` integrieren (wie `endPoints.ts`)
    - Oder als private Methoden in `DeviceController` (da nur dort genutzt)

- [x] **`createState.ts` → `Store.createObjects()`**
  Die Funktion erstellt ioBroker-States beim Start. Passt als Methode in `Store`, analog zu `clearStateValues()`. Bietet
  keinen Mehrwert das in den store zu packen, würde ihn nur aufblähen.

- [x] **`getTokenAndDevice()` Rückgabetyp vereinfachen**
  Aktuell: `{ token: string | null; device: string | null }` bei Fehler.
  Besser: `{ token: string; device: string } | null` — dann entfällt die wiederholte `if (!token || !device)` Prüfung.

- [x] **`voltage` in `savePowerOnSensors` vereinheitlichen**
  `voltage` nutzt noch `saveNumberIfValid(key, tVoltageVal)` direkt, alle anderen via `saveSensorNumber`.
  Entweder `voltage` auch auf `saveSensorNumber` umstellen, oder bewusst so lassen (wegen Vorberechnung für
  Consumption). Bewusst so lassen

### Tests

- [x] **`DeviceController` Methoden testen**
  `updateDevicePower`, `updateDeviceSilent`, `updateDeviceSetTemp` — brauchen Mock für `ApiClient`.

---

## Erledigt

- [x] `updateInterval` / `tokenRefreshTimer` als Klassenvariablen in `MidasAquatemp`
- [x] `getSettings.ts` eliminiert — `getPowerMode` als `public static` in `DeviceController`
- [x] `axios.ts` → `ApiClient`-Klasse, Token direkt in `request()` integriert
- [x] `endPoints.ts` → Methoden auf `Store`, Datei gelöscht
- [x] `getHeaders` aus `axiosParameter.ts` entfernt
- [x] `DeviceController` private Methoden: `getSensorCodes`, `getTokenAndDevice`, `saveSensorNumber`,
  `savePowerOnSensors`
- [x] `parseNumberOrNull` → `parseFloatOrNull` umbenannt
- [x] `TokenManager` — `fetchToken`-Guard korrigiert, `token` private, Setter-Pattern für `DeviceController`
- [x] `Store` — `clearStateValues`, Endpoint-Methoden, `setupEndpoints` im Konstruktor
- [x] `main.ts` — `DeviceController` + `TokenManager` + `ApiClient` instanziiert, Klassenvariablen, `adapter = this`
  entfernt

### Tests

- [x] `utils.test.ts` — bereinigt, nur pure Utility-Funktionen
- [x] `apiClient.test.ts` — `isApiSuccess` neu erstellt
- [x] `tokenManager.test.ts` — `getValidTokenOrNull`, `resetToken`, `setDeviceController`
- [x] `getSettings.test.ts` → `DeviceController.getPowerMode` über `DeviceController.getPowerMode()`
- [x] `endPoints.test.ts` → Store-Methoden umgestellt
- [x] `store.test.ts` — `resetOnErrorHandler`, Konstruktor-Defaults, `encryptedPassword`
- [x] `axiosParameter.test.ts` — Payload-Builder v2/v3, Poolsana vs. generisch