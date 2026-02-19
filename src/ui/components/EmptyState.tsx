import { Code, Document, Heart } from 'stera-icons';

interface EmptyStateProps {
  variant: 'no-api-key' | 'no-history' | 'no-saved';
  onAddApiKey?: () => void;
  onViewGuide?: () => void;
}

const VARIANTS = {
  'no-api-key': {
    icon: Code,
    heading: 'OpenAI API key required',
    body: 'Mentarii uses ChatGPT to generate realistic content for your designs.',
    showButtons: true,
  },
  'no-history': {
    icon: Document,
    heading: 'Hello, Designer.',
    body: 'Select text elements and prompt your way to a more realistic feeling design.',
    showButtons: false,
  },
  'no-saved': {
    icon: Heart,
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
      <Icon size={40} />
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
