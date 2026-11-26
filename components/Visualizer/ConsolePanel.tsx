'use client';

import React from 'react';
import { Terminal } from 'lucide-react';
import { useVisualizer } from '../VisualizerContext';

const ConsolePanel: React.FC = () => {
    const { state } = useVisualizer();

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e]">
            <div className="h-8 bg-[#2d2d2d] flex items-center px-4 text-xs text-[#969696] border-b border-[#333] space-x-2">
                <Terminal size={14} />
                <span>Output</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
                {state.console.map((log, i) => (
                    <div key={i} className="flex space-x-2">
                        <span className="text-[#6a9955]">{'>'}</span>
                        <span className={log.type === 'error' ? 'text-[#f44747]' : 'text-[#d4d4d4]'}>
                            {log.content.map((arg: any, idx: number) => {
                                if (typeof arg === 'object' && arg !== null && 'type' in arg) {
                                    return arg.type === 'primitive'
                                        ? String(arg.value)
                                        : `Object #${arg.id.split('_')[1]}`;
                                }
                                return String(arg);
                            }).join(' ')}
                        </span>
                    </div>
                ))}
                {state.console.length === 0 && (
                    <div className="text-[#555] italic">No output yet...</div>
                )}
            </div>
        </div>
    );
};

export default ConsolePanel;
