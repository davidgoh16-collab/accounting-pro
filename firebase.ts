import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    OAuthProvider,
    User
} from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { AuthUser } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyB-1EHzIdag5GriE076dSxVUCiN1gwC1F8",
  authDomain: "a-level-geography.firebaseapp.com",
  projectId: "a-level-geography",
  storageBucket: "a-level-geography.firebasestorage.app",
  messagingSenderId: "642592912836",
  appId: "1:642592912836:web:99d28b88da8edfc0406091",
  measurementId: "G-NHGBH7PY9Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const microsoftProvider = new OAuthProvider('microsoft.com');

export const signInWithMicrosoft = () => {
    return signInWithPopup(auth, microsoftProvider);
};

export const signOutUser = () => {
    return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const getAllUsers = async (): Promise<AuthUser[]> => {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            displayName: data.displayName || null,
            email: data.email || null,
            photoURL: data.photoURL || null,
        }
    });
    return userList;
};