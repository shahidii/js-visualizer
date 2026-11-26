'use client';

import React from 'react';
import { VisualizerProvider } from '../components/VisualizerContext';
import ControlBar from '../components/Visualizer/ControlBar';
import EditorPanel from '../components/Editor/EditorPanel';
import ConsolePanel from '../components/Visualizer/ConsolePanel';
import StatePanel from '../components/Visualizer/StatePanel';
import MemoryPanel from '../components/Visualizer/MemoryPanel';
import EventLoopPanel from '../components/Visualizer/EventLoopPanel';
import PrototypeChainInspector from '../components/Visualizer/PrototypeChainInspector';

export default function Home() {
  return (
    <VisualizerProvider>
      <main className="flex flex-col h-screen bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden font-sans">
        {/* Top Control Bar */}
        <ControlBar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Editor and Console */}
          <div className="flex flex-col w-1/2 border-r border-[#333]">
            <div className="flex-1 overflow-hidden">
              <EditorPanel />
            </div>
            <div className="h-1/3 border-t border-[#333] overflow-hidden">
              <ConsolePanel />
            </div>
          </div>

          {/* Right: State and Memory */}
          <div className="flex flex-col w-1/2 overflow-y-auto">
            <div className="p-4 space-y-4">
              <StatePanel />
              <MemoryPanel />
              <EventLoopPanel />
              <PrototypeChainInspector />
            </div>
          </div>
        </div>
      </main>
    </VisualizerProvider>
  );
}
