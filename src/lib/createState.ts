import { CreateObjects } from "../types";
import { initStore } from "./store";

export const createObjects = (): void => {
	const store = initStore();
	const _this = store._this;
	const dpRoot = store.getDpRoot();

	const objects: CreateObjects[] = [
		{
			id: dpRoot + ".ambient",
			name: {
				en: "Ambient temperature",
				de: "Umgebungstemperatur",
				ru: "Температура",
				pt: "Temperatura ambiente",
				nl: "Omgevingstemperatuur",
				fr: "Température ambiante",
				it: "Temperatura ambiente",
				es: "Temperatura ambiente",
				pl: "Temperatura otoczenia",
				uk: "Температура навколишнього середовища",
				"zh-cn": "环境温度",
			},
			type: "number",
			role: "value.temperature",
			unit: "°C",
		},
		{
			id: dpRoot + ".info.connection",
			name: {
				en: "Connection",
				de: "Verbindung",
				ru: "Подключение",
				pt: "Conexão",
				nl: "Verbinding",
				fr: "Connexion",
				it: "Connessione",
				es: "Conexión",
				pl: "Połączenie",
				uk: "Підключення",
				"zh-cn": "连接",
			},
			type: "boolean",
			role: "state",
			def: false,
		},
		{
			id: dpRoot + ".consumption",
			name: {
				en: "Power consumption",
				de: "Stromverbrauch",
				ru: "Потребление электроэнергии",
				pt: "Consumo de energia",
				nl: "Energieverbruik",
				fr: "Consommation d'énergie",
				it: "Consumo energetico",
				es: "Consumo de energía",
				pl: "Zużycie energii",
				uk: "Споживана потужність",
				"zh-cn": "电力消耗",
			},
			type: "number",
			role: "value.power",
			unit: "W",
			def: 0,
		},
		{
			id: dpRoot + ".error",
			name: {
				en: "Error",
				de: "Fehler",
				ru: "Ошибка",
				pt: "Erro",
				nl: "Fout",
				fr: "Erreur",
				it: "Errore",
				es: "Error",
				pl: "Błąd",
				uk: "Помилка",
				"zh-cn": "错误",
			},
			type: "boolean",
			role: "state",
			def: false,
		},
		{
			id: dpRoot + ".errorCode",
			name: {
				en: "Error code",
				de: "Fehlercode",
				ru: "Код ошибки",
				pt: "Código de erro",
				nl: "Foutcode",
				fr: "Code d'erreur",
				it: "Codice errore",
				es: "Código de error",
				pl: "Kod błędu",
				uk: "Код помилки",
				"zh-cn": "错误代码",
			},
			type: "string",
			def: "",
			role: "state",
		},
		{
			id: dpRoot + ".errorLevel",
			name: {
				en: "Error level",
				de: "Fehlerlevel",
				ru: "Уровень ошибок",
				pt: "Nível de erro",
				nl: "Foutniveau",
				fr: "Niveau d'erreur",
				it: "Livello di errore",
				es: "Nivel de error",
				pl: "Poziom błędu",
				uk: "Рівень помилок",
				"zh-cn": "错误级别",
			},
			type: "number",
			role: "state",
		},
		{
			id: dpRoot + ".errorMessage",
			name: {
				en: "Errormessage",
				de: "Fehlermeldung",
				ru: "Ошибки",
				pt: "Erro",
				nl: "Foutmelding",
				fr: "Message d'erreur",
				it: "Messaggio di errore",
				es: "Errores",
				pl: "Errormessage",
				uk: "Помилка",
				"zh-cn": "错误消息",
			},
			type: "string",
			def: "",
			role: "state",
		},
		{
			id: dpRoot + ".mode",
			name: "Modus",
			type: "string",
			states: "-1:off;0:cool;1:heat;2:auto",
			def: "",
			write: true,
			role: "state",
		},
		{
			id: dpRoot + ".rotor",
			name: {
				en: "Fan speed",
				de: "Lüfterdrehzahl",
				ru: "Скорость вентилятора",
				pt: "Velocidade do ventilador",
				nl: "Ventilatorsnelheid",
				fr: "Vitesse du ventilateur",
				it: "Velocità del ventilatore",
				es: "Velocidad del ventilador",
				pl: "Prędkość wentylatora",
				uk: "Швидкість вентилятора",
				"zh-cn": "扇形速度",
			},
			type: "number",
			unit: "rpm",
			def: 0,
			role: "state",
		},
		{
			id: dpRoot + ".silent",
			name: {
				en: "Silent",
				de: "Silent",
				ru: "Молчание",
				pt: "Silencioso",
				nl: "Stil",
				fr: "Silencieux",
				it: "Silente",
				es: "Silent",
				pl: "Cichy",
				uk: "Сидіння",
				"zh-cn": "安静",
			},
			type: "boolean",
			role: "state",
			def: false,
			write: true,
		},
		{
			id: dpRoot + ".state",
			name: {
				en: "Status",
				de: "Status",
				ru: "Статус",
				pt: "Estado",
				nl: "Status",
				fr: "État",
				it: "Stato",
				es: "Situación",
				pl: "Status",
				uk: "Статус на сервери",
				"zh-cn": "状态",
			},
			type: "boolean",
			role: "state",
			def: false,
		},
		{
			id: dpRoot + ".tempIn",
			name: {
				en: "Input temperature",
				de: "Eingangstemperatur",
				ru: "Температура входа",
				pt: "Temperatura de entrada",
				nl: "Invoertemperatuur",
				fr: "Température d'entrée",
				it: "Temperatura di ingresso",
				es: "Temperatura de entrada",
				pl: "Temperatura wlotu",
				uk: "Температура введення",
				"zh-cn": "输入温度",
			},
			type: "number",
			unit: "°C",
			role: "value.temperature",
		},
		{
			id: dpRoot + ".tempOut",
			name: {
				en: "Output temperature",
				de: "Ausgangstemperatur",
				ru: "Температура",
				pt: "Temperatura de saída",
				nl: "Uitvoertemperatuur",
				fr: "Température de sortie",
				it: "Temperatura di uscita",
				es: "Temperatura de salida",
				pl: "Temperatura wyjściowa",
				uk: "Температура виходу",
				"zh-cn": "输出温度",
			},
			type: "number",
			unit: "°C",
			role: "value.temperature",
		},
		{
			id: dpRoot + ".tempSet",
			name: {
				en: "Should temperature",
				de: "Solltemperatur",
				ru: "Должна быть температура",
				pt: "Temperatura do ombro",
				nl: "Moet temperatuur",
				fr: "Température",
				it: "Dovrebbe temperatura",
				es: "Tener temperatura",
				pl: "Temperatura powinna",
				uk: "Температура",
				"zh-cn": "应否温度",
			},
			type: "number",
			unit: "°C",
			write: true,
			role: "value.temperature",
		},
		{
			id: dpRoot + ".suctionTemp",
			name: {
				en: "Air intake temperature",
				de: "Lufteintrittstemperatur",
				ru: "Температура воздуха",
				pt: "Temperatura de entrada de ar",
				nl: "Luchtinlaattemperatuur",
				fr: "Température d'admission d'air",
				it: "Temperatura di aspirazione dell'aria",
				es: "Temperatura de consumo de aire",
				pl: "Temperatura wlotu powietrza",
				uk: "Температура забору повітря",
				"zh-cn": "空气摄入温度",
			},
			type: "number",
			unit: "°C",
			role: "value.temperature",
		},
		{
			id: dpRoot + ".coilTemp",
			name: {
				en: "Compressor temperature",
				de: "Kompressortemperatur",
				ru: "Температура компрессора",
				pt: "Temperatura do compressor",
				nl: "Compressortemperatuur",
				fr: "Température du compresseur",
				it: "Temperatura del compressore",
				es: "Temperatura del compresor",
				pl: "Temperatura sprężarki",
				uk: "Температура компресора",
				"zh-cn": "压缩器温度",
			},
			type: "number",
			unit: "°C",
			role: "value.temperature",
		},
		{
			id: dpRoot + ".exhaust",
			name: {
				en: "Compressor output",
				de: "Kompressorausgang",
				ru: "Выход компрессора",
				pt: "Saída do compressor",
				nl: "Compressoruitvoer",
				fr: "Sortie du compresseur",
				it: "Uscita del compressore",
				es: "Salida del compresor",
				pl: "Wyjście kompresora",
				uk: "Компресори",
				"zh-cn": "压缩器输出",
			},
			type: "number",
			unit: "°C",
			role: "value.temperature",
		},
		{
			id: dpRoot + ".ProductCode",
			name: {
				en: "Productcode",
				de: "Produktcode",
				ru: "Код товара",
				pt: "Código do produto",
				nl: "Productcode",
				fr: "Code produit",
				it: "Codice prodotto",
				es: "Código de producto",
				pl: "Kod producenta",
				uk: "Код товару",
				"zh-cn": "产品代码",
			},
			type: "string",
			role: "state",
		},
		{
			id: dpRoot + ".DeviceCode",
			name: {
				en: "Device ID",
				de: "Geräte ID",
				ru: "ID устройства",
				pt: "ID do dispositivo",
				nl: "Apparaat-ID",
				fr: "ID du périphérique",
				it: "ID dispositivo",
				es: "ID de dispositivo",
				pl: "Identyfikator urządzenia",
				uk: "Код пристрою",
				"zh-cn": "设备标识",
			},
			type: "string",
			role: "state",
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
				uk: "СОНЦЕ",
				"zh-cn": "贾森",
			},
			type: "array",
			role: "state",
		},
	];

	objects.forEach(({ id, name, role, unit, type, def }) => {
		_this.setObjectNotExists(id, {
			type: "state",
			common: { read: true, write: false, type: type, unit, role, name, def },
			native: {},
		});
	});

};
