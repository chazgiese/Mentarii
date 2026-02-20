import { useRef, useState, useEffect, useCallback, KeyboardEvent, type ComponentType } from 'react';
import {
  MapPin,
  AtSign,
  Text,
  CurrencyDollar,
  Clock,
  DevicePhone,
  XCircleFill,
  Plus,
  ArrowUp,
  CircleNotchFillDuotone,
} from 'stera-icons';

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

const CATEGORY_ICON_MAP: Record<string, ComponentType<{ size?: number }>> = {
  'map-pin': MapPin,
  'at-sign': AtSign,
  text: Text,
  dollar: CurrencyDollar,
  clock: Clock,
  phone: DevicePhone,
};

function CategoryIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  const IconComponent = CATEGORY_ICON_MAP[icon];
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
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
                {categoryHovered ? <XCircleFill size={16} /> : <CategoryIcon icon={activeCategory.icon} />}
                <span className="category-btn-label">{activeCategory.label}</span>
              </>
            ) : (
              <Plus size={16} />
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
              <CircleNotchFillDuotone size={16} className="send-spinner-icon" />
            ) : (
              <ArrowUp size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
