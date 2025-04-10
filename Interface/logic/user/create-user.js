import updateRemoteStorage from './update-remote-storage.js';

export default async function createNewUser(username, userkey) {
    const defaultUserdata = {
        purchases: {}
    };

    const response = await updateRemoteStorage(username, defaultUserdata, userkey);

    if (!response.ok) {
        return { ok: false, error: "Не удалось создать нового пользователя", userdata: null };
    }

    return { ok: true, userdata: defaultUserdata, error: null };
}