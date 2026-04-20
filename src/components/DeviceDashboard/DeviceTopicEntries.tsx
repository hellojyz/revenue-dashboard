import styles from './DeviceTopicEntries.module.css';

const TOPICS = [
  {
    name: '供电健康',
    desc: '电量消耗、充电异常、高耗电分布',
    href: '/device/power-health',
    icon: '⚡',
  },
  {
    name: '连接健康',
    desc: '在线率、频繁上下线、信号质量',
    href: '/device/connection-health',
    icon: '📡',
  },
  {
    name: '接入健康',
    desc: '配网成功率、配网耗时分布',
    href: '/device/access-health',
    icon: '🔗',
  },
  {
    name: '体验健康',
    desc: '预览耗时、SD卡录像丢失',
    href: '/device/experience-health',
    icon: '🎥',
  },
  {
    name: '识别健康',
    desc: '识别准确率、误报率、漏报率',
    href: '/device/recognition-health',
    icon: '🔍',
  },
];

export default function DeviceTopicEntries() {
  return (
    <div className={styles.container}>
      <div className={styles.title}>专题诊断入口</div>
      <div className={styles.list}>
        {TOPICS.map((topic) => (
          <div
            key={topic.name}
            className={styles.card}
            onClick={() => { window.location.href = topic.href; }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = topic.href; }}
          >
            <span className={styles.icon}>{topic.icon}</span>
            <div className={styles.info}>
              <span className={styles.name}>{topic.name}</span>
              <span className={styles.desc}>{topic.desc}</span>
            </div>
            <span className={styles.arrow}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
