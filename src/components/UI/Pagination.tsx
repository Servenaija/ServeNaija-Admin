import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalPages,
  onChange,
  total,
  pageSize,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  total?: number;
  pageSize?: number;
}) {
  if (totalPages <= 1) return null;

  const go = (p: number) => {
    const clamped = Math.max(0, Math.min(totalPages - 1, p));
    if (clamped !== page) onChange(clamped);
  };

  // windowed page numbers with ellipsis
  const nums: (number | '...')[] = [];
  const push = (n: number | '...') => { if (nums[nums.length - 1] !== n) nums.push(n); };
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) push(i);
    else if (nums[nums.length - 1] !== '...') push('...');
  }

  const from = total != null && pageSize ? page * pageSize + 1 : null;
  const to = total != null && pageSize ? Math.min(total, (page + 1) * pageSize) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      {total != null && from != null && to != null && (
        <p className="text-xs text-gray-500">
          {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={page === 0}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {nums.map((n, idx) =>
          n === '...' ? (
            <span key={`e-${idx}`} className="px-1.5 text-gray-400 text-xs select-none">…</span>
          ) : (
            <button
              key={n}
              onClick={() => go(n)}
              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-medium border transition-colors ${
                n === page
                  ? 'bg-[#165B43] text-white border-[#165B43]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {n + 1}
            </button>
          )
        )}
        <button
          onClick={() => go(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
