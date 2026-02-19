interface LoadingIndicatorProps {
  loading: boolean;
}

function LoadingIndicator({ loading }: LoadingIndicatorProps) {
  return (
    <div className={`loading-indicator ${loading ? 'active' : ''}`}>
      <div className="loading-indicator-bar"></div>
    </div>
  );
}

export default LoadingIndicator;
