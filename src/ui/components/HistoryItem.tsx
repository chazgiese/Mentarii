import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Copy, ArrowULeft, Heart, HeartFill, More } from 'stera-icons';
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

const TOOLTIP_OFFSET = 4;
const TOOLTIP_PADDING = 8;
const DROPDOWN_OFFSET = 4;
const DROPDOWN_ESTIMATE_HEIGHT = 80;

function TooltipButton({ tooltip, onClick, active, children, className = '' }: TooltipButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!hovered || !wrapRef.current) return;

    const updatePosition = () => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const tooltipHeight = 24;
      const viewportPadding = TOOLTIP_PADDING;

      let top: number;
      const preferBelow = rect.bottom + TOOLTIP_OFFSET + tooltipHeight <= window.innerHeight - viewportPadding;
      if (preferBelow) {
        top = rect.bottom + TOOLTIP_OFFSET;
      } else {
        top = rect.top - TOOLTIP_OFFSET - tooltipHeight;
      }

      let left = rect.left + rect.width / 2;
      const minLeft = viewportPadding;
      const maxLeft = window.innerWidth - viewportPadding;
      left = Math.min(maxLeft, Math.max(minLeft, left));

      setTooltipStyle({
        position: 'fixed',
        left,
        top,
        transform: 'translate(-50%, 0)',
      });
    };

    updatePosition();
    const contentArea = document.querySelector('.content-area');
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('resize', onScrollOrResize);
    contentArea?.addEventListener('scroll', onScrollOrResize);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      contentArea?.removeEventListener('scroll', onScrollOrResize);
    };
  }, [hovered]);

  return (
    <div className="tooltip-btn-wrap" ref={wrapRef}>
      <button
        className={`story-action-btn ${active ? 'active' : ''} ${className}`}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </button>
      {hovered &&
        createPortal(
          <div className="tooltip tooltip-portal" style={tooltipStyle}>
            {tooltip}
          </div>,
          document.body
        )}
    </div>
  );
}

interface MoreButtonProps {
  timestamp: number;
  onDelete: (e: React.MouseEvent) => void;
}

function MoreButton({ timestamp, onDelete }: MoreButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        wrapRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;

    const updatePosition = () => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const viewportPadding = TOOLTIP_PADDING;

      let top: number;
      const preferBelow =
        rect.bottom + DROPDOWN_OFFSET + DROPDOWN_ESTIMATE_HEIGHT <=
        window.innerHeight - viewportPadding;
      if (preferBelow) {
        top = Math.min(
          window.innerHeight - viewportPadding - DROPDOWN_ESTIMATE_HEIGHT,
          rect.bottom + DROPDOWN_OFFSET
        );
      } else {
        top = Math.max(
          viewportPadding,
          rect.top - DROPDOWN_OFFSET - DROPDOWN_ESTIMATE_HEIGHT
        );
      }

      let left = rect.left;
      const minLeft = viewportPadding;
      const maxLeft = window.innerWidth - viewportPadding;
      const dropdownWidth = 160;
      left = Math.min(maxLeft - dropdownWidth, Math.max(minLeft, left));

      setDropdownStyle({
        position: 'fixed',
        left,
        top,
      });
    };

    updatePosition();
    const contentArea = document.querySelector('.content-area');
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('resize', onScrollOrResize);
    contentArea?.addEventListener('scroll', onScrollOrResize);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      contentArea?.removeEventListener('scroll', onScrollOrResize);
    };
  }, [open]);

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(prev => !prev);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    onDelete(e);
  };

  return (
    <div className="tooltip-btn-wrap" ref={wrapRef}>
      <TooltipButton tooltip="More actions" onClick={handleMore} active={open}>
        <More size={16} />
      </TooltipButton>
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="more-dropdown more-dropdown-portal"
            style={dropdownStyle}
          >
            <div className="more-dropdown-timestamp">
              {formatTimestamp(timestamp)}
            </div>
            <button className="more-dropdown-delete" onClick={handleDelete}>
              Delete
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

function HistoryItem({ item, onReapply, onDelete, onToggleSaved, onCopyPrompt }: HistoryItemProps) {
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
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
          <TooltipButton tooltip="Copy" onClick={handleCopy}>
            <Copy size={16} />
          </TooltipButton>
          <TooltipButton tooltip="Re-apply text" onClick={handleReapply}>
            <ArrowULeft size={16} />
          </TooltipButton>
          <TooltipButton tooltip={item.saved ? 'Unsave' : 'Save'} onClick={handleToggleSaved}>
            {item.saved ? <HeartFill size={16} /> : <Heart size={16} />}
          </TooltipButton>
          <MoreButton timestamp={item.timestamp} onDelete={handleDelete} />
        </div>
        <div className="story-meta">
          {item.response.length} items{categoryStr ? ` \u2022 ${categoryStr}` : ''}
        </div>
      </div>
    </div>
  );
}

export default HistoryItem;
