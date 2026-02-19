interface EmptyStateProps {
  variant: 'no-api-key' | 'no-history' | 'no-saved';
  onAddApiKey?: () => void;
  onViewGuide?: () => void;
}

function CodeCircleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="20" fill="rgba(255,255,255,0.1)" />
      <path d="M16.5 15L12 20L16.5 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23.5 15L28 20L23.5 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 13L18 27" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ScrollTextIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="20" fill="rgba(255,255,255,0.1)" />
      <path d="M15 14H25C25.5523 14 26 14.4477 26 15V25C26 25.5523 25.5523 26 25 26H15C14.4477 26 14 25.5523 14 25V15C14 14.4477 14.4477 14 15 14Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 18H23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 21H23" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 24H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="20" fill="rgba(255,255,255,0.1)" />
      <path d="M20 27L19.18 26.26C15.4 22.84 13 20.68 13 18.04C13 15.88 14.72 14.16 16.88 14.16C18.1 14.16 19.26 14.72 20 15.6C20.74 14.72 21.9 14.16 23.12 14.16C25.28 14.16 27 15.88 27 18.04C27 20.68 24.6 22.84 20.82 26.26L20 27Z" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

const VARIANTS = {
  'no-api-key': {
    icon: CodeCircleIcon,
    heading: 'OpenAI API key required',
    body: 'Mentarii uses ChatGPT to generate realistic content for your designs.',
    showButtons: true,
  },
  'no-history': {
    icon: ScrollTextIcon,
    heading: 'Hello, Designer.',
    body: 'Select text elements and prompt your way to a more realistic feeling design.',
    showButtons: false,
  },
  'no-saved': {
    icon: HeartIcon,
    heading: 'No saved prompts',
    body: 'Save your favorite prompts from the Write tab to quickly access them here.',
    showButtons: false,
  },
};

function EmptyState({ variant, onAddApiKey, onViewGuide }: EmptyStateProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  return (
    <div className="empty-state">
      <Icon />
      <div className="empty-state-heading">{config.heading}</div>
      <div className="empty-state-body">{config.body}</div>
      {config.showButtons && (
        <div className="empty-state-actions">
          <button className="btn-brand" onClick={onAddApiKey}>
            Add API Key
          </button>
          <button
            className="btn-outline"
            onClick={onViewGuide}
          >
            View Guide
          </button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
