import type { Store } from './store';

export function setupEndpoints(store: Store): void {
    const apiLevel = store.apiLevel;

    store.cloudURL =
        apiLevel == 3
            ? 'https://cloud.linked-go.com:449/crmservice/api'
            : 'https://cloud.linked-go.com/cloudservice/api';
}

export const getSUrl = (
    store: Store,
): {
    sURL: string;
} => {
    const { cloudURL } = store;
    return store.apiLevel < 3
        ? { sURL: `${cloudURL}/app/device/control.json` }
        : { sURL: `${cloudURL}/app/device/control` };
};

export const getSUrlUpdateDeviceId = (store: Store): { sURL: string } => {
    return store.apiLevel < 3
        ? { sURL: `${store.cloudURL}/app/device/getDataByCode.json` }
        : { sURL: `${store.cloudURL}/app/device/getDataByCode` };
};

export const getOptionsAndSUrl = (
    store: Store,
): {
    sUrl: string;
    options: {
        userName?: string;
        user_name?: string;
        password: string;
        type: string;
    };
} => {
    const { cloudURL, apiLevel, encryptedPassword, username } = store;

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

export const getUpdateDeviceStatusSUrl = (store: Store): { sURL: string } => {
    return store.apiLevel < 3
        ? { sURL: `${store.cloudURL}/app/device/getDeviceStatus.json` }
        : { sURL: `${store.cloudURL}/app/device/getDeviceStatus` };
};

export const getUpdateDeviceIdSUrl = (store: Store): { sURL: string } => {
    return store.apiLevel < 3
        ? { sURL: `${store.cloudURL}/app/device/deviceList.json` }
        : { sURL: `${store.cloudURL}/app/device/deviceList` };
};
