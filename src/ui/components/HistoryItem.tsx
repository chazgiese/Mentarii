import { useState, useRef, useEffect } from 'react';
import { Copy, RotateLeft, Heart, HeartFill, ChevronsLeftRightEllipsis } from 'stera-icons';
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
            <Copy size={16} />
          </TooltipButton>
          <TooltipButton tooltip="Re-apply text" onClick={handleReapply}>
            <RotateLeft size={16} />
          </TooltipButton>
          <TooltipButton tooltip={item.saved ? 'Unsave' : 'Save'} onClick={handleToggleSaved}>
            {item.saved ? <HeartFill size={16} /> : <Heart size={16} />}
          </TooltipButton>
          <div className="tooltip-btn-wrap" ref={moreRef}>
            <TooltipButton tooltip="More actions" onClick={handleMore} active={moreOpen}>
              <ChevronsLeftRightEllipsis size={16} />
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
