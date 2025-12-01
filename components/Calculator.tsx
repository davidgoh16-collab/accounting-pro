import React, { useState } from 'react';

interface CalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

type CalcButtonProps = React.PropsWithChildren<{
    onClick: () => void;
    className?: string;
}>;

const CalcButton = ({ onClick, children, className = '' }: CalcButtonProps) => (
    <button onClick={onClick} className={`bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xl rounded-lg transition-colors shadow-sm active:shadow-inner ${className}`}>
        {children}
    </button>
);

const Calculator: React.FC<CalculatorProps> = ({ isOpen, onClose }) => {
    const [displayValue, setDisplayValue] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

    if (!isOpen) return null;

    const handleDigit = (digit: string) => {
        if (waitingForSecondOperand) {
            setDisplayValue(digit);
            setWaitingForSecondOperand(false);
        } else {
            setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
        }
    };

    const handleDecimal = () => {
        if (!displayValue.includes('.')) {
            setDisplayValue(displayValue + '.');
        }
    };

    const handleClear = () => {
        setDisplayValue('0');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
    };
    
    const handleBackspace = () => {
        setDisplayValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    };

    const handleOperator = (nextOperator: string) => {
        const inputValue = parseFloat(displayValue);

        if (operator && !waitingForSecondOperand) {
            if (firstOperand === null) {
                setFirstOperand(inputValue);
            } else {
                 const result = performCalculation();
                 setDisplayValue(String(result));
                 setFirstOperand(result);
            }
        } else {
             setFirstOperand(inputValue);
        }
        
        setWaitingForSecondOperand(true);
        setOperator(nextOperator);
    };

    const performCalculation = (): number => {
        const inputValue = parseFloat(displayValue);
        if (firstOperand === null || operator === null) return inputValue;

        const calculations: { [key: string]: (a: number, b: number) => number } = {
            '/': (a, b) => a / b,
            '*': (a, b) => a * b,
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
        };
        
        return calculations[operator](firstOperand, inputValue);
    };

    const handleEquals = () => {
        if (operator === null) return;
        const result = performCalculation();
        setDisplayValue(String(result));
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-xs p-4 relative animate-fade-in">
                <button onClick={onClose} className="absolute top-2 right-2 text-stone-400 hover:text-stone-600">
                    <span className="text-2xl">❌</span>
                </button>
                <div className="bg-stone-800 text-white text-4xl font-mono text-right p-4 rounded-lg mb-4 overflow-x-auto custom-scrollbar">
                    {displayValue}
                </div>
                <div className="grid grid-cols-4 gap-3 h-64">
                    <CalcButton onClick={handleClear} className="col-span-2 bg-red-200 hover:bg-red-300 text-red-800">C</CalcButton>
                    <CalcButton onClick={handleBackspace}><span className="text-2xl">⌫</span></CalcButton>
                    <CalcButton onClick={() => handleOperator('/')} className="bg-green-200 hover:bg-green-300 text-green-800">/</CalcButton>
                    
                    <CalcButton onClick={() => handleDigit('7')}>7</CalcButton>
                    <CalcButton onClick={() => handleDigit('8')}>8</CalcButton>
                    <CalcButton onClick={() => handleDigit('9')}>9</CalcButton>
                    <CalcButton onClick={() => handleOperator('*')} className="bg-green-200 hover:bg-green-300 text-green-800">*</CalcButton>

                    <CalcButton onClick={() => handleDigit('4')}>4</CalcButton>
                    <CalcButton onClick={() => handleDigit('5')}>5</CalcButton>
                    <CalcButton onClick={() => handleDigit('6')}>6</CalcButton>
                    <CalcButton onClick={() => handleOperator('-')} className="bg-green-200 hover:bg-green-300 text-green-800">-</CalcButton>

                    <CalcButton onClick={() => handleDigit('1')}>1</CalcButton>
                    <CalcButton onClick={() => handleDigit('2')}>2</CalcButton>
                    <CalcButton onClick={() => handleDigit('3')}>3</CalcButton>
                    <CalcButton onClick={() => handleOperator('+')} className="bg-green-200 hover:bg-green-300 text-green-800">+</CalcButton>
                    
                    <CalcButton onClick={() => handleDigit('0')} className="col-span-2">0</CalcButton>
                    <CalcButton onClick={handleDecimal}>.</CalcButton>
                    <CalcButton onClick={handleEquals} className="bg-emerald-200 hover:bg-emerald-300 text-emerald-800">=</CalcButton>
                </div>
            </div>
             <style>{`.animate-fade-in { animation: fadeIn 0.2s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
};

export default Calculator;