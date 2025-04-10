import { Url } from '../consts.js';
import CryptoJS from "https://esm.sh/crypto-js";

export default async function updateRemoteStorage(username, userData, userkey) {
    const encryptedData = CryptoJS.AES
        .encrypt(JSON.stringify(userData), userkey)
        .toString();

    const body = {
        username: username,
        data: encryptedData
    };

    try {
        const response = await fetch(
            Url + "/api/users",
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {
            console.error("Не удалось обновить информацию о пользователе: " + response.status);

            return { ok: false, error: "Не удалось обновить информацию о пользователе" };
        }

        return { ok: true, error: null };
    } catch (err) {
        console.error("Не удалось обновить информацию о пользователе: ", err);

        return { ok: false, error: "Не удалось обновить информацию о пользователе" };
    }
}