import { useRef, useState, useEffect, useCallback, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string, category: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  loading: boolean;
}

const CATEGORIES: Array<{ value: string; label: string; icon: string }> = [
  { value: 'addresses', label: 'Address', icon: 'map-pin' },
  { value: 'emails', label: 'Email', icon: 'at-sign' },
  { value: 'headlines', label: 'Headline', icon: 'text' },
  { value: 'prices', label: 'Price', icon: 'dollar' },
  { value: 'times', label: 'Time', icon: 'clock' },
  { value: 'us_phones', label: 'Phone number', icon: 'phone' },
];

function CategoryIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  const s = String(size);
  switch (icon) {
    case 'map-pin':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 8.667a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 14s4.667-3.067 4.667-7.333a4.667 4.667 0 0 0-9.334 0C3.333 10.933 8 14 8 14Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'at-sign':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.667 5.333v3.334a1.667 1.667 0 0 0 3.333 0 6 6 0 1 0-2.4 4.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 10.667a2.667 2.667 0 1 0 0-5.334 2.667 2.667 0 0 0 0 5.334Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'text':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.333 4h9.334M5.333 8h5.334M6.333 12h3.334" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'dollar':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2v12M11.333 5.333H6.333a2 2 0 0 0 0 4h3.334a2 2 0 0 1 0 4H4.667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'clock':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="5.333" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M8 5.333V8l2 1.333" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'phone':
      return (
        <svg width={s} height={s} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 11.28v1.747a1.165 1.165 0 0 1-1.27 1.165 11.528 11.528 0 0 1-5.027-1.788 11.363 11.363 0 0 1-3.5-3.5A11.528 11.528 0 0 1 2.415 3.87 1.165 1.165 0 0 1 3.573 2.6h1.747a1.165 1.165 0 0 1 1.165 1.002c.074.556.21 1.101.408 1.626a1.165 1.165 0 0 1-.262 1.23l-.74.74a9.325 9.325 0 0 0 3.5 3.5l.74-.74a1.165 1.165 0 0 1 1.23-.262c.525.197 1.07.334 1.627.408A1.165 1.165 0 0 1 14 11.28Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return null;
  }
}

function XCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="5.333" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M9.887 6.113 6.113 9.887M6.113 6.113l3.774 3.774" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChatInput({
  onSend,
  selectedCategory,
  onSelectCategory,
  loading,
}: ChatInputProps) {
  const inputRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const [hasContent, setHasContent] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categoryHovered, setCategoryHovered] = useState(false);

  const handleInput = () => {
    const content = inputRef.current?.textContent?.trim() || '';
    setHasContent(content.length > 0);
  };

  const handleSend = () => {
    const message = inputRef.current?.textContent?.trim() || '';
    if (!message || loading) return;
    onSend(message, selectedCategory);
    if (inputRef.current) {
      inputRef.current.textContent = '';
      setHasContent(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCategoryClick = useCallback(() => {
    if (selectedCategory) {
      onSelectCategory('');
      try { localStorage.setItem('mentarii-selected-category', ''); } catch {}
    } else {
      setIsCategoryOpen(prev => !prev);
    }
  }, [selectedCategory, onSelectCategory]);

  const handleSelectCategory = useCallback((value: string) => {
    onSelectCategory(value);
    setIsCategoryOpen(false);
    try { localStorage.setItem('mentarii-selected-category', value); } catch {}
  }, [onSelectCategory]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mentarii-selected-category');
      if (saved) onSelectCategory(saved);
    } catch {}
  }, [onSelectCategory]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        categoryBtnRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !categoryBtnRef.current.contains(e.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCategory = CATEGORIES.find(c => c.value === selectedCategory);

  return (
    <div className="chat-container">
      <div className="chatbox">
        <div
          ref={inputRef}
          className="chat-input"
          contentEditable
          data-placeholder="Et tu, Prompte?"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        <div className="chat-input-actions">
          {/* Category button / pill */}
          <button
            ref={categoryBtnRef}
            className={`category-btn ${selectedCategory ? 'active' : ''} ${isCategoryOpen ? 'menu-open' : ''}`}
            onClick={handleCategoryClick}
            onMouseEnter={() => setCategoryHovered(true)}
            onMouseLeave={() => setCategoryHovered(false)}
          >
            {selectedCategory && activeCategory ? (
              <>
                {categoryHovered ? <XCircleIcon /> : <CategoryIcon icon={activeCategory.icon} />}
                <span className="category-btn-label">{activeCategory.label}</span>
              </>
            ) : (
              <PlusIcon />
            )}
          </button>

          {/* Category popup */}
          {isCategoryOpen && (
            <div ref={popupRef} className="category-popup">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`category-popup-item ${cat.value === selectedCategory ? 'selected' : ''}`}
                  onClick={() => handleSelectCategory(cat.value)}
                >
                  <CategoryIcon icon={cat.icon} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Send button */}
          <button
            className={`send-btn ${loading ? 'loading' : ''}`}
            disabled={!hasContent || loading}
            onClick={handleSend}
            aria-label="Send"
          >
            {loading ? (
              <div className="send-spinner" />
            ) : (
              <ArrowUpIcon />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
