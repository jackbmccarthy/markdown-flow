"use client";

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageSquare, Clock, Send, X, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const BlockWrapper = ({ children, node, comments, onSelect, isSelected }: any) => {
  const lineNumber = node?.position?.start?.line;
  if (!lineNumber) return <>{children}</>;

  const hasComments = comments.some((c: any) => c.lineNumber === lineNumber);

  return (
    <div 
      className={cn(
        "relative group py-1 px-4 border-l-2 transition-all duration-200",
        hasComments ? "border-primary bg-primary/5" : "border-transparent hover:border-white/10 hover:bg-white/[0.02]",
        isSelected && "border-accent bg-accent/5 ring-1 ring-accent/20"
      )} 
      id={`line-${lineNumber}`}
    >
      {/* Line Number Gutter */}
      <div className="absolute left-[-48px] top-1/2 -translate-y-1/2 w-10 text-right text-[10px] font-mono text-muted-foreground/30 select-none opacity-0 group-hover:opacity-100 transition-opacity">
        {lineNumber}
      </div>

      <div className="prose prose-invert prose-sm max-w-none">
        {children}
      </div>

      <button 
        className="absolute right-4 top-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-secondary border border-border rounded-lg shadow-xl hover:text-primary hover:border-primary/50"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(lineNumber);
        }}
      >
        <MessageSquare className="w-3.5 h-3.5" />
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
    const wrapper = (props: any) => (
      <BlockWrapper 
        {...props} 
        comments={comments} 
        onSelect={setSelectedLine} 
        isSelected={selectedLine === props.node?.position?.start?.line}
      />
    );
    return {
      p: wrapper,
      h1: wrapper,
      h2: wrapper,
      h3: wrapper,
      h4: wrapper,
      h5: wrapper,
      h6: wrapper,
      blockquote: wrapper,
      pre: ({ children }: any) => (
        <pre className="bg-background border border-border rounded-lg p-4 my-4 font-mono text-xs overflow-x-auto glass">
          {children}
        </pre>
      ),
      ul: wrapper,
      ol: wrapper,
    };
  }, [comments, selectedLine]);

  return (
    <div className="flex h-full divide-x divide-border/50">
      {/* Document Pane */}
      <div className="flex-1 overflow-y-auto bg-background custom-scrollbar">
        <div className="max-w-4xl mx-auto py-12 px-12 lg:px-24">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
      
      {/* Comments Pane */}
      <div className="w-96 flex flex-col bg-secondary/20 glass">
        <div className="h-14 flex items-center justify-between px-6 border-b border-border/50 bg-background/30">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Feed</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white/5 px-2 py-0.5 rounded text-muted-foreground">
            {comments.length} TOTAL
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {comments.length === 0 && !selectedLine && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale">
              <MessageSquare className="w-12 h-12 mb-4" />
              <p className="text-xs font-medium max-w-[180px]">No annotations found. Hover over text to add feedback.</p>
            </div>
          )}

          {comments.map(c => (
            <div 
              key={c.id} 
              className="group relative animate-in fade-in slide-in-from-right-4 duration-300"
              onClick={() => {
                document.getElementById(`line-${c.lineNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary">{c.author.email[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate">{c.author.email.split('@')[0]}</span>
                    <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <Hash className="w-2.5 h-2.5" /> {c.lineNumber}
                    </span>
                  </div>
                  <div className="bg-background border border-border/50 rounded-xl p-3 shadow-sm group-hover:border-primary/30 transition-colors">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{c.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 opacity-40">
                    <Clock className="w-2.5 h-2.5" />
                    <span className="text-[10px] font-medium uppercase tracking-tight">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input Overlay */}
        {selectedLine && (
          <div className="p-6 bg-background border-t border-border/50 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-accent">{selectedLine}</span>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Annotation</h4>
              </div>
              <button 
                onClick={() => setSelectedLine(null)} 
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <textarea 
              className="w-full h-32 p-4 bg-secondary/50 border border-border rounded-xl text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-white placeholder:text-muted-foreground/50" 
              placeholder="Provide technical feedback or suggestions..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              autoFocus
            />
            
            <button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="w-full h-11 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-all active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Comment</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
