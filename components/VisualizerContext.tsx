'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { EngineState, EngineStep } from '../lib/engine/types';
import { Interpreter } from '../lib/engine/interpreter';
import { StateManager } from '../lib/engine/state-manager';

interface VisualizerContextType {
    state: EngineState;
    steps: EngineStep[];
    currentStepIndex: number;
    isRunning: boolean;
    code: string;
    setCode: (code: string) => void;
    run: () => void;
    stepForward: () => void;
    stepBackward: () => void;
    reset: () => void;
}

const VisualizerContext = createContext<VisualizerContextType | undefined>(undefined);

export const VisualizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [code, setCode] = useState("var a = 10;\nvar b = 20;\nconsole.log(a + b);");
    const [state, setState] = useState<EngineState>(new StateManager().getState());
    const [steps, setSteps] = useState<EngineStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isRunning, setIsRunning] = useState(false);

    const interpreterRef = useRef<Interpreter | null>(null);
    const generatorRef = useRef<Generator<EngineStep, void, any> | null>(null);
    const stateManagerRef = useRef<StateManager>(new StateManager());

    const reset = useCallback(() => {
        stateManagerRef.current = new StateManager();
        setState(stateManagerRef.current.getState());
        setSteps([]);
        setCurrentStepIndex(-1);
        setIsRunning(false);
        interpreterRef.current = null;
        generatorRef.current = null;
    }, []);

    const stepForward = useCallback(() => {
        if (!interpreterRef.current) {
            interpreterRef.current = new Interpreter();
            generatorRef.current = interpreterRef.current.execute(code);
        }

        if (generatorRef.current) {
            stateManagerRef.current.saveStep();
            const result = generatorRef.current.next();
            if (!result.done) {
                const step = result.value;
                setSteps(prev => [...prev, step]);
                setCurrentStepIndex(prev => prev + 1);
                setState(prev => ({ ...prev, ...step.stateChange, currentASTNode: step.astNode }));
            } else {
                setIsRunning(false);
            }
        }
    }, [code]);

    const stepBackward = useCallback(() => {
        if (currentStepIndex >= 0) {
            const prevState = stateManagerRef.current.rollback();
            if (prevState) {
                setState(prevState);
                setCurrentStepIndex(prev => prev - 1);
                setSteps(prev => prev.slice(0, -1));
            }
        }
    }, [currentStepIndex]);

    const run = useCallback(() => {
        setIsRunning(true);
        // Auto-stepping logic could go here
    }, []);

    return (
        <VisualizerContext.Provider value={{
            state,
            steps,
            currentStepIndex,
            isRunning,
            code,
            setCode,
            run,
            stepForward,
            stepBackward,
            reset
        }}>
            {children}
        </VisualizerContext.Provider>
    );
};

export const useVisualizer = () => {
    const context = useContext(VisualizerContext);
    if (!context) throw new Error('useVisualizer must be used within a VisualizerProvider');
    return context;
};
