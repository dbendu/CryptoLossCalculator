import { Url } from '../consts.js';

export default async function userExists(username) {
    try {
        const response = await fetch(
            Url + "/api/users/exists?username=" + encodeURIComponent(username),
            {
                method: 'GET',
                headers: {
                    "Content-Type": "text/plain"
                }
            }
        );

        if (!response.ok) {
            console.error("Ошибка при попытке получить информацию о пользователе: " + response.status);

            return { ok: false, error: "Не удалось получить информацию о пользователе", exists: null };
        }

        const body = await response.text();

        const exists = body === "true";

        return { ok: true, exists: exists, error: null };
    } catch (err) {
        console.error("Ошибка при попытке получить информацию о пользователе: " + err);

        return { ok: false, error: "Ошибка при попытке получить информацию о пользователе", exists: null };
    }
}