import { CONDITION_GRADES, type LineItem, type ConditionGrade } from '../types/catalog';

interface LineItemRowProps {
  item: LineItem;
  onChange: (rowId: string, updates: Partial<LineItem>) => void;
  onDelete: (rowId: string) => void;
}

export function LineItemRow({ item, onChange, onDelete }: LineItemRowProps) {
  const catalogPrice = item.prices[item.condition];
  const isBlankPrice = catalogPrice === null;

  function selectCondition(grade: ConditionGrade) {
    onChange(item.rowId, { condition: grade, rate: item.prices[grade] });
  }

  return (
    <tr
      className={`border-b border-gray-100 align-top ${
        item.isGroup ? 'bg-amber-50/40 border-l-4 border-l-amber-400' : 'hover:bg-gray-50/50'
      }`}
    >
      {/* Item */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          {item.isGroup && (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded shrink-0">
              Group
            </span>
          )}
          <span className="font-medium text-sm text-gray-900 leading-snug">{item.label}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          <span className="font-mono text-gray-400">{item.ndc}</span>
          <span className="mx-1.5">·</span>
          {item.category}
        </div>
        {item.notes && (
          <div className="text-xs text-gray-400 italic mt-1 max-w-xs">{item.notes}</div>
        )}
      </td>

      {/* Condition grade selector */}
      <td className="py-3 px-3">
        <div className="flex flex-col gap-1">
          {CONDITION_GRADES.map(grade => {
            const p = item.prices[grade];
            const selected = item.condition === grade;
            return (
              <button
                key={grade}
                type="button"
                onClick={() => selectCondition(grade)}
                className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded border text-xs transition-colors ${
                  selected
                    ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                }`}
              >
                <span className="font-medium">{grade}</span>
                <span className="tabular-nums">
                  {p === null ? (
                    <span className="text-amber-600">enter price</span>
                  ) : (
                    `$${p}`
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </td>

      {/* Rate */}
      <td className="py-3 px-3">
        {isBlankPrice ? (
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.rate ?? ''}
              onChange={e =>
                onChange(item.rowId, {
                  rate: e.target.value === '' ? null : parseFloat(e.target.value),
                })
              }
              placeholder="0.00"
              className="w-24 border border-amber-400 bg-amber-50 rounded px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <LockIcon className="text-gray-400 shrink-0" />
            <span className="text-sm font-medium text-gray-600 bg-gray-100 rounded px-2 py-1 tabular-nums">
              ${catalogPrice}
            </span>
          </div>
        )}
      </td>

      {/* Quantity */}
      <td className="py-3 px-3">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={e =>
            onChange(item.rowId, { quantity: Math.max(1, parseInt(e.target.value) || 1) })
          }
          className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </td>

      {/* Amount */}
      <td className="py-3 px-3 text-right">
        <span className="text-sm font-semibold text-gray-900 tabular-nums">
          {item.rate === null ? '—' : `$${item.amount.toFixed(2)}`}
        </span>
      </td>

      {/* Delete */}
      <td className="py-3 px-2 text-center">
        <button
          type="button"
          onClick={() => onDelete(item.rowId)}
          title="Remove item"
          className="w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </td>
    </tr>
  );
}

function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-3.5 h-3.5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}
