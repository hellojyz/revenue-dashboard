interface LoadingStateProps {
  rows?: number;
}

/**
 * LoadingState 组件
 * 展示加载骨架屏
 */
const LoadingState: React.FC<LoadingStateProps> = ({ rows = 4 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        minHeight: 200,
      }}
      data-testid="loading-state"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: i === 0 ? 24 : 16,
            width: i === 0 ? '60%' : `${80 - i * 10}%`,
            background: 'var(--bg-tertiary)',
            borderRadius: 4,
            animation: 'pulse 1.5s ease-in-out infinite',
            opacity: 0.6,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
