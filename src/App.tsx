import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Tabs } from 'antd';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import LangSwitch from './components/common/LangSwitch';
import DashboardPage from './components/DashboardPage';
import HeatmapDashboardPage from './components/HeatmapDashboard/HeatmapDashboardPage';
import SimpleDashboardPage from './components/SimpleDashboard/SimpleDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInner() {
  const [activeKey, setActiveKey] = useState('revenue');
  const { t } = useI18n();

  const tabItems = [
    {
      key: 'revenue',
      label: t.tabRevenue,
      children: <DashboardPage />,
    },
    {
      key: 'heatmap',
      label: t.tabHeatmap,
      children: <HeatmapDashboardPage />,
    },
    {
      key: 'simple',
      label: t.tabSimple,
      children: <SimpleDashboardPage />,
    },
  ];

  return (
    <>
      <LangSwitch />
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
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AppInner />
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
