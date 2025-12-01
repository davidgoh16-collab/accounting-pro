
import { User } from 'firebase/auth';

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }

    interface Window {
        jspdf: any;
        html2canvas: any;
        aistudio?: AIStudio;
        AudioContext: typeof AudioContext;
        webkitAudioContext: typeof AudioContext;
    }
}

export type Page = 'dashboard' | 'question_practice_hub' | 'question_practice' | 'command_words' | 'skills_practice' | 'games_hub' | 'flappy_geo' | 'block_blast' | 'swipe_quiz' | 'game_analysis' | 'session_analysis' | 'case_study_explorer' | 'flashcard_quiz_hub' | 'flashcards' | 'quiz_mode' | 'careers_university' | 'admin' | 'rag_analysis' | 'video_overview';
export type PracticeMode = 'standard' | 'tutor' | 'timed' | 'teacher_led';
export type UserLevel = 'GCSE' | 'A-Level';

export interface Question {
  id: string;
  examYear: number;
  questionNumber: string;
  unit: string;
  title: string;
  prompt: string;
  marks: number;
  figures?: {
      name: string;
      url:string;
  }[];
  ao: {
      ao1: number;
      ao2: number;
      ao3: number;
      ao4?: number;
  };
  caseStudy: {
    title: string;
    content: string;
  };
  markScheme: {
    title: string;
    content: string;
  };
  level?: UserLevel;
}

export interface CommandWord {
  word: string;
  definition: string;
  requiredAction: string;
  aoFocus: string;
  tips: string[];
  levels: UserLevel[];
}

export type MathsSkillID = 'mean' | 'median' | 'mode' | 'range' | 'iqr' | 'std_dev' | 'spearman' | 'chi_square' | 'percentage' | 'ratio' | 'area';

export interface MathsSkill {
    id: MathsSkillID;
    name: string;
    category: string;
    instructions: string[];
    formula?: string;
    levels: UserLevel[];
}

export interface MathsProblem {
    id: string;
    type: MathsSkillID;
    question: string;
    data: number[];
    answer: number | string;
    explanation: string;
    levels: UserLevel[];
}

export interface StructureGuide {
    title: string;
    aoWeighting: string;
    structureComponents: {
        title: string;
        details: string;
    }[];
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
    ao: 'AO1' | 'AO2' | 'AO3' | 'AO4' | 'Intro' | 'Conclusion' | 'Generic';
    feedback: string;
}

export interface MarkedModelAnswer {
    title: string;
    segments: AnswerSegment[];
}

export interface AIFeedback {
    overallComment: string;
    score: number;
    totalMarks: number;
    strengths: string[];
    improvements: string[];
    annotatedAnswer: AnswerSegment[];
}

export interface CaseStudyLocation {
    name: string;
    topic: string;
    geography: string;
    lat: number;
    lng: number;
    details: string;
    citation: string;
    type?: 'case_study';
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

export type FlashcardItem = CaseStudyLocation | KeyTerm;

export interface CaseStudyMaster {
    name: string;
    aqaUnitMapping: string[];
    geographicContext: string;
    keyConcepts: string[];
    criticalDetailExample: string;
    levels: UserLevel[];
}

export interface CaseStudyQuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    name?: string;
}

export interface SwipeQuizItem {
    id: string;
    statement: string;
    imageUrl: string;
    correctAnswer: boolean;
    topic: string;
    caseStudyName: string;
}

export interface GeographyCareer {
    title: string;
    description: string;
    keySkills: string[];
    salaryRange: string;
}

export interface UniversityCourseInfo {
    courseTitle: string;
    description: string;
    entryRequirements: string;
    url?: string;
    sourceTitle?: string;
}

export interface TransferableSkill {
    skillName: string;
    description: string;
    applicationInCareers: string;
}

export interface CVSuggestions {
    personalStatement: string;
    keySkills: {
        skill: string;
        justification: string;
    }[];
    educationEnhancements: string;
}

export interface ChatSessionLog {
    id: string;
    type: 'general' | 'tutor' | 'maths';
    timestamp: string;
    preview: string;
    messages: ChatMessage[];
    context?: string;
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

export type SessionData = CompletedSession;

export interface AuthUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    level?: UserLevel; 
}

export interface MultipleChoiceQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    topic: string;
    levels: UserLevel[];
}

export interface GameSessionResult {
    question: MultipleChoiceQuestion | SwipeQuizItem;
    wasCorrect: boolean;
    timestamp: string;
    level?: UserLevel;
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