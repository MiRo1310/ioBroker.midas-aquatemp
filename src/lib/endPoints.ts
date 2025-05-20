import { initStore } from './store';

export function setupEndpoints(): void {
    const store = initStore();
    const apiLevel = store.apiLevel;

    store.cloudURL =
        apiLevel == 3
            ? 'https://cloud.linked-go.com:449/crmservice/api'
            : 'https://cloud.linked-go.com/cloudservice/api';
}

export const getSUrl = (): {
    sURL: string;
} => {
    const store = initStore();
    const cloudURL = store.cloudURL;
    return store.apiLevel < 3
        ? { sURL: `${cloudURL}/app/device/control.json` }
        : { sURL: `${cloudURL}/app/device/control` };
};

export const getSUrlUpdateDeviceId = (): { sURL: string } => {
    const store = initStore();
    return store.apiLevel < 3
        ? { sURL: `${store.cloudURL}/app/device/getDataByCode.json` }
        : { sURL: `${store.cloudURL}/app/device/getDataByCode` };
};

export const getOptionsAndSUrl = (): {
    sUrl: string;
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
    return apiLevel < 3
        ? {
              sUrl: `${cloudURL}/app/user/login.json`,
              options: {
                  user_name: username,
                  password: encryptedPassword,
                  type: '2',
              },
          }
        : {
              sUrl: `${cloudURL}/app/user/login`,
              options: {
                  userName: username,
                  password: encryptedPassword,
                  type: '2',
              },
          };
};

export const getUpdateDeviceStatusSUrl = (): { sURL: string } => {
    const store = initStore();
    return store.apiLevel < 3
        ? { sURL: `${store.cloudURL}/app/device/getDeviceStatus.json` }
        : { sURL: `${store.cloudURL}/app/device/getDeviceStatus` };
};

export const getUpdateDeviceIdSUrl = (): { sURL: string } => {
    const store = initStore();
    return store.apiLevel < 3
        ? { sURL: `${store.cloudURL}/app/device/deviceList.json` }
        : { sURL: `${store.cloudURL}/app/device/deviceList` };
};
