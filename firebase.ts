import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    OAuthProvider,
    User
} from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove, query, where, writeBatch, deleteDoc } from "firebase/firestore";
import { getStorage, ref, listAll } from "firebase/storage";
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
export const storage = getStorage(app);

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
            yearGroup: data.yearGroup || '11',
            studentIds: data.studentIds || []
        } as ClassGroup;
    });
};

export const createClass = async (name: string, yearGroup: string = '11'): Promise<string> => {
    const classesCol = collection(db, 'classes');
    const docRef = await addDoc(classesCol, {
        name,
        yearGroup,
        studentIds: []
    });
    return docRef.id;
};

export const updateClassDetails = async (classId: string, name: string, yearGroup: string) => {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, { name, yearGroup });
};

export const updateClassName = async (classId: string, name: string) => {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, { name });
};

export const deleteClass = async (classId: string) => {
    const classRef = doc(db, 'classes', classId);
    await deleteDoc(classRef);
};

export const removeStudentFromAllClasses = async (studentId: string) => {
    const classesCol = collection(db, 'classes');
    const q = query(classesCol, where('studentIds', 'array-contains', studentId));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
            studentIds: arrayRemove(studentId)
        });
    });
    await batch.commit();
};

export const addClassMember = async (classId: string, studentId: string) => {
    await removeStudentFromAllClasses(studentId);
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
        studentIds: arrayUnion(studentId)
    });
};

export const addClassMembers = async (classId: string, studentIds: string[]) => {
    // Process removals sequentially or in parallel, depending on preference.
    // For safety and simplicity, we await all removals first.
    await Promise.all(studentIds.map(id => removeStudentFromAllClasses(id)));

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

export const deleteUserAccount = async (uid: string) => {
    // 1. Remove from all classes
    await removeStudentFromAllClasses(uid);
    // 2. Delete User Document
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
};

export const logUserActivity = async (uid: string, eventType: string, details: any = {}) => {
    try {
        const logsCol = collection(db, 'users', uid, 'activity_logs');
        await addDoc(logsCol, {
            type: eventType,
            timestamp: new Date().toISOString(),
            ...details
        });
    } catch (e) {
        console.error("Failed to log user activity", e);
    }
};

export const getCourseFiles = async (level: string): Promise<string[]> => {
    try {
        const folder = level === 'GCSE' ? 'GCSE Geography' : 'A Level Geography';
        const folderRef = ref(storage, folder);
        const res = await listAll(folderRef);

        // Construct gs:// URIs based on bucket and path
        // Bucket: a-level-geography.firebasestorage.app
        const bucket = 'a-level-geography.firebasestorage.app';
        return res.items.map(item => `gs://${bucket}/${item.fullPath}`);
    } catch (e) {
        console.error(`Failed to list files for ${level}`, e);
        return [];
    }
};
