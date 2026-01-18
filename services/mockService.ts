import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, getDoc, deleteDoc, query, where } from 'firebase/firestore';
import { MockConfig, MockExam, UserLevel } from '../types';

export const getMocks = async (): Promise<MockConfig[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'mocks'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockConfig));
    } catch (e) {
        console.error("Failed to fetch mocks", e);
        return [];
    }
};

export const saveMock = async (mock: MockConfig): Promise<void> => {
    try {
        await setDoc(doc(db, 'mocks', mock.id), mock);
    } catch (e) {
        console.error("Failed to save mock", e);
        throw e;
    }
};

export const deleteMock = async (mockId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'mocks', mockId));
    } catch (e) {
        console.error("Failed to delete mock", e);
        throw e;
    }
};

export const migrateFeb2026 = async (): Promise<void> => {
    const febMockId = 'feb_mocks_2026';
    const existing = await getDoc(doc(db, 'mocks', febMockId));
    if (existing.exists()) return; // Already migrated

    const febMock: MockConfig = {
        id: febMockId,
        title: 'February Mocks 2026',
        isActive: true,
        level: 'A-Level',
        createdAt: new Date().toISOString(),
        topics: [
            'Carbon Cycle', 'Water Cycle', 'Coasts', 'Hazards',
            'Global Systems', 'Global Governance', 'Changing Places', 'Urban Issues'
        ],
        exams: [
            {
                id: 'paper1',
                title: 'Paper 1: Physical Geography',
                paper: 'Paper 1',
                date: '2026-02-12',
                time: '09:00',
                duration: '2h 30m',
                topics: ['Carbon Cycle', 'Water Cycle', 'Coasts', 'Hazards']
            },
            {
                id: 'paper2',
                title: 'Paper 2: Human Geography',
                paper: 'Paper 2',
                date: '2026-02-24',
                time: '13:00',
                duration: '2h 30m',
                topics: ['Global Systems', 'Global Governance', 'Changing Places', 'Urban Issues']
            }
        ]
    };

    await saveMock(febMock);
};
