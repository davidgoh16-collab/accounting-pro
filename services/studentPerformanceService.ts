import { collection, query, where, getDocs } from 'firebase/firestore';
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

    // Using a simpler query to avoid composite index requirements
    const q = query(
        collection(db, 'student_performance_records'),
        where('studentEmail', '==', auth.currentUser.email)
    );

    try {
        const snapshot = await getDocs(q);
        const assessments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeacherAssessment));

        // Client-side sort by timestamp descending
        return assessments.sort((a, b) => {
            // Handle Firestore Timestamp or Date string/object
            const getMillis = (t: any) => {
                if (!t) return 0;
                if (t.toMillis) return t.toMillis(); // Firestore Timestamp
                if (t.seconds) return t.seconds * 1000; // Raw seconds
                return new Date(t).getTime(); // Date string or object
            };

            return getMillis(b.timestamp) - getMillis(a.timestamp);
        });
    } catch (error) {
        console.error("Error fetching teacher assessments:", error);
        return [];
    }
};
