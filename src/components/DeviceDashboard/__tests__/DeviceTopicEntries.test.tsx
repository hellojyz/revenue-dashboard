import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DeviceTopicEntries from '../DeviceTopicEntries';

describe('DeviceTopicEntries', () => {
  it('renders 5 topic entry cards', () => {
    render(<DeviceTopicEntries />);
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(5);
  });

  it('renders topic name: 供电健康', () => {
    render(<DeviceTopicEntries />);
    expect(screen.getByText('供电健康')).toBeInTheDocument();
  });

  it('renders topic name: 连接健康', () => {
    render(<DeviceTopicEntries />);
    expect(screen.getByText('连接健康')).toBeInTheDocument();
  });

  it('renders topic name: 接入健康', () => {
    render(<DeviceTopicEntries />);
    expect(screen.getByText('接入健康')).toBeInTheDocument();
  });

  it('renders topic name: 体验健康', () => {
    render(<DeviceTopicEntries />);
    expect(screen.getByText('体验健康')).toBeInTheDocument();
  });

  it('renders topic name: 识别健康', () => {
    render(<DeviceTopicEntries />);
    expect(screen.getByText('识别健康')).toBeInTheDocument();
  });

  it('each card contains topic name and description', () => {
    render(<DeviceTopicEntries />);
    // Check names
    expect(screen.getByText('供电健康')).toBeInTheDocument();
    expect(screen.getByText('连接健康')).toBeInTheDocument();
    expect(screen.getByText('接入健康')).toBeInTheDocument();
    expect(screen.getByText('体验健康')).toBeInTheDocument();
    expect(screen.getByText('识别健康')).toBeInTheDocument();
    // Check descriptions
    expect(screen.getByText('电量消耗、充电异常、高耗电分布')).toBeInTheDocument();
    expect(screen.getByText('在线率、频繁上下线、信号质量')).toBeInTheDocument();
    expect(screen.getByText('配网成功率、配网耗时分布')).toBeInTheDocument();
    expect(screen.getByText('预览耗时、SD卡录像丢失')).toBeInTheDocument();
    expect(screen.getByText('识别准确率、误报率、漏报率')).toBeInTheDocument();
  });
});
