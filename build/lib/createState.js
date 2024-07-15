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
const createObjects = async () => {
  const store = (0, import_store.initStore)();
  const _this = store._this;
  const dpRoot = store.getDpRoot();
  const objects = [
    {
      id: dpRoot + ".ambient",
      name: {
        en: "Ambient temperature",
        de: "Umgebungstemperatur",
        ru: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430",
        pt: "Temperatura ambiente",
        nl: "Omgevingstemperatuur",
        fr: "Temp\xE9rature ambiante",
        it: "Temperatura ambiente",
        es: "Temperatura ambiente",
        pl: "Temperatura otoczenia",
        uk: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u043D\u0430\u0432\u043A\u043E\u043B\u0438\u0448\u043D\u044C\u043E\u0433\u043E \u0441\u0435\u0440\u0435\u0434\u043E\u0432\u0438\u0449\u0430",
        "zh-cn": "\u73AF\u5883\u6E29\u5EA6"
      },
      type: "number",
      role: "value.temperature",
      unit: "\xB0C"
    },
    {
      id: dpRoot + ".info.connection",
      name: {
        en: "Connection",
        de: "Verbindung",
        ru: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435",
        pt: "Conex\xE3o",
        nl: "Verbinding",
        fr: "Connexion",
        it: "Connessione",
        es: "Conexi\xF3n",
        pl: "Po\u0142\u0105czenie",
        uk: "\u041F\u0456\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043D\u044F",
        "zh-cn": "\u8FDE\u63A5"
      },
      type: "boolean",
      role: "state",
      def: false
    },
    {
      id: dpRoot + ".consumption",
      name: {
        en: "Power consumption",
        de: "Stromverbrauch",
        ru: "\u041F\u043E\u0442\u0440\u0435\u0431\u043B\u0435\u043D\u0438\u0435 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u044D\u043D\u0435\u0440\u0433\u0438\u0438",
        pt: "Consumo de energia",
        nl: "Energieverbruik",
        fr: "Consommation d'\xE9nergie",
        it: "Consumo energetico",
        es: "Consumo de energ\xEDa",
        pl: "Zu\u017Cycie energii",
        uk: "\u0421\u043F\u043E\u0436\u0438\u0432\u0430\u043D\u0430 \u043F\u043E\u0442\u0443\u0436\u043D\u0456\u0441\u0442\u044C",
        "zh-cn": "\u7535\u529B\u6D88\u8017"
      },
      type: "number",
      role: "value.power",
      unit: "W",
      def: 0
    },
    {
      id: dpRoot + ".error",
      name: {
        en: "Error",
        de: "Fehler",
        ru: "\u041E\u0448\u0438\u0431\u043A\u0430",
        pt: "Erro",
        nl: "Fout",
        fr: "Erreur",
        it: "Errore",
        es: "Error",
        pl: "B\u0142\u0105d",
        uk: "\u041F\u043E\u043C\u0438\u043B\u043A\u0430",
        "zh-cn": "\u9519\u8BEF"
      },
      type: "boolean",
      role: "state",
      def: false
    },
    {
      id: dpRoot + ".errorCode",
      name: {
        en: "Error code",
        de: "Fehlercode",
        ru: "\u041A\u043E\u0434 \u043E\u0448\u0438\u0431\u043A\u0438",
        pt: "C\xF3digo de erro",
        nl: "Foutcode",
        fr: "Code d'erreur",
        it: "Codice errore",
        es: "C\xF3digo de error",
        pl: "Kod b\u0142\u0119du",
        uk: "\u041A\u043E\u0434 \u043F\u043E\u043C\u0438\u043B\u043A\u0438",
        "zh-cn": "\u9519\u8BEF\u4EE3\u7801"
      },
      type: "string",
      def: "",
      role: "state"
    },
    {
      id: dpRoot + ".errorLevel",
      name: {
        en: "Error level",
        de: "Fehlerlevel",
        ru: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u043E\u0448\u0438\u0431\u043E\u043A",
        pt: "N\xEDvel de erro",
        nl: "Foutniveau",
        fr: "Niveau d'erreur",
        it: "Livello di errore",
        es: "Nivel de error",
        pl: "Poziom b\u0142\u0119du",
        uk: "\u0420\u0456\u0432\u0435\u043D\u044C \u043F\u043E\u043C\u0438\u043B\u043E\u043A",
        "zh-cn": "\u9519\u8BEF\u7EA7\u522B"
      },
      type: "number",
      role: "state"
    },
    {
      id: dpRoot + ".errorMessage",
      name: {
        en: "Errormessage",
        de: "Fehlermeldung",
        ru: "\u041E\u0448\u0438\u0431\u043A\u0438",
        pt: "Erro",
        nl: "Foutmelding",
        fr: "Message d'erreur",
        it: "Messaggio di errore",
        es: "Errores",
        pl: "Errormessage",
        uk: "\u041F\u043E\u043C\u0438\u043B\u043A\u0430",
        "zh-cn": "\u9519\u8BEF\u6D88\u606F"
      },
      type: "string",
      def: "",
      role: "state"
    },
    {
      id: dpRoot + ".mode",
      name: "Modus",
      type: "string",
      states: "-1:off;0:cool;1:heat;2:auto",
      def: "",
      write: true,
      role: "state"
    },
    {
      id: dpRoot + ".rotor",
      name: {
        en: "Fan speed",
        de: "L\xFCfterdrehzahl",
        ru: "\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430",
        pt: "Velocidade do ventilador",
        nl: "Ventilatorsnelheid",
        fr: "Vitesse du ventilateur",
        it: "Velocit\xE0 del ventilatore",
        es: "Velocidad del ventilador",
        pl: "Pr\u0119dko\u015B\u0107 wentylatora",
        uk: "\u0428\u0432\u0438\u0434\u043A\u0456\u0441\u0442\u044C \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430",
        "zh-cn": "\u6247\u5F62\u901F\u5EA6"
      },
      type: "number",
      unit: "rpm",
      def: 0,
      role: "state"
    },
    {
      id: dpRoot + ".silent",
      name: {
        en: "Silent",
        de: "Silent",
        ru: "\u041C\u043E\u043B\u0447\u0430\u043D\u0438\u0435",
        pt: "Silencioso",
        nl: "Stil",
        fr: "Silencieux",
        it: "Silente",
        es: "Silent",
        pl: "Cichy",
        uk: "\u0421\u0438\u0434\u0456\u043D\u043D\u044F",
        "zh-cn": "\u5B89\u9759"
      },
      type: "boolean",
      role: "state",
      def: false,
      write: true
    },
    {
      id: dpRoot + ".state",
      name: {
        en: "Status",
        de: "Status",
        ru: "\u0421\u0442\u0430\u0442\u0443\u0441",
        pt: "Estado",
        nl: "Status",
        fr: "\xC9tat",
        it: "Stato",
        es: "Situaci\xF3n",
        pl: "Status",
        uk: "\u0421\u0442\u0430\u0442\u0443\u0441 \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0438",
        "zh-cn": "\u72B6\u6001"
      },
      type: "boolean",
      role: "state",
      def: false
    },
    {
      id: dpRoot + ".tempIn",
      name: {
        en: "Input temperature",
        de: "Eingangstemperatur",
        ru: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0432\u0445\u043E\u0434\u0430",
        pt: "Temperatura de entrada",
        nl: "Invoertemperatuur",
        fr: "Temp\xE9rature d'entr\xE9e",
        it: "Temperatura di ingresso",
        es: "Temperatura de entrada",
        pl: "Temperatura wlotu",
        uk: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0432\u0432\u0435\u0434\u0435\u043D\u043D\u044F",
        "zh-cn": "\u8F93\u5165\u6E29\u5EA6"
      },
      type: "number",
      unit: "\xB0C",
      role: "value.temperature"
    },
    {
      id: dpRoot + ".tempOut",
      name: {
        en: "Output temperature",
        de: "Ausgangstemperatur",
        ru: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430",
        pt: "Temperatura de sa\xEDda",
        nl: "Uitvoertemperatuur",
        fr: "Temp\xE9rature de sortie",
        it: "Temperatura di uscita",
        es: "Temperatura de salida",
        pl: "Temperatura wyj\u015Bciowa",
        uk: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0432\u0438\u0445\u043E\u0434\u0443",
        "zh-cn": "\u8F93\u51FA\u6E29\u5EA6"
      },
      type: "number",
      unit: "\xB0C",
      role: "value.temperature"
    },
    {
      id: dpRoot + ".tempSet",
      name: {
        en: "Should temperature",
        de: "Solltemperatur",
        ru: "\u0414\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430",
        pt: "Temperatura do ombro",
        nl: "Moet temperatuur",
        fr: "Temp\xE9rature",
        it: "Dovrebbe temperatura",
        es: "Tener temperatura",
        pl: "Temperatura powinna",
        uk: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430",
        "zh-cn": "\u5E94\u5426\u6E29\u5EA6"
      },
      type: "number",
      unit: "\xB0C",
      write: true,
      role: "value.temperature"
    },
    {
      id: dpRoot + ".suctionTemp",
      name: {
        en: "Air intake temperature",
        de: "Lufteintrittstemperatur",
        ru: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0432\u043E\u0437\u0434\u0443\u0445\u0430",
        pt: "Temperatura de entrada de ar",
        nl: "Luchtinlaattemperatuur",
        fr: "Temp\xE9rature d'admission d'air",
        it: "Temperatura di aspirazione dell'aria",
        es: "Temperatura de consumo de aire",
        pl: "Temperatura wlotu powietrza",
        uk: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0437\u0430\u0431\u043E\u0440\u0443 \u043F\u043E\u0432\u0456\u0442\u0440\u044F",
        "zh-cn": "\u7A7A\u6C14\u6444\u5165\u6E29\u5EA6"
      },
      type: "number",
      unit: "\xB0C",
      role: "value.temperature"
    },
    {
      id: dpRoot + ".coilTemp",
      name: {
        en: "Compressor temperature",
        de: "Kompressortemperatur",
        ru: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440\u0430",
        pt: "Temperatura do compressor",
        nl: "Compressortemperatuur",
        fr: "Temp\xE9rature du compresseur",
        it: "Temperatura del compressore",
        es: "Temperatura del compresor",
        pl: "Temperatura spr\u0119\u017Carki",
        uk: "\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u043A\u043E\u043C\u043F\u0440\u0435\u0441\u043E\u0440\u0430",
        "zh-cn": "\u538B\u7F29\u5668\u6E29\u5EA6"
      },
      type: "number",
      unit: "\xB0C",
      role: "value.temperature"
    },
    {
      id: dpRoot + ".exhaust",
      name: {
        en: "Compressor output",
        de: "Kompressorausgang",
        ru: "\u0412\u044B\u0445\u043E\u0434 \u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440\u0430",
        pt: "Sa\xEDda do compressor",
        nl: "Compressoruitvoer",
        fr: "Sortie du compresseur",
        it: "Uscita del compressore",
        es: "Salida del compresor",
        pl: "Wyj\u015Bcie kompresora",
        uk: "\u041A\u043E\u043C\u043F\u0440\u0435\u0441\u043E\u0440\u0438",
        "zh-cn": "\u538B\u7F29\u5668\u8F93\u51FA"
      },
      type: "number",
      unit: "\xB0C",
      role: "value.temperature"
    },
    {
      id: dpRoot + ".ProductCode",
      name: {
        en: "Productcode",
        de: "Produktcode",
        ru: "\u041A\u043E\u0434 \u0442\u043E\u0432\u0430\u0440\u0430",
        pt: "C\xF3digo do produto",
        nl: "Productcode",
        fr: "Code produit",
        it: "Codice prodotto",
        es: "C\xF3digo de producto",
        pl: "Kod producenta",
        uk: "\u041A\u043E\u0434 \u0442\u043E\u0432\u0430\u0440\u0443",
        "zh-cn": "\u4EA7\u54C1\u4EE3\u7801"
      },
      type: "string",
      role: "state"
    },
    {
      id: dpRoot + ".DeviceCode",
      name: {
        en: "Device ID",
        de: "Ger\xE4te ID",
        ru: "ID \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430",
        pt: "ID do dispositivo",
        nl: "Apparaat-ID",
        fr: "ID du p\xE9riph\xE9rique",
        it: "ID dispositivo",
        es: "ID de dispositivo",
        pl: "Identyfikator urz\u0105dzenia",
        uk: "\u041A\u043E\u0434 \u043F\u0440\u0438\u0441\u0442\u0440\u043E\u044E",
        "zh-cn": "\u8BBE\u5907\u6807\u8BC6"
      },
      type: "string",
      role: "state"
    },
    {
      id: dpRoot + ".rawJSON",
      name: {
        en: "JSON",
        de: "JSON",
        ru: "JSON",
        pt: "JSON",
        nl: "JSON",
        fr: "JSON",
        it: "JSON",
        es: "JSON",
        pl: "JSON",
        uk: "\u0421\u041E\u041D\u0426\u0415",
        "zh-cn": "\u8D3E\u68EE"
      },
      type: "array",
      role: "state"
    }
  ];
  try {
    for (const { id, name, role, unit, type, def, write } of objects) {
      _this.log.info("Create object: " + id);
      await _this.setObjectNotExistsAsync(id, {
        type: "state",
        common: { read: true, write: write || false, type, unit, role, name, def },
        native: {}
      });
    }
  } catch (error) {
    _this.log.error(`Error in createObjects: ${error.message}, stack: ${error.stack}`);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createObjects
});
//# sourceMappingURL=createState.js.map
