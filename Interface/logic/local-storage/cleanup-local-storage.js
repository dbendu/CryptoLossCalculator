import { UserNameVar, UserDataVar, UserKeyVar } from '../consts.js';

export default function cleanupLocalStorage() {
    localStorage.removeItem(UserNameVar);
    localStorage.removeItem(UserDataVar);
    localStorage.removeItem(UserKeyVar);

    sessionStorage.removeItem(UserKeyVar);
}