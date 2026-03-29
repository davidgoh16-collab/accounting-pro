
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChatMessage, Question, MarkedModelAnswer, MathsProblem, MathsSkill, AIFeedback, CaseStudyLocation, CaseStudyQuizQuestion, SwipeQuizItem, GeographyCareer, UniversityCourseInfo, JobOpportunity, TransferableSkill, CVSuggestions, FlashcardItem, UserLevel, VideoLessonPlan, LessonContent, GeneratedQuestionData, VideoQuizContent, CompletedSession, AuthUser, ClassGroup } from "../types";
import { MASTER_CASE_STUDIES, ALL_QUESTIONS as QUESTION_EXAMPLES } from "../database";
import { STATIC_LESSONS } from "../lesson-content-database";
import { KEY_TERMS } from "../knowledge-database";
import { auth, db, getCourseFiles, downloadFileAsBase64, uploadBase64Image } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getSpecContext } from '../utils/contentUtils';
import { fetchStudentPerformance, fetchTopicPerformance } from './adminService';
import { AQA_ALEVEL_SPEC, AQA_GCSE_SPEC, EDEXCEL_IGCSE_SPEC } from '../data/specifications';
import { sanitizeForFirestore } from '../utils/firestoreUtils';

// --- MODEL CONFIGURATION ---
// Using stable versions to prevent 400 Bad Request errors.

const STRICT_AQA_CONTEXT = "You are an expert AQA Geography examiner. All content must be strictly aligned with the AQA GCSE and A-Level specifications.";
const STRICT_IGCSE_CONTEXT = "You are an expert Edexcel International GCSE Geography examiner. All content must be strictly aligned with the Pearson Edexcel International GCSE Geography (4GE1) specification.";

const getStrictContext = (level?: UserLevel) => {
    if (level === 'IGCSE') return STRICT_IGCSE_CONTEXT;
    return STRICT_AQA_CONTEXT;
};

// Safety settings for DfE compliance
const SAFETY_SETTINGS = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

// Proxy client to route requests through backend
class ProxyClient {
    models = {
        generateContent: async (params: any) => {
            const response = await fetch('/api/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Request failed' }));
                throw new Error(error.error || error.message || 'Request failed');
            }
            return await response.json();
        },
        generateContentStream: async function* (params: any) {
             const response = await fetch('/api/generate-content-stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Stream request failed' }));
                throw new Error(error.error || error.message || 'Stream request failed');
            }
            if (!response.body) throw new Error('ReadableStream not supported');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const chunk = JSON.parse(line);
                            yield chunk;
                        } catch (e) {
                            console.error('Error parsing stream chunk', e);
                        }
                    }
                }
            }
        },
        generateImages: async (params: any) => {
             const response = await fetch('/api/generate-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Image generation failed' }));
                throw new Error(error.error || error.message || 'Image generation failed');
            }
            return await response.json();
        }
    }
}

const getAiClient = (): GoogleGenAI => {
    return new ProxyClient() as unknown as GoogleGenAI;
};

const getUserContext = async (userId: string, level: UserLevel): Promise<string> => {
    try {
        let context = `User Profile:\n- Level: ${level}\n`;

        // 1. Recent Sessions
        const sessionsRef = collection(db, 'users', userId, 'sessions');
        const qSessions = query(sessionsRef, orderBy('completedAt', 'desc'), limit(5));
        const sessionsSnap = await getDocs(qSessions);
        if (!sessionsSnap.empty) {
            context += "- Recent Activity:\n";
            sessionsSnap.docs.forEach(doc => {
                const s = doc.data() as CompletedSession;
                if (s.level === level) {
                    context += `  * Topic: ${s.question.unit} - Score: ${s.aiFeedback.score}/${s.aiFeedback.totalMarks}\n`;
                }
            });
        }

        // 2. Weak Areas (Manual RAG)
        const manualRef = doc(db, 'users', userId, 'manual_progress', 'rag_sheet');
        const manualSnap = await getDoc(manualRef);
        if (manualSnap.exists()) {
            const ratings = manualSnap.data() as Record<string, string>;
            const weak = Object.entries(ratings).filter(([_, status]) => status === 'Red').map(([topic]) => topic);
            const strong = Object.entries(ratings).filter(([_, status]) => status === 'Green').map(([topic]) => topic);

            if (weak.length > 0) context += `- Weak Areas (Focus needed): ${weak.join(', ')}\n`;
            if (strong.length > 0) context += `- Strong Areas: ${strong.join(', ')}\n`;
        }

        return context;
    } catch (e) {
        console.error("Error fetching user context", e);
        return ""; // Fail gracefully
    }
};

const checkDailyLimit = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // 1. Get Global Limit
        const settingsRef = doc(db, 'settings', 'global');
        const settingsSnap = await getDoc(settingsRef);
        const limit = settingsSnap.exists() ? settingsSnap.data().dailyRequestLimit : 50; // Default 50

        if (limit === -1) return; // Unlimited

        // 2. Get User Usage
        const today = new Date().toISOString().split('T')[0];
        const usageRef = doc(db, 'users', user.uid, 'usage_stats', today);
        const usageSnap = await getDoc(usageRef);

        const currentUsage = usageSnap.exists() ? usageSnap.data().count : 0;

        if (currentUsage >= limit) {
            throw new Error(`Daily AI limit of ${limit} reached. Upgrade or try again tomorrow.`);
        }

        // 3. Increment
        if (!usageSnap.exists()) {
            await setDoc(usageRef, { count: 1, date: today });
        } else {
            await updateDoc(usageRef, { count: increment(1) });
        }
    } catch (e: any) {
        console.error("Usage limit check failed:", e);
        // If it's our limit error, rethrow it. If it's a network/firestore error, maybe let it slide?
        // For now, rethrow so we fail safe.
        throw e;
    }
};

export const getImageLimitStatus = async (): Promise<{ used: number, limit: number }> => {
    const user = auth.currentUser;
    if (!user) return { used: 0, limit: 0 };

    try {
        const settingsRef = doc(db, 'settings', 'global');
        const settingsSnap = await getDoc(settingsRef);
        const limit = settingsSnap.exists() ? (settingsSnap.data().dailyImageLimit ?? 5) : 5;

        if (limit === -1) return { used: 0, limit: 9999 };

        const today = new Date().toISOString().split('T')[0];
        const usageRef = doc(db, 'users', user.uid, 'usage_stats', today);
        const usageSnap = await getDoc(usageRef);
        const used = usageSnap.exists() ? (usageSnap.data().imageCount ?? 0) : 0;

        return { used, limit };
    } catch (e) {
        console.error("Failed to fetch image limit status", e);
        return { used: 0, limit: 5 };
    }
};

const checkAndIncrementImageLimit = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const { used, limit } = await getImageLimitStatus();

        if (limit !== -1 && used >= limit) {
            throw new Error(`Daily figure generation limit of ${limit} reached. Please try again tomorrow.`);
        }

        const today = new Date().toISOString().split('T')[0];
        const usageRef = doc(db, 'users', user.uid, 'usage_stats', today);

        // Ensure doc exists before updating imageCount specifically
        // If we are calling this, we probably haven't called checkDailyLimit yet for this specific action?
        // But usage_stats doc might not exist if this is the first action of the day.
        const usageSnap = await getDoc(usageRef);

        if (!usageSnap.exists()) {
            await setDoc(usageRef, { count: 0, imageCount: 1, date: today });
        } else {
            await updateDoc(usageRef, { imageCount: increment(1) });
        }
    } catch (e: any) {
        console.error("Image limit check failed:", e);
        throw e;
    }
};

const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
    try {
        await checkDailyLimit();
        return await apiCall();
    } catch (e: any) {
        console.error("Gemini API call failed:", e);
        throw e;
    }
};

const cleanJson = (text: string): string => {
    // Remove markdown code blocks if present
    let clean = text.replace(/```json\n?/g, '').replace(/```/g, '');
    
    // Attempt to extract the JSON object or array if there's surrounding text
    const firstCurly = clean.indexOf('{');
    const firstSquare = clean.indexOf('[');

    let start = -1;
    let end = -1;

    if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
        start = firstCurly;
        end = clean.lastIndexOf('}');
    } else if (firstSquare !== -1) {
        start = firstSquare;
        end = clean.lastIndexOf(']');
    }

    if (start !== -1 && end !== -1 && end > start) {
        clean = clean.substring(start, end + 1);
    }
    
    return clean.trim();
};

export const detectDistress = async (text: string): Promise<boolean> => {
    const ai = getAiClient();
    const prompt = `Analyze the following student message for signs of severe emotional distress, anxiety, self-harm intent, or serious safeguarding concerns.

    Message: "${text}"

    Return strictly JSON: { "isDistress": boolean, "reason": "string" }

    Flag TRUE for:
    - Expressions of self-harm or suicide.
    - Statements indicating feeling "low", "depressed", "anxious", or "hopeless" (mental health concerns).
    - Indications of bullying or abuse.

    Do NOT flag minor frustration with homework (e.g. "I hate geography", "This is killing me" in a hyperbolic sense).

    Prioritize child safety. If in doubt, flag as TRUE.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                safetySettings: SAFETY_SETTINGS
            }
        });
        const result = JSON.parse(cleanJson(response.text || '{}'));
        return result.isDistress === true;
    } catch (e) {
        console.error("Distress detection failed", e);
        // Fail-safe: if detection fails but text contains trigger words, maybe flag?
        // For now, return false to avoid spamming if API is down.
        return false;
    }
};

const logSafeguardingAlert = async (text: string, userId: string) => {
    try {
        // Fetch user profile to get the display name
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userName = userDoc.exists() ? (userDoc.data().displayName || 'Unknown Student') : 'Unknown Student';

        await addDoc(collection(db, 'safeguarding_alerts'), {
            uid: userId,
            message: text,
            timestamp: new Date().toISOString(),
            status: 'unresolved'
        });
        console.warn(`Safeguarding alert logged for user ${userId}`);

        // Power Automate Trigger via secure backend proxy
        await fetch('/api/safeguarding-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                userName: userName,
                type: 'Chat Message Distress',
                content: text,
                context: "Geo Pro"
            })
        }).catch(e => console.error("Failed to send webhook to Power Automate:", e));
    } catch (error) {
        console.error("Error saving Geo Pro safeguarding alert:", error);
    }
};

export const generateQuestion = async (params: { unit: string; marks: number; level: UserLevel; includeFigure?: boolean; subTopic?: string; forceFormationQuestion?: boolean; questionType?: string; }): Promise<GeneratedQuestionData> => handleApiCall(async () => {
    const ai = getAiClient();
    let levelContext = "AQA GCSE Geography (Specification 8035)";
    if (params.level === 'A-Level') levelContext = "AQA A-Level Geography";
    if (params.level === 'IGCSE') levelContext = "Edexcel International GCSE Geography (4GE1)";
    
    // Figure instruction
    const figureInstruction = params.includeFigure
        ? "You MUST generate a relevant 'figureDescription' for a stimulus (map, graph, photo) that the question is based on."
        : "Do NOT generate a figure or resource. The question should be answerable without a stimulus.";

    let promptExtraInstructions = "";
    if (params.questionType) {
        promptExtraInstructions += `Question Type: "${params.questionType}". Ensure the question style matches this description. `;
    }

    if (params.level === 'A-Level' && params.marks === 6) {
        promptExtraInstructions += `IMPORTANT: This MUST be a specialized "Analyse the data..." question (AO3). Require TESLA model in mark scheme. `;
    }

    if (params.subTopic && params.subTopic !== 'All Sub-topics') {
        promptExtraInstructions += `Focus strictly on the sub-topic: "${params.subTopic}". `;
    }

    if (params.forceFormationQuestion) {
        promptExtraInstructions += `This MUST be a 4-mark "Explain the formation of..." question. `;
        if (params.includeFigure) {
            promptExtraInstructions += `The question must ask to explain the formation of the landform shown in the figure (do not name the feature in the question, just refer to Figure X). `;
        } else {
            promptExtraInstructions += `The question must name a specific landform (e.g., spit, waterfall, corrie) and ask for its formation. `;
        }
        promptExtraInstructions += `Mark scheme must award marks for: 1. Identifying/Defining the feature (if applicable) or stating the start point. 2. Sequenced explanation of formation processes. `;
    }

    const fullPrompt = `Generate a new, unique ${levelContext} exam question.
    Unit: "${params.unit}"
    Marks: ${params.marks}
    ${figureInstruction}
    ${promptExtraInstructions}

    Format as JSON object: { "examYear": 2024, "questionNumber": "01.X", "unit": "${params.unit}", "title": "string", "prompt": "string", "marks": number, "figureDescription": "string", "ao": { "ao1": number, "ao2": number, "ao3": number, "ao4": number }, "caseStudy": { "title": "string", "content": "string" }, "markScheme": { "title": "string", "content": "string" } }`;

    const stream = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents: fullPrompt,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    let fullText = '';
    for await (const chunk of stream) {
        fullText += (chunk.text || '');
    }

    return JSON.parse(cleanJson(fullText || '{}')) as GeneratedQuestionData;
});

export const generateFigure = async (description: string): Promise<string> => {
    // Check specific image limit
    try {
        await checkAndIncrementImageLimit();
        const ai = getAiClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Geography exam figure: ${description}`,
            config: {
                numberOfImages: 1,
                aspectRatio: "16:9",
                safetySettings: SAFETY_SETTINGS
            }
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        throw new Error("No image generated.");
    } catch (e: any) {
        console.error("Image generation failed or limit reached", e);
        if (e.message && e.message.includes("Daily AI limit")) {
            throw e; // Propagate limit error
        }
        return "https://placehold.co/600x400?text=Figure+Generation+Failed";
    }
};

export const streamChatResponse = async (history: ChatMessage[], message: string, mode: 'fast' | 'complex', level: UserLevel = 'GCSE', contextMode: 'strict' | 'research' = 'strict', onChunk: (chunk: string) => void): Promise<void> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const user = auth.currentUser;

    // Background Distress Check
    detectDistress(message).then(isDistressed => {
        if (isDistressed && user) {
            logSafeguardingAlert(message, user.uid);
        }
    });

    const contents: any[] = history.filter(m => m.role !== 'system').map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));

    // Add user message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const modelName = mode === 'fast' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';

    let systemInstruction = `You are an AI assistant for Geography, supporting ${level} students.`;

    // Fetch User Context
    if (user) {
        const userContext = await getUserContext(user.uid, level);
        if (userContext) {
            systemInstruction += `\n\n${userContext}`;
        }
    }

    systemInstruction += `
    SAFETY & ETHICS GUIDELINES (MANDATORY):
    1. **No Anthropomorphism**: Do NOT imply you have feelings, opinions, consciousness, or a physical body. Do not say "I think", "I feel", or "I believe". Use neutral phrases like "The evidence suggests" or "It is generally understood".
    2. **No Manipulation**: Do NOT use flattery, guilt, or fear to keep the student engaged. Be helpful but neutral.
    3. **Progressive Disclosure**: Do NOT spoon-feed answers. If the student asks a question, guide them to the answer with hints or questions (scaffolding) rather than giving the full explanation immediately, unless they explicitly ask for a summary.
    `;

    if (contextMode === 'strict') {
        let specContent = AQA_GCSE_SPEC;
        if (level === 'A-Level') specContent = AQA_ALEVEL_SPEC;
        if (level === 'IGCSE') specContent = EDEXCEL_IGCSE_SPEC;

        const specName = level === 'IGCSE' ? 'Edexcel International GCSE (4GE1)' : `AQA ${level}`;

        systemInstruction += `
        STRICT MODE ENABLED.
        You must ONLY answer questions using content from the ${specName} Geography specification provided below.

        Reference Context (Specification):
        ${specContent}

        Rules:
        1. Use the provided specification text as the PRIMARY source of truth.
        2. If a student asks about a topic NOT in the specification, politely decline.
        3. Do NOT hallucinate case studies.
        4. Tailor your response based on the "User Profile" provided above (e.g. if they are weak in a topic, provide more detail).
        `;
    } else {
        systemInstruction += `
        RESEARCH MODE ENABLED.
        You HAVE access to the 'googleSearch' tool. You MUST use it to find real-world examples, recent events, and additional context.

        Rules:
        1. You MUST use the googleSearch tool to verify facts.
        2. You MUST provide citations for external information using Markdown links inline (e.g. "According to [BBC News](http://bbc.co.uk)...").
        3. Ensure information is relevant to AQA ${level} Geography.
        `;
    }

    const tools = contextMode === 'research' ? [{ googleSearch: {} }] : undefined;
    const config = mode === 'complex' ? { thinkingConfig: { thinkingBudget: 8192 }, tools, safetySettings: SAFETY_SETTINGS } : { tools, safetySettings: SAFETY_SETTINGS };

    const responseStream = await ai.models.generateContentStream({ model: modelName, contents: contents, config: { ...config, systemInstruction } });

    const collectedSources: Set<string> = new Set();

    for await (const chunk of responseStream) {
        onChunk(chunk.text || '');

        // Extract grounding metadata if present (GroundingChunks)
        // Note: The SDK structure for grounding metadata might vary, we check candidates[0]
        const candidate = chunk.candidates?.[0];
        if (candidate?.groundingMetadata?.groundingChunks) {
            candidate.groundingMetadata.groundingChunks.forEach((c: any) => {
                if (c.web?.uri && c.web?.title) {
                    collectedSources.add(`[${c.web.title}](${c.web.uri})`);
                }
            });
        }
    }

    // Append collected sources to the end of the message if Research Mode was active and sources were found
    if (contextMode === 'research' && collectedSources.size > 0) {
        const sourcesList = Array.from(collectedSources).map(s => `- ${s}`).join('\n');
        onChunk(`\n\n### 📚 Sources:\n${sourcesList}`);
    }
};

export const getHint = async (question: Question): Promise<string> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Hint for: ${question.prompt}`,
        config: { safetySettings: SAFETY_SETTINGS }
    });
    return response.text || 'Think about the command word.';
};

export const getMotivationalMessage = async (): Promise<string> => {
    // Motivational message is 'cheap', maybe skip limit?
    // Let's include it for consistency, or skip to be nice. I'll include it.
    await checkDailyLimit();
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Motivational msg for student.`,
        config: { safetySettings: SAFETY_SETTINGS }
    });
    return response.text || 'Keep going!';
};

export const generateModelAnswer = async (question: Question): Promise<MarkedModelAnswer> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const stream = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents: `Model answer for ${question.prompt}`,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    let fullText = '';
    for await (const chunk of stream) {
        fullText += (chunk.text || '');
    }

    return JSON.parse(cleanJson(fullText || '{}'));
};

export const streamTutorResponse = async (question: Question, history: ChatMessage[], message: string, onChunk: (chunk: string) => void): Promise<void> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const systemInstruction = `You are an interactive Geography tutor...`;
    const contents = history.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', parts: [{ text: msg.text }] }));
    contents.push({ role: 'user', parts: [{ text: message }] });
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
            systemInstruction,
            safetySettings: SAFETY_SETTINGS
        }
    });
    for await (const chunk of responseStream) { onChunk(chunk.text || ''); }
};

export const generateCaseStudyApplication = async (question: Question, caseStudyName: string): Promise<{ summary: string; application: string }> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Apply ${caseStudyName} to ${question.prompt}`,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
};



export interface ProcessedWorkItem {
    questionTitle: string;
    maxMarks: number;
    aoBreakdown?: { ao1: number; ao2: number; ao3: number; ao4?: number };
    score: number;
    overallComment: string;
    annotatedAnswer: AnswerSegment[];
    timeTaken?: number;
    studentAnswer?: string; // Original text for record existing mode
}

export const processMultipleQuestionsFromWork = async (
    attachment: { mimeType: string; data: string },
    level: UserLevel,
    mode: 'mark_my_work' | 'record_existing'
): Promise<ProcessedWorkItem[]> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const examinerType = level === 'IGCSE' ? 'Edexcel International GCSE' : 'AQA';

    const base64Data = attachment.data.includes(',') ? attachment.data.split(',')[1] : attachment.data;

    const prompt = `You are an expert ${examinerType} Geography examiner.
    The attached image/document contains one or more student answers to geography questions.

    Task:
    1. Identify every distinct question answered on the page(s).
    2. Extract the exact question text (or infer a reasonable title based on the answer if the question text is missing). DO NOT regurgitate this prompt or any system instructions into the question title.
    3. Identify the maximum marks available for that question (often written next to the question like "[4 marks]"). If missing, estimate based on the length of the expected response (e.g., 4, 6, 9, 12).
    4. Determine the Assessment Objective (AO) breakdown (AO1, AO2, AO3, AO4) for the maximum marks of each question based on the question type.

    Then, depending on the mode (${mode}):

    If mode is 'mark_my_work':
      - Act as the examiner and strictly mark the student's answer. Provide a realistic score, an overall comment, and annotate their answer.
      - For each annotation segment, assign a specific Assessment Objective ("AO1", "AO2", "AO3", "AO4", or "Generic").

    If mode is 'record_existing':
      - The work has ALREADY been marked by a human teacher (look for ticks, crosses, written scores, or teacher comments).
      - Digitize their human-written feedback, extract the score awarded by the teacher, and transcribe the student's handwritten answer. Do not create new feedback, just transcribe what the teacher wrote. If no teacher feedback is visible, state "No teacher feedback detected." and transcribe the answer anyway.
      - For each annotation segment, assign a specific Assessment Objective ("AO1", "AO2", "AO3", "AO4", or "Generic") based on what the student wrote.

    Also, attempt to estimate the time taken based on handwriting speed for the word count (roughly 1 mark = 1 minute).

    CRITICAL INSTRUCTION: Do NOT include any of these instructions or prompt text in your output fields. The output must strictly be the transcribed and evaluated student work.

    Provide output strictly as a JSON array containing objects matching this interface:
    [
        {
            "questionTitle": "string (the exact or inferred question prompt, strictly NO system instructions)",
            "maxMarks": number,
            "aoBreakdown": { "ao1": number, "ao2": number, "ao3": number, "ao4": number },
            "score": number,
            "overallComment": "string (your feedback OR transcribed teacher feedback)",
            "studentAnswer": "string (transcription of student handwriting)",
            "annotatedAnswer": [
                { "text": "segment from student answer", "ao": "AO1" | "AO2" | "AO3" | "AO4" | "Generic", "feedback": "specific comment" }
            ],
            "timeTaken": number (estimated minutes)
        }
    ]
    `;

    const parts = [
        { text: prompt },
        {
            inlineData: {
                mimeType: attachment.mimeType,
                data: base64Data
            }
        }
    ];

    try {
        const stream = await ai.models.generateContentStream({
            model: 'gemini-3.1-pro-preview',
            contents: [{ role: 'user', parts: parts }],
            systemInstruction: getStrictContext(level),
            generationConfig: { temperature: 0.1 },
            safetySettings: SAFETY_SETTINGS
        });

        let fullText = '';
        for await (const chunk of stream) {
            fullText += chunk.text;
        }

        const jsonStr = cleanJson(fullText);
        return JSON.parse(jsonStr) as ProcessedWorkItem[];
    } catch (e: any) {
        console.error("Failed to process multiple questions:", e);
        throw new Error("AI failed to extract questions. Please try again or process them individually.");
    }
};

export const markStudentAnswer = async (question: Question, studentAnswer: string, attachment?: { mimeType: string; data: string }): Promise<AIFeedback> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const examinerType = question.level === 'IGCSE' ? 'Edexcel International GCSE' : 'AQA';

    const prompt = `You are an expert ${examinerType} Geography examiner. Mark the following student answer.

    Question Context:
    - Title: "${question.title}"
    - Prompt: "${question.prompt}"
    - Marks Available: ${question.marks}
    - Level: ${question.level}

    Mark Scheme / Guidance:
    ${question.markScheme?.content || `No specific mark scheme provided. Use expert judgment based on ${examinerType} standards.`}

    Student Answer:
    "${studentAnswer}"

    ${attachment ? '(Note: The student also provided an image/document attachment which you should consider if visible)' : ''}

    Provide output in strict JSON format matching this structure:
    {
        "score": number,
        "totalMarks": ${question.marks},
        "overallComment": "string",
        "strengths": ["string", "string"],
        "improvements": ["string", "string"],
        "annotatedAnswer": [
            { "text": "segment from student answer", "ao": "AO1|AO2|AO3|Generic", "feedback": "specific comment" }
        ]
    }

    Ensure "annotatedAnswer" reconstructs the student's answer with feedback interleaved or attached to segments.
    `;

    const parts: any[] = [{ text: prompt }];

    if (attachment) {
        const base64Data = attachment.data.includes(',') ? attachment.data.split(',')[1] : attachment.data;
        parts.push({
            inlineData: {
                mimeType: attachment.mimeType,
                data: base64Data
            }
        });
    }

    const stream = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents: [{ role: 'user', parts: parts }],
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    let fullText = '';
    for await (const chunk of stream) {
        fullText += (chunk.text || '');
    }

    return JSON.parse(cleanJson(fullText || '{}'));
};

export const generateSessionSummary = async (question: Question, feedback: AIFeedback): Promise<string> => {
    // Summary is generated automatically after marking. It should count as part of the flow.
    await checkDailyLimit();
    const ai = getAiClient();
    const prompt = `You are a geography teacher writing a concise, one-sentence summary for a student's practice session.

    Question Title: ${question.title || question.prompt}
    Student Score: ${feedback.score}/${feedback.totalMarks}
    Teacher Feedback: ${feedback.overallComment}

    Write a short summary (maximum 15 words) of how the student performed on this specific topic. Do NOT ask for more details. Just write the summary sentence based on the provided information. Example format: "Scored 4/4 on tectonic hazards with excellent explanation of plate margins." or "Struggled with longshore drift, scoring 2/6. Needs to review coastal processes."`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
            config: { safetySettings: SAFETY_SETTINGS }
        });
        return response.text?.trim() || 'Session complete.';
    } catch (e) {
        console.error("Error generating session summary", e);
        return 'Session complete.';
    }
};

export const streamMathsTutorResponse = async (problem: MathsProblem, skill: MathsSkill, history: ChatMessage[], message: string, onChunk: (chunk: string) => void): Promise<void> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: [{role: 'user', parts: [{text: message}]}],
        config: { safetySettings: SAFETY_SETTINGS }
    });
    for await (const chunk of responseStream) { onChunk(chunk.text || ''); }
};

export const generateCaseStudyInfo = async (study: CaseStudyLocation): Promise<{ summary: string; imageUrl: string }> => {
    await checkDailyLimit();
    const ai = getAiClient();
    // Handling parallel calls safely
    try {
        const info = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summary of ${study.name}`,
            config: { safetySettings: SAFETY_SETTINGS }
        });

        let imageUrl = "https://placehold.co/600x400?text=Case+Study+Image";
        try {
            const img = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `Image of ${study.name}`,
                config: { numberOfImages: 1, safetySettings: SAFETY_SETTINGS }
            });
            if (img.generatedImages && img.generatedImages.length > 0) {
                imageUrl = `data:image/png;base64,${img.generatedImages[0].image.imageBytes}`;
            }
        } catch (imgError) {
            console.error("Case study image generation failed:", imgError);
        }

        return { summary: info.text || '', imageUrl };
    } catch (e) {
        console.error("Failed to generate case study info", e);
        return { summary: "Details unavailable.", imageUrl: "https://placehold.co/600x400?text=Error" };
    }
};

export const generateBatchQuizQuestions = async (items: FlashcardItem[]): Promise<CaseStudyQuizQuestion[]> => handleApiCall(async () => {
    if (items.length === 0) return [];

    const ai = getAiClient();
    const systemContext = getStrictContext(items[0]?.levels?.[0]);

    const itemsContext = items.map((item, index) =>
        `Item ${index + 1}: ${item.name} (${item.type})\nContext: ${item.details}`
    ).join('\n\n');

    const seed = Math.floor(Math.random() * 1000000); // Random seed to force variance

    const prompt = `Create a unique quiz with ${items.length} multiple-choice questions, one for each of the following items.

    Random Seed: ${seed} (Ensure questions are different from previous generations if possible).

    Focus on different angles for each question (e.g., definition, application, cause/effect, or a specific detail). Do not just ask "What is [Item]?".

    ${itemsContext}

    Instruction:
    - Return a JSON ARRAY of objects.
    - Each object must correspond to one item in the order provided.
    - Format for each object:
    {
      "sourceName": "Exact Name of the Item",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
    - "correctAnswer" must be EXACTLY identical to one of the "options".
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemContext,
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    const jsonText = cleanJson(response.text || '[]');
    try {
        let parsed: any[] = [];
        const raw = JSON.parse(jsonText);
        if (Array.isArray(raw)) {
            parsed = raw;
        } else if (raw.questions && Array.isArray(raw.questions)) {
             parsed = raw.questions;
        }

        // Post-processing to ensure data integrity
        return parsed.map(q => {
            const options = q.options || [];
            let correctAnswer = q.correctAnswer;

            // 1. Exact match check
            if (options.includes(correctAnswer)) return q;

            // 2. Fuzzy match (case-insensitive, trimmed)
            const fuzzyMatch = options.find((opt: string) => opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase());
            if (fuzzyMatch) {
                return { ...q, correctAnswer: fuzzyMatch };
            }

            // 3. Fallback: If answer is an index (0-3) or letter (A-D), try to map it
            // (Skipping complex logic for now, defaulting to first option if total mismatch to prevent UI lockup)
            // Ideally, we shouldn't guess, but a mismatch breaks the quiz.
            // Let's try to see if the correct answer string is *contained* in an option
            const containmentMatch = options.find((opt: string) => opt.includes(correctAnswer) || correctAnswer.includes(opt));
            if (containmentMatch) {
                return { ...q, correctAnswer: containmentMatch };
            }

            // Extreme fallback: Set correct answer to the first option (better than broken state)
            // But this makes the quiz "wrong" technically. Better than "Marked Wrong" when right?
            // Actually, if we set it to option[0], and the user picks option[0], they get points.
            // If they pick the "actual" right answer (which might be option[1]), they lose points.
            // But if correct answer string doesn't match ANY option, the user can NEVER get it right.
            console.warn(`Fixed mismatched quiz answer for "${q.question}". Expected: ${correctAnswer}, Options: ${options.join(', ')}`);

            // NEW STRATEGY: Do not just pick option[0]. Pick the option that is most similar (Levenshtein-ish) or just fail gracefully?
            // If we force it to option[0], users get angry.
            // Let's try to find the option with the most shared words.
            const correctWords = correctAnswer.toLowerCase().split(' ');
            let bestMatch = options[0];
            let maxOverlap = 0;

            options.forEach(opt => {
                const optWords = opt.toLowerCase().split(' ');
                const overlap = optWords.filter(w => correctWords.includes(w)).length;
                if (overlap > maxOverlap) {
                    maxOverlap = overlap;
                    bestMatch = opt;
                }
            });

            return { ...q, correctAnswer: bestMatch };
        });
    } catch (e) {
        console.error("Failed to parse batch quiz questions", e);
        return [];
    }
});

export const streamAdminChat = async (history: ChatMessage[], message: string, contextData: { users: AuthUser[], classes: ClassGroup[] }, onChunk: (chunk: string) => void): Promise<void> => {
    await checkDailyLimit();
    const ai = getAiClient();

    // Prepare Data Summary
    const userSummary = contextData.users.map(u => ({
        id: u.uid,
        name: u.displayName,
        email: u.email,
        level: u.level,
        role: u.role
    }));

    const classSummary = contextData.classes.map(c => ({
        id: c.id,
        name: c.name,
        size: c.studentIds.length,
        year: c.yearGroup
    }));

    const tools = [
        {
            functionDeclarations: [
                {
                    name: "fetchStudentPerformance",
                    description: "Fetches detailed performance data for a specific student using their User ID (uid) or Email. Use this when asked about a student's progress, grades, assignments, or time spent.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            identifier: { type: "STRING", description: "The User UID or Email address" }
                        },
                        required: ["identifier"]
                    }
                },
                {
                    name: "fetchTopicPerformance",
                    description: "Fetches aggregated global statistics for a specific geography topic (e.g., 'Coasts', 'Tectonics'). Use this to compare class performance.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            topic: { type: "STRING", description: "The name of the topic" }
                        },
                        required: ["topic"]
                    }
                }
            ]
        }
    ];

    const systemInstruction = `You are an expert Educational Data Analyst and Assistant for the Admin of a Geography learning platform.

    Current Data Context (Summary):
    - Users: ${JSON.stringify(userSummary)}
    - Classes: ${JSON.stringify(classSummary)}

    Capabilities:
    1. Answer questions about the user base (metadata).
    2. **DEEP ANALYSIS**: If asked about a *specific student* or *topic*, YOU MUST USE THE PROVIDED TOOLS to fetch real data. Do not guess.
    3. **Generate Charts**: If a question is best answered with a visualization, output a JSON object wrapped in \`\`\`json-chart ... \`\`\`.

    Chart Rules:
    - Supported types: 'bar', 'pie', 'line', 'area'.
    - Structure: { "type": "...", "title": "...", "data": [...], "xKey": "...", "yKey": "..." }

    Tone: Professional, helpful, data-driven.
    `;

    const contents = history.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', parts: [{ text: msg.text }] }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    // Initial Request with Tools
    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
            systemInstruction,
            tools: tools,
            safetySettings: SAFETY_SETTINGS
        }
    });

    const candidates = result.candidates || [];
    const firstCandidate = candidates[0];
    const parts = firstCandidate?.content?.parts || [];

    let toolResponseText = "";

    // Check for Function Calls
    for (const part of parts) {
        if (part.functionCall) {
            const fnName = part.functionCall.name;
            const args = part.functionCall.args as any;

            onChunk(`\n\n*Analyzing data for ${args.identifier || args.topic}...*\n\n`);

            let toolResultStr = "{}";
            try {
                if (fnName === 'fetchStudentPerformance') {
                    // Resolve Email to UID if needed
                    let uid = args.identifier;
                    const foundUser = contextData.users.find(u => u.email === args.identifier || u.uid === args.identifier || u.displayName === args.identifier);
                    if (foundUser) uid = foundUser.uid;

                    const data = await fetchStudentPerformance(uid);

                    // -- Aggregation Logic --
                    // 1. Time on Task (Estimate based on log timestamps)
                    // We look for 'login' or 'session_start' events and calculate gaps, or just count active days.
                    // For simplicity and reliability without complex session tracking, we count distinct days active and total actions.
                    const activeDays = new Set(data.activityLogs.map(l => {
                        // Handle Firestore Timestamp or ISO string
                        if (l.timestamp && typeof l.timestamp.toDate === 'function') {
                            return l.timestamp.toDate().toISOString().split('T')[0];
                        } else if (typeof l.timestamp === 'string') {
                            return l.timestamp.split('T')[0];
                        }
                        return 'unknown';
                    })).size;

                    // 2. Topic Performance
                    const topicStats: Record<string, { total: number, count: number }> = {};
                    data.sessions.forEach(s => {
                        const topic = s.question.unit || 'Unknown';
                        if (!topicStats[topic]) topicStats[topic] = { total: 0, count: 0 };
                        topicStats[topic].total += (s.aiFeedback.score / s.aiFeedback.totalMarks) * 100;
                        topicStats[topic].count++;
                    });

                    const topicPerformance = Object.entries(topicStats).map(([topic, stats]) =>
                        `${topic}: ${(stats.total / stats.count).toFixed(0)}% (${stats.count} quizzes)`
                    );

                    // Summarize data to save context window
                    const summary = {
                        student: foundUser?.displayName,
                        engagement: {
                            totalSessions: data.sessions.length,
                            completedLessons: Object.keys(data.learningProgress).length,
                            activeDays: activeDays,
                            totalActionsLogged: data.activityLogs.length
                        },
                        performance: {
                            overallAvg: data.sessions.length > 0 ? (data.sessions.reduce((a, b) => a + (b.aiFeedback.score/b.aiFeedback.totalMarks), 0) / data.sessions.length * 100).toFixed(1) + '%' : 'N/A',
                            topicBreakdown: topicPerformance
                        },
                        recentActivity: data.sessions.slice(0, 5).map(s => `${s.question.unit} (${new Date(s.completedAt).toLocaleDateString()}): ${s.aiFeedback.score}/${s.aiFeedback.totalMarks}`)
                    };
                    toolResultStr = JSON.stringify(summary);
                } else if (fnName === 'fetchTopicPerformance') {
                    const data = await fetchTopicPerformance(args.topic);
                    toolResultStr = JSON.stringify(data);
                }
            } catch (e: any) {
                toolResultStr = JSON.stringify({ error: e.message });
            }

            // Send Tool Response back to Model
            // Construct the next turn
            // Note: SDK structure for FunctionResponse might vary slightly in v1.x
            // We need to simulate the turn: [User Msg, Model Call, Function Response]

            const functionResponseParts = [{
                functionResponse: {
                    name: fnName,
                    response: { result: toolResultStr }
                }
            }];

            const toolContents = [
                ...contents,
                { role: 'model', parts: parts }, // The model's call
                { role: 'user', parts: functionResponseParts } // The tool output
            ];

            // Stream the final answer based on the tool output
            const secondStream = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: toolContents,
                config: {
                    systemInstruction,
                    safetySettings: SAFETY_SETTINGS
                }
            });

            for await (const chunk of secondStream) {
                onChunk(chunk.text || '');
            }
            return; // Done
        }
    }

    // No tool call, just stream the text
    if (result.text) {
        onChunk(result.text);
    }
};

export const generateQuizQuestion = async (item: FlashcardItem): Promise<CaseStudyQuizQuestion> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const systemContext = getStrictContext(item.levels?.[0]);

    const seed = Math.floor(Math.random() * 1000000);
    const prompt = `Create a single, unique multiple-choice quiz question for the topic/term: "${item.name}".

    Random Seed: ${seed}.
    Focus on a specific application, example, or deep understanding of the concept. Avoid simple definitions if possible.

    Context:
    ${item.details}

    Instruction:
    - Create a challenging question suitable for A-Level/GCSE Geography.
    - Provide 4 distinct options.
    - Ensure the "correctAnswer" is EXACTLY identical to one of the "options".

    Format (JSON):
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemContext,
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    const q = JSON.parse(cleanJson(response.text || '{}'));

    // Validate answer
    if (q.options && q.correctAnswer && !q.options.includes(q.correctAnswer)) {
         const fuzzyMatch = q.options.find((opt: string) => opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
         if (fuzzyMatch) {
             q.correctAnswer = fuzzyMatch;
         } else {
             // Word overlap fallback
             const correctWords = q.correctAnswer.toLowerCase().split(' ');
             let bestMatch = q.options[0];
             let maxOverlap = 0;
             q.options.forEach((opt: string) => {
                 const optWords = opt.toLowerCase().split(' ');
                 const overlap = optWords.filter((w: string) => correctWords.includes(w)).length;
                 if (overlap > maxOverlap) {
                     maxOverlap = overlap;
                     bestMatch = opt;
                 }
             });
             q.correctAnswer = bestMatch;
         }
    }

    return q;
};

export const generateSwipeQuizItem = async (study: CaseStudyLocation): Promise<SwipeQuizItem> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const systemContext = getStrictContext(study.levels?.[0]);

    const seed = Math.floor(Math.random() * 1000000);
    const prompt = `Create a unique "True/False" style statement for the case study: "${study.name}".

    Random Seed: ${seed}.

    Context:
    ${study.details}

    Instruction:
    - Create a short, punchy statement about this case study.
    - It can be factually correct (True) or a plausible misconception (False).
    - "correctAnswer" must be a boolean: true if the statement is factually correct, false otherwise.

    Format (JSON):
    {
      "caseStudyName": "${study.name}",
      "topic": "${study.topic}",
      "statement": "string",
      "correctAnswer": boolean,
      "imageUrl": "string" (leave empty, handled by frontend)
    }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemContext,
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateCareerInfo = async (category: string): Promise<GeographyCareer[]> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Careers in ${category}`,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });
    return JSON.parse(cleanJson(response.text || '[]'));
};

export const generateLocalOpportunities = async (location: string, level: string, radius: string = '10 miles'): Promise<{ opportunities: JobOpportunity[], sources: { uri: string; title: string }[] }> => handleApiCall(async () => {
    const ai = getAiClient();
    const isGCSE = level === 'GCSE' || level === 'IGCSE';
    const age = isGCSE ? '16-18' : '18+';
    const type = isGCSE ? 'Apprenticeships, Work Experience, or Entry Level Jobs' : 'Degree Apprenticeships, Internships, or Entry Level Jobs';

    const prompt = `Find current local ${type} in Geography, Environmental Science, Travel, Tourism, or Sustainability near ${location} (within ${radius}). Suitable for age ${age}.

    Use Google Search to find REAL, current opportunities.

    Return a JSON object with this structure:
    {
      "opportunities": [
        { "title": "string", "company": "string", "location": "string", "description": "Detailed description including key responsibilities and why it's relevant to geography.", "link": "Direct URL to the job posting or company careers page" }
      ]
    }

    Ensure the JSON is valid. If no specific live jobs are found, suggest typical local employers or roles found in the search results.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
            safetySettings: SAFETY_SETTINGS
        }
    });

    const jsonText = cleanJson(response.text || '{}');
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
        uri: c.web?.uri || '',
        title: c.web?.title || 'Source'
    })).filter((s: any) => s.uri) || [];

    try {
        const parsed = JSON.parse(jsonText);
        return {
            opportunities: parsed.opportunities || [],
            sources
        };
    } catch (e) {
        console.error("Failed to parse opportunities JSON", e);
        return { opportunities: [], sources: [] };
    }
});

export const generateUniversityCourseInfo = async (interests: string, location?: string): Promise<{ courses: UniversityCourseInfo[], sources: { uri: string; title: string }[] }> => handleApiCall(async () => {
    const ai = getAiClient();
    const locationPrompt = location ? `near ${location} (or reasonably accessible)` : `in the UK`;

    const prompt = `Find 5 university courses related to "${interests}" ${locationPrompt}.
    Filter by: Best match for the interest.

    Use Google Search to find up-to-date entry requirements and course details.

    Return a JSON object with this structure:
    {
      "courses": [
        { "courseTitle": "string", "universityName": "string", "description": "string", "entryRequirements": "string", "url": "string" }
      ]
    }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
            safetySettings: SAFETY_SETTINGS
        }
    });

    const jsonText = cleanJson(response.text || '{}');
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
        uri: c.web?.uri || '',
        title: c.web?.title || 'Source'
    })).filter((s: any) => s.uri) || [];

    try {
        const parsed = JSON.parse(jsonText);
        return {
            courses: parsed.courses || [],
            sources
        };
    } catch (e) {
        console.error("Failed to parse uni courses JSON", e);
        return { courses: [], sources: [] };
    }
});

export const generateTopUKUniversityInfo = async (): Promise<{ courses: UniversityCourseInfo[], sources: { uri: string; title: string }[] }> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `Find the top 5 UK universities for Geography (based on recent league tables like Guardian, Times, or Complete University Guide).

    Return a JSON object with this structure:
    {
      "courses": [
        { "courseTitle": "BSc/BA Geography", "universityName": "string", "description": "Why it is top rated", "entryRequirements": "Typical offer", "url": "string" }
      ]
    }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
            safetySettings: SAFETY_SETTINGS
        }
    });

    const jsonText = cleanJson(response.text || '{}');
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
        uri: c.web?.uri || '',
        title: c.web?.title || 'Source'
    })).filter((s: any) => s.uri) || [];

    try {
        const parsed = JSON.parse(jsonText);
        return {
            courses: parsed.courses || [],
            sources
        };
    } catch (e) {
        console.error("Failed to parse top unis JSON", e);
        return { courses: [], sources: [] };
    }
});

export const generateTransferableSkillInfo = async (skillName: string): Promise<TransferableSkill> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const prompt = `Provide detailed information about the transferable skill: "${skillName}" in the context of Geography.

    Return a JSON object with this structure:
    {
        "name": "${skillName}",
        "description": ["Key point 1", "Key point 2", "Key point 3"],
        "applicationInCareers": ["Career application 1", "Career application 2", "Career application 3"]
    }

    Ensure the points are concise, easy to read, and plain text (no markdown, no asterisks).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateCVSuggestions = async (jobTitle: string): Promise<CVSuggestions> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `CV for ${jobTitle}`,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateReelSummary = async (study: CaseStudyLocation): Promise<string> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Reel summary ${study.name}`,
        config: { safetySettings: SAFETY_SETTINGS }
    });
    return response.text || '';
};

export const generateCaseStudyVideo = async (study: CaseStudyLocation, summary: string): Promise<string> => {
    return 'http://fake-video-url'; 
};

export const generateLessonPlan = async (topic: string, level: UserLevel): Promise<VideoLessonPlan> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Lesson plan for ${topic}`,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateSlideImage = async (imagePrompt: string): Promise<string> => {
    try {
        await checkDailyLimit();
        const ai = getAiClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "16:9",
                safetySettings: SAFETY_SETTINGS
            }
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        throw new Error("No image generated.");
    } catch (e: any) {
        console.error("Slide image generation failed", e);
        if (e.message && e.message.includes("Daily AI limit")) {
            throw e;
        }
        return "https://placehold.co/600x400?text=Slide+Image+Failed";
    }
};

export const generateSlideAudio = async (text: string): Promise<AudioBuffer> => {
    return new AudioContext().createBuffer(1, 1, 22050);
};

export const generatePodcastScript = async (topic: string, level: string): Promise<string> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Podcast script ${topic}`,
        config: { safetySettings: SAFETY_SETTINGS }
    });
    return response.text || '';
};

export const generatePodcastAudio = async (script: string): Promise<string> => {
    return ''; 
};

export const generateLessonContent = async (lessonTitle: string, chapter: string, level: UserLevel, lessonId?: string): Promise<LessonContent> => handleApiCall(async () => {
    // 1. CHECK STATIC DATABASE FIRST
    if (lessonId && STATIC_LESSONS[lessonId]) {
        console.log("Serving static lesson content for:", lessonId);
        await new Promise(resolve => setTimeout(resolve, 500));
        return STATIC_LESSONS[lessonId];
    }

    // 2. FALLBACK TO AI GENERATION
    console.log("Generating AI lesson content for:", lessonTitle);
    const ai = getAiClient();
    
    const topicTerms = KEY_TERMS
        .filter(t => t.topic === chapter || chapter.includes(t.topic) || (t.levels.includes(level) && Math.random() < 0.2)) 
        .map(t => t.name)
        .join(', ');

    const specName = level === 'IGCSE' ? 'Edexcel International GCSE (4GE1)' : 'AQA Specification';
    const prompt = `Create a highly engaging, interactive Geography lesson for a student studying ${level} (${specName}).
    
    Chapter: ${chapter}
    Lesson Title: ${lessonTitle}
    
    Structure: "Teach -> Test -> Test -> Test -> Teach -> Test -> Test -> Test".
    (Repeat this pattern: 1 Info Block followed by 3 distinct Activity Blocks)
    
    CRITICAL INSTRUCTION FOR "INFO" BLOCKS:
    - **Content**: 150+ words, process-focused, real examples.
    - **Key Terms**: Naturally include and **bold** these: ${topicTerms}.

    CRITICAL INSTRUCTION FOR "ACTIVITY" BLOCKS:
    - You MUST provide **exactly 3 activity blocks** immediately following EVERY "info" block.
    - This ensures students are thoroughly tested on the concept just taught.
    - Use a variety of formats. Do NOT just use multiple choice.
    
    1. **"multiple_choice"**: Standard 4-option question.
    2. **"fill_in_blank"**: Sentence with missing terms.
       - 'textWithBlanks': "The [blank] is formed by..."
       - 'correctBlanks': ["spit"]
    3. **"sorting"**: Reordering steps.
       - 'items': ["Step 1", "Step 2", "Step 3"] (Provide in CORRECT order)
    4. **"diagram_match"**: Labelling a diagram.
       - 'imagePrompt': "Diagram of X where the key distinct parts are labelled ONLY with numbers (e.g. 1, 2, 3, 4) pointing to them. The image MUST NOT contain the text names of the features, only the numbers."
       - 'items': ["Label for 1", "Label for 2", "Label for 3", "Label for 4"] (In order 1-4)
       - 'question': "Match the labels to the numbered parts of the diagram."
    5. **"text_input"**: Short answer.
       - 'correctAnswer': The ideal short answer.
       - 'keywords': A list of 1-3 ESSENTIAL keywords that the user's answer MUST contain to be correct (e.g. ["erosion", "hydraulic action"]). Be specific.

    DISTRIBUTION REQUIRED:
    - 20% Multiple Choice
    - 20% Fill in the Blank
    - 20% Sorting (Process sequences)
    - 20% Diagram Match (Visual learning)
    - 20% Text Input (Explanation)
    
    Format as JSON:
    {
      "title": "${lessonTitle}",
      "blocks": [
        { "type": "info", "heading": "...", "content": "...", "imagePrompt": "..." },
        { "type": "multiple_choice", "question": "...", "options": ["...", "..."], "correctAnswer": "...", "explanation": "..." },
        { "type": "fill_in_blank", "question": "...", "textWithBlanks": "...", "correctBlanks": ["..."], "explanation": "..." },
        { "type": "text_input", "question": "Explain why...", "correctAnswer": "...", "keywords": ["key1", "key2"], "explanation": "..." },
        { "type": "info", "heading": "Next Concept...", "content": "...", "imagePrompt": "..." },
        { "type": "diagram_match", "question": "Label the coastal features...", "imagePrompt": "Coastal landscape with 1. Headland, 2. Bay, 3. Stack labelled clearly", "items": ["Headland", "Bay", "Stack"], "explanation": "..." },
        { "type": "sorting", "question": "Order the formation of...", "items": ["A", "B", "C"], "explanation": "..." },
        { "type": "text_input", "question": "...", "correctAnswer": "...", "keywords": ["key1"], "explanation": "..." }
      ]
    }`;

    const stream = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    let fullText = '';
    for await (const chunk of stream) {
        fullText += (chunk.text || '');
    }

    const jsonText = cleanJson(fullText || '{}');
    try {
        const parsed = JSON.parse(jsonText);
        // Basic validation
        if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
            throw new Error("Invalid lesson structure");
        }
        return parsed;
    } catch (e) {
        console.error("Failed to parse lesson JSON", e);
        console.log("Raw text:", fullText);
        throw new Error("Failed to generate valid lesson content.");
    }
});

export const validateLessonAnswer = async (question: string, userAnswer: string, correctAnswer: string, keywords?: string[]): Promise<boolean> => {
    await checkDailyLimit();
    const ai = getAiClient();

    const prompt = `You are an automated grading assistant for a Geography lesson.

    Question: "${question}"
    Correct Answer/Key Concept: "${correctAnswer}"
    Required Keywords: ${keywords ? JSON.stringify(keywords) : "None"}

    Student Answer: "${userAnswer}"

    Task: Determine if the student's answer is factually correct and demonstrates understanding of the key concept.

    Rules:
    1. It does NOT need to match the wording of the correct answer exactly.
    2. It MUST contain the core meaning.
    3. If 'Required Keywords' are provided, the student answer MUST contain the essence of these keywords (fuzzy match is okay).
    4. Be lenient with spelling errors.

    Return strictly JSON: { "isCorrect": boolean }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                safetySettings: SAFETY_SETTINGS
            }
        });
        const result = JSON.parse(cleanJson(response.text || '{}'));
        return result.isCorrect === true;
    } catch (e) {
        console.error("Lesson validation failed", e);
        // Fallback to basic fuzzy match if AI fails
        const normUser = userAnswer.toLowerCase();
        const normCorrect = correctAnswer.toLowerCase();
        return normUser.includes(normCorrect) || normCorrect.includes(normUser);
    }
};

export const generateVideoQuestions = async (videoTitle: string, level: string): Promise<VideoQuizContent> => handleApiCall(async () => {
    const ai = getAiClient();
    // Use A-Level specific wording only if the level is A-Level
    let levelContext = 'Geography';
    if (level === 'A-Level') levelContext = 'A-Level Geography';
    if (level === 'IGCSE') levelContext = 'Edexcel International GCSE Geography';

    const prompt = `Based on the ${levelContext} video titled "${videoTitle}", generate a short quiz to test understanding.
    
    Create:
    1. 3 Multiple Choice Questions (with 4 options, 1 correct answer, and explanation).
    2. 2 Open-Ended "Discussion" Questions (with a sample model answer for checking).

    Context: The user is a student studying ${level} Geography. The questions should be relevant to the likely content of a video with this title.

    Return ONLY a JSON object with this structure:
    {
      "multipleChoice": [
        { "question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Exact Text of Correct Option", "explanation": "..." }
      ],
      "openEnded": [
        { "question": "...", "sampleAnswer": "..." }
      ]
    }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Switched to Pro for better JSON adherence
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    try {
        const parsed = JSON.parse(cleanJson(response.text || '{}'));
        // Ensure structure is valid even if partial
        return {
            multipleChoice: parsed.multipleChoice || [],
            openEnded: parsed.openEnded || []
        } as VideoQuizContent;
    } catch (error) {
        console.error("Failed to parse video quiz JSON:", response.text);
        throw new Error("Invalid AI response format");
    }
});

export const chatWithPreRelease = async (history: ChatMessage[], message: string, imageBase64: string | null, onChunk: (chunk: string) => void): Promise<void> => {
    await checkDailyLimit();
    const ai = getAiClient();

    // Construct history with the new model input format
    // gemini-2.5-pro supports multimodal inputs
    const contents: any[] = history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    const userParts: any[] = [{ text: message }];

    if (imageBase64) {
        // Remove data URL prefix if present for the API call
        const base64Data = imageBase64.split(',')[1] || imageBase64;
        userParts.push({
            inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
            }
        });
    }

    contents.push({ role: 'user', parts: userParts });

    const systemInstruction = `You are an expert Geography tutor assisting a student with the "June 2025 Paper 3 Pre-release Material".
    The student is looking at a specific page of the resource booklet (provided as an image).
    Answer their questions specifically about the data, maps, graphs, or photos shown in the image.
    Be precise, quote figures if visible, and explain geographical concepts related to the resource.`;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro', // Use Pro for vision capabilities
        contents: contents,
        config: {
            systemInstruction,
            safetySettings: SAFETY_SETTINGS
        }
    });

    for await (const chunk of responseStream) { onChunk(chunk.text || ''); }
};

export const generatePreReleaseQuestion = async (imageBase64: string): Promise<GeneratedQuestionData> => handleApiCall(async () => {
    const ai = getAiClient();
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const prompt = `Look at this Geography Pre-release resource. Generate a GCSE-level exam question based on it.

    Format as JSON object: { "questionNumber": "03.X", "marks": number, "prompt": "string", "markScheme": { "content": "string" } }

    Ensure the question requires using the resource (e.g., "Using Figure X...", "Describe the pattern...", "Calculate...").`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
            { role: 'user', parts: [
                { text: prompt },
                { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]}
        ],
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    const data = JSON.parse(cleanJson(response.text || '{}'));

    // Map to GeneratedQuestionData interface
    return {
        examYear: 2025,
        questionNumber: data.questionNumber || "03.1",
        unit: "Paper 3",
        title: "Pre-release Question",
        prompt: data.prompt,
        marks: data.marks || 4,
        figureDescription: "Pre-release Resource",
        ao: { ao1: 0, ao2: 0, ao3: 0, ao4: 0 },
        caseStudy: { title: "", content: "" },
        markScheme: { title: "Mark Scheme", content: data.markScheme?.content || "" }
    };
});

export const parseTimetableFile = async (data: string, mimeType: string = 'image/jpeg'): Promise<any[]> => handleApiCall(async () => {
    const ai = getAiClient();
    // remove data uri prefix if present for binary types, but not for text/csv if we encoded it raw?
    // In MockManager we used btoa(text) for CSV, and DataURL for others.
    // If DataURL, split comma. If raw base64, keep it.
    const base64Data = data.includes(',') ? data.split(',')[1] : data;

    let prompt = `Analyze this exam timetable. Extract the dates, times, and durations for Geography exams (Paper 1, Paper 2, Paper 3) for both GCSE and A-Level if present.

    Return a JSON ARRAY of objects with this structure:
    {
        "level": "GCSE" | "A-Level",
        "paper": "Paper 1" | "Paper 2" | "Paper 3",
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "duration": "Xh Ym" (e.g. "1h 30m")
    }

    Ignore non-geography exams.`;

    // Handle CSV as text prompt if possible, or blob.
    // If it is CSV, we can just decode base64 and pass as text part?
    // Gemini supports text/csv via inlineData too? Or just as text.
    // Let's prefer passing text if it is text-based.

    const parts: any[] = [{ text: prompt }];

    if (mimeType === 'text/csv') {
        const csvText = atob(base64Data);
        parts.push({ text: `\n\nCSV Data:\n${csvText}` });
    } else {
        parts.push({
            inlineData: {
                mimeType: mimeType,
                data: base64Data
            }
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
            { role: 'user', parts: parts }
        ],
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    return JSON.parse(cleanJson(response.text || '[]'));
});

export const generateFlashcards = async (topic: string, subTopic: string, level: string): Promise<FlashcardItem[]> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `Generate 10 high-quality flashcards for the ${level} Geography topic: "${topic}".
    Focus specifically on the sub-topic: "${subTopic}".

    Include a mix of:
    - Key Terms (Definitions)
    - Case Study Details (Facts/Figures for specific locations if relevant to this sub-topic)
    - Key Concepts (Processes/Explanations)

    Return a JSON ARRAY of objects with this structure:
    {
        "name": "Term or Concept Name",
        "topic": "${topic}",
        "details": "Definition or key facts",
        "citation": "Context (e.g. 'Process: Erosion' or 'Case Study: Nigeria')",
        "type": "term" | "case_study",
        "levels": ["${level}"]
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    const jsonText = cleanJson(response.text || '[]');
    try {
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) {
            return parsed.map((item: any) => ({
                ...item,
                topic: topic, // Ensure topic matches request
                levels: [level] // Ensure level matches request
            }));
        }
        return [];
    } catch (e) {
        console.error("Failed to parse flashcards JSON", e);
        return [];
    }
});

export const digitizeHandwrittenWork = async (imageBase64: string, level: UserLevel): Promise<{ score: number, totalMarks: number, feedback: string, studentAnswer: string, questionTitle?: string, unit?: string, timeTaken?: string }> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const prompt = `Analyze this image of a marked ${level} Geography exam answer.

    Extract the following details:
    1. The student's handwritten answer (transcribe it).
    2. The mark/score awarded (e.g., 4/6).
    3. The total marks available.
    4. The teacher's feedback or comments (if visible).
    5. The likely question title or topic based on the content.
    6. Any indication of "Time Taken" or duration written on the page (e.g. "15 mins", "Time: 20m").

    Return a JSON object with this structure:
    {
        "studentAnswer": "string",
        "score": number,
        "totalMarks": number,
        "feedback": "string",
        "questionTitle": "string",
        "unit": "string",
        "timeTaken": "string"
    }

    If score/feedback is not visible, estimate or leave blank/0. Use "unit" for broad topics like "Coasts", "Hazards". If no time is found, leave "timeTaken" empty.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
            { role: 'user', parts: [
                { text: prompt },
                { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]}
        ],
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    return JSON.parse(cleanJson(response.text || '{}'));
};

export const evaluateMemoryRecallAttempt = async (
    summaryText: string,
    studentAttempt: string,
    level: UserLevel
): Promise<{ score: number; highlightedSummary: string; encouragement: string }> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const examinerType = level === 'IGCSE' ? 'Edexcel International GCSE' : 'AQA';

    const prompt = `You are an expert ${examinerType} Geography tutor helping a student with a "blurting" or "active recall" exercise.

    Original Topic Summary:
    """
    ${summaryText}
    """

    Student's Recall Attempt (from memory):
    """
    ${studentAttempt}
    """

    Task:
    1. Compare the student's attempt to the original summary.
    2. Calculate a percentage score (0-100) based on how much of the core information they successfully recalled. Be fair but accurate.
    3. Generate a "highlightedSummary" by taking the ORIGINAL summary text and wrapping the parts the student MISSED or got wrong in a span with the class "bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded px-1". Leave the parts they got right as plain text. Use Markdown for basic formatting (bold, italics) but use HTML spans for the highlights.
    4. Write a short, encouraging message ("encouragement") giving them specific praise and pointing out one or two key things they missed.

    Return strictly JSON:
    {
        "score": number,
        "highlightedSummary": "string (markdown + HTML spans for highlights)",
        "encouragement": "string"
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateAndSaveMemoryRecallSummary = async (topicId: string, subTopicId: string, level: UserLevel): Promise<MemoryRecallSummary> => {
    await checkDailyLimit();
    const ai = getAiClient();
    const examinerType = level === 'IGCSE' ? 'Edexcel International GCSE' : 'AQA';

    const prompt = `You are an expert ${examinerType} Geography examiner.
    Generate a detailed summary for a memory recall ("blurting") exercise.

    Topic: ${topicId}
    Sub-Topic: ${subTopicId}
    Level: ${level}

    Task:
    1. Break down the sub-topic into 2 to 4 key logical sections (e.g., Causes, Effects, Management).
    2. For each section, provide a concise but comprehensive text paragraph (approx 100-150 words) covering the core facts, processes, or case study details relevant to the specification.
    3. Generate a highly descriptive image prompt ("imagePrompt") for each section that visually represents the concept (for dual coding). Make it vivid and specific (e.g., "A diagram showing constructive plate margins...").

    Return strictly JSON:
    {
      "sections": [
        {
          "heading": "string",
          "text": "string",
          "imagePrompt": "string"
        }
      ]
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            safetySettings: SAFETY_SETTINGS
        }
    });

    const parsed = JSON.parse(cleanJson(response.text || '{}'));

    // Generate Images and upload to Firebase Storage
    const finalSections: any[] = [];
    const docId = `${level}_${topicId}_${subTopicId}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    for (let i = 0; i < (parsed.sections || []).length; i++) {
        const sec = parsed.sections[i];
        let finalImageUrl = null;

        try {
            await checkAndIncrementImageLimit();
            const imgResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `Geography diagram: ${sec.imagePrompt}`,
                config: { numberOfImages: 1, aspectRatio: "16:9", safetySettings: SAFETY_SETTINGS }
            });

            if (imgResponse.generatedImages?.length > 0) {
                const base64Data = imgResponse.generatedImages[0].image.imageBytes;

                // Upload to Firebase Storage
                const storagePath = `memory_recall_images/${docId}_section_${i}.png`;
                finalImageUrl = await uploadBase64Image(storagePath, base64Data);
            }
        } catch (e) {
            console.error(`Failed to generate or upload image for summary section ${i}`, e);
        }

        finalSections.push({
            heading: sec.heading || "Untitled Section",
            text: sec.text || "No text provided.",
            imageUrl: finalImageUrl
        });
    }

    const summary: MemoryRecallSummary = {
        topicId,
        subTopicId,
        level,
        sections: finalSections
    };

    // Sanitize before saving to prevent "invalid nested entity" errors from undefined fields or weird parsed JSON
    const sanitizedSummary = sanitizeForFirestore(summary);

    await setDoc(doc(db, 'memory_recall_summaries', docId), sanitizedSummary);

    return summary;
};

export const getMemoryRecallHint = async (
    summaryText: string,
    studentAttempt: string
): Promise<string> => {
    await checkDailyLimit();
    const ai = getAiClient();

    const prompt = `You are an AI tutor helping a student with a memory recall exercise.

    Original Summary:
    """
    ${summaryText}
    """

    Student's Current Attempt:
    """
    ${studentAttempt}
    """

    Task: Look at what the student has written so far. Identify ONE key concept from the original summary that they have NOT mentioned yet. Provide a short, cryptic hint (maximum 15 words) to jog their memory about that missing concept. Do NOT give them the answer directly.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: { safetySettings: SAFETY_SETTINGS }
    });

    return response.text || "Think about the other main factors.";
};
