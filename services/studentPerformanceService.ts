import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { TeacherAssessment, GradeProfile } from '../types';

// NEW: Fetch the single grade profile
export const getStudentGradeProfile = async (): Promise<GradeProfile | null> => {
    if (!auth.currentUser?.email) return null;
    const docRef = doc(db, 'student_performance_records', `${auth.currentUser.email}_overall_grades`);
    const snap = await getDoc(docRef);
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
