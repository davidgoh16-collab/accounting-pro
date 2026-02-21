
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthUser, CompletedSession, LessonProgress } from '../types';

export interface StudentPerformanceData {
    uid: string;
    sessions: CompletedSession[];
    learningProgress: Record<string, LessonProgress>;
    activityLogs: any[];
}

export const fetchStudentPerformance = async (uid: string): Promise<StudentPerformanceData> => {
    try {
        // 1. Sessions (Quizzes)
        const sessionsRef = collection(db, 'users', uid, 'sessions');
        const sessionsQ = query(sessionsRef, orderBy('completedAt', 'desc'), limit(50));
        const sessionsSnap = await getDocs(sessionsQ);
        const sessions = sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as CompletedSession));

        // 2. Learning Progress (Assignments)
        // This is stored in subcollections by chapter, so we iterate known chapters or just fetch a summary if available.
        // For now, let's fetch a few key chapters or iterate a predefined list.
        // Actually, `learning_progress` is usually a subcollection. We can't query across all subcollections easily client-side without a Collection Group Query.
        // Let's assume we fetch major topics.
        const learningProgress: Record<string, LessonProgress> = {};
        const topics = ['Coasts', 'Rivers', 'Hazards', 'Economic World', 'Urban Issues', 'Resource Management'];

        await Promise.all(topics.map(async (topic) => {
             const topicRef = collection(db, 'users', uid, 'learning_progress', topic, 'lessons'); // Check structure?
             // Actually structure is `users/{uid}/learning_progress/{topic}` doc which contains map of lessons?
             // Reading `LearningProgressViewer`: `doc(db, 'users', user.uid, 'learning_progress', topic)`

             const docRef = doc(db, 'users', uid, 'learning_progress', topic);
             const docSnap = await getDoc(docRef);
             if (docSnap.exists()) {
                 const data = docSnap.data();
                 Object.entries(data).forEach(([lessonId, prog]) => {
                     learningProgress[`${topic} - ${lessonId}`] = prog as LessonProgress;
                 });
             }
        }));

        // 3. Activity Logs (Time on Task)
        const logsRef = collection(db, 'users', uid, 'activity_logs');
        const logsQ = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
        const logsSnap = await getDocs(logsQ);
        const activityLogs = logsSnap.docs.map(d => d.data());

        return { uid, sessions, learningProgress, activityLogs };
    } catch (e) {
        console.error("Error fetching student performance", e);
        throw new Error("Failed to fetch student data.");
    }
};

export const fetchTopicPerformance = async (topic: string): Promise<any> => {
    // This requires a Collection Group Query index on 'sessions' where 'question.unit' == topic
    // If index exists:
    try {
        // We can't easily do this client side without the index.
        // Fallback: Fetch from a global 'stats' collection if you have one, or just fail gracefully.
        // For now, let's return a "Not Available" or simulated data if we can't query.
        return { error: "Global topic stats not available without specific indexing." };
    } catch (e) {
        return { error: e.message };
    }
};
