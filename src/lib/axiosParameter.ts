export const getProtocolCodes = (
	deviceCode: string,
): {
	device_code: string;
	deviceCode: string;
	protocal_codes: string[];
	protocalCodes: string[];
} => {
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
}: {
	deviceCode: string;
	value: number | string;
	protocolCode: string;
}): {
	param: [
		{
			device_code: string;
			deviceCode: string;
			protocol_code: string;
			protocolCode: string;
			value: number | string;
		},
	];
} => {
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
}: {
	deviceCode: string;
	sTemperature: string;
}): {
	param: [
		{
			device_code: string;
			deviceCode: string;
			protocol_code: string;
			protocolCode: string;
			value: string;
		},
		{
			device_code: string;
			deviceCode: string;
			protocol_code: string;
			protocolCode: string;
			value: string;
		},
		{
			device_code: string;
			deviceCode: string;
			protocol_code: string;
			protocolCode: string;
			value: string;
		},
		{
			device_code: string;
			deviceCode: string;
			protocol_code: string;
			protocolCode: string;
			value: string;
		},
	];
} => {
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
