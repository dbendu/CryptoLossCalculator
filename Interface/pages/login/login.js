import { UserNameVar, UserKeyVar, UserDataVar } from '../../logic/consts.js';
import loadUserData from '../../logic/user/load-user.js';
import userExists from '../../logic/user/user-exists.js';
import createNewUser from '../../logic/user/create-user.js';
import loggedIn from '../../logic/user/is-logged-in.js';
import cleanupLocalStorage from '../../logic/local-storage/cleanup-local-storage.js';

export async function login() {
    const username = document.getElementById('username').value.trim();
    const key = document.getElementById('key').value;
    const remember = document.getElementById('remember').checked;

    const userExistsResponse = await userExists(username);

    if (!userExistsResponse.ok) {
        alert(userExistsResponse.error);
        return;
    }

    let userdata;

    if (userExistsResponse.exists) {
        const dataLoadResult = await loadUserData(username, key);

        if (!dataLoadResult.ok) {
            alert(dataLoadResult.error);
            return;
        }

        userdata = dataLoadResult.userdata;
    } else {
        const createUserResult = await createNewUser(username, key);

        if (!createUserResult.ok) {
            alert(createUserResult.error);
            return;
        }

        userdata = createUserResult.userdata;
    }

    cleanupLocalStorage();

    localStorage.setItem(UserNameVar, username);
    localStorage.setItem(UserDataVar, JSON.stringify(userdata));

    const keyStorage = remember ? localStorage : sessionStorage;
    keyStorage.setItem(UserKeyVar, key);

    window.location.href = "../rates/rates.html";
    return;
}

function init() {
    if (loggedIn()) {
        window.location.href = "../rates/rates.html";
        return;
    }

    // Активируем кнопку для входа, когда все поля заполнены
    document.addEventListener("DOMContentLoaded", () => {
        const usernameInput = document.getElementById("username");
        const keyInput = document.getElementById("key");
        const loginButton = document.getElementById("login-button");
    
        function updateButtonState() {
            const isReady = usernameInput.value.trim() !== "" && keyInput.value.trim() !== "";
            loginButton.disabled = !isReady;
        }
    
        usernameInput.addEventListener("input", updateButtonState);
        keyInput.addEventListener("input", updateButtonState);
    });

    // Добавляем обработчик нажатия кнопки входа
    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("login-button");

        btn.addEventListener("click", login);
    });
}

init();