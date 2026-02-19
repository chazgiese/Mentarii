import { useRef, useEffect } from 'react';
import { HistoryItem as HistoryItemType } from '../types';
import HistoryItem from './HistoryItem';

interface HistorySectionProps {
  historyItems: HistoryItemType[];
  onReapply: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleSaved: (id: string) => void;
  onCopyPrompt: (prompt: string) => void;
}

function HistorySection({
  historyItems,
  onReapply,
  onDelete,
  onToggleSaved,
  onCopyPrompt,
}: HistorySectionProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    const el = listRef.current?.closest('.content-area');
    if (!el) return;

    if (prevCountRef.current === null) {
      // Component just mounted (initial load or tab switch): jump to bottom
      el.scrollTop = el.scrollHeight;
    } else if (historyItems.length !== prevCountRef.current) {
      // Item count changed while mounted: smooth scroll to bottom
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
    prevCountRef.current = historyItems.length;
  }, [historyItems.length]);

  const chronological = [...historyItems].reverse();

  return (
    <div className="history-list" ref={listRef}>
      {chronological.map((item) => (
        <HistoryItem
          key={item.id}
          item={item}
          onReapply={onReapply}
          onDelete={onDelete}
          onToggleSaved={onToggleSaved}
          onCopyPrompt={onCopyPrompt}
        />
      ))}
    </div>
  );
}

export default HistorySection;
