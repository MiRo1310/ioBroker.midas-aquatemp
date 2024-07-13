import {
	InputGetAxiosUpdateDevicePowerParams,
	InputGetAxiosUpdateDeviceSetTempParams,
	ReturnGetAxiosUpdateDevicePowerParams,
	ReturnGetAxiosUpdateDeviceSetTempParams,
	ReturnGetProtocolCodes,
} from "src/types";

export const getProtocolCodes = (deviceCode: string): ReturnGetProtocolCodes => {
	return {
		device_code: deviceCode,
		deviceCode: deviceCode,
		protocal_codes: [
			"Power",
			"Mode",
			"Manual-mute",
			"T01",
			"T02",
			"2074",
			"2075",
			"2076",
			"2077",
			"H03",
			"Set_Temp",
			"R08",
			"R09",
			"R10",
			"R11",
			"R01",
			"R02",
			"R03",
			"T03",
			"1158",
			"1159",
			"F17",
			"H02",
			"T04",
			"T05",
			"T06",
			"T07",
			"T14",
			"T17",
			"T1",
			"T2",
			"T3",
			"T4",
			"T5",
			"T6",
			"T7",
		],
		protocalCodes: [
			"Power",
			"Mode",
			"Manual-mute",
			"T01",
			"T02",
			"2074",
			"2075",
			"2076",
			"2077",
			"H03",
			"Set_Temp",
			"R08",
			"R09",
			"R10",
			"R11",
			"R01",
			"R02",
			"R03",
			"T03",
			"1158",
			"1159",
			"F17",
			"H02",
			"T04",
			"T05",
			"T06",
			"T07",
			"T14",
			"T17",
			"T1",
			"T2",
			"T3",
			"T4",
			"T5",
			"T6",
			"T7",
		],
	};
};

export const getAxiosUpdateDevicePowerParams = ({
	deviceCode,
	value,
	protocolCode,
}: InputGetAxiosUpdateDevicePowerParams): ReturnGetAxiosUpdateDevicePowerParams => {
	return {
		param: [
			{
				device_code: deviceCode,
				deviceCode: deviceCode,
				protocol_code: protocolCode,
				protocolCode: protocolCode,
				value: value,
			},
		],
	};
};

export const getAxiosUpdateDeviceSetTempParams = ({
	deviceCode,
	sTemperature,
}: InputGetAxiosUpdateDeviceSetTempParams): ReturnGetAxiosUpdateDeviceSetTempParams => {
	return {
		param: [
			{
				device_code: deviceCode,
				deviceCode: deviceCode,
				protocol_code: "R01",
				protocolCode: "R01",
				value: sTemperature,
			},
			{
				device_code: deviceCode,
				deviceCode: deviceCode,
				protocol_code: "R02",
				protocolCode: "R02",
				value: sTemperature,
			},
			{
				device_code: deviceCode,
				deviceCode: deviceCode,
				protocol_code: "R03",
				protocolCode: "R03",
				value: sTemperature,
			},
			{
				device_code: deviceCode,
				deviceCode: deviceCode,
				protocol_code: "Set_Temp",
				protocolCode: "Set_Temp",
				value: sTemperature,
			},
		],
	};
};

export const getAxiosGetUpdateDeviceIdParams = (): { productIds: string[] } => {
	return {
		productIds: [
			"1132174963097280512",
			"1245226668902080512",
			"1656269521923575808",
			"1663080854333558784",
			"1596427678569979904",
			"1674238226096406528",
			"1650063968998252544",
			"1668781858447085568",
			"1186904563333062656",
			"1158905952238313472",
			"1442284873216843776",
			"1732565142225256450",
			"1548963836789501952",
			"1669159229372477440",
			"1650758828508766208",
			"1664085465655808000",
		],
	};
};
