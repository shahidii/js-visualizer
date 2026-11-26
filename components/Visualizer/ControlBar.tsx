'use client';

import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { useVisualizer } from '../VisualizerContext';

const ControlBar: React.FC = () => {
    const { run, stepForward, stepBackward, reset, isRunning, currentStepIndex, steps } = useVisualizer();

    return (
        <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center px-4 space-x-4">
            <div className="flex items-center space-x-2 border-r border-[#444] pr-4">
                <button
                    onClick={run}
                    className="p-1.5 rounded hover:bg-[#37373d] text-[#75beff]"
                    title="Run"
                >
                    {isRunning ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                    onClick={stepBackward}
                    className="p-1.5 rounded hover:bg-[#37373d] text-[#cccccc] disabled:opacity-30"
                    title="Step Back"
                    disabled={currentStepIndex < 0}
                >
                    <SkipBack size={18} />
                </button>
                <button
                    onClick={stepForward}
                    className="p-1.5 rounded hover:bg-[#37373d] text-[#cccccc]"
                    title="Step Forward"
                >
                    <SkipForward size={18} />
                </button>
                <button
                    onClick={reset}
                    className="p-1.5 rounded hover:bg-[#37373d] text-[#cccccc]"
                    title="Reset"
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            <div className="text-xs text-[#888]">
                {currentStepIndex >= 0 ? `Step ${currentStepIndex + 1} of ${steps.length}` : 'Ready'}
            </div>

            <div className="flex-1" />

            <h1 className="text-sm font-semibold text-[#888] tracking-wider uppercase">
                JS Engine Visualizer
            </h1>
        </div>
    );
};

export default ControlBar;
