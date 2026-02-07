import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface TeacherAssessment {
    id: string;
    assessmentTitle: string;
    topic: string;
    mark: number;
    percentage: number;
    feedback: string;
    improvementAreas: string[];
    timestamp: any;
}

export const getTeacherAssessments = async (): Promise<TeacherAssessment[]> => {
    if (!auth.currentUser?.email) return [];

    // Updated to use server-side sorting as requested
    const q = query(
        collection(db, 'student_performance_records'),
        where('studentEmail', '==', auth.currentUser.email),
        orderBy('timestamp', 'desc')
    );

    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherAssessment));
    } catch (error) {
        console.error("Error fetching teacher assessments:", error);
        return [];
    }
};
