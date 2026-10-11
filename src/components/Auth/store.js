import { api } from '../../services/api';

const SESSION_KEY = 'BANSAC_CURRENT_USER';
export const AUTH_EVENT = 'bansac-auth-change';

function notify() { window.dispatchEvent(new Event(AUTH_EVENT)); }
function saveUser(user, remember) {
  localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY);
  (remember === false ? sessionStorage : localStorage).setItem(SESSION_KEY, JSON.stringify(user));
  notify(); return user;
}

export function currentUser() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)); }
  catch (e) { return null; }
}

export function registerUser(data) {
  return api.post('/auth/register', { name:data.name, email:data.email, phone:data.phone, password:data.password }).then((result) => saveUser(result.user, true));
}

export function loginUser(email, password, remember) {
  return api.post('/auth/login', { email, password, remember }).then((result) => saveUser(result.user, remember));
}

export function refreshUser() {
  return api.get('/auth/me').then((result) => saveUser(result.user, Boolean(localStorage.getItem(SESSION_KEY)))).catch(() => { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); notify(); return null; });
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); notify();
  return api.post('/auth/logout', {}).catch(() => null);
}
