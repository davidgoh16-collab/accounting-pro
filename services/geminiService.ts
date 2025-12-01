
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChatMessage, Question, MarkedModelAnswer, MathsProblem, MathsSkill, AIFeedback, CaseStudyLocation, CaseStudyQuizQuestion, SwipeQuizItem, GeographyCareer, UniversityCourseInfo, TransferableSkill, CVSuggestions, FlashcardItem, UserLevel, VideoLessonPlan } from "../types";
import { MASTER_CASE_STUDIES, ALL_QUESTIONS as QUESTION_EXAMPLES } from "../database";

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
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        return text.substring(firstOpen, lastClose + 1);
    }
    return text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
};

type GeneratedQuestionData = Omit<Question, 'id' | 'figures'> & { figureDescription: string };

export const generateQuestion = async (params: { unit: string; marks: number; level: UserLevel }): Promise<GeneratedQuestionData> => handleApiCall(async () => {
    const ai = getAiClient();
    
    const levelContext = params.level === 'GCSE' 
        ? "AQA GCSE Geography (Specification 8035)" 
        : "AQA A-Level Geography";

    let promptExtraInstructions = "";
    if (params.level === 'A-Level' && params.marks === 6) {
        promptExtraInstructions = `
        IMPORTANT: This MUST be a specialized "Analyse the data..." question (AO3).
        1. The question prompt MUST be strictly: "Analyse the data shown in Figure 1." (or similar reference to the figure).
        2. You MUST generate a detailed 'figureDescription' for a complex graph, map, or data visualization suitable for A-Level analysis (e.g., Lorenz curve, complex choropleth, logarithmic graph, or scatter graph with anomalies).
        3. The mark scheme MUST explicitly require the use of the TESLA model (Trend, Evidence, Shape, Link, Anomaly) for analysis.
        4. The mark scheme MUST include a distinct section labelled "Indicative Content:" listing specific data points, trends, and anomalies students should identify.
        `;
    } else if (params.level === 'GCSE' && params.marks === 6) {
        promptExtraInstructions = `
        This should be an AO3 data response question. 
        Require a figure description for a graph or map suitable for GCSE level analysis.
        The mark scheme should look for TEA (Trend, Evidence, Anomaly).
        The mark scheme MUST include a distinct section labelled "Indicative Content:" listing specific data points.
        `;
    }

    const prompt = `Generate a new, unique ${levelContext} exam question.
    
    The question MUST be for the following unit: "${params.unit}". Do not generate a question for any other unit.
    Marks: ${params.marks}
    ${promptExtraInstructions}

    Existing question examples to avoid duplicating:
    ${QUESTION_EXAMPLES.filter(q => !q.level || q.level === params.level).map(q => `- ${q.title}: ${q.prompt}`).join('\n')}

    The question must be plausible for a real exam paper at ${params.level} standard.
    If the question is AO3 (e.g., 6 marks in A-Level, or data response in GCSE), it MUST require a stimulus figure. Generate a detailed description for a plausible stimulus figure (e.g., a map, graph, table, or photo).
    For other mark tariffs, a figure is optional but can be included if it enhances the question.

    Format your response as a JSON object with the following structure:
    {
      "examYear": 2024,
      "questionNumber": "01.X",
      "unit": "${params.unit}",
      "title": "string",
      "prompt": "string",
      "marks": number,
      "figureDescription": "string (detailed description for image generation, or empty string if no figure)",
      "ao": { "ao1": number, "ao2": number, "ao3": number, "ao4": number },
      "caseStudy": { "title": "string", "content": "string" },
      "markScheme": { "title": "string", "content": "string" }
    }
    
    Crucially, ensure the generated question's topic and the "unit" field in the JSON response both strictly match "${params.unit}".
    Ensure the AO breakdown is appropriate for the marks and command word for ${params.level}.
    ${params.level === 'GCSE' ? 'For GCSE, ensure questions are direct. 9-markers usually have 3 marks AO1, 3 AO2, 3 AO3.' : 'For A-Level, ensure high complexity. 20-markers are 10 AO1, 10 AO2.'}
    
    The caseStudy content should describe any stimulus provided with the question. If there's no stimulus, say so.
    The markScheme content should be detailed, similar to official AQA mark schemes. 
    CRITICAL REQUIREMENT: The markScheme content string MUST contain a section titled "Indicative Content:" (case insensitive) followed by bullet points of specific facts, figures, case study details, or data interpretations that would be credited. This section must be separate from the general marking guidance/levels.
    Do not wrap the JSON in markdown backticks.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        }
    });

    const jsonText = response.text ? cleanJson(response.text) : '{}';
    return JSON.parse(jsonText) as GeneratedQuestionData;
});

export const generateFigure = async (description: string): Promise<string> => handleApiCall(async () => {
    const ai = getAiClient();
    
    // Use gemini-3-pro-image-preview (nano banana pro) as requested for high quality exam figures
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [
                {
                    text: `Create a Geography exam stimulus figure. It should look professional, clear, and academic. The figure must accurately represent: "${description}". The style should be clean, with clear labels, legends, and titles where appropriate. For maps, use a simple color palette suitable for an exam paper. For graphs, ensure axes are clearly labelled. The image should be easily understandable in a classroom setting.`
                }
            ]
        },
        config: {
            imageConfig: {
                aspectRatio: "16:9",
                imageSize: "1K"
            }
        }
    });

    let base64Image = '';
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            base64Image = part.inlineData.data;
            return `data:image/png;base64,${base64Image}`;
        }
    }
    
    throw new Error("No image generated.");
});

export const streamChatResponse = async (
    history: ChatMessage[],
    message: string,
    mode: 'fast' | 'complex',
    onChunk: (chunk: string) => void
): Promise<void> => handleApiCall(async () => {
    const ai = getAiClient();
    
    const contents = history.filter(m => m.role !== 'system').map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const modelName = mode === 'fast' ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
    const config = mode === 'complex' ? { thinkingConfig: { thinkingBudget: 8192 } } : {};
    
    const systemInstruction = `You are Geo Pro, an expert Geography tutor. You are friendly, encouraging, and knowledgeable about the AQA specification (both GCSE and A-Level). Adjust your complexity based on the user's questions. Keep your responses concise and helpful.`;

    const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: contents,
        config: {
            ...config,
            systemInstruction
        }
    });

    for await (const chunk of responseStream) {
        onChunk(chunk.text || '');
    }
});

export const getHint = async (question: Question): Promise<string> => handleApiCall(async () => {
    const ai = getAiClient();
    const level = question.level || 'A-Level';
    const prompt = `For the following ${level} Geography question, provide a concise, one-sentence hint to help a student get started. Don't give away the answer, but point them in the right direction.
    
    Question: "${question.prompt}" (${question.marks} marks)
    
    Hint:`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text || 'Think about the command word.';
});

export const getMotivationalMessage = async (): Promise<string> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `Generate a short, encouraging, and slightly quirky motivational message for a geography student who has just finished a practice question. Keep it to one sentence.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text || 'Keep going!';
});

export const generateModelAnswer = async (question: Question): Promise<MarkedModelAnswer> => handleApiCall(async () => {
    const ai = getAiClient();
    const level = question.level || 'A-Level';
    const prompt = `Generate an exemplar ${level} model answer for the following geography question.
    
    Question: "${question.prompt}"
    Marks: ${question.marks}
    Unit: ${question.unit}
    Stimulus: ${question.caseStudy.content}
    Mark Scheme Guidance: ${question.markScheme.content}

    Structure the response as a JSON object. The root object should have 'title' and 'segments'.
    'title' should be "Exemplar Model Answer".
    'segments' should be an array of objects, each with 'text', 'ao', and 'feedback'.
    - 'text': A chunk of the model answer.
    - 'ao': The primary assessment objective for this text segment ('AO1', 'AO2', 'AO3', 'Intro', 'Conclusion').
    - 'feedback': A brief explanation of why this segment scores marks for that AO.

    The answer must be detailed, accurate, and use appropriate geographical terminology suitable for ${level}. It should meet the requirements of the highest mark band. Break the answer down into logical segments.
    Do not wrap the JSON in markdown backticks.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        }
    });
    
    const jsonText = response.text ? cleanJson(response.text) : '{}';
    return JSON.parse(jsonText);
});

export const streamTutorResponse = async (
    question: Question,
    history: ChatMessage[],
    message: string,
    onChunk: (chunk: string) => void
): Promise<void> => handleApiCall(async () => {
    const ai = getAiClient();
    const level = question.level || 'A-Level';

    const systemInstruction = `You are an interactive ${level} Geography tutor. Your goal is to guide a student to write a full, high-quality answer to an exam question without giving them the answer directly.
    The student is working on this question:
    - Title: ${question.title}
    - Prompt: ${question.prompt}
    - Marks: ${question.marks}

    Your personality is encouraging and Socratic. Ask questions to prompt the student.
    You have two special commands you MUST use to build the student's answer and help them deconstruct the question:
    1.  To add text to the student's live answer, prefix the line with "ANSWER:". Example: "ANSWER: Climate change is a significant factor..."
    2.  To "BUG" the question (Box command words, Underline key terms), use "BUG:BOX: <term>" or "BUG:UNDERLINE: <term>". Example: "BUG:BOX: Evaluate". Only BUG terms from the original question prompt.
    3.  For all normal conversation, prefix the line with "CHAT:". Example: "CHAT: That's a great start! What case study could you use to support that point?"

    Every line of your response MUST start with one of "CHAT:", "ANSWER:", "BUG:BOX:", or "BUG:UNDERLINE:". Use multiple lines and commands in a single response.
    
    Start the session by breaking down the question for the student, using the BUG commands, and asking them for an opening sentence.
    Guide them paragraph by paragraph. If they provide a good point, rephrase it formally and add it to their answer using the "ANSWER:" command.
    Keep your CHAT responses short and focused on one step at a time.`;

    const contents = history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents,
        config: { systemInstruction }
    });

    for await (const chunk of responseStream) {
        onChunk(chunk.text || '');
    }
});

export const generateCaseStudyApplication = async (question: Question, caseStudyName: string): Promise<{ summary: string; application: string }> => handleApiCall(async () => {
    const ai = getAiClient();
    const caseStudyData = MASTER_CASE_STUDIES.find(cs => cs.name === caseStudyName);
    const level = question.level || 'A-Level';
    
    const prompt = `Given the following ${level} Geography question and case study, provide specific, tailored information.
    
    Question: "${question.prompt}" (${question.marks} marks, Unit: ${question.unit})
    
    Case Study: ${caseStudyName}
    - Geographic Context: ${caseStudyData?.geographicContext}
    - Key Concepts: ${caseStudyData?.keyConcepts.join(', ')}

    Your response must be a JSON object with two keys: "summary" and "application".
    - "summary": A concise summary of the most relevant key facts, figures, and specific details from the ${caseStudyName} case study that could be used to answer this question.
    - "application": A paragraph explaining exactly HOW a student could apply these details to directly answer the specific question provided.

    Do not wrap the JSON in markdown backticks.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    const jsonText = response.text ? cleanJson(response.text) : '{}';
    return JSON.parse(jsonText);
});

export const markStudentAnswer = async (question: Question, studentAnswer: string, attachment?: { mimeType: string; data: string }): Promise<AIFeedback> => handleApiCall(async () => {
    const ai = getAiClient();
    const level = question.level || 'A-Level';
    
    let userContent: any[] = [];
    
    if (attachment) {
        userContent.push({
            inlineData: {
                mimeType: attachment.mimeType,
                data: attachment.data
            }
        });
        userContent.push({
            text: `This is an image/PDF of my handwritten answer. Please transcribe it internally and then mark it against the question. ${studentAnswer ? 'Additional notes: ' + studentAnswer : ''}`
        });
    } else {
        userContent.push({
            text: `Student's Answer:\n"${studentAnswer}"`
        });
    }

    const promptText = `You are an expert ${level} Geography examiner for the AQA specification. Mark the student's answer.
    
    Question Details:
    - Title: ${question.title}
    - Prompt: ${question.prompt}
    - Marks: ${question.marks}
    - Mark Scheme: ${question.markScheme.content}

    Your task is to provide feedback in a specific JSON format. The root object must have "overallComment", "score", "totalMarks", "strengths", "improvements", and "annotatedAnswer".
    - "overallComment": A constructive paragraph summarizing the performance.
    - "score": An integer mark out of the total. Be a tough but fair examiner.
    - "totalMarks": The total marks for the question (${question.marks}).
    - "strengths": An array of 2-3 specific strengths as strings.
    - "improvements": An array of 2-3 specific, actionable improvements as strings.
    - "annotatedAnswer": An array of segment objects. Each segment must have "text", "ao", and "feedback".
        - "text": A chunk of the student's answer (transcribed if from image).
        - "ao": The primary AO demonstrated ('AO1', 'AO2', 'AO3', 'AO4' (if GCSE), 'Intro', 'Conclusion', or 'Generic' for non-creditworthy parts).
        - "feedback": A concise comment on why that segment is good, or how it could be improved.
    
    The entire student answer must be represented in the "annotatedAnswer" segments. Do not miss any part of it. Be precise in your AO allocation and feedback.
    Do not wrap the JSON in markdown backticks.`;
    
    userContent.push({ text: promptText });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
            role: 'user',
            parts: userContent
        },
        config: { responseMimeType: 'application/json' }
    });

    const jsonText = response.text ? cleanJson(response.text) : '{}';
    return JSON.parse(jsonText);
});

export const generateSessionSummary = async (question: Question, feedback: AIFeedback): Promise<string> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `Based on this question and the feedback given to a student, generate a very short, one-sentence summary of the student's performance for a "Recent Activity" feed.
    
    Question Title: ${question.title}
    Score: ${feedback.score}/${feedback.totalMarks}
    Key Improvement: ${feedback.improvements[0]}
    
    Generate a new summary for the provided data:`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text ? response.text.trim() : 'Completed a practice session.';
});

export const streamMathsTutorResponse = async (
    problem: MathsProblem,
    skill: MathsSkill,
    history: ChatMessage[],
    message: string,
    onChunk: (chunk: string) => void
): Promise<void> => handleApiCall(async () => {
    const ai = getAiClient();
    const systemInstruction = `You are an expert Geography maths tutor. You are guiding a student through a quantitative skills problem step-by-step.
    
    The student is working on this problem:
    - Skill: ${skill.name} (${skill.category})
    - Instructions: ${skill.instructions.join('; ')}
    - Question: ${problem.question}
    - Data: [${problem.data.join(', ')}]

    Your personality is clear, patient, and methodical.
    You have special commands to structure your response and build the "Live Working Out" section for the student.
    1.  STEP: A description of the current step. (e.g., "STEP: First, we need to add up all the values in the dataset.")
    2.  FORMULA: The relevant formula. (e.g., "FORMULA: Mean = (Sum of values) / (Number of values)")
    3.  CALCULATION: The actual calculation being performed. (e.g., "CALCULATION: 1200 + 1150 + 1300 + 1250 + 1100 = 6000")
    4.  FINAL_ANSWER: The final calculated answer. (e.g., "FINAL_ANSWER: 1200")
    5.  CHAT: Your conversational text to the student. (e.g., "CHAT: Great! Now what does the formula tell us to do next?")

    Every line of your response MUST start with one of these commands. Use multiple commands to form a complete thought.
    Start the session by explaining the first step of the instructions. Guide the student through each calculation.
    Keep your CHAT responses short and focused on the immediate next step.`;
    
    const contents = history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents,
        config: { systemInstruction }
    });

    for await (const chunk of responseStream) {
        onChunk(chunk.text || '');
    }
});

export const generateCaseStudyInfo = async (study: CaseStudyLocation): Promise<{ summary: string; imageUrl: string }> => handleApiCall(async () => {
    const ai = getAiClient();
    const infoPrompt = `Generate a concise, informative summary for a Geography student about the "${study.name}" case study.
    
    Topic: ${study.topic}
    Known Details: ${study.details}
    Exam Context: ${study.citation}
    
    The summary should include:
    - Key geographical concepts illustrated by this case study.
    - Specific facts, figures, or dates that are useful for exam answers.
    - The significance of this location in relation to its topic.
    
    The summary should be about 150-200 words. Format it as a single block of text.`;

    const imagePrompt = `Create a visually appealing and geographically relevant image for the "${study.name}" case study. The style should be a professional, slightly stylized illustration, suitable for an educational context. It could be a map, a landscape, or a conceptual diagram related to "${study.topic}". Do not include any text in the image.`;

    // Use Flash models for speed
    const infoPromise = ai.models.generateContent({ model: 'gemini-2.5-flash', contents: infoPrompt });
    const imagePromise = ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '16:9',
        }
    });

    const [infoResponse, imageResponse] = await Promise.all([infoPromise, imagePromise]);
    
    const summary = infoResponse.text || 'Summary unavailable.';
    const imageUrl = `data:image/png;base64,${imageResponse.generatedImages[0].image.imageBytes}`;
    
    return { summary, imageUrl };
});

export const generateQuizQuestion = async (item: FlashcardItem): Promise<CaseStudyQuizQuestion> => handleApiCall(async () => {
    const ai = getAiClient();
    
    const isTerm = (item as any).type === 'term';
    const contextType = isTerm ? 'Key Term' : 'Case Study';
    
    const prompt = `Generate a unique multiple-choice quiz question based on the following Geography ${contextType}:
    
    Name: ${item.name}
    Topic: ${item.topic}
    Details: ${item.details}
    Citation/Context: ${item.citation}

    The question should test a key concept, specific detail, or definition related to this item.
    It must have exactly 4 plausible options, with only one being correct.
    One of the incorrect options should be a common misconception if possible.
    
    Return the response as a JSON object with the following structure:
    {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctAnswer": "string"
    }
    The 'correctAnswer' must be one of the strings from the 'options' array.
    Do not wrap the JSON response in markdown backticks.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        correctAnswer: { type: Type.STRING }
                    },
                    required: ['question', 'options', 'correctAnswer']
                }
            }
        });
        
        const jsonText = response.text ? cleanJson(response.text) : '{}';
        return JSON.parse(jsonText);
    } catch (error) {
        console.warn("Strict schema generation failed, retrying with loose mode...", error);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt + "\nIMPORTANT: Return valid raw JSON only.",
            config: {
                responseMimeType: 'application/json'
            }
        });
        
        const jsonText = response.text ? cleanJson(response.text) : '{}';
        return JSON.parse(jsonText);
    }
});

export const generateSwipeQuizItem = async (study: CaseStudyLocation): Promise<SwipeQuizItem> => handleApiCall(async () => {
    const ai = getAiClient();

    const statementPrompt = `Create a challenging True or False statement for a Geography student about:
    Case Study: ${study.name}
    Topic: ${study.topic}
    
    CRITICAL RULES:
    1. The "statement" MUST be SHORT and CONCISE. Maximum 15 words.
    2. It should test specific knowledge (fact, figure, or concept).
    3. Provide a "imagePrompt" for a background illustration.
    
    Output valid JSON only:
    {
      "statement": "The Amazon rainforest stores 20% of the world's carbon.",
      "isTrue": true,
      "imagePrompt": "Dense rainforest canopy, digital art style, NO TEXT"
    }`;

    const statementResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: statementPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    statement: { type: Type.STRING },
                    isTrue: { type: Type.BOOLEAN },
                    imagePrompt: { type: Type.STRING }
                },
                required: ['statement', 'isTrue', 'imagePrompt']
            }
        }
    });
    
    let statement, isTrue, imagePrompt;
    try {
        const jsonText = cleanJson(statementResponse.text || '{}');
        const parsed = JSON.parse(jsonText);
        statement = parsed.statement;
        isTrue = parsed.isTrue;
        imagePrompt = parsed.imagePrompt;
    } catch (e) {
        console.warn("Failed to parse quiz item, using fallback.", e);
        statement = `${study.name} is a case study in ${study.topic}.`;
        isTrue = true;
        imagePrompt = `Map of ${study.name}`;
    }

    let imageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='; 

    try {
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A simple, clear, educational illustration for a geography quiz card. Subject: ${imagePrompt}. Style: Digital art, clean lines, NO TEXT LABELS, high contrast.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            }
        });
        imageUrl = `data:image/png;base64,${imageResponse.generatedImages[0].image.imageBytes}`;
    } catch (imageError) {
        console.warn("Failed to generate image for swipe quiz.", imageError);
    }

    return {
        id: `swipe-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        statement: statement || "Error generating statement",
        imageUrl,
        correctAnswer: typeof isTrue === 'boolean' ? isTrue : true,
        topic: study.topic,
        caseStudyName: study.name,
    };
});


export const generateCareerInfo = async (category: string): Promise<GeographyCareer[]> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `Generate a list of 3-5 interesting and relevant careers for a Geography student within the category of "${category}".
    
    For each career, provide a title, a brief description, a list of key skills (mixing technical and soft skills), and a typical UK salary range.
    
    Return the response as a JSON array of objects with the following structure:
    [
        {
            "title": "string",
            "description": "string (2-3 sentences)",
            "keySkills": ["string", "string", "string"],
            "salaryRange": "string (e.g., £25,000 - £60,000)"
        }
    ]
    
    Do not wrap the JSON response in markdown backticks.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        keySkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                        salaryRange: { type: Type.STRING }
                    },
                    required: ['title', 'description', 'keySkills', 'salaryRange']
                }
            }
        }
    });

    const jsonText = response.text ? cleanJson(response.text) : '[]';
    return JSON.parse(jsonText);
});

export const generateUniversityCourseInfo = async (interests: string): Promise<{ courses: UniversityCourseInfo[], sources: { uri: string; title: string }[] }> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `As a UK university admissions advisor, use Google Search to find 3-4 actual undergraduate degree courses related to these interests: '${interests}'.
    
    For each course, provide its exact title, the university name, a brief description, and typical A-Level entry requirements.
    
    Return the response as a JSON array of objects. Each object should have 'courseTitle', 'description', and 'entryRequirements'.
    DO NOT invent courses; use real examples from university websites found via search.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const jsonText = response.text ? response.text.trim() : '';
    let courses: UniversityCourseInfo[] = [];
    try {
        const match = jsonText.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
            courses = JSON.parse(match[1]);
        } else {
            courses = JSON.parse(jsonText);
        }
    } catch (e) {
        console.error("Failed to parse university course JSON:", e);
        throw new Error("The response was not in the expected JSON format.");
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
            uri: chunk.web.uri,
            title: chunk.web.title,
        }));
    
    courses.forEach(course => {
        const universityNameMatch = course.courseTitle.match(/-\s*(.*)/);
        const universityName = universityNameMatch ? universityNameMatch[1].toLowerCase() : '';
        const matchingSource = sources.find(s => s.title.toLowerCase().includes(universityName));
        if (matchingSource) {
            course.url = matchingSource.uri;
            course.sourceTitle = matchingSource.title;
        }
    });


    return { courses, sources };
});

export const generateTopUKUniversityInfo = async (): Promise<{ courses: UniversityCourseInfo[], sources: { uri: string; title: string }[] }> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `Using Google Search, find a list of 5 top-ranked UK universities for Geography based on a recent, reputable ranking. Provide the degree title, description, and entry requirements.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const jsonText = response.text ? response.text.trim() : '';
    let courses: UniversityCourseInfo[] = [];
    try {
        const match = jsonText.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
             courses = JSON.parse(match[1]);
        } else {
             courses = JSON.parse(jsonText);
        }
    } catch (e) {
        console.error("Failed to parse top university course JSON:", e);
        throw new Error("The response was not in the expected JSON format.");
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
            uri: chunk.web.uri,
            title: chunk.web.title,
        }));
    
    courses.forEach(course => {
        const universityNameMatch = course.courseTitle.match(/-\s*(.*)/);
        const universityName = universityNameMatch ? universityNameMatch[1].toLowerCase() : '';
        const matchingSource = sources.find(s => s.title.toLowerCase().includes(universityName));
        if (matchingSource) {
            course.url = matchingSource.uri;
            course.sourceTitle = matchingSource.title;
        }
    });

    return { courses, sources };
});


export const generateTransferableSkillInfo = async (skillName: string): Promise<TransferableSkill> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `Provide a detailed explanation of the transferable skill "${skillName}" in the context of Geography studies.
    
    Return the response as a JSON object with the following structure:
    {
        "skillName": "${skillName}",
        "description": "string",
        "applicationInCareers": "string"
    }

    Do not wrap the JSON response in markdown backticks.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        }
    });
    
    const jsonText = response.text ? cleanJson(response.text) : '{}';
    return JSON.parse(jsonText);
});

export const generateCVSuggestions = async (jobTitle: string): Promise<CVSuggestions> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `You are a professional CV writer. A student studying Geography wants to apply for the job of '${jobTitle}'. Generate tailored suggestions for their CV.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    personalStatement: { type: Type.STRING },
                    keySkills: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                skill: { type: Type.STRING },
                                justification: { type: Type.STRING }
                            },
                            required: ['skill', 'justification']
                        }
                    },
                    educationEnhancements: { type: Type.STRING }
                },
                required: ['personalStatement', 'keySkills', 'educationEnhancements']
            }
        }
    });
    
    const jsonText = response.text ? cleanJson(response.text) : '{}';
    return JSON.parse(jsonText);
});

export const generateReelSummary = async (study: CaseStudyLocation): Promise<string> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `Create a short, punchy, 3-point summary of the "${study.name}" geography case study (Topic: ${study.topic}).
    Focus on the most impressive facts or figures.
    Format as a single string with bullet points separated by " • ".`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text ? response.text.trim() : `${study.name} is a key case study for ${study.topic}.`;
});

export const generateCaseStudyVideo = async (study: CaseStudyLocation, summary: string): Promise<string> => handleApiCall(async () => {
    const ai = getAiClient();
    
    const prompt = `A cinematic, aerial drone shot of ${study.name}, related to ${study.topic}. The scene should be realistic, high quality, 4k, highly detailed.`;
    
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p', 
            aspectRatio: '9:16'
        }
    });
    
    while (!operation.done) {
         await new Promise(resolve => setTimeout(resolve, 5000));
         operation = await ai.operations.getVideosOperation({operation: operation});
    }
    
    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
        throw new Error("Video generation failed: No URI returned.");
    }
    
    return videoUri;
});

export const generateLessonPlan = async (topic: string, level: UserLevel): Promise<VideoLessonPlan> => handleApiCall(async () => {
    const ai = getAiClient();
    const prompt = `Create a structured video lesson plan for a ${level} Geography video on the topic: "${topic}".
    
    The lesson should be divided into 4-6 distinct segments (e.g., Introduction, Key Concepts, Case Study Details, Conclusion).
    For each segment, provide:
    - "title": A short title.
    - "script": A spoken script for a narrator (approx 80-120 words per segment). It should be engaging and educational. The tone should be conversational but academic.
    - "imagePrompt": A detailed visual description to generate a slide background image. No text in the image description.

    Return the response as a JSON object with the structure:
    {
        "topic": "${topic}",
        "segments": [
            { "title": "string", "script": "string", "imagePrompt": "string" }
        ]
    }
    Do not wrap the JSON in markdown backticks.`;

    // Using Flash model for faster response time on lesson plan generation
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        }
    });

    const jsonText = response.text ? cleanJson(response.text) : '{}';
    return JSON.parse(jsonText);
});

export const generateSlideImage = async (imagePrompt: string): Promise<string> => handleApiCall(async () => {
    const ai = getAiClient();
    // Using Flash Image model for faster generation
    const response = await ai.models.generateImages({
        model: 'gemini-2.5-flash-image',
        prompt: `Educational geography illustration: ${imagePrompt}. High quality, photorealistic or clean digital art style. No text.`,
        config: {
            numberOfImages: 1,
            aspectRatio: '16:9',
        }
    });
    
    // Assuming the response format for gemini-2.5-flash-image is similar or adapted. 
    // If using generateImages method from SDK, it returns GeneratedImages object.
    const base64 = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64}`;
});

export const generateSlideAudio = async (text: string): Promise<AudioBuffer> => handleApiCall(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Aoede' }
                }
            }
        }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Audio generation failed.");
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    await audioContext.close();
    
    return audioBuffer;
});
