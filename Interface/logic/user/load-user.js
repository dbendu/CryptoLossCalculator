import { Url } from '../consts.js';
import CryptoJS from "https://esm.sh/crypto-js";

export default async function loadUserData(username, userkey) {
    const loadDataResult = await loadEncryptedData(username);

    if (!loadDataResult.ok) {
        return loadDataResult;
    }

    const decoded = decodeData(loadDataResult.userdata, userkey);

    if (!decoded.ok) {
        return decoded;
    }

    return { ok: true, userdata: JSON.parse(decoded.userdata), error: null };
}

async function loadEncryptedData(username) {
    try {
        const getUserResponse = await fetch(
            Url + "/api/users/" + encodeURIComponent(username),
            {
                method: 'GET',
                headers: {
                    "Content-Type": "text/plain"
                }
            }
        );
    
        if (getUserResponse.status !== 200) {
            const error = await response.text();
            console.error("Ошибка при отправке запроса: " + error);

            return { ok: false, error: "Не удалось загрузить данные", userdata: null };
        }

        return { ok: true, userdata: await getUserResponse.text(), error: null };
    } catch (error) {
        console.error("Ошибка при отправке запроса: " + error);

        return { ok: false, error: "Не удалось загрузить данные", userdata: null };
    }
}

function decodeData(rawData, key) {
    try {
        const decryptedText = CryptoJS.AES
            .decrypt(rawData, key)
            .toString(CryptoJS.enc.Utf8);

        if (!decryptedText) {
            return { ok: false, error: "Не удалось расшифровать данные — возможно, введён неверный ключ.", userdata: null };
        }

        return { ok: true, userdata: decryptedText, error: null };
    } catch (error) {
        console.error("Ошибка при попытке декодировать данные: " + error);

        return { ok: true, error : "Не удалось расшифровать данные", userdata: null };
    }
}
