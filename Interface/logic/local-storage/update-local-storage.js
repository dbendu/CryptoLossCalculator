import { UserDataVar } from '../consts.js';

export default function updateLocalStorage(userData, token, amount, price) {
    token = token.toUpperCase();

    const newRecord = { amount: amount, price: price };

    if (!userData.purchases[token]) {
        userData.purchases[token] = [];
    }

    userData.purchases[token].push(newRecord);

    localStorage.setItem(UserDataVar, JSON.stringify(userData));
}