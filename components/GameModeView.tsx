
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GAME_QUESTIONS } from '../game-database';
import { KEY_TERMS } from '../knowledge-database';
import { generateQuizQuestion, getHint } from '../services/geminiService';
import { MultipleChoiceQuestion, GameSessionResult, Question, AuthUser } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

// Game Constants
const GRAVITY = 0.6;
const JUMP_STRENGTH = -10;
const PIPE_WIDTH = 80;
const PIPE_GAP = 220;
const PIPE_SPAWN_RATE = 90; // Lower is faster, based on frames
const INITIAL_SPEED = 4;
const SPEED_INCREASE = 0.002;
const INITIAL_GLOBE_SIZE = 40;
const GLOBE_SIZE_INCREASE = 5;
const GROUND_HEIGHT = 80;
const GLOBE_X_POSITION = 60;

type GameState = 'start' | 'playing' | 'gameOver';
type Pipe = { id: number; x: number; gapY: number; passed: boolean };

interface GameModeViewProps {
    topic: string;
    user: AuthUser;
    onExit: () => void;
}

const usePersistentState = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};

const GameModeView: React.FC<GameModeViewProps> = ({ topic, user, onExit }) => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = usePersistentState('geo-guide-highscore', 0);
    const [globeSize, setGlobeSize] = usePersistentState('geo-guide-globe-size', INITIAL_GLOBE_SIZE);

    // Game Object State
    const [globeY, setGlobeY] = useState(300); // Start with a temporary, safe value
    const [pipes, setPipes] = useState<Pipe[]>([]);
    
    // Game Physics Refs (mutated every frame, don't need to trigger re-renders)
    const globeVelocity = useRef(0);
    const gameSpeed = useRef(INITIAL_SPEED);
    const frameCount = useRef(0);
    
    // Quiz State
    const [currentQuestion, setCurrentQuestion] = useState<MultipleChoiceQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
    const [hint, setHint] = useState<string | null>(null);
    const [isHintLoading, setIsHintLoading] = useState(false);
    
    // Question Tracking
    const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);

    // Dynamic Question Queue
    const [dynamicQuestions, setDynamicQuestions] = useState<MultipleChoiceQuestion[]>([]);
    const loadingQuestionRef = useRef(false);

    const gameLoopRef = useRef<number | null>(null);

    const questionsForTopic = useMemo(() => {
        const level = user.level || 'A-Level';
        // Filter by level first
        let filtered = GAME_QUESTIONS.filter(q => q.levels.includes(level));
        
        // Then filter by topic
        if (topic !== 'All Topics') {
            filtered = filtered.filter(q => q.topic === topic);
        }
        
        return filtered.length > 0 ? filtered : GAME_QUESTIONS.filter(q => q.levels.includes(level));
    }, [topic, user.level]);

    // Pre-fetch dynamic questions
    const fetchDynamicQuestion = useCallback(async () => {
        if (loadingQuestionRef.current) return;
        loadingQuestionRef.current = true;

        try {
            const level = user.level || 'A-Level';
            let pool = KEY_TERMS.filter(term => term.levels.includes(level));
            if (topic !== 'All Topics') {
                pool = pool.filter(term => term.topic === topic);
            }
            // Fallback
            if (pool.length === 0) pool = KEY_TERMS.filter(term => term.levels.includes(level));

            if (pool.length > 0) {
                const randomTerm = pool[Math.floor(Math.random() * pool.length)];
                const qData = await generateQuizQuestion(randomTerm);

                const newQ: MultipleChoiceQuestion = {
                    id: `dyn_${Date.now()}_${Math.random()}`,
                    question: qData.question,
                    options: qData.options,
                    correctAnswer: qData.correctAnswer,
                    topic: randomTerm.topic,
                    levels: [level]
                };

                setDynamicQuestions(prev => [...prev, newQ]);
            }
        } catch (e) {
            console.error("Failed to fetch dynamic question", e);
        } finally {
            loadingQuestionRef.current = false;
        }
    }, [topic, user.level]);

    // Reset used questions if topic changes and start fetching
    useEffect(() => {
        setUsedQuestionIds([]);
        setDynamicQuestions([]);
        fetchDynamicQuestion();
    }, [topic, fetchDynamicQuestion]);

    // Keep buffer full
    useEffect(() => {
        if (dynamicQuestions.length < 2 && !loadingQuestionRef.current) {
            fetchDynamicQuestion();
        }
    }, [dynamicQuestions.length, fetchDynamicQuestion]);

    // Set correct initial globe position once the component has mounted
    useEffect(() => {
        setGlobeY(window.innerHeight / 2 - INITIAL_GLOBE_SIZE / 2);
    }, []);

    // Game Over Logic
    const handleGameOver = useCallback(() => {
        setGameState('gameOver');
        if (score > highScore) {
            setHighScore(score);
        }
        
        // Prioritize dynamic questions
        if (dynamicQuestions.length > 0) {
            const nextQuestion = dynamicQuestions[0];
            setDynamicQuestions(prev => prev.slice(1)); // Remove used question
            setCurrentQuestion(nextQuestion);
            // Trigger fetch for next one
            fetchDynamicQuestion();
            setHint(null);
            return;
        }

        // Filter out used questions (Fallback)
        const unusedQuestions = questionsForTopic.filter(q => !usedQuestionIds.includes(q.id));
        let pool = unusedQuestions;
        let isReset = false;

        // If all questions have been used, reset the pool
        if (pool.length === 0) {
            pool = questionsForTopic;
            isReset = true;
        }

        if (pool.length > 0) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            const nextQuestion = pool[randomIndex];
            setCurrentQuestion(nextQuestion);
            
            setUsedQuestionIds(prev => {
                if (isReset) return [nextQuestion.id];
                return [...prev, nextQuestion.id];
            });
        } else {
             // Emergency fallback if everything fails
             setCurrentQuestion({
                 id: 'emergency_fallback',
                 question: 'What is the capital of the UK?',
                 options: ['London', 'Paris', 'Berlin', 'Madrid'],
                 correctAnswer: 'London',
                 topic: 'General',
                 levels: ['GCSE', 'A-Level']
            });
        }
        setHint(null);
    }, [score, highScore, setHighScore, questionsForTopic, usedQuestionIds, dynamicQuestions, fetchDynamicQuestion]);
    
    // Reset Game Logic
    const resetGame = useCallback((isContinuing: boolean = false) => {
        setGameState('start');
        setScore(0);
        setPipes([]);
        setGlobeY(window.innerHeight / 2 - (isContinuing ? globeSize : INITIAL_GLOBE_SIZE) / 2);
        globeVelocity.current = 0;
        gameSpeed.current = INITIAL_SPEED;
        frameCount.current = 0;
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
        setHint(null);
        if (!isContinuing) {
            setGlobeSize(INITIAL_GLOBE_SIZE);
        }
    }, [setGlobeSize, globeSize]);

    // Main Game Loop
    const gameLoop = useCallback(() => {
        if (gameState !== 'playing') return;

        const SCREEN_HEIGHT = window.innerHeight;
        const SCREEN_WIDTH = window.innerWidth;

        // --- Physics & Object Updates ---
        // 1. Globe
        globeVelocity.current += GRAVITY;
        let newGlobeY = globeY + globeVelocity.current;

        // 2. Pipes
        frameCount.current++;
        let newPipes = pipes.map(pipe => ({ ...pipe, x: pipe.x - gameSpeed.current }));
        
        // 3. Spawn new pipes
        if (frameCount.current % PIPE_SPAWN_RATE === 0) {
            const gapY = Math.random() * (SCREEN_HEIGHT - PIPE_GAP - (GROUND_HEIGHT + 100)) + (PIPE_GAP / 2) + 50;
            newPipes.push({ id: Date.now(), x: SCREEN_WIDTH, gapY, passed: false });
        }
        
        // 4. Update Score
        let currentScore = score;
        newPipes.forEach(pipe => {
            if (!pipe.passed && pipe.x + PIPE_WIDTH < GLOBE_X_POSITION) {
                pipe.passed = true;
                currentScore++;
                gameSpeed.current += SPEED_INCREASE;
            }
        });
        
        // 5. Remove off-screen pipes
        newPipes = newPipes.filter(pipe => pipe.x > -PIPE_WIDTH);

        // --- Collision Detection ---
        const globeRect = { top: newGlobeY, bottom: newGlobeY + globeSize, left: GLOBE_X_POSITION, right: GLOBE_X_POSITION + globeSize };
        
        // Ground/Ceiling collision
        if (globeRect.bottom > SCREEN_HEIGHT - GROUND_HEIGHT || globeRect.top < 0) {
            handleGameOver();
            return;
        }

        // Pipe collision
        for (const pipe of newPipes) {
            const topPipeBottom = pipe.gapY - PIPE_GAP / 2;
            const bottomPipeTop = pipe.gapY + PIPE_GAP / 2;
            if (
                globeRect.right > pipe.x && globeRect.left < pipe.x + PIPE_WIDTH &&
                (globeRect.top < topPipeBottom || globeRect.bottom > bottomPipeTop)
            ) {
                handleGameOver();
                return;
            }
        }

        // --- Update State ---
        setGlobeY(newGlobeY);
        setPipes(newPipes);
        if(currentScore > score) {
            setScore(currentScore);
        }
        
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, globeY, pipes, score, globeSize, handleGameOver]);

    // Effect to control starting/stopping the game loop
    useEffect(() => {
        if (gameState === 'playing') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState, gameLoop]);

    // Jump handler
    const handleJump = useCallback(() => {
        if (gameState === 'playing') {
            globeVelocity.current = JUMP_STRENGTH;
        } else if (gameState === 'start') {
            setGameState('playing');
            globeVelocity.current = JUMP_STRENGTH;
        }
    }, [gameState]);
    
    // Event listeners for input
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === 'Space' && gameState !== 'gameOver') {
                e.preventDefault();
                handleJump();
            }
        };
        const handleClick = () => {
             if (gameState !== 'gameOver') {
                handleJump();
            }
        }

        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('click', handleClick);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('click', handleClick);
        };
    }, [handleJump, gameState]);
    
    const fetchHintForQuestion = async () => {
        if (!currentQuestion || isHintLoading) return;
        setIsHintLoading(true);
        try {
            const tempQuestion: Question = {
                id: currentQuestion.id,
                examYear: 0,
                questionNumber: '',
                unit: currentQuestion.topic,
                title: currentQuestion.topic,
                prompt: currentQuestion.question,
                marks: 1,
                ao: { ao1: 1, ao2: 0, ao3: 0 },
                caseStudy: { title: '', content: '' },
                markScheme: { title: '', content: '' },
                level: user.level || 'A-Level'
            };
            const fetchedHint = await getHint(tempQuestion);
            setHint(fetchedHint);
        } catch (error) {
            console.error("Failed to get hint", error);
            setHint("Sorry, couldn't fetch a hint right now.");
        } finally {
            setIsHintLoading(false);
        }
    };


    // Quiz answer handler
    const handleAnswer = async (answer: string) => {
        if (selectedAnswer || !currentQuestion) return;

        setSelectedAnswer(answer);
        const correct = answer === currentQuestion.correctAnswer;
        setIsAnswerCorrect(correct);
        
        const result: GameSessionResult = {
            question: currentQuestion,
            wasCorrect: correct,
            timestamp: new Date().toISOString(),
            level: user.level || 'A-Level'
        };
        try {
            const gameResultsRef = collection(db, 'users', user.uid, 'game_results');
            await addDoc(gameResultsRef, result);
        } catch (e) {
            console.error("Failed to save game result", e);
        }

        if (!correct) {
            setGlobeSize(Math.min(globeSize + GLOBE_SIZE_INCREASE, 80));
        }

        setTimeout(() => {
            resetGame(true);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-sky-400 z-50 select-none overflow-hidden game-container">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-600"></div>
            <div className="cloud cloud-1"></div>
            <div className="cloud cloud-2"></div>
            <div className="cloud cloud-3"></div>

            {/* UI */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-5xl font-extrabold z-10 text-center" style={{ textShadow: '3px 3px 6px #00000080' }}>
                {score}
            </div>
            <div className="absolute top-6 right-6 text-white text-xl font-bold z-10" style={{ textShadow: '2px 2px 4px #00000080' }}>
                HIGH SCORE: {highScore}
            </div>
            
            <button 
                onClick={(e) => { e.stopPropagation(); onExit(); }}
                className="absolute top-6 left-6 z-50 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white font-bold py-2 px-4 rounded-full border border-white/30 transition-all shadow-lg flex items-center gap-2"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
            >
                <span>⬅️</span> Main Menu
            </button>
            
            {/* Game Objects */}
            {gameState !== 'start' && (
                <div className="globe absolute top-0" style={{ transform: `translate(${GLOBE_X_POSITION}px, ${globeY}px)`, fontSize: `${globeSize}px`, width: `${globeSize}px`, height: `${globeSize}px` }}>🌍</div>
            )}

            {pipes.map(pipe => (
                <div key={pipe.id} className="pipe absolute top-0 h-full" style={{ transform: `translateX(${pipe.x}px)`, width: `${PIPE_WIDTH}px` }}>
                    <div className="pipe-piece top-pipe" style={{ height: pipe.gapY - PIPE_GAP / 2 }}></div>
                    <div className="pipe-piece bottom-pipe" style={{ height: window.innerHeight - (pipe.gapY + PIPE_GAP / 2) }}></div>
                </div>
            ))}
            
            <div className="ground"></div>

            {/* Game State Overlays */}
            {gameState === 'start' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white p-4">
                    <h2 className="text-8xl font-black" style={{ fontFamily: 'Figtree, sans-serif', textShadow: '0 0 10px white, 0 0 20px white, 0 0 30px #0ea5e9, 0 0 40px #0ea5e9, 0 0 50px #0ea5e9, 0 0 60px #0ea5e9, 0 0 70px #0ea5e9' }}>Flappy Geo</h2>
                    <p className="text-3xl mt-8 font-semibold animate-pulse" style={{ textShadow: '2px 2px 4px #000' }}>Click or Press Space to Start</p>
                </div>
            )}

            {gameState === 'gameOver' && currentQuestion && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in z-40" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-[90%] text-center">
                        <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="text-xl font-bold text-stone-800 text-left flex-grow">{currentQuestion.question}</h3>
                            <button 
                                onClick={fetchHintForQuestion} 
                                disabled={isHintLoading}
                                className="flex-shrink-0 p-2 rounded-full hover:bg-stone-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Get a hint"
                            >
                                <span className="text-xl">💡</span>
                            </button>
                        </div>
                        {isHintLoading && <p className="text-sm text-stone-500 mt-2 animate-pulse">Getting hint...</p>}
                        {hint && !isHintLoading && <p className="text-sm text-amber-800 bg-amber-100 p-3 rounded-lg mt-2 text-left animate-fade-in">{hint}</p>}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            {currentQuestion.options.map(option => {
                                const isSelected = selectedAnswer === option;
                                const isCorrect = isSelected && isAnswerCorrect;
                                const isIncorrect = isSelected && !isAnswerCorrect;
                                return (
                                    <button 
                                        key={option} 
                                        onClick={() => handleAnswer(option)}
                                        disabled={!!selectedAnswer}
                                        className={`p-4 rounded-lg font-semibold text-left transition-all duration-300 flex items-center gap-3
                                            ${isCorrect ? 'bg-emerald-500 text-white scale-105' : ''}
                                            ${isIncorrect ? 'bg-red-500 text-white' : ''}
                                            ${!isSelected ? 'bg-stone-100 hover:bg-stone-200 text-stone-700' : ''}
                                            ${!!selectedAnswer ? 'disabled:opacity-70' : ''}
                                        `}
                                    >
                                        {isCorrect && <span>✅</span>}
                                        {isIncorrect && <span>❌</span>}
                                        <span>{option}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedAnswer && (
                            <p className={`mt-4 text-lg font-bold ${isAnswerCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isAnswerCorrect ? 'Correct! Restarting...' : `Incorrect! The answer was ${currentQuestion.correctAnswer}`}
                            </p>
                        )}
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); onExit(); }}
                            className="mt-6 text-stone-500 hover:text-stone-800 font-semibold underline text-sm"
                        >
                            Return to Main Menu
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
                
                .pipe-piece {
                    position: absolute;
                    width: 100%;
                    background: linear-gradient(to right, #22c55e, #16a34a);
                    border: 4px solid #14532d;
                    border-radius: 8px;
                }
                .pipe-piece.top-pipe { top: 0; border-top: 0; border-radius: 0 0 8px 8px; }
                .pipe-piece.bottom-pipe { bottom: 0; border-bottom: 0; border-radius: 8px 8px 0 0; }
                
                .pipe-piece::after {
                    content: '';
                    position: absolute;
                    width: calc(100% + 16px);
                    left: -8px;
                    height: 30px;
                    background: linear-gradient(to right, #22c55e, #16a34a);
                    border: 4px solid #14532d;
                    border-radius: 8px;
                }
                .pipe-piece.top-pipe::after { bottom: -8px; }
                .pipe-piece.bottom-pipe::after { top: -8px; }
                
                .ground {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 200vw;
                    height: ${GROUND_HEIGHT}px;
                    background-image: linear-gradient(to top, #654321, #8B5A2B), 
                                      repeating-linear-gradient(45deg, transparent, transparent 10px, #9C6B3D 10px, #9C6B3D 20px),
                                      repeating-linear-gradient(-45deg, transparent, transparent 10px, #9C6B3D 10px, #9C6B3D 20px);

                    background-color: #8B5A2B;
                    border-top: 8px solid #3E2723;
                    animation: slide 5s linear infinite;
                    z-index: 20;
                }
                @keyframes slide {
                    from { transform: translateX(0); }
                    to { transform: translateX(-100vw); }
                }

                .cloud {
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                    opacity: 0.8;
                    filter: blur(2px);
                    animation: drift linear infinite;
                    z-index: 1;
                }
                .cloud::before, .cloud::after {
                    content: '';
                    position: absolute;
                    background: white;
                    border-radius: 50%;
                }
                .cloud-1 { width: 100px; height: 100px; top: 15%; animation-duration: 70s; }
                .cloud-1::before { width: 60px; height: 60px; top: -30px; left: 20px; }
                .cloud-1::after { width: 80px; height: 80px; top: -10px; right: -30px; }
                
                .cloud-2 { width: 60px; height: 60px; top: 30%; animation-duration: 50s; animation-delay: -15s; }
                .cloud-2::before { width: 30px; height: 30px; top: -15px; left: 10px; }
                .cloud-2::after { width: 40px; height: 40px; top: -5px; right: -15px; }

                .cloud-3 { width: 120px; height: 120px; top: 25%; animation-duration: 90s; animation-delay: -30s; }
                .cloud-3::before { width: 70px; height: 70px; top: -35px; left: 25px; }
                .cloud-3::after { width: 90px; height: 90px; top: -15px; right: -35px; }

                @keyframes drift {
                    from { transform: translateX(-200px); }
                    to { transform: translateX(calc(100vw + 200px)); }
                }
            `}</style>
        </div>
    );
};

export default GameModeView;
