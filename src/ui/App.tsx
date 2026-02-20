import { useState, useCallback, useEffect } from 'react';
import { usePluginMessages } from './hooks/usePluginMessages';
import type { HistoryItem, Toast, UIMessage } from './types';
import ChatInput from './components/ChatInput';
import HistorySection from './components/HistorySection';
import EmptyState from './components/EmptyState';
import SettingsSection from './components/SettingsSection';
import ToastContainer from './components/Toast';
import LoadingIndicator from './components/LoadingIndicator';

type Tab = 'write' | 'saved' | 'settings';

function fallbackCopyToClipboard(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const [selectedTextCount, setSelectedTextCount] = useState(0);
  const [currentApiKey, setCurrentApiKey] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handlePluginMessage = useCallback(
    (msg: UIMessage) => {
      switch (msg.type) {
        case 'selection-update':
          setSelectedTextCount(msg.count);
          break;
        case 'api-key-loaded':
          setCurrentApiKey(msg.apiKey || '');
          break;
        case 'show-toast':
          addToast(msg.message, msg.toastType);
          break;
        case 'chat-complete':
          setLoading(false);
          break;
        case 'history-loaded':
          setHistoryItems(msg.history || []);
          break;
        default:
          console.warn('Unknown message type:', msg.type);
      }
    },
    [addToast]
  );

  const { sendMessage } = usePluginMessages(handlePluginMessage);

  useEffect(() => {
    sendMessage('get-api-key');
    sendMessage('get-history');
    sendMessage('get-selection-count');
  }, [sendMessage]);

  const isApiKeyValid = currentApiKey.startsWith('sk-') && currentApiKey.length > 20;

  const handleSendChat = useCallback(
    (message: string, category: string) => {
      if (!message.trim()) return;
      if (!isApiKeyValid) {
        addToast('Missing valid API key', 'critical');
        return;
      }
      if (selectedTextCount < 1) {
        addToast('First, select text elements', 'error');
        return;
      }
      setLoading(true);
      sendMessage('send-chat-message', { message, category });
    },
    [isApiKeyValid, selectedTextCount, sendMessage, addToast]
  );

  const handleReapplyHistory = useCallback(
    (historyId: string) => {
      if (!isApiKeyValid) {
        addToast('Missing valid API key', 'critical');
        return;
      }
      if (selectedTextCount < 1) {
        addToast('First, select text elements', 'error');
        return;
      }
      setLoading(true);
      sendMessage('reapply-history', { historyId });
    },
    [isApiKeyValid, selectedTextCount, sendMessage, addToast]
  );

  const handleDeleteHistory = useCallback(
    (historyId: string) => sendMessage('delete-history-item', { historyId }),
    [sendMessage]
  );

  const handleToggleHistorySaved = useCallback(
    (historyId: string) => sendMessage('toggle-history-saved', { historyId }),
    [sendMessage]
  );

  const handleClearHistory = useCallback(
    () => sendMessage('clear-history'),
    [sendMessage]
  );

  const handleClearSaved = useCallback(
    () => sendMessage('clear-saved'),
    [sendMessage]
  );

  const handleDeleteAll = useCallback(
    () => sendMessage('delete-all'),
    [sendMessage]
  );

  const handleSaveApiKey = useCallback(
    (apiKey: string) => {
      sendMessage('save-api-key', { apiKey });
      setCurrentApiKey(apiKey);
    },
    [sendMessage]
  );

  const handleCopyPrompt = useCallback(
    (prompt: string) => {
      const onFailure = () => addToast('Failed to copy', 'error');

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(prompt).then(() => {}, () => {
          if (!fallbackCopyToClipboard(prompt)) onFailure();
        });
        return;
      }
      if (!fallbackCopyToClipboard(prompt)) {
        onFailure();
      }
    },
    [addToast]
  );

  const savedItems = historyItems.filter(item => item.saved);

  const renderContent = () => {
    switch (activeTab) {
      case 'write': {
        if (!isApiKeyValid) {
          return (
            <EmptyState
              variant="no-api-key"
              onAddApiKey={() => setActiveTab('settings')}
              onViewGuide={() => window.open('https://chatgpt.com/canvas/shared/687ead3443688191840cc7e8bb6087c5', '_blank')}
            />
          );
        }
        if (historyItems.length === 0) {
          return <EmptyState variant="no-history" />;
        }
        return (
          <HistorySection
            historyItems={historyItems}
            onReapply={handleReapplyHistory}
            onDelete={handleDeleteHistory}
            onToggleSaved={handleToggleHistorySaved}
            onCopyPrompt={handleCopyPrompt}
          />
        );
      }
      case 'saved': {
        if (savedItems.length === 0) {
          return <EmptyState variant="no-saved" />;
        }
        return (
          <HistorySection
            historyItems={savedItems}
            onReapply={handleReapplyHistory}
            onDelete={handleDeleteHistory}
            onToggleSaved={handleToggleHistorySaved}
            onCopyPrompt={handleCopyPrompt}
          />
        );
      }
      case 'settings':
        return (
          <SettingsSection
            currentApiKey={currentApiKey}
            onSaveApiKey={handleSaveApiKey}
            onClearSaved={handleClearSaved}
            onClearHistory={handleClearHistory}
            onDeleteAll={handleDeleteAll}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <LoadingIndicator loading={loading} />

      {/* Tab bar */}
      <div className="tab-bar">
        <button
          className={`tab ${activeTab === 'write' ? 'active' : ''}`}
          onClick={() => setActiveTab('write')}
        >
          Write
        </button>
        <button
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Content area */}
      <div className="content-area">
        {renderContent()}
      </div>

      {/* Chat container - only on Write and Saved tabs */}
      {activeTab !== 'settings' && (
        <ChatInput
          onSend={handleSendChat}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          loading={loading}
        />
      )}

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default App;
