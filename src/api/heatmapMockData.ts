/**
 * 热力图看板 Mock 数据
 * 提供 18 个 APP 的模拟指标数据，用于前端预览和演示
 */
import type { HeatmapAppMetric, HeatmapDataResponse } from '../types/heatmap';

const mockApps: HeatmapAppMetric[] = [
  {
    appName: 'ANRAN',
    deviceCount: 28500, subscriptionConversionRate: 0.35, subscriptionRetentionRate: 0.72, revenuePerDevice: 42.8,
    deviceType: '4g_camera', packageType: 'yearly',
    yoyChange: { deviceCount: 0.12, subscriptionConversionRate: 0.05, subscriptionRetentionRate: -0.02, revenuePerDevice: 0.08 },
    momChange: { deviceCount: 0.03, subscriptionConversionRate: 0.01, subscriptionRetentionRate: -0.01, revenuePerDevice: 0.02 },
  },
  {
    appName: 'Cococam',
    deviceCount: 15200, subscriptionConversionRate: 0.28, subscriptionRetentionRate: 0.65, revenuePerDevice: 35.5,
    deviceType: 'battery_camera', packageType: 'monthly',
    yoyChange: { deviceCount: -0.05, subscriptionConversionRate: -0.03, subscriptionRetentionRate: 0.02, revenuePerDevice: -0.01 },
    momChange: { deviceCount: -0.02, subscriptionConversionRate: -0.01, subscriptionRetentionRate: 0.01, revenuePerDevice: 0.00 },
  },
  {
    appName: 'ieGeek Cam',
    deviceCount: 4200, subscriptionConversionRate: 0.18, subscriptionRetentionRate: 0.48, revenuePerDevice: 18.3,
    deviceType: 'wired_camera', packageType: 'quarterly',
    yoyChange: { deviceCount: -0.15, subscriptionConversionRate: -0.08, subscriptionRetentionRate: -0.05, revenuePerDevice: -0.12 },
    momChange: { deviceCount: -0.06, subscriptionConversionRate: -0.03, subscriptionRetentionRate: -0.02, revenuePerDevice: -0.04 },
  },
  {
    appName: 'Meari',
    deviceCount: 32000, subscriptionConversionRate: 0.42, subscriptionRetentionRate: 0.78, revenuePerDevice: 55.2,
    deviceType: 'doorbell', packageType: 'yearly',
    yoyChange: { deviceCount: 0.18, subscriptionConversionRate: 0.07, subscriptionRetentionRate: 0.03, revenuePerDevice: 0.10 },
    momChange: { deviceCount: 0.05, subscriptionConversionRate: 0.02, subscriptionRetentionRate: 0.01, revenuePerDevice: 0.03 },
  },
  {
    appName: 'Arenti',
    deviceCount: 1800, subscriptionConversionRate: 0.08, subscriptionRetentionRate: 0.42, revenuePerDevice: 12.5,
    deviceType: 'battery_camera', packageType: 'daily',
    yoyChange: { deviceCount: -0.25, subscriptionConversionRate: -0.10, subscriptionRetentionRate: -0.08, revenuePerDevice: -0.18 },
    momChange: { deviceCount: -0.10, subscriptionConversionRate: -0.05, subscriptionRetentionRate: -0.03, revenuePerDevice: -0.07 },
  },
  {
    appName: 'COOAU',
    deviceCount: 8900, subscriptionConversionRate: 0.22, subscriptionRetentionRate: 0.55, revenuePerDevice: 25.0,
    deviceType: 'mini_camera', packageType: 'half_yearly',
    yoyChange: { deviceCount: 0.08, subscriptionConversionRate: 0.03, subscriptionRetentionRate: -0.01, revenuePerDevice: 0.04 },
    momChange: { deviceCount: 0.02, subscriptionConversionRate: 0.01, subscriptionRetentionRate: 0.00, revenuePerDevice: 0.01 },
  },
  {
    appName: 'Ctronics',
    deviceCount: 6500, subscriptionConversionRate: 0.15, subscriptionRetentionRate: 0.52, revenuePerDevice: 19.8,
    deviceType: 'wired_camera', packageType: 'monthly',
    yoyChange: { deviceCount: -0.03, subscriptionConversionRate: -0.02, subscriptionRetentionRate: 0.01, revenuePerDevice: -0.01 },
    momChange: { deviceCount: 0.01, subscriptionConversionRate: 0.00, subscriptionRetentionRate: 0.00, revenuePerDevice: 0.01 },
  },
  {
    appName: 'ZOSI',
    deviceCount: 22000, subscriptionConversionRate: 0.38, subscriptionRetentionRate: 0.68, revenuePerDevice: 48.6,
    deviceType: '4g_camera', packageType: 'yearly',
    yoyChange: { deviceCount: 0.22, subscriptionConversionRate: 0.09, subscriptionRetentionRate: 0.04, revenuePerDevice: 0.15 },
    momChange: { deviceCount: 0.08, subscriptionConversionRate: 0.03, subscriptionRetentionRate: 0.02, revenuePerDevice: 0.05 },
  },
  {
    appName: 'Hiseeu',
    deviceCount: 12500, subscriptionConversionRate: 0.25, subscriptionRetentionRate: 0.60, revenuePerDevice: 30.2,
    deviceType: 'light', packageType: 'quarterly',
    yoyChange: { deviceCount: 0.05, subscriptionConversionRate: 0.02, subscriptionRetentionRate: 0.01, revenuePerDevice: 0.03 },
    momChange: { deviceCount: 0.01, subscriptionConversionRate: 0.00, subscriptionRetentionRate: 0.00, revenuePerDevice: 0.01 },
  },
  {
    appName: 'GALAYOU',
    deviceCount: 3800, subscriptionConversionRate: 0.12, subscriptionRetentionRate: 0.46, revenuePerDevice: 16.0,
    deviceType: 'mini_camera', packageType: 'monthly',
    yoyChange: { deviceCount: -0.10, subscriptionConversionRate: -0.06, subscriptionRetentionRate: -0.04, revenuePerDevice: -0.08 },
    momChange: { deviceCount: -0.04, subscriptionConversionRate: -0.02, subscriptionRetentionRate: -0.01, revenuePerDevice: -0.03 },
  },
  {
    appName: 'DEKCO',
    deviceCount: 45000, subscriptionConversionRate: 0.48, subscriptionRetentionRate: 0.82, revenuePerDevice: 68.5,
    deviceType: 'wired_camera', packageType: 'yearly',
    yoyChange: { deviceCount: 0.30, subscriptionConversionRate: 0.12, subscriptionRetentionRate: 0.06, revenuePerDevice: 0.20 },
    momChange: { deviceCount: 0.10, subscriptionConversionRate: 0.04, subscriptionRetentionRate: 0.02, revenuePerDevice: 0.07 },
  },
  {
    appName: 'FloodLight Cam',
    deviceCount: 9800, subscriptionConversionRate: 0.20, subscriptionRetentionRate: 0.58, revenuePerDevice: 22.0,
    deviceType: 'doorbell', packageType: 'half_yearly',
    yoyChange: { deviceCount: 0.02, subscriptionConversionRate: 0.01, subscriptionRetentionRate: 0.00, revenuePerDevice: 0.01 },
    momChange: { deviceCount: 0.00, subscriptionConversionRate: 0.00, subscriptionRetentionRate: 0.00, revenuePerDevice: 0.00 },
  },
  {
    appName: 'BabyMonitor',
    deviceCount: null, subscriptionConversionRate: 0.10, subscriptionRetentionRate: null, revenuePerDevice: 14.0,
    deviceType: 'mini_camera', packageType: 'daily',
    yoyChange: { deviceCount: null, subscriptionConversionRate: -0.04, subscriptionRetentionRate: null, revenuePerDevice: -0.06 },
    momChange: { deviceCount: null, subscriptionConversionRate: -0.02, subscriptionRetentionRate: null, revenuePerDevice: -0.02 },
  },
  {
    appName: 'PetCam',
    deviceCount: 18000, subscriptionConversionRate: 0.30, subscriptionRetentionRate: 0.62, revenuePerDevice: 38.0,
    deviceType: '4g_camera', packageType: 'quarterly',
    yoyChange: { deviceCount: 0.06, subscriptionConversionRate: 0.02, subscriptionRetentionRate: 0.01, revenuePerDevice: 0.04 },
    momChange: { deviceCount: 0.02, subscriptionConversionRate: 0.01, subscriptionRetentionRate: 0.00, revenuePerDevice: 0.01 },
  },
  {
    appName: 'SolarCam',
    deviceCount: 0, subscriptionConversionRate: 0, subscriptionRetentionRate: 0, revenuePerDevice: 0,
    deviceType: 'battery_camera', packageType: 'monthly',
    yoyChange: { deviceCount: -0.30, subscriptionConversionRate: -0.15, subscriptionRetentionRate: -0.20, revenuePerDevice: -0.25 },
    momChange: { deviceCount: -0.18, subscriptionConversionRate: -0.10, subscriptionRetentionRate: -0.12, revenuePerDevice: -0.16 },
  },
  {
    appName: 'DoorBell Pro',
    deviceCount: 7200, subscriptionConversionRate: null, subscriptionRetentionRate: 0.50, revenuePerDevice: null,
    deviceType: 'doorbell', packageType: 'half_yearly',
    yoyChange: { deviceCount: 0.04, subscriptionConversionRate: null, subscriptionRetentionRate: 0.01, revenuePerDevice: null },
    momChange: { deviceCount: 0.01, subscriptionConversionRate: null, subscriptionRetentionRate: 0.00, revenuePerDevice: null },
  },
  {
    appName: 'PTZ Outdoor',
    deviceCount: 25000, subscriptionConversionRate: 0.32, subscriptionRetentionRate: 0.70, revenuePerDevice: 40.0,
    deviceType: 'wired_camera', packageType: 'yearly',
    yoyChange: { deviceCount: 0.10, subscriptionConversionRate: 0.04, subscriptionRetentionRate: 0.02, revenuePerDevice: 0.06 },
    momChange: { deviceCount: 0.03, subscriptionConversionRate: 0.01, subscriptionRetentionRate: 0.01, revenuePerDevice: 0.02 },
  },
  {
    appName: 'Mini Indoor',
    deviceCount: 38000, subscriptionConversionRate: 0.45, subscriptionRetentionRate: 0.75, revenuePerDevice: 52.0,
    deviceType: 'mini_camera', packageType: 'yearly',
    yoyChange: { deviceCount: 0.15, subscriptionConversionRate: 0.06, subscriptionRetentionRate: 0.03, revenuePerDevice: 0.09 },
    momChange: { deviceCount: 0.04, subscriptionConversionRate: 0.02, subscriptionRetentionRate: 0.01, revenuePerDevice: 0.03 },
  },
];

export const mockHeatmapData: HeatmapDataResponse = {
  apps: mockApps,
  updatedAt: new Date().toISOString(),
};
