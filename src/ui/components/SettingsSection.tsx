import { useState, useEffect, useRef } from 'react';

interface SettingsSectionProps {
  currentApiKey: string;
  onSaveApiKey: (apiKey: string) => void;
  onClearSaved: () => void;
  onClearHistory: () => void;
  onDeleteAll: () => void;
}

function SettingsSection({
  currentApiKey,
  onSaveApiKey,
  onClearSaved,
  onClearHistory,
  onDeleteAll,
}: SettingsSectionProps) {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const saveTimeoutRef = useRef<number>();

  useEffect(() => {
    setApiKey(currentApiKey);
  }, [currentApiKey]);

  const isApiKeyValid = (key: string) => key.startsWith('sk-') && key.length > 20;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    setApiKey(key);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      if (key === '' || isApiKeyValid(key)) {
        onSaveApiKey(key);
      }
    }, 500);
  };

  const validationStatus = !apiKey ? '' : isApiKeyValid(apiKey) ? 'valid' : 'invalid';

  return (
    <div className="settings-section">
      <div className="settings-group">
        <label className="settings-label">OpenAI API Key</label>
        <div className="settings-input-wrap">
          <input
            type="password"
            className="settings-input"
            placeholder="sk-..."
            value={apiKey}
            onChange={handleInputChange}
            autoComplete="off"
          />
          {validationStatus && (
            <span className={`settings-input-status ${validationStatus}`}>
              {validationStatus === 'valid' ? '✓' : '✗'}
            </span>
          )}
        </div>
        <div className="settings-helper">
          Keys are stored securely on your local device.{' '}
          <a
            href="https://chatgpt.com/canvas/shared/687ead3443688191840cc7e8bb6087c5"
            target="_blank"
            rel="noopener noreferrer"
          >
            API key guide
          </a>
        </div>
      </div>

      <div className="settings-divider" />

      <div className="settings-row">
        <div className="settings-row-text">
          <div className="settings-label">Saved</div>
          <div className="settings-description">
            Clearing saved prompts won't delete them from history
          </div>
        </div>
        <button className="btn-outline btn-sm" onClick={onClearSaved}>
          Clear
        </button>
      </div>

      <div className="settings-divider" />

      <div className="settings-row">
        <div className="settings-row-text">
          <div className="settings-label">History</div>
          <div className="settings-description">
            Saved prompts will be preserved when clearing history
          </div>
        </div>
        <button className="btn-outline btn-sm" onClick={onClearHistory}>
          Clear
        </button>
      </div>

      <div className="settings-divider" />

      <div className="settings-row">
        <div className="settings-row-text">
          <div className="settings-label">Danger</div>
          <div className="settings-description">
            Permanently delete all history and saved prompts
          </div>
        </div>
        <button className="btn-danger btn-sm" onClick={onDeleteAll}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default SettingsSection;
