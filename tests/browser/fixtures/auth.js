import { state, pause } from "./state";
export const getAuth = () => ({});
export function onAuthStateChanged(auth, callback) {
    state.listeners.add(callback);
    queueMicrotask(() => callback(state.user));
    return () => state.listeners.delete(callback);
}
export async function signInWithEmailAndPassword(auth, email, password) {
    await pause();
    if (password === "wrong")
        throw Object.assign(new Error("Invalid credentials"), { code: "auth/invalid-credential" });
    state.user = { uid: "fixture-household", email };
    state.listeners.forEach((callback) => callback(state.user));
}
export async function signOut() {
    await pause();
    state.user = null;
    state.listeners.forEach((callback) => callback(null));
}
