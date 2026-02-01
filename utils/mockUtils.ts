import { MockExam } from '../types';
import { GCSE_SPEC_TOPICS, COURSE_LESSONS } from '../constants';

export interface ScheduleTask {
    date: Date;
    task: string;
    examId: string;
    id: string;
    isExam: boolean;
    examTitle: string;
}

export interface ScheduleWeek {
    title: string;
    days: ScheduleTask[];
}

export const getSubTopics = (topicName: string): string[] => {
    // 1. Try manual granular list (mostly GCSE)
    if (GCSE_SPEC_TOPICS[topicName]) {
        return GCSE_SPEC_TOPICS[topicName];
    }
    // 2. Try COURSE_LESSONS (A-Level & GCSE fallback)
    const lessons = COURSE_LESSONS.filter(l => l.chapter === topicName).map(l => l.title);
    if (lessons.length > 0) {
        return lessons;
    }
    // 3. Fallback to the topic name itself
    return [topicName];
};

export const generateMockSchedule = (exams: MockExam[]): ScheduleWeek[] => {
    const tasks: ScheduleTask[] = [];

    // 1. Generate tasks for each exam working backwards
    exams.forEach(exam => {
        if (!exam.date) return;
        const examDate = new Date(exam.date);

        // Add the exam itself
        tasks.push({
            date: examDate,
            task: `EXAM: ${exam.title} (${exam.time})`,
            examId: exam.id,
            id: `${exam.id}_exam`,
            isExam: true,
            examTitle: exam.title
        });

        // Expand topics
        const allSubTopics = exam.topics.flatMap(topic =>
            getSubTopics(topic).map(sub => ({ parent: topic, title: sub }))
        );

        // Work backwards from exam date - 1 day
        let currentDate = new Date(examDate);
        currentDate.setDate(currentDate.getDate() - 1);

        // Reverse topics so the last one is closest to exam
        [...allSubTopics].reverse().forEach((topic, idx) => {
            // Determine ID (stable based on topic index in reversed list)
            const id = `${exam.id}_task_${allSubTopics.length - 1 - idx}`;

            tasks.push({
                date: new Date(currentDate),
                task: `${topic.parent}: ${topic.title}`,
                examId: exam.id,
                id: id,
                isExam: false,
                examTitle: exam.title
            });

            // Move back one day
            currentDate.setDate(currentDate.getDate() - 1);
        });
    });

    // 2. Sort all tasks by date
    tasks.sort((a, b) => a.date.getTime() - b.date.getTime());

    // 3. Group by Week (Monday start)
    const weeks: ScheduleWeek[] = [];
    let currentWeek: ScheduleTask[] = [];
    let currentWeekStart: Date | null = null;

    tasks.forEach(task => {
        // Find Monday of the task's week
        const d = new Date(task.date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(d.setDate(diff));
        monday.setHours(0,0,0,0);

        if (!currentWeekStart || monday.getTime() !== currentWeekStart.getTime()) {
            if (currentWeek.length > 0) {
                weeks.push({
                    title: `Week Commencing ${currentWeekStart!.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`,
                    days: currentWeek
                });
            }
            currentWeek = [];
            currentWeekStart = monday;
        }
        currentWeek.push(task);
    });

    if (currentWeek.length > 0 && currentWeekStart) {
        weeks.push({
            title: `Week Commencing ${currentWeekStart.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`,
            days: currentWeek
        });
    }

    return weeks;
};
