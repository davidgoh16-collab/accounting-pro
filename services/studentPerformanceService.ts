import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { TeacherAssessment, GradeProfile } from '../types';

// NEW: Fetch the single grade profile
export const getStudentGradeProfile = async (studentEmail: string): Promise<GradeProfile | null> => {
    if (!studentEmail) return null;

    const docPath = `${studentEmail}_overall_grades`;
    // console.log("Fetching grade profile from:", docPath);

    const docRef = doc(db, 'student_performance_records', docPath);
    const snap = await getDoc(docRef);

    // console.log("Grade profile fetch result:", snap.exists() ? "Exists" : "Not Found");
    return snap.exists() ? snap.data() as GradeProfile : null;
};

// UPDATE: Filter out the 'OVERALL_GRADES' type
export const getTeacherAssessments = async (): Promise<TeacherAssessment[]> => {
    if (!auth.currentUser?.email) return [];
    const q = query(
        collection(db, 'student_performance_records'),
        where('studentEmail', '==', auth.currentUser.email),
        orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(item => item.type !== 'OVERALL_GRADES') as TeacherAssessment[];
};
