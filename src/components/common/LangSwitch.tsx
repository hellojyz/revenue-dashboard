import { useI18n } from '../../i18n/I18nContext';

export default function LangSwitch() {
  const { locale, setLocale } = useI18n();
  const isZh = locale === 'zh';

  return (
    <div
      onClick={() => setLocale(isZh ? 'en' : 'zh')}
      style={{
        position: 'fixed',
        top: 14,
        right: 24,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: '4px 6px',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s',
      }}
      title={isZh ? 'Switch to English' : '切换到中文'}
    >
      <span
        style={{
          fontSize: 12,
          padding: '2px 10px',
          borderRadius: 14,
          background: isZh ? 'rgba(255,255,255,0.15)' : 'transparent',
          color: isZh ? '#fff' : 'rgba(255,255,255,0.45)',
          fontWeight: isZh ? 600 : 400,
          transition: 'all 0.2s',
        }}
      >
        中
      </span>
      <span
        style={{
          fontSize: 12,
          padding: '2px 10px',
          borderRadius: 14,
          background: !isZh ? 'rgba(255,255,255,0.15)' : 'transparent',
          color: !isZh ? '#fff' : 'rgba(255,255,255,0.45)',
          fontWeight: !isZh ? 600 : 400,
          transition: 'all 0.2s',
        }}
      >
        EN
      </span>
    </div>
  );
}
