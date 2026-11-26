'use client';

import React from 'react';
import { Database, Box } from 'lucide-react';
import { useVisualizer } from '../VisualizerContext';

const MemoryPanel: React.FC = () => {
    const { state } = useVisualizer();

    return (
        <div className="space-y-4">
            {/* Heap Memory */}
            <section className="bg-[#252526] rounded-lg border border-[#333] overflow-hidden">
                <div className="h-8 bg-[#2d2d2d] flex items-center px-4 text-xs font-bold text-[#aaaaaa] border-b border-[#333] space-x-2">
                    <Database size={14} />
                    <span>HEAP MEMORY</span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(state.heap).map((obj) => (
                        <div key={obj.id} className="bg-[#1e1e1e] border border-[#444] rounded p-3 text-xs font-mono">
                            <div className="flex justify-between border-b border-[#333] pb-1 mb-2">
                                <span className="text-[#ce9178]">Object #{obj.id.split('_')[1]}</span>
                                <span className="text-[#888]">{obj.type}</span>
                            </div>
                            <div className="space-y-1">
                                {Object.entries(obj.properties).map(([key, val]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="text-[#9cdcfe]">{key}:</span>
                                        <span className={val.type === 'primitive' ? 'text-[#dcdcaa]' : 'text-[#ce9178]'}>
                                            {val.type === 'primitive'
                                                ? String(val.value)
                                                : `Object #${val.id.split('_')[1]}`}
                                        </span>
                                    </div>
                                ))}
                                {Object.keys(obj.properties).length === 0 && (
                                    <div className="text-[#555] italic">empty</div>
                                )}
                                <div className="mt-2 pt-1 border-t border-[#333] flex justify-between">
                                    <span className="text-[#888]">[[Prototype]]:</span>
                                    <span className="text-[#ce9178]">
                                        {obj.prototype ? `Object #${obj.prototype.split('_')[1]}` : 'null'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {Object.keys(state.heap).length === 0 && (
                        <div className="col-span-2 text-[#555] italic text-center py-4">Heap is empty</div>
                    )}
                </div>
            </section>

            {/* Stack Memory */}
            <section className="bg-[#252526] rounded-lg border border-[#333] overflow-hidden">
                <div className="h-8 bg-[#2d2d2d] flex items-center px-4 text-xs font-bold text-[#aaaaaa] border-b border-[#333] space-x-2">
                    <Box size={14} />
                    <span>STACK MEMORY</span>
                </div>
                <div className="p-4">
                    <table className="w-full text-xs font-mono">
                        <thead>
                            <tr className="text-[#888] border-b border-[#333]">
                                <th className="text-left pb-2">Name</th>
                                <th className="text-left pb-2">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.callStack.slice().reverse().flatMap(ctx =>
                                Object.entries(state.environments[ctx.lexicalEnvironment].bindings).map(([name, binding]) => (
                                    <tr key={`${ctx.id}-${name}`} className="border-b border-[#333] last:border-0">
                                        <td className="py-2 text-[#9cdcfe]">{name}</td>
                                        <td className={binding.value.type === 'primitive' ? 'text-[#dcdcaa]' : 'text-[#ce9178]'}>
                                            {binding.value.type === 'primitive'
                                                ? String(binding.value.value)
                                                : `Object #${binding.value.id.split('_')[1]}`}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {state.callStack.length === 0 && (
                        <div className="text-[#555] italic text-center py-4">Stack is empty</div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default MemoryPanel;
