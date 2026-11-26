'use client';

import React from 'react';
import { RefreshCcw, Activity } from 'lucide-react';
import { useVisualizer } from '../VisualizerContext';
import { motion, AnimatePresence } from 'framer-motion';

const EventLoopPanel: React.FC = () => {
    const { state } = useVisualizer();

    return (
        <section className="bg-[#252526] rounded-lg border border-[#333] overflow-hidden">
            <div className="h-8 bg-[#2d2d2d] flex items-center px-4 text-xs font-bold text-[#aaaaaa] border-b border-[#333] space-x-2">
                <RefreshCcw size={14} />
                <span>EVENT LOOP SYSTEM</span>
            </div>
            <div className="p-4 flex flex-col space-y-4">
                {/* Microtask Queue */}
                <div className="space-y-2">
                    <div className="text-[10px] text-[#888] uppercase flex items-center space-x-2">
                        <Activity size={10} className="text-[#4ec9b0]" />
                        <span>Microtask Queue</span>
                    </div>
                    <div className="bg-[#1e1e1e] border border-[#333] rounded p-2 min-h-[40px] flex gap-2 overflow-x-auto">
                        <AnimatePresence>
                            {state.microtaskQueue.map((task, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="bg-[#007acc] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap"
                                >
                                    Promise Callback
                                </motion.div>
                            ))}
                            {state.microtaskQueue.length === 0 && (
                                <span className="text-[#444] text-[10px] italic">empty</span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Macrotask Queue */}
                <div className="space-y-2">
                    <div className="text-[10px] text-[#888] uppercase flex items-center space-x-2">
                        <Activity size={10} className="text-[#ce9178]" />
                        <span>Macrotask Queue (Callback Queue)</span>
                    </div>
                    <div className="bg-[#1e1e1e] border border-[#333] rounded p-2 min-h-[40px] flex gap-2 overflow-x-auto">
                        <AnimatePresence>
                            {state.macrotaskQueue.map((task, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="bg-[#d16d9e] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap"
                                >
                                    setTimeout
                                </motion.div>
                            ))}
                            {state.macrotaskQueue.length === 0 && (
                                <span className="text-[#444] text-[10px] italic">empty</span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EventLoopPanel;
