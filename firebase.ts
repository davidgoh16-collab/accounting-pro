import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    OAuthProvider,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    User
} from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove, query, where, writeBatch, deleteDoc } from "firebase/firestore";
import { getStorage, ref, listAll, getBytes, getMetadata, uploadString, getDownloadURL } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { AuthUser, ClassGroup } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyAomVajk0-fAkyc7o7PkPg2biqsS8k_HnU",
  authDomain: "student-apps-ebc94.firebaseapp.com",
  projectId: "student-apps-ebc94",
  storageBucket: "student-apps-ebc94.firebasestorage.app",
  messagingSenderId: "882131158020",
  appId: "1:882131158020:web:97f5a941e1799046882151",
  measurementId: "G-6K19WED9P8"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app, "accounting-app");
export const storage = getStorage(app);

const microsoftProvider = new OAuthProvider('microsoft.com');
const googleProvider = new GoogleAuthProvider();

export const signInWithMicrosoft = () => {
    return signInWithPopup(auth, microsoftProvider);
};

export const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
};

export const signInWithEmail = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
};

export const signUpWithEmail = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
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

export const updateUserTourStatus = async (uid: string, hasSeenTour: boolean) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { hasSeenTour });
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

const fileCache: Record<string, { data: string; mimeType: string }> = {};

export const getCourseFiles = async (level: string): Promise<{name: string, path: string}[]> => {
    try {
        const folder = level === 'GCSE' ? 'GCSE Accounting' : 'A Level Accounting';
        const folderRef = ref(storage, folder);
        const res = await listAll(folderRef);

        return res.items.map(item => ({
            name: item.name,
            path: item.fullPath
        }));
    } catch (e) {
        console.error(`Failed to list files for ${level}`, e);
        return [];
    }
};

export const downloadFileAsBase64 = async (path: string): Promise<{ data: string; mimeType: string }> => {
    if (fileCache[path]) {
        return fileCache[path];
    }

    try {
        const fileRef = ref(storage, path);
        // Get metadata for MIME type
        let mimeType = 'application/pdf'; // default
        try {
            const metadata = await getMetadata(fileRef);
            if (metadata.contentType) {
                mimeType = metadata.contentType;
            }
        } catch (e) {
            console.warn(`Failed to fetch metadata for ${path}, using default mime type`, e);
        }

        const buffer = await getBytes(fileRef);

        // Convert buffer to base64
        const blob = new Blob([buffer], { type: mimeType });
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                const result = reader.result as string;
                // remove "data:mime/type;base64,"
                const base64Data = result.split(',')[1];
                const cachedResult = { data: base64Data, mimeType };
                fileCache[path] = cachedResult;
                resolve(cachedResult);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error(`Failed to download file ${path}`, e);
        throw e;
    }
};

export const uploadBase64Image = async (path: string, base64Data: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);

        // Remove the data URI scheme if present (e.g., 'data:image/png;base64,')
        const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

        await uploadString(storageRef, base64Content, 'base64', {
            contentType: 'image/png' // Assuming we generate PNGs
        });

        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    } catch (error) {
        console.error(`Failed to upload base64 image to ${path}`, error);
        throw error;
    }
};
