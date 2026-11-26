'use client';

import React, { useState } from 'react';
import { GitBranch, ChevronRight } from 'lucide-react';
import { useVisualizer } from '../VisualizerContext';

const PrototypeChainInspector: React.FC = () => {
    const { state } = useVisualizer();
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

    const getChain = (id: string) => {
        const chain = [];
        let currentId: string | null = id;
        while (currentId && state.heap[currentId]) {
            chain.push(state.heap[currentId]);
            currentId = state.heap[currentId].prototype;
        }
        return chain;
    };

    return (
        <section className="bg-[#252526] rounded-lg border border-[#333] overflow-hidden">
            <div className="h-8 bg-[#2d2d2d] flex items-center px-4 text-xs font-bold text-[#aaaaaa] border-b border-[#333] space-x-2">
                <GitBranch size={14} />
                <span>PROTOTYPE CHAIN INSPECTOR</span>
            </div>
            <div className="p-4 space-y-4">
                <div className="flex items-center space-x-2">
                    <select
                        className="bg-[#1e1e1e] border border-[#333] text-xs px-2 py-1 rounded w-full outline-none focus:border-[#007acc]"
                        onChange={(e) => setSelectedObjectId(e.target.value)}
                        value={selectedObjectId || ''}
                    >
                        <option value="">Select an object to inspect...</option>
                        {Object.keys(state.heap).map(id => (
                            <option key={id} value={id}>Object #{id.split('_')[1]} ({state.heap[id].name || state.heap[id].type})</option>
                        ))}
                    </select>
                </div>

                {selectedObjectId && (
                    <div className="space-y-4">
                        {getChain(selectedObjectId).map((obj, i) => (
                            <div key={obj.id} className="relative pl-6">
                                {i > 0 && (
                                    <div className="absolute left-2 top-[-20px] bottom-[50%] border-l border-b border-[#444] w-4" />
                                )}
                                <div className="bg-[#1e1e1e] border border-[#444] rounded p-2 text-xs font-mono">
                                    <div className="font-bold text-[#ce9178] mb-1">
                                        {obj.name || `Object #${obj.id.split('_')[1]}`}
                                    </div>
                                    <div className="text-[10px] text-[#888]">
                                        {Object.keys(obj.properties).length} properties
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="relative pl-6">
                            <div className="absolute left-2 top-[-20px] bottom-[50%] border-l border-b border-[#444] w-4" />
                            <div className="text-[10px] text-[#888] font-mono p-2">null</div>
                        </div>
                    </div>
                )}

                {!selectedObjectId && (
                    <div className="text-[#555] italic text-xs text-center py-4">
                        Select an object to visualize its prototype chain
                    </div>
                )}
            </div>
        </section>
    );
};

export default PrototypeChainInspector;
