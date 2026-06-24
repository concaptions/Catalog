import { useState, useMemo, useEffect } from 'react';
import { CONDITION_GRADES, type ConditionGrade, type CatalogItem } from '../types/catalog';

interface ProductSearchProps {
  items: CatalogItem[];
  onSelect: (item: CatalogItem) => void;
}

const GRADE_META: Record<ConditionGrade, { short: string; sub: string; tint: string }> = {
  'Mint 9m+': { short: 'Mint', sub: '9m+', tint: 'text-emerald-600' },
  'Ding 6-8m': { short: 'Ding', sub: '6–8m', tint: 'text-amber-600' },
  'Damage 3-5m': { short: 'Damage', sub: '3–5m', tint: 'text-rose-600' },
};

const PAGE_SIZE = 8;

export function ProductSearch({ items, onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [page, setPage] = useState(0);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))],
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => {
      if (category !== 'all' && i.category !== category) return false;
      if (!q) return true;
      return i.label.toLowerCase().includes(q) || i.drug.toLowerCase().includes(q);
    });
  }, [items, query, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Reset to first page whenever the filter changes.
  useEffect(() => {
    setPage(0);
  }, [query, category]);

  // Keep page in range if the list shrinks.
  useEffect(() => {
    if (page > pageCount - 1) setPage(pageCount - 1);
  }, [page, pageCount]);

  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(filtered.length, (page + 1) * PAGE_SIZE);

  return (
    <div>
      {/* Category navigation */}
      {categories.length > 1 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                category === c
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {c === 'all' ? 'All Categories' : c}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by drug or item name…"
          className="w-full border border-gray-300 rounded-lg pl-10 pr-24 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            title="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {!query && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 tabular-nums">
            {filtered.length} items
          </span>
        )}
      </div>

      {/* Column legend */}
      <div className="hidden sm:flex items-center justify-between gap-3 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        <span>Item</span>
        <div className="flex items-center gap-1.5">
          {CONDITION_GRADES.map(g => (
            <span key={g} className={`w-[60px] text-center ${GRADE_META[g].tint}`}>
              {GRADE_META[g].short}
            </span>
          ))}
          <span className="w-[68px]" />
        </div>
      </div>

      {/* Inline browsable results */}
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
        {pageItems.length === 0 ? (
          <div className="p-8 text-sm text-gray-400 text-center">No items match your search</div>
        ) : (
          pageItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 px-3 py-3 transition-colors hover:bg-gray-50 ${
                item.isGroup ? 'bg-amber-50/50 border-l-4 border-l-amber-400' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {item.isGroup && (
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded shrink-0">
                      Group
                    </span>
                  )}
                  <span className="font-medium text-sm text-gray-900 truncate">{item.label}</span>
                </div>
                <div className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1.5">
                  <span className="font-semibold text-gray-600">{item.drug}</span>
                  <span className="text-gray-300">·</span>
                  <span className="font-mono text-gray-400">{item.ndc}</span>
                  <span className="text-gray-300">·</span>
                  <span>{item.category}</span>
                </div>
                {item.notes && (
                  <div className="text-[11px] text-gray-400 italic truncate mt-0.5">{item.notes}</div>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {CONDITION_GRADES.map(g => {
                  const v = item.prices[g];
                  const meta = GRADE_META[g];
                  return (
                    <div
                      key={g}
                      className="w-[60px] flex flex-col items-center rounded border border-gray-100 bg-gray-50/80 py-1"
                    >
                      <span className={`text-[9px] uppercase tracking-wide font-semibold ${meta.tint}`}>
                        {meta.sub}
                      </span>
                      <span
                        className={`text-xs tabular-nums font-semibold ${
                          v === null ? 'text-amber-600' : 'text-gray-800'
                        }`}
                      >
                        {v === null ? 'enter' : `$${v}`}
                      </span>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="w-[68px] inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination — on the page */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 mt-3">
          <span className="text-xs text-gray-500 tabular-nums">
            Showing {rangeStart}–{rangeEnd} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="px-2.5 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              « First
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ‹ Prev
            </button>
            <span className="px-3 py-1.5 text-xs font-medium text-gray-700 tabular-nums">
              Page {page + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next ›
            </button>
            <button
              type="button"
              onClick={() => setPage(pageCount - 1)}
              disabled={page >= pageCount - 1}
              className="px-2.5 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Last »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
