"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var createState_exports = {};
__export(createState_exports, {
  createObjects: () => createObjects
});
module.exports = __toCommonJS(createState_exports);
var import_store = require("./store");
const store = (0, import_store.useStore)();
const createObjects = () => {
  const _this = store._this;
  const dpRoot = store.getDpRoot();
  const objects = [
    { id: dpRoot + ".ambient", name: "Umgebungstemperatur", type: "number", role: "value.temperature", unit: "\xB0C" },
    { id: dpRoot + ".info.connection", name: "Verbindung", type: "boolean", role: "state", def: false },
    { id: dpRoot + ".consumption", name: "Stromverbrauch", type: "number", role: "value.power", unit: "W", def: 0 },
    { id: dpRoot + ".error", name: "Fehler", type: "boolean", role: "state", def: false },
    { id: dpRoot + ".errorCode", name: "Fehlercode", type: "string", def: "", role: "state" },
    { id: dpRoot + ".errorLevel", name: "Fehlerlevel", type: "number", role: "state" },
    { id: dpRoot + ".errorMessage", name: "Fehlermeldung", type: "string", def: "", role: "state" },
    { id: dpRoot + ".mode", name: "Modus", type: "string", states: "-1:off;0:cool;1:heat;2:auto", def: "", write: true, role: "state" },
    { id: dpRoot + ".rotor", name: "L\xFCfterdrehzahl", type: "number", unit: "rpm", def: 0, role: "state" },
    { id: dpRoot + ".silent", name: "Silent", type: "boolean", role: "state", def: false, write: true },
    { id: dpRoot + ".state", name: "Status", type: "boolean", role: "state", def: false },
    { id: dpRoot + ".tempIn", name: "Eingangstemperatur", type: "number", unit: "\xB0C", role: "value.temperature" },
    { id: dpRoot + ".tempOut", name: "Ausgangstemperatur", type: "number", unit: "\xB0C", role: "value.temperature" },
    { id: dpRoot + ".tempSet", name: "Solltemperatur", type: "number", unit: "\xB0C", write: true, role: "value.temperature" },
    { id: dpRoot + ".suctionTemp", name: "Luftansaugtemperatur", type: "number", unit: "\xB0C", role: "value.temperature" },
    { id: dpRoot + ".coilTemp", name: "Kompressortemperatur", type: "number", unit: "\xB0C", role: "value.temperature" },
    { id: dpRoot + ".exhaust", name: "Kompressorausgang", type: "number", unit: "\xB0C", role: "value.temperature" },
    { id: dpRoot + ".ProductCode", name: "Produktcode", type: "string", role: "state" },
    { id: dpRoot + ".DeviceCode", name: "Ger\xE4te-ID", type: "string", role: "state" },
    { id: dpRoot + ".rawJSON", name: "komplette R\xFCckgabe", type: "array", role: "state" }
  ];
  objects.forEach(({ id, name, role, unit, type, def }) => {
    _this.setObjectNotExists(id, { type: "state", common: { read: true, write: false, type, unit, role, name, def }, native: {} });
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createObjects
});
//# sourceMappingURL=createState.js.map
