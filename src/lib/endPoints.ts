import { useStore } from "./store";
const store = useStore();

export function setupEndpoints(): void {
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
	const cloudURL = store.cloudURL;
	if (store.apiLevel < 3) {
		return { sURL: cloudURL + "/app/device/control.json" };
	}
	return { sURL: cloudURL + "/app/device/control" };
};

export const getSUrlUpdateDeviceId = (): { sURL: string } => {
	if (store.apiLevel < 3) {
		return { sURL: store.cloudURL + "/app/device/getDataByCode.json" };
	}
	return { sURL: store.cloudURL + "/app/device/getDataByCode" };
};

export const getOptionsAnsSUrl = (): {
	sUrl: string;
	options: {
		userName?: string;
		user_name?: string;
		password: string;
		type: string;
	};
} => {
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
