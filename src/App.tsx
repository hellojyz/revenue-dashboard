import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tabs } from 'antd';
import DashboardPage from './components/DashboardPage';
import HeatmapDashboardPage from './components/HeatmapDashboard/HeatmapDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const tabItems = [
  {
    key: 'revenue',
    label: '可确认收入&利润预测看板',
    children: <DashboardPage />,
  },
  {
    key: 'heatmap',
    label: 'APP核心指标热力图',
    children: <HeatmapDashboardPage />,
  },
];

function App() {
  const [activeKey, setActiveKey] = useState('revenue');

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={tabItems}
        type="card"
        style={{ padding: '0 16px' }}
        tabBarStyle={{
          marginBottom: 0,
          paddingTop: 8,
          background: '#141414',
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
