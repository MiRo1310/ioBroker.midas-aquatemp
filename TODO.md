# Refactoring TODO

## Offen

### Code

- [x] **`main.ts` — `silentId`, `stateId`, `tempSetId` einmalig definieren**
  Werden aktuell bei jedem `stateChange`-Aufruf neu berechnet (Zeilen 85–88). Einmalig vor dem Handler definieren,
  analog zu `modeId`.

- [x] **`main.ts` — `if`-Kette auf `else if` umstellen**
  Im `stateChange`-Handler können nur einer der vier Branches matchen. Aktuell laufen alle vier `if`-Checks immer
  durch (Zeilen 95/117/126/134).

- [x] **`main.ts` — `tokenRefreshInterval`: `async function` → Arrow-Function**
  Beide Intervalle verwenden jetzt konsistent `async function`.

- [x] **`loggingController.ts` — `errorHandler`: doppeltes `if (e?.response)` zusammenführen**
  Zeilen 41–46 prüfen `e?.response` zweimal in getrennten Blöcken. Beide Logs gehören in einen einzigen `if`-Block.

- [x] **`deviceController.ts` — `updateDeviceErrorMsg`: Payload API-Level-bedingt senden**
  Bewusst so gelassen — beide Feldnamen gleichzeitig senden schadet nicht und vereinfacht den Code.

- [x] **Arrow-Class-Fields Cleanup in `store.ts` und `tokenManager.ts`**
  `getDpRoot`, `resetOnError`, `resetDeviceOnly`, `saveValue` (store) sowie `updateTokenAndDeviceId`, `resetToken`,
  `getValidTokenOrNull` (tokenManager) sind Arrow-Class-Fields, werden aber immer mit explizitem Objektbezug
  aufgerufen — kein Binding-Grund. Reguläre Methoden sind idiomatischer und sparen pro Instanz eine Funktionskopie.

- [x] **`main.ts` — `subscribeStatesAsync` parallelisieren**
  Vier unabhängige `await`-Aufrufe (Zeilen 148–151) → `Promise.all` verwenden.

- [x] **`deviceController.ts` — `logger` konsistent verwenden in `updateDevicePower`**
  `logger` wird am Methodenanfang destrukturiert, Zeile 228 verwendet aber `this.store.logger.warn(...)` direkt.

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