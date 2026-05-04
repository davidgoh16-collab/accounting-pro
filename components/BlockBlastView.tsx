
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GAME_QUESTIONS } from '../game-database';
import { KEY_TERMS } from '../knowledge-database';
import { generateQuizQuestion } from '../services/geminiService';
import { MultipleChoiceQuestion, GameSessionResult, AuthUser, FlashcardItem } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

// --- Constants ---
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const PLACEMENTS_PER_QUIZ = 5;
const PIECE_TRAY_SIZE = 3;

const SHAPES = {
    I: { shape: [[1, 1, 1, 1]], color: 'cyan' },
    O: { shape: [[1, 1], [1, 1]], color: 'yellow' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'blue' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' },
};
const SHAPE_KEYS = Object.keys(SHAPES);

const COLORS: { [key: string]: string } = {
    cyan: 'bg-cyan-500',
    yellow: 'bg-yellow-400',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
};

// --- Types ---
type GridType = (string | null)[][];
type PieceType = { id: number; type: keyof typeof SHAPES; shape: number[][]; color: string; };
type GameStateType = 'playing' | 'quiz' | 'gameOver';

interface BlockBlastViewProps {
    topic: string;
    user: AuthUser;
    onExit: () => void;
}

const usePersistentState = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) { console.error(error); return initialValue; }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) { console.error(error); }
    };
    return [storedValue, setValue];
};

const createEmptyGrid = (): GridType => Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null));

const BlockBlastView: React.FC<BlockBlastViewProps> = ({ topic, user, onExit }) => {
    const [grid, setGrid] = useState<GridType>(createEmptyGrid);
    const [gameState, setGameState] = useState<GameStateType>('playing');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = usePersistentState('acc-pro-blast-highscore', 0);
    const [placements, setPlacements] = useState(0);
    const [pieceTray, setPieceTray] = useState<PieceType[]>([]);

    const [dragging, setDragging] = useState<{ piece: PieceType; index: number; clientX: number, clientY: number } | null>(null);
    const [ghost, setGhost] = useState<{ r: number; c: number; piece: PieceType; isValid: boolean } | null>(null);

    const gridRef = useRef<HTMLDivElement>(null);

    const [currentQuestion, setCurrentQuestion] = useState<MultipleChoiceQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
    
    // Question Tracking
    const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);

    // Dynamic Question Queue
    const [dynamicQuestions, setDynamicQuestions] = useState<MultipleChoiceQuestion[]>([]);
    const loadingQuestionRef = useRef(false);

    const questionsForTopic = useMemo(() => {
        const level = user.level || 'A-Level';
        let filtered = GAME_QUESTIONS.filter(q => q.levels.includes(level));
        
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
        // Initial fetch
        fetchDynamicQuestion();
    }, [topic, fetchDynamicQuestion]);

    // Keep buffer full
    useEffect(() => {
        if (dynamicQuestions.length < 2 && !loadingQuestionRef.current) {
            fetchDynamicQuestion();
        }
    }, [dynamicQuestions.length, fetchDynamicQuestion]);

    const generatePiece = useCallback((): PieceType => {
        const type = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)] as keyof typeof SHAPES;
        const pieceData = SHAPES[type];
        return { id: Date.now() + Math.random(), type, ...pieceData };
    }, []);

    const replenishTray = useCallback(() => {
        setPieceTray(prev => {
            const needed = PIECE_TRAY_SIZE - prev.length;
            if (needed <= 0) return prev;
            const newPieces = Array.from({ length: needed }, generatePiece);
            return [...prev, ...newPieces];
        });
    }, [generatePiece]);

    useEffect(() => {
        if(pieceTray.length === 0) {
            replenishTray();
        }
    }, [pieceTray.length, replenishTray]);

    const checkCollision = (piece: PieceType, r: number, c: number, currentGrid: GridType) => {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const newRow = r + row;
                    const newCol = c + col;
                    if (newRow >= GRID_HEIGHT || newCol < 0 || newCol >= GRID_WIDTH || currentGrid[newRow]?.[newCol]) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    
    const checkGameOver = useCallback((tray: PieceType[], currentGrid: GridType) => {
        if (tray.length === 0) return false;
        for (const piece of tray) {
            for (let r = 0; r <= GRID_HEIGHT - piece.shape.length; r++) {
                for (let c = 0; c <= GRID_WIDTH - piece.shape[0].length; c++) {
                    if (!checkCollision(piece, r, c, currentGrid)) {
                        return false; 
                    }
                }
            }
        }
        return true;
    }, []);


    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, piece: PieceType, index: number) => {
        if (gameState !== 'playing') return;
        // e.preventDefault(); // Allowing default here often helps with touch initialization
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setDragging({ piece, index, clientX, clientY });
    };

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!dragging || !gridRef.current) return;
        
        if(e.cancelable) e.preventDefault(); // Prevent page scrolling on touch devices
        
        const gridRect = gridRef.current.getBoundingClientRect();
        const isTouch = 'touches' in e;
        const clientX = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = isTouch ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
        
        // Mobile UX: Lift the piece above the finger so it's visible
        const TOUCH_OFFSET_Y = -120; 
        const visualYOffset = isTouch ? TOUCH_OFFSET_Y : 0;
        
        // Update position of dragging piece for visual feedback
        const draggedPieceEl = document.getElementById('dragged-piece');
        if (draggedPieceEl) {
            draggedPieceEl.style.transform = `translate(${clientX}px, ${clientY + visualYOffset}px) translate(-50%, -50%) scale(${isTouch ? 1.5 : 1.1})`;
        }

        // Important: Apply the same offset to the logic so the ghost piece matches the visual position
        const x = clientX - gridRect.left;
        const y = (clientY + visualYOffset) - gridRect.top;

        const cellWidth = gridRect.width / GRID_WIDTH;
        const cellHeight = gridRect.height / GRID_HEIGHT;
        
        // Use Math.round for centering logic
        let c = Math.round(x / cellWidth - dragging.piece.shape[0].length / 2);
        let r = Math.round(y / cellHeight - dragging.piece.shape.length / 2);
        
        // Bounds check
        const maxR = GRID_HEIGHT - dragging.piece.shape.length;
        const maxC = GRID_WIDTH - dragging.piece.shape[0].length;

        // We allow 'ghost' to be calculated even if slightly out of bounds to show it "clipping" or red
        // But for the actual ghost to render nicely, we constrain it to the grid.
        const clampedR = Math.max(0, Math.min(maxR, r));
        const clampedC = Math.max(0, Math.min(maxC, c));

        // Check if cursor is totally wildly out of bounds
        const isOutOfBounds = x < -cellWidth || x > gridRect.width + cellWidth || y < -cellHeight || y > gridRect.height + cellHeight;

        if (!isOutOfBounds) {
             const isColliding = checkCollision(dragging.piece, clampedR, clampedC, grid);
             setGhost({ r: clampedR, c: clampedC, piece: dragging.piece, isValid: !isColliding });
        } else {
            setGhost(null);
        }
       
    }, [dragging, grid]);


    const handleDragEnd = useCallback(() => {
        if (!dragging || !ghost) {
            setDragging(null);
            setGhost(null);
            return;
        }

        // If drop is invalid, cancel
        if (!ghost.isValid) {
            setDragging(null);
            setGhost(null);
            return;
        }

        const newGrid = grid.map(row => [...row]);
        ghost.piece.shape.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if (cell) {
                    newGrid[ghost.r + rIdx][ghost.c + cIdx] = ghost.piece.color;
                }
            });
        });

        // Clear lines
        let linesCleared = 0;
        let unclearedRows: GridType = [];
        const clearedCols: Set<number> = new Set();
        
        // Horizontal check
        for (let r = GRID_HEIGHT - 1; r >= 0; r--) {
            if (newGrid[r].every(cell => cell !== null)) {
                linesCleared++;
            } else {
                unclearedRows.unshift(newGrid[r]);
            }
        }
        
        // Vertical check
        for(let c = 0; c < GRID_WIDTH; c++) {
            let isColFull = true;
            for(let r = 0; r < unclearedRows.length; r++){
                 if(unclearedRows[r]?.[c] === null) {
                    isColFull = false;
                    break;
                 }
            }
            if(isColFull){
                linesCleared++;
                clearedCols.add(c);
            }
        }

        let finalGrid = unclearedRows;
        if(clearedCols.size > 0){
             finalGrid = unclearedRows.map(row => row.filter((_,c) => !clearedCols.has(c)));
             for (let i=0; i < clearedCols.size; i++) {
                 finalGrid.forEach(row => row.unshift(null));
             }
        }
        
        while (finalGrid.length < GRID_HEIGHT) {
            finalGrid.unshift(Array(GRID_WIDTH).fill(null));
        }
        
        const currentScore = score + 10 * dragging.piece.shape.flat().reduce((a, b) => a + b, 0) + Math.pow(linesCleared * 10, 2);
        setScore(currentScore);

        const updatedPlacements = placements + 1;
        setPlacements(updatedPlacements);

        let newTray = pieceTray.filter((_, i) => i !== dragging.index);
        
        // Replenish logic
        if (newTray.length < PIECE_TRAY_SIZE) {
            const needed = PIECE_TRAY_SIZE - newTray.length;
            const newPieces = Array.from({ length: needed }, generatePiece);
            newTray = [...newTray, ...newPieces];
        }
        
        setPieceTray(newTray);

        if (checkGameOver(newTray, finalGrid)) {
             setGameState('gameOver');
             if(currentScore > highScore) setHighScore(currentScore);
        } 

        if (updatedPlacements % PLACEMENTS_PER_QUIZ === 0 && !checkGameOver(newTray, finalGrid)) {
            setGameState('quiz');
            
            // Prioritize dynamic questions
            if (dynamicQuestions.length > 0) {
                const nextQuestion = dynamicQuestions[0];
                setDynamicQuestions(prev => prev.slice(1)); // Remove used question
                setCurrentQuestion(nextQuestion);
                // Trigger fetch for next one
                fetchDynamicQuestion();
            } else {
                // Fallback to static
                const unusedQuestions = questionsForTopic.filter(q => !usedQuestionIds.includes(q.id));
                let pool = unusedQuestions;
                let isReset = false;

                if (pool.length === 0) {
                    pool = questionsForTopic; // Reset pool
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
                         question: 'What does EBITDA stand for?',
                         options: ['Earnings Before Interest, Taxes, Depreciation, and Amortization', 'Every Business Is Doing Total Accounting', 'Earnings Beyond Internal Total Assets', 'Exempt Business Interest Toward Debt Account'],
                         correctAnswer: 'Earnings Before Interest, Taxes, Depreciation, and Amortization',
                         topic: 'General',
                         levels: ['GCSE', 'A-Level']
                    });
                }
            }
        }

        setGrid(finalGrid);
        setDragging(null);
        setGhost(null);
    }, [dragging, ghost, grid, placements, pieceTray, checkGameOver, score, highScore, setHighScore, generatePiece, questionsForTopic, usedQuestionIds]);


    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleDragMove, { passive: false });
            window.addEventListener('touchmove', handleDragMove, { passive: false });
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [dragging, handleDragMove, handleDragEnd]);

    const handleAnswer = async (answer: string) => {
        if (selectedAnswer || !currentQuestion || !user) return;
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

        setTimeout(() => {
            setGameState('playing');
            setSelectedAnswer(null);
            setIsAnswerCorrect(null);
            setCurrentQuestion(null);
        }, 2000);
    };

    const restartGame = () => {
        const newGrid = createEmptyGrid();
        setGrid(newGrid);
        setScore(0);
        setPlacements(0);
        setUsedQuestionIds([]);
        
        const newTray = Array.from({ length: PIECE_TRAY_SIZE }, generatePiece);
        setPieceTray(newTray);

        if (checkGameOver(newTray, newGrid)) {
            setGameState('gameOver');
        } else {
            setGameState('playing');
        }
    }

    const PieceDisplay: React.FC<{ piece: PieceType, isDragging?: boolean }> = ({ piece, isDragging }) => (
        <div className={`p-2 ${isDragging ? 'opacity-30' : ''}`} style={{ touchAction: 'none' }}>
            <div className="flex flex-col items-center">
                {piece.shape.map((row, rIdx) => (
                    <div key={rIdx} className="flex">
                        {row.map((cell, cIdx) => (
                            <div key={cIdx} className={`w-5 h-5 border border-white/20 ${cell ? COLORS[piece.color] : 'opacity-0'}`} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-stone-800 z-50 flex flex-col items-center justify-center p-4 font-sans select-none">
            <button 
                onClick={onExit} 
                className="absolute top-4 left-4 bg-black/30 text-white font-bold py-2 px-4 rounded-lg hover:bg-black/50 transition flex items-center gap-2"
            >
                <span>⬅️</span> Menu
            </button>

            <div className="absolute top-4 right-4 flex gap-4 text-white text-lg font-bold">
                <div className="bg-black/30 px-4 py-2 rounded-lg">SCORE: {score}</div>
                <div className="bg-black/30 px-4 py-2 rounded-lg">HIGH SCORE: {highScore}</div>
            </div>

            <div className="flex-grow flex items-center justify-center w-full">
                <div 
                    ref={gridRef} 
                    className="grid border-4 border-stone-600 bg-stone-900" 
                    style={{ 
                        gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
                        gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
                        width: 'min(40vh, 300px)',
                        height: 'min(80vh, 600px)',
                    }}
                >
                    {grid.map((row, r) => row.map((cell, c) => {
                         // Show ghost logic: Only if dragging, and only if this cell is part of the ghost piece
                         const isGhostCell = ghost && ghost.piece.shape[r - ghost.r]?.[c - ghost.c];
                         
                         // Ghost styling: 
                         // - If valid: color with opacity
                         // - If invalid: red with opacity
                         let ghostClass = '';
                         if (isGhostCell) {
                             if (ghost.isValid) {
                                 ghostClass = `${COLORS[ghost.piece.color]} opacity-50`;
                             } else {
                                 ghostClass = `bg-red-600 opacity-60`;
                             }
                         }

                         return (
                            <div key={`${r}-${c}`} className={`border-stone-700/50 border-[0.5px] ${cell ? COLORS[cell] : ''} ${ghostClass}`} />
                         )
                    }))}
                </div>
            </div>

            <div className="h-32 w-full flex items-center justify-around bg-black/30 mt-4 rounded-xl px-2">
                 {pieceTray.map((piece, i) => (
                    <div key={piece.id} onMouseDown={(e) => handleDragStart(e, piece, i)} onTouchStart={(e) => handleDragStart(e, piece, i)} className="cursor-grab active:cursor-grabbing p-2">
                        <PieceDisplay piece={piece} isDragging={dragging?.index === i} />
                    </div>
                ))}
            </div>

            {dragging && (
                 <div
                    id="dragged-piece"
                    className="absolute top-0 left-0 pointer-events-none z-50 drop-shadow-2xl"
                    style={{
                        transform: `translate(${dragging.clientX}px, ${dragging.clientY}px) translate(-50%, -50%)`,
                        touchAction: 'none',
                    }}
                >
                    <PieceDisplay piece={dragging.piece} />
                </div>
            )}
            
            {(gameState === 'quiz' || gameState === 'gameOver') && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in z-40">
                    {gameState === 'quiz' && currentQuestion && (
                         <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-[90%] text-center">
                            <h3 className="text-xl font-bold text-stone-800">{currentQuestion.question}</h3>
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
                         </div>
                    )}
                    {gameState === 'gameOver' && (
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-[90%] text-center">
                            <h2 className="text-4xl font-bold text-red-500">Game Over</h2>
                            <p className="text-xl text-stone-700 mt-2">Your final score is:</p>
                            <p className="text-6xl font-bold text-stone-800 my-4">{score}</p>
                            <div className="flex gap-4 justify-center w-full">
                                <button onClick={onExit} className="flex-1 py-3 bg-stone-200 text-stone-800 font-bold text-lg rounded-lg hover:bg-stone-300 transition">
                                    Menu
                                </button>
                                <button onClick={restartGame} className="flex-1 py-3 bg-blue-500 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-blue-600 transition">
                                    Play Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
             <style>{`.animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

export default BlockBlastView;
