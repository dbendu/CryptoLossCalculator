import { UserNameVar, UserKeyVar, UserDataVar } from '../consts.js';

export default function loggedIn() {
    const username = localStorage.getItem(UserNameVar);
    const userdata = localStorage.getItem(UserDataVar);
    const userkey = localStorage.getItem(UserKeyVar) ?? sessionStorage.getItem(UserKeyVar);

    return username && userkey && userdata;
}