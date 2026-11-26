'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { useVisualizer } from '../VisualizerContext';

const EditorPanel: React.FC = () => {
    const { code, setCode, state } = useVisualizer();
    const editorRef = React.useRef<any>(null);
    const decorationsRef = React.useRef<any>([]);

    React.useEffect(() => {
        if (editorRef.current && state.currentASTNode && state.currentASTNode.loc) {
            const loc = state.currentASTNode.loc;
            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
                {
                    range: {
                        startLineNumber: loc.start.line,
                        startColumn: loc.start.column + 1,
                        endLineNumber: loc.end.line,
                        endColumn: loc.end.column + 1
                    },
                    options: {
                        inlineClassName: 'bg-[#ffde5944] border-b-2 border-[#ffde59] rounded-sm',
                        hoverMessage: { value: 'Current Execution Node' }
                    }
                }
            ]);
        } else if (editorRef.current && !state.currentASTNode) {
            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
        }
    }, [state.currentASTNode]);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="h-8 bg-[#2d2d2d] flex items-center px-4 text-xs text-[#969696] border-b border-[#333]">
                index.js
            </div>
            <div className="flex-1">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onMount={handleEditorDidMount}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 10 },
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPanel;
