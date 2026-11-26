'use client';

import React from 'react';
import { Layers, Zap } from 'lucide-react';
import { useVisualizer } from '../VisualizerContext';

const StatePanel: React.FC = () => {
    const { state } = useVisualizer();

    return (
        <div className="space-y-4">
            {/* Call Stack */}
            <section className="bg-[#252526] rounded-lg border border-[#333] overflow-hidden">
                <div className="h-8 bg-[#2d2d2d] flex items-center px-4 text-xs font-bold text-[#aaaaaa] border-b border-[#333] space-x-2">
                    <Layers size={14} />
                    <span>CALL STACK</span>
                </div>
                <div className="p-2 space-y-1">
                    {state.callStack.slice().reverse().map((ctx, i) => (
                        <div
                            key={ctx.id}
                            className={`px-3 py-2 rounded text-sm flex justify-between items-center ${i === 0 ? 'bg-[#37373d] border border-[#007acc]' : 'bg-transparent'
                                }`}
                        >
                            <span className="font-semibold text-[#75beff]">
                                {ctx.functionName || (ctx.type === 'global' ? '(anonymous)' : 'anonymous')}
                            </span>
                            <span className="text-[10px] text-[#888] uppercase tracking-tighter">
                                {ctx.type}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Execution Context Internals */}
            <section className="bg-[#252526] rounded-lg border border-[#333] overflow-hidden">
                <div className="h-8 bg-[#2d2d2d] flex items-center px-4 text-xs font-bold text-[#aaaaaa] border-b border-[#333] space-x-2">
                    <Zap size={14} />
                    <span>EXECUTION CONTEXT</span>
                </div>
                <div className="p-4 space-y-4">
                    {state.callStack.length > 0 && (
                        <>
                            <div>
                                <div className="text-[10px] text-[#888] uppercase mb-1">Phase</div>
                                <div className="text-sm text-[#ce9178] font-mono">
                                    {state.callStack[state.callStack.length - 1].phase}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-[#888] uppercase mb-1">This Binding</div>
                                <div className="text-sm text-[#4ec9b0] font-mono">
                                    {JSON.stringify(state.callStack[state.callStack.length - 1].thisValue)}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-[#888] uppercase mb-1">Environment</div>
                                <div className="text-xs font-mono space-y-1 bg-[#1e1e1e] p-2 rounded">
                                    {Object.entries(state.environments[state.callStack[state.callStack.length - 1].lexicalEnvironment].bindings).map(([name, binding]) => (
                                        <div key={name} className="flex justify-between">
                                            <span className="text-[#9cdcfe]">{name}:</span>
                                            <span className={binding.value.type === 'primitive' ? 'text-[#dcdcaa]' : 'text-[#ce9178]'}>
                                                {binding.value.type === 'primitive'
                                                    ? String(binding.value.value)
                                                    : `Object #${binding.value.id.split('_')[1]}`}
                                            </span>
                                        </div>
                                    ))}
                                    {Object.keys(state.environments[state.callStack[state.callStack.length - 1].lexicalEnvironment].bindings).length === 0 && (
                                        <span className="text-[#555] italic">empty</span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default StatePanel;
