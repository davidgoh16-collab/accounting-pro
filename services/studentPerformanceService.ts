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
export const getTeacherAssessments = async (studentEmail?: string): Promise<TeacherAssessment[]> => {
    const email = studentEmail || auth.currentUser?.email;
    if (!email) {
        console.warn("getTeacherAssessments: No email provided");
        return [];
    }

    try {
        // Try simple query first to avoid index issues
        const q = query(
            collection(db, 'student_performance_records'),
            where('studentEmail', '==', email)
        );
        const snapshot = await getDocs(q);

        const data = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as any))
            .filter(item => item.type !== 'OVERALL_GRADES') as TeacherAssessment[];

        // Client-side sort to be safe
        return data.sort((a, b) => {
            const timeA = a.timestamp?.seconds || 0;
            const timeB = b.timestamp?.seconds || 0;
            return timeB - timeA;
        });
    } catch (e) {
        console.error("Error fetching assessments:", e);
        return [];
    }
};
