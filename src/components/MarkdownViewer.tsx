"use client";

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Comment {
  id: string;
  lineNumber?: number;
  content: string;
  author: { email: string };
  createdAt: string;
}

interface MarkdownViewerProps {
  content: string;
  comments: Comment[];
  onAddComment: (lineNumber: number, content: string) => void;
}

// Separate component to avoid re-renders
const BlockWrapper = ({ children, node, comments, onSelect }: any) => {
  const lineNumber = node?.position?.start?.line;
  if (!lineNumber) return <>{children}</>;

  const hasComments = comments.some((c: any) => c.lineNumber === lineNumber);

  return (
    <div className="relative group mb-4" id={`line-${lineNumber}`}>
      <div className={`transition-all duration-200 border-l-4 pl-4 ${hasComments ? "border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/20" : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"}`}>
        {children}
      </div>
      <button 
        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity p-1 bg-white dark:bg-gray-800 rounded shadow-sm border"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(lineNumber);
        }}
        title={`Add comment to line ${lineNumber}`}
      >
        💬
      </button>
    </div>
  );
};

export default function MarkdownViewer({ content, comments, onAddComment }: MarkdownViewerProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (selectedLine !== null && newComment.trim()) {
      onAddComment(selectedLine, newComment);
      setNewComment("");
      setSelectedLine(null);
    }
  };

  const components = useMemo(() => {
    const wrapper = (props: any) => <BlockWrapper {...props} comments={comments} onSelect={setSelectedLine} />;
    return {
      p: wrapper,
      h1: wrapper,
      h2: wrapper,
      h3: wrapper,
      h4: wrapper,
      h5: wrapper,
      h6: wrapper,
      blockquote: wrapper,
      pre: wrapper,
      ul: wrapper,
      ol: wrapper,
    };
  }, [comments]); // Re-create components only when comments change

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
      <div className="flex-1 bg-white dark:bg-gray-800 p-8 shadow rounded overflow-y-auto">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
      
      <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-900 border md:border-l p-4 flex flex-col rounded shadow h-full">
        <h3 className="font-bold mb-4 text-lg border-b pb-2">Comments</h3>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {comments.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No comments yet.</p>}
          {comments.map(c => (
            <div key={c.id} className="p-3 bg-white dark:bg-gray-800 border rounded shadow-sm text-sm hover:border-blue-300 transition-colors cursor-pointer" onClick={() => {
              document.getElementById(`line-${c.lineNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}>
              <div className="flex justify-between items-start mb-1 border-b pb-1">
                <span className="font-semibold text-xs text-blue-600 dark:text-blue-400">
                  {c.author.email.split('@')[0]}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  Line {c.lineNumber}
                </span>
              </div>
              <p className="text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">{c.content}</p>
              <div className="text-xs text-gray-400 mt-2 text-right">{new Date(c.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        {selectedLine && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-sm text-blue-800 dark:text-blue-200">New Comment (Line {selectedLine})</h4>
              <button onClick={() => setSelectedLine(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg leading-none">&times;</button>
            </div>
            <textarea 
              className="w-full p-2 border rounded text-sm mb-2 resize-none focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
              rows={3}
              placeholder="Type your comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
