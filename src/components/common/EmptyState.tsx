interface EmptyStateProps {
  message?: string;
  filtered?: boolean;
}

/**
 * EmptyState 组件
 * 展示"暂无数据"或"当前筛选条件下暂无数据"
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  filtered = false,
}) => {
  const text = message ?? (filtered ? '当前筛选条件下暂无数据' : '暂无数据');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        color: 'var(--text-secondary)',
        fontSize: 'var(--font-size-normal)',
        gap: 8,
      }}
      data-testid="empty-state"
    >
      <span style={{ fontSize: 32, opacity: 0.5 }}>📊</span>
      <span>{text}</span>
    </div>
  );
};

export default EmptyState;
