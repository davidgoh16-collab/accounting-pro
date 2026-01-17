import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    OAuthProvider,
    User
} from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { AuthUser, ClassGroup } from "./types";

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
            level: data.level,
            role: data.role,
        }
    });
    return userList;
};

export const updateUserRole = async (uid: string, role: string) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { role });
};

export const getClasses = async (): Promise<ClassGroup[]> => {
    const classesCol = collection(db, 'classes');
    const snapshot = await getDocs(classesCol);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name || 'Unnamed Class',
            studentIds: data.studentIds || []
        } as ClassGroup;
    });
};

export const createClass = async (name: string): Promise<string> => {
    const classesCol = collection(db, 'classes');
    const docRef = await addDoc(classesCol, {
        name,
        studentIds: []
    });
    return docRef.id;
};

export const updateClassName = async (classId: string, name: string) => {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, { name });
};

export const addClassMember = async (classId: string, studentId: string) => {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
        studentIds: arrayUnion(studentId)
    });
};

export const addClassMembers = async (classId: string, studentIds: string[]) => {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
        studentIds: arrayUnion(...studentIds)
    });
};

export const removeClassMember = async (classId: string, studentId: string) => {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
        studentIds: arrayRemove(studentId)
    });
};