import { initStore } from "./store";
import https from "https";

export function setupEndpoints(): void {
	const store = initStore();
	const apiLevel = store.apiLevel;
	if (apiLevel == 1) {
		store.cloudURL = "https://cloud.linked-go.com/cloudservice/api";
		return;
	}
	if (apiLevel == 2) {
		store.cloudURL = "https://cloud.linked-go.com/cloudservice/api";
		return;
	}
	if (apiLevel == 3) {
		store.cloudURL = "https://cloud.linked-go.com:449/crmservice/api";
	}
}
export const getSUrl = (): {
	sURL: string;
} => {
	const store = initStore();
	const cloudURL = store.cloudURL;
	if (store.apiLevel < 3) {
		return { sURL: cloudURL + "/app/device/control.json" };
	}
	return { sURL: cloudURL + "/app/device/control" };
};

export const getSUrlUpdateDeviceId = (): { sURL: string } => {
	const store = initStore();
	if (store.apiLevel < 3) {
		return { sURL: store.cloudURL + "/app/device/getDataByCode.json" };
	}
	return { sURL: store.cloudURL + "/app/device/getDataByCode" };
};

const httpsAgent = new https.Agent({
	rejectUnauthorized: false, // Achtung: Dies birgt Sicherheitsrisiken
});
export const getOptionsAndSUrl = (): {
	sUrl: string;
	httpsAgent?: https.Agent;
	timeout?: number;
	options: {
		userName?: string;
		user_name?: string;
		password: string;
		type: string;

	};
} => {
	const store = initStore();
	const cloudURL = store.cloudURL;
	const apiLevel = store.apiLevel;
	const encryptedPassword = store.encryptedPassword;
	const username = store.username;
	if (apiLevel < 3) {
		return {
			sUrl: cloudURL + "/app/user/login.json",
			options: {
				user_name: username,
				password: encryptedPassword,
				type: "2",

			},
			httpsAgent,
			timeout: 5000,
		};
	}
	return {
		sUrl: cloudURL + "/app/user/login",
		options: {
			userName: username,
			password: encryptedPassword,
			type: "2",
		},
	};
};

export const getUpdateDeviceStatusSUrl = (): { sURL: string } => {
	const store = initStore();
	if (store.apiLevel < 3) {
		return { sURL: store.cloudURL + "/app/device/getDeviceStatus.json" };
	}
	return { sURL: store.cloudURL + "/app/device/getDeviceStatus" };
};

export const getUpdateDeviceIdSUrl = (): { sURL: string } => {
	const store = initStore();
	if (store.apiLevel < 3) {
		return { sURL: store.cloudURL + "/app/device/deviceList.json" };
	}
	return { sURL: store.cloudURL + "/app/device/deviceList" };
};
