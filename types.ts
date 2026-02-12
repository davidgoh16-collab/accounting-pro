
import { User } from 'firebase/auth';

export type UserLevel = 'GCSE' | 'A-Level';

export type Page = 
    | 'dashboard' 
    | 'learning_hub' 
    | 'question_practice_hub' 
    | 'question_practice' 
    | 'session_analysis' 
    | 'games_hub' 
    | 'flappy_geo' 
    | 'block_blast' 
    | 'swipe_quiz' 
    | 'game_analysis' 
    | 'flashcard_quiz_hub' 
    | 'flashcards' 
    | 'quiz_mode' 
    | 'case_study_explorer' 
    | 'skills_practice' 
    | 'command_words' 
    | 'careers_university' 
    | 'rag_analysis' 
    | 'revision_planner' 
    | 'podcast_studio' 
    | 'video_learning'
    | 'mocks_hub'
    | 'feb_mocks'
    | 'admin'
    | 'full_chat'
    | 'mock_detail'
    | 'assessment_hub';

export interface AuthUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    level?: UserLevel;
    role?: 'student' | 'admin';
}

export interface CommandWord {
    word: string;
    definition: string;
    requiredAction: string;
    aoFocus: string;
    tips: string[];
    levels: UserLevel[];
}

export interface MathsSkill {
    id: string;
    name: string;
    category: string;
    instructions: string[];
    formula?: string;
    levels: UserLevel[];
}

export interface MathsProblem {
    id: string;
    type: string;
    question: string;
    data: number[];
    answer: number | string;
    explanation: string;
    levels: UserLevel[];
}

export interface StructureGuide {
    title: string;
    aoWeighting: string;
    structureComponents: { title: string; details: string }[];
    extraTips?: string[];
    levels: UserLevel[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model' | 'system';
    text: string;
}

export interface AnswerSegment {
    text: string;
    ao: string;
    feedback: string;
}

export interface MarkedModelAnswer {
    title: string;
    segments: AnswerSegment[];
}

export interface AIFeedback {
    score: number;
    totalMarks: number;
    overallComment: string;
    strengths: string[];
    improvements: string[];
    annotatedAnswer: AnswerSegment[];
}

export interface Question {
    id: string;
    examYear: number;
    questionNumber: string;
    unit: string;
    title: string;
    prompt: string;
    marks: number;
    ao: { ao1: number; ao2: number; ao3: number; ao4?: number };
    caseStudy: { title: string; content: string };
    markScheme: { title: string; content: string };
    figures?: { name: string; url: string }[];
    level: UserLevel;
}

export interface GeneratedQuestionData {
    examYear: number;
    questionNumber: string;
    unit: string;
    title: string;
    prompt: string;
    marks: number;
    figureDescription?: string;
    ao: { ao1: number; ao2: number; ao3: number; ao4?: number };
    caseStudy: { title: string; content: string };
    markScheme: { title: string; content: string };
}

export interface CompletedSession {
    id: string;
    question: Question;
    studentAnswer: string;
    aiFeedback: AIFeedback;
    completedAt: string;
    aiSummary: string;
    level: UserLevel;
}

export type PracticeMode = 'standard' | 'teacher_led' | 'tutor' | 'timed';

export interface DraftSession {
    id: string;
    question: Question;
    studentAnswer: string;
    structuredPlan: Record<string, string>;
    figureNotes: string;
    lastUpdated: string;
    practiceMode: PracticeMode;
    timerState?: number;
    startTime?: string;
    level: UserLevel;
}

export interface SessionData {}

export interface CaseStudyMaster {
    name: string;
    aqaUnitMapping: string[];
    geographicContext: string;
    keyConcepts: string[];
    criticalDetailExample: string;
    levels: UserLevel[];
}

export interface CaseStudyLocation {
    name: string;
    topic: string;
    geography: 'Physical Geography' | 'Human Geography';
    lat: number;
    lng: number;
    details: string;
    citation: string;
    levels: UserLevel[];
}

export interface ChatSessionLog {
    id: string;
    type: 'general' | 'tutor' | 'maths';
    timestamp: string;
    preview: string;
    messages: ChatMessage[];
    context: string;
}

export interface FlashcardItem {
    name: string;
    topic: string;
    details: string;
    citation: string;
    type: 'case_study' | 'term';
    levels: UserLevel[];
}

export interface KeyTerm {
    name: string;
    topic: string;
    details: string;
    citation: string;
    type: 'term';
    levels: UserLevel[];
}

export interface MultipleChoiceQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    topic: string;
    levels: UserLevel[];
}

export interface SwipeQuizItem {
    id?: string;
    caseStudyName: string;
    statement: string;
    correctAnswer: boolean;
    imageUrl: string;
    topic: string;
}

export interface GameSessionResult {
    question: MultipleChoiceQuestion | SwipeQuizItem;
    wasCorrect: boolean;
    timestamp: string;
    level: UserLevel;
}

export interface CaseStudyQuizQuestion {
    sourceName?: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface GeographyCareer {
    title: string;
    description: string;
    salaryRange: string;
    keySkills: string[];
}

export interface UniversityCourseInfo {
    courseTitle: string;
    universityName?: string;
    description: string;
    entryRequirements: string;
    url?: string;
}

export interface JobOpportunity {
    title: string;
    company: string;
    location: string;
    description: string;
    link?: string;
}

export interface TransferableSkill {
    name?: string;
    description: string[];
    applicationInCareers: string[];
}

export interface CVSuggestions {
    personalStatement: string;
    keySkills: { skill: string; justification: string }[];
    educationEnhancements: string;
}

export interface VideoLessonSegment {
    title: string;
    script: string;
    imagePrompt: string;
    imageUrl?: string;
    audioBuffer?: AudioBuffer;
    isLoading?: boolean;
}

export interface VideoLessonPlan {
    topic: string;
    segments: VideoLessonSegment[];
}

export type RevisionMethod = 'Flashcards' | 'Practice Question' | 'Video Lesson' | 'Mind Map' | 'Textbook';

export interface RevisionSession {
    id: string;
    topic: string;
    subTopic?: string;
    date: string;
    method: RevisionMethod;
    durationMinutes: number;
    notes?: string;
    status: 'planned' | 'completed';
    level: UserLevel;
}

export type LessonBlockType = 'info' | 'multiple_choice' | 'text_input' | 'true_false' | 'fill_in_blank' | 'sorting' | 'diagram_match';

export interface LessonBlock {
    type: LessonBlockType;
    id?: string;
    heading?: string;
    content?: string;
    imagePrompt?: string;
    imageUrl?: string;
    staticImageUrl?: string;
    question?: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    textWithBlanks?: string;
    correctBlanks?: string[];
    items?: string[];
    keywords?: string[]; // For lenient text validation
}

export interface LessonContent {
    title: string;
    blocks: LessonBlock[];
}

export interface CourseLesson {
    id: string;
    title: string;
    chapter: string;
}

export interface LessonProgress {
    completed: boolean;
    score: number;
    completedAt?: string;
    lastAccessed?: string;
    lastBlockIndex?: number;
    rawScore?: number;
    savedContent?: LessonContent;
}

export interface VideoResource {
    id: string;
    title: string;
    videoId: string;
    level: UserLevel;
    topic?: string;
    paper?: 'Paper 1' | 'Paper 2';
}

export interface VideoQuizContent {
    multipleChoice: {
        question: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
    }[];
    openEnded: {
        question: string;
        sampleAnswer: string;
    }[];
}

export interface ClassGroup {
    id: string;
    name: string;
    studentIds: string[];
    yearGroup?: string; // '10', '11', '12', '13'
}

export interface TopicTrackerItem {
    topic: string;
    status: 'red' | 'amber' | 'green' | 'not_started';
}

export interface ScheduleItem {
    id: string;
    task: string;
    date: string;
    completed: boolean;
}

export interface ChecklistItem {
    id: string;
    task: string;
    completed: boolean;
}

export interface MockExam {
    id: string;
    title: string;
    paper: string;
    date: string;
    time: string;
    duration: string;
    topics: string[];
}

export interface MockConfig {
    id: string;
    title: string;
    isActive: boolean;
    level: UserLevel;
    yearGroups?: string[]; // Target year groups e.g. ['11']
    exams: MockExam[];
    topics: string[]; // List of all topics covered in this mock series
    createdAt: string;
}

export interface TeacherAssessment {
    id: string;
    studentEmail: string;
    feedback: string;
    improvementAreas?: string[];
    assessmentTitle?: string;
    topic?: string;
    mark?: number;
    maxMarks?: number;
    percentage?: number;
    timestamp?: any;
    type?: string;
    grade?: string;
    sourceApp?: string;
}

export interface GradeProfile {
    paper1: string;
    paper2: string;
    nea: string;
    overall: string;
    target: string;
}
