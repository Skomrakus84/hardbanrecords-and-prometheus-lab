import React from 'react';

interface PaginationProps {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, total, onPageChange }) => {
  if (total <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 8, margin: '16px 0', justifyContent: 'center' }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}>&lt;</button>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          style={{ fontWeight: page === i + 1 ? 'bold' : undefined }}
        >
          {i + 1}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === total}>&gt;</button>
    </div>
  );
};

export default Pagination;
