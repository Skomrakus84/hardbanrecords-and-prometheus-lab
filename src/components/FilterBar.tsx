import React from 'react';

interface FilterBarProps {
  filters: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, value, onChange, label }) => {
  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      {label && <span style={{ color: 'white' }}>{label}</span>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: 6, borderRadius: 4, border: '1px solid #444' }}>
        {filters.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
