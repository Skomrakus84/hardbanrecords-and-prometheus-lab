import React from 'react';
import { Brand } from '../../components/ui/BrandConfig';

const cardStyle: React.CSSProperties = {
  background: Brand.colors.surface,
  borderRadius: Brand.radius,
  padding: 20,
  boxShadow: Brand.shadow,
  border: `1px solid ${Brand.colors.border}`
};

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: 16
};

const kpiValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: '#111827'
};

const kpiLabel: React.CSSProperties = {
  fontSize: 13,
  color: '#6b7280',
  marginTop: 6
};

const badge: React.CSSProperties = {
  fontSize: 12,
  padding: '6px 10px',
  borderRadius: 999,
  background: '#eef2ff',
  color: '#4338ca',
  fontWeight: 700
};

const quickActionBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid #e5e7eb',
  background: '#f8fafc',
  color: '#111827',
  fontWeight: 600,
  cursor: 'pointer'
};

const MusicOverviewNew: React.FC = () => {
  return (
    <div style={{ padding: 28, background: Brand.colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: Brand.colors.text }}>Music Overview</h1>
          <p style={{ margin: '6px 0 0 0', color: Brand.colors.subtext }}>Podsumowanie wydawnictw, artystów i dystrybucji</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={badge}>Live</span>
          <button style={{ ...quickActionBtn, background: Brand.colors.primaryDark, color: 'white', border: 'none' }}>+ New Release</button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 16 }}>
        {[{ label: 'Total Streams', value: '2.45M' }, { label: 'Monthly Revenue', value: '$12,430' }, { label: 'Active Artists', value: '12' }, { label: 'Live Releases', value: '34' }].map((k) => (
          <div key={k.label} style={cardStyle}>
            <div style={kpiValue}>{k.value}</div>
            <div style={kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {/* Recent Releases */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Ostatnie wydania</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { title: 'Midnight Dreams', artist: 'The Synthwave', status: 'Live', date: '2024-01-15' },
              { title: 'Electric Pulse', artist: 'Neon Beats', status: 'Live', date: '2024-02-10' },
              { title: 'Urban Vibes', artist: 'City Sound', status: 'Processing', date: '2024-03-01' }
            ].map((r) => (
              <div key={r.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{r.artist} • {r.date}</div>
                </div>
                <span style={{ ...badge, background: r.status === 'Live' ? '#dcfce7' : '#fef9c3', color: r.status === 'Live' ? '#166534' : '#854d0e' }}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Szybkie akcje</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <button style={quickActionBtn}>➕ Dodaj wydanie</button>
            <button style={quickActionBtn}>👤 Dodaj artystę</button>
            <button style={quickActionBtn}>📤 Dystrybucja</button>
            <button style={quickActionBtn}>📈 Analityka</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicOverviewNew;
