import { useState, useRef, useEffect } from 'react';
import { HistoryItem as HistoryItemType, CATEGORY_DISPLAY_NAMES } from '../types';

interface HistoryItemProps {
  item: HistoryItemType;
  onReapply: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSaved: (id: string) => void;
  onCopyPrompt: (prompt: string) => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isYesterday =
    date.getDate() === now.getDate() - 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${time}`;
}

function formatCategory(category: string): string {
  if (!category) return '';
  return CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES] || category;
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5.333" y="5.333" width="7.333" height="7.333" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M3.333 10.667V4a1.333 1.333 0 0 1 1.334-1.333h6.666" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function ReapplyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6.667h6a2.667 2.667 0 0 1 0 5.333H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.667 9.333 4 6.667 6.667 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function HeartOutlineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 13.533l-.593-.533C4.453 10.32 2.667 8.707 2.667 6.727c0-1.614 1.266-2.86 2.893-2.86.92 0 1.8.427 2.44 1.1.64-.673 1.52-1.1 2.44-1.1 1.627 0 2.893 1.246 2.893 2.86 0 1.98-1.786 3.593-4.74 6.28L8 13.533Z" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

function HeartFilledIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 13.533l-.593-.533C4.453 10.32 2.667 8.707 2.667 6.727c0-1.614 1.266-2.86 2.893-2.86.92 0 1.8.427 2.44 1.1.64-.673 1.52-1.1 2.44-1.1 1.627 0 2.893 1.246 2.893 2.86 0 1.98-1.786 3.593-4.74 6.28L8 13.533Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="4" r="1" fill="currentColor"/>
      <circle cx="8" cy="8" r="1" fill="currentColor"/>
      <circle cx="8" cy="12" r="1" fill="currentColor"/>
    </svg>
  );
}

interface TooltipButtonProps {
  tooltip: string;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

function TooltipButton({ tooltip, onClick, active, children, className = '' }: TooltipButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="tooltip-btn-wrap">
      <button
        className={`story-action-btn ${active ? 'active' : ''} ${className}`}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </button>
      {hovered && <div className="tooltip">{tooltip}</div>}
    </div>
  );
}

function HistoryItem({ item, onReapply, onDelete, onToggleSaved, onCopyPrompt }: HistoryItemProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyPrompt(item.prompt);
  };

  const handleReapply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReapply(item.id);
  };

  const handleToggleSaved = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSaved(item.id);
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMoreOpen(prev => !prev);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMoreOpen(false);
    onDelete(item.id);
  };

  const categoryStr = formatCategory(item.category);

  return (
    <div className="story-container">
      <div className="story-header">
        <span className="story-prompt">{item.prompt}</span>
      </div>
      <div className="story-actions">
        <div className="story-action-btns">
          <TooltipButton tooltip="Copy prompt" onClick={handleCopy}>
            <CopyIcon />
          </TooltipButton>
          <TooltipButton tooltip="Re-apply text" onClick={handleReapply}>
            <ReapplyIcon />
          </TooltipButton>
          <TooltipButton tooltip={item.saved ? 'Unsave' : 'Save'} onClick={handleToggleSaved}>
            {item.saved ? <HeartFilledIcon /> : <HeartOutlineIcon />}
          </TooltipButton>
          <div className="tooltip-btn-wrap" ref={moreRef}>
            <TooltipButton tooltip="More actions" onClick={handleMore} active={moreOpen}>
              <MoreIcon />
            </TooltipButton>
            {moreOpen && (
              <div className="more-dropdown">
                <div className="more-dropdown-timestamp">
                  {formatTimestamp(item.timestamp)}
                </div>
                <button className="more-dropdown-delete" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="story-meta">
          {item.response.length} items{categoryStr ? ` \u2022 ${categoryStr}` : ''}
        </div>
      </div>
    </div>
  );
}

export default HistoryItem;
