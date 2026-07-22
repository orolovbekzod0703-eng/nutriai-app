import { initializeApp } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQ1E4e_rH9IhF-L0D8teYlbvZLJzwAQ4c",
  authDomain: "fit-counter-ai.firebaseapp.com",
  projectId: "fit-counter-ai",
  storageBucket: "fit-counter-ai.firebasestorage.app",
  messagingSenderId: "308751358056",
  appId: "1:308751358056:web:3ed9e62513c269e09703dd",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export const onAuth = (cb) => onAuthStateChanged(auth, cb);
export const signInGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);

// Firestore hujjat hajmi limiti (1 MiB) oshib ketmasligi uchun
// base64 ovqat rasmlarini bulutga yubormaymiz — ular faqat qurilmada (localStorage) qoladi.
function stripImages(state) {
  if (!state || !Array.isArray(state.meals)) return state;
  return { ...state, meals: state.meals.map((m) => (m.img ? { ...m, img: null } : m)) };
}

export async function saveUserData(uid, state) {
  await setDoc(
    doc(db, "users", uid),
    { data: JSON.stringify(stripImages(state)), updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function loadUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  try {
    return d.data ? JSON.parse(d.data) : null;
  } catch {
    return null;
  }
}
