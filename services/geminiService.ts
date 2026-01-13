
// ... (imports remain the same)
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChatMessage, Question, MarkedModelAnswer, MathsProblem, MathsSkill, AIFeedback, CaseStudyLocation, CaseStudyQuizQuestion, SwipeQuizItem, GeographyCareer, UniversityCourseInfo, TransferableSkill, CVSuggestions, FlashcardItem, UserLevel, VideoLessonPlan, LessonContent, GeneratedQuestionData, VideoQuizContent } from "../types";
import { MASTER_CASE_STUDIES, ALL_QUESTIONS as QUESTION_EXAMPLES } from "../database";
import { STATIC_LESSONS } from "../lesson-content-database";
import { KEY_TERMS } from "../knowledge-database"; // Added import

const STRICT_AQA_CONTEXT = "You are an expert AQA Geography examiner. All content must be strictly aligned with the AQA GCSE and A-Level specifications.";

const getAiClient = (): GoogleGenAI => {
    const API_KEY = process.env.API_KEY;
    if (API_KEY) {
        return new GoogleGenAI({ apiKey: API_KEY });
    } else {
        console.error("API_KEY environment variable not set. AI features will be disabled.");
        throw new Error("API Key not available.");
    }
};

const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
    try {
        return await apiCall();
    } catch (e: any) {
        console.error("Gemini API call failed:", e);
        throw e;
    }
};

const cleanJson = (text: string): string => {
    // Remove markdown code blocks if present
    let clean = text.replace(/```json\n?/g, '').replace(/```/g, '');
    
    // Attempt to extract the JSON object if there's surrounding text
    const firstOpen = clean.indexOf('{');
    const lastClose = clean.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        clean = clean.substring(firstOpen, lastClose + 1);
    }
    
    return clean.trim();
};

export const generateQuestion = async (params: { unit: string; marks: number; level: UserLevel }): Promise<GeneratedQuestionData> => handleApiCall(async () => {
    const ai = getAiClient();
    const levelContext = params.level === 'GCSE' ? "AQA GCSE Geography (Specification 8035)" : "AQA A-Level Geography";
    const prompt = `Generate a new, unique ${levelContext} exam question for unit: "${params.unit}". Marks: ${params.marks}. Format: JSON.`; 
    
    let promptExtraInstructions = "";
    if (params.level === 'A-Level' && params.marks === 6) {
        promptExtraInstructions = `IMPORTANT: This MUST be a specialized "Analyse the data..." question (AO3). Require TESLA model in mark scheme.`;
    }

    const fullPrompt = `Generate a new, unique ${levelContext} exam question.
    Unit: "${params.unit}"
    Marks: ${params.marks}
    ${promptExtraInstructions}
    Format as JSON object: { "examYear": 2024, "questionNumber": "01.X", "unit": "${params.unit}", "title": "string", "prompt": "string", "marks": number, "figureDescription": "string", "ao": { "ao1": number, "ao2": number, "ao3": number, "ao4": number }, "caseStudy": { "title": "string", "content": "string" }, "markScheme": { "title": "string", "content": "string" } }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(cleanJson(response.text || '{}')) as GeneratedQuestionData;
});

export const generateFigure = async (description: string): Promise<string> => handleApiCall(async () => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Geography exam figure: ${description}`,
            config: { numberOfImages: 1, aspectRatio: "16:9" }
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        throw new Error("No image generated.");
    } catch (e) {
        console.error("Image generation failed, returning placeholder", e);
        return "https://placehold.co/600x400?text=Figure+Generation+Failed";
    }
});

export const streamChatResponse = async (history: ChatMessage[], message: string, mode: 'fast' | 'complex', onChunk: (chunk: string) => void): Promise<void> => {
    const ai = getAiClient();
    const contents = history.filter(m => m.role !== 'system').map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
    contents.push({ role: 'user', parts: [{ text: message }] });
    const modelName = mode === 'fast' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    const config = mode === 'complex' ? { thinkingConfig: { thinkingBudget: 8192 } } : {};
    const systemInstruction = `You are Geo Pro, an expert Geography tutor.`;
    const responseStream = await ai.models.generateContentStream({ model: modelName, contents: contents, config: { ...config, systemInstruction } });
    for await (const chunk of responseStream) { onChunk(chunk.text || ''); }
};

export const getHint = async (question: Question): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Hint for: ${question.prompt}` });
    return response.text || 'Think about the command word.';
};

export const getMotivationalMessage = async (): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Motivational msg for student.` });
    return response.text || 'Keep going!';
};

export const generateModelAnswer = async (question: Question): Promise<MarkedModelAnswer> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Model answer for ${question.prompt}`, config: { responseMimeType: 'application/json' } });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const streamTutorResponse = async (question: Question, history: ChatMessage[], message: string, onChunk: (chunk: string) => void): Promise<void> => {
    const ai = getAiClient();
    const systemInstruction = `You are an interactive Geography tutor...`;
    const contents = history.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', parts: [{ text: msg.text }] }));
    contents.push({ role: 'user', parts: [{ text: message }] });
    const responseStream = await ai.models.generateContentStream({ model: 'gemini-2.5-pro', contents, config: { systemInstruction } });
    for await (const chunk of responseStream) { onChunk(chunk.text || ''); }
};

export const generateCaseStudyApplication = async (question: Question, caseStudyName: string): Promise<{ summary: string; application: string }> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Apply ${caseStudyName} to ${question.prompt}`, config: { responseMimeType: 'application/json' } });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const markStudentAnswer = async (question: Question, studentAnswer: string, attachment?: { mimeType: string; data: string }): Promise<AIFeedback> => {
    const ai = getAiClient();
    const prompt = `You are an expert AQA Geography examiner. Mark the following student answer.

    Question Context:
    - Title: "${question.title}"
    - Prompt: "${question.prompt}"
    - Marks Available: ${question.marks}
    - Level: ${question.level}

    Mark Scheme / Guidance:
    ${question.markScheme?.content || 'No specific mark scheme provided. Use expert judgment based on AQA standards.'}

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

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json'
        }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateSessionSummary = async (question: Question, feedback: AIFeedback): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Summarize session.` });
    return response.text?.trim() || 'Session complete.';
};

export const streamMathsTutorResponse = async (problem: MathsProblem, skill: MathsSkill, history: ChatMessage[], message: string, onChunk: (chunk: string) => void): Promise<void> => {
    const ai = getAiClient();
    const responseStream = await ai.models.generateContentStream({ model: 'gemini-2.5-pro', contents: [{role: 'user', parts: [{text: message}]}] });
    for await (const chunk of responseStream) { onChunk(chunk.text || ''); }
};

export const generateCaseStudyInfo = async (study: CaseStudyLocation): Promise<{ summary: string; imageUrl: string }> => {
    const ai = getAiClient();
    // Handling parallel calls safely
    try {
        const info = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Summary of ${study.name}` });

        let imageUrl = "https://placehold.co/600x400?text=Case+Study+Image";
        try {
            const img = await ai.models.generateImages({ model: 'imagen-4.0-generate-001', prompt: `Image of ${study.name}`, config: { numberOfImages: 1 } });
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

export const generateQuizQuestion = async (item: FlashcardItem): Promise<CaseStudyQuizQuestion> => {
    const ai = getAiClient();
    const prompt = `Create a single multiple-choice quiz question for the topic/term: "${item.name}".

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
            systemInstruction: STRICT_AQA_CONTEXT,
            responseMimeType: 'application/json'
        }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateSwipeQuizItem = async (study: CaseStudyLocation): Promise<SwipeQuizItem> => {
    const ai = getAiClient();
    const prompt = `Create a "True/False" style statement for the case study: "${study.name}".

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
            systemInstruction: STRICT_AQA_CONTEXT,
            responseMimeType: 'application/json'
        }
    });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateCareerInfo = async (category: string): Promise<GeographyCareer[]> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Careers in ${category}`, config: { responseMimeType: 'application/json' } });
    return JSON.parse(cleanJson(response.text || '[]'));
};

export const generateUniversityCourseInfo = async (interests: string): Promise<{ courses: UniversityCourseInfo[], sources: { uri: string; title: string }[] }> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Uni courses for ${interests}`, config: { tools: [{googleSearch: {}}] } });
    return { courses: [], sources: [] }; 
};

export const generateTopUKUniversityInfo = async (): Promise<{ courses: UniversityCourseInfo[], sources: { uri: string; title: string }[] }> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Top 5 UK Geog unis`, config: { tools: [{googleSearch: {}}] } });
    return { courses: [], sources: [] }; 
};

export const generateTransferableSkillInfo = async (skillName: string): Promise<TransferableSkill> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Skill info ${skillName}`, config: { responseMimeType: 'application/json' } });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateCVSuggestions = async (jobTitle: string): Promise<CVSuggestions> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `CV for ${jobTitle}`, config: { responseMimeType: 'application/json' } });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateReelSummary = async (study: CaseStudyLocation): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Reel summary ${study.name}` });
    return response.text || '';
};

export const generateCaseStudyVideo = async (study: CaseStudyLocation, summary: string): Promise<string> => {
    return 'http://fake-video-url'; 
};

export const generateLessonPlan = async (topic: string, level: UserLevel): Promise<VideoLessonPlan> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Lesson plan for ${topic}`, config: { responseMimeType: 'application/json' } });
    return JSON.parse(cleanJson(response.text || '{}'));
};

export const generateSlideImage = async (imagePrompt: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: { numberOfImages: 1, aspectRatio: "16:9" }
        });
        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        throw new Error("No image generated.");
    } catch (e) {
        console.error("Slide image generation failed", e);
        return "https://placehold.co/600x400?text=Slide+Image+Failed";
    }
};

export const generateSlideAudio = async (text: string): Promise<AudioBuffer> => {
    return new AudioContext().createBuffer(1, 1, 22050);
};

export const generatePodcastScript = async (topic: string, level: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: `Podcast script ${topic}` });
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

    const prompt = `Create a highly engaging, interactive Geography lesson for a student studying ${level} (AQA Specification).
    
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

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        }
    });

    const jsonText = cleanJson(response.text || '{}');
    try {
        const parsed = JSON.parse(jsonText);
        // Basic validation
        if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
            throw new Error("Invalid lesson structure");
        }
        return parsed;
    } catch (e) {
        console.error("Failed to parse lesson JSON", e);
        console.log("Raw text:", response.text);
        throw new Error("Failed to generate valid lesson content.");
    }
});

export const generateVideoQuestions = async (videoTitle: string, level: string): Promise<VideoQuizContent> => handleApiCall(async () => {
    const ai = getAiClient();
    // Use A-Level specific wording only if the level is A-Level
    const levelContext = level === 'A-Level' ? 'A-Level Geography' : 'Geography';

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
        config: { responseMimeType: 'application/json' }
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
