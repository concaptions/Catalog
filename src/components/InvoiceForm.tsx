import { useState, useCallback } from 'react';
import type { CatalogItem, LineItem, SubmittedLineItem } from '../types/catalog';
import { ProductSearch } from './ProductSearch';
import { LineItemRow } from './LineItemRow';

interface InvoiceFormProps {
  items: CatalogItem[];
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

let _rowSeq = 1;

function buildLineItem(src: CatalogItem): LineItem {
  const condition = 'Mint 9m+';
  const rate = src.prices[condition];
  return {
    rowId: `row-${_rowSeq++}`,
    id: src.id,
    label: src.label,
    drug: src.drug,
    ndc: src.ndc,
    isGroup: src.isGroup,
    category: src.category,
    notes: src.notes,
    prices: src.prices,
    condition,
    rate,
    quantity: 1,
    amount: rate === null ? 0 : rate,
  };
}

export function InvoiceForm({ items }: InvoiceFormProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const updateLineItem = useCallback((rowId: string, updates: Partial<LineItem>) => {
    setLineItems(prev =>
      prev.map(li => {
        if (li.rowId !== rowId) return li;
        const next = { ...li, ...updates };
        next.amount = next.rate === null ? 0 : parseFloat((next.quantity * next.rate).toFixed(2));
        return next;
      }),
    );
  }, []);

  function deleteLineItem(rowId: string) {
    setLineItems(prev => prev.filter(li => li.rowId !== rowId));
  }

  function addItem(src: CatalogItem) {
    setLineItems(prev => [...prev, buildLineItem(src)]);
    setSubmitState('idle');
  }

  const subtotal = lineItems.reduce((sum, li) => sum + (li.rate === null ? 0 : li.amount), 0);
  const blankPriceCount = lineItems.filter(li => li.rate === null).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
    if (!webhookUrl || webhookUrl.includes('YOUR_WEBHOOK_PATH')) {
      alert('VITE_N8N_WEBHOOK_URL is not configured in .env');
      return;
    }

    if (blankPriceCount > 0) {
      alert(
        `${blankPriceCount} line item(s) have a blank price. Enter a price for every line before submitting.`,
      );
      return;
    }

    const payload: SubmittedLineItem[] = lineItems.map(li => ({
      id: li.id,
      label: li.label,
      drug: li.drug,
      ndc: li.ndc,
      isGroup: li.isGroup,
      category: li.category,
      condition: li.condition,
      rate: li.rate as number,
      quantity: li.quantity,
      amount: li.amount,
      notes: li.notes,
    }));

    setSubmitState('submitting');
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmitState('success');
      setLineItems([]);
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitState('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Search / add */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Add Item
        </h2>
        <ProductSearch items={items} onSelect={addItem} />
      </div>

      {/* Line items */}
      {lineItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 pt-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Line Items
            </h2>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-gray-100 bg-gray-50/80 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-2.5 px-3">Item</th>
                  <th className="text-left py-2.5 px-3">Condition</th>
                  <th className="text-left py-2.5 px-3">Rate</th>
                  <th className="text-left py-2.5 px-3">Qty</th>
                  <th className="text-right py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-2" />
                </tr>
              </thead>
              <tbody>
                {lineItems.map(li => (
                  <LineItemRow
                    key={li.rowId}
                    item={li}
                    onChange={updateLineItem}
                    onDelete={deleteLineItem}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center gap-3 border-t border-gray-100 px-5 py-4">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-2xl font-bold text-gray-900 tabular-nums">
              ${subtotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Success banner — persists after the form clears */}
      {submitState === 'success' && lineItems.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2 text-green-700">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">
            Invoice submitted successfully. Add items above to start a new invoice.
          </span>
        </div>
      )}

      {/* Submit */}
      {lineItems.length > 0 && (
        <div className="flex items-center justify-end gap-4">
          {blankPriceCount > 0 && (
            <p className="text-sm text-amber-600">
              {blankPriceCount} line item(s) need a price before you can submit.
            </p>
          )}
          {submitState === 'error' && (
            <p className="text-sm text-red-600">Submission failed — please try again.</p>
          )}
          <button
            type="submit"
            disabled={submitState === 'submitting' || blankPriceCount > 0}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {submitState === 'submitting' ? 'Submitting…' : 'Submit Invoice'}
          </button>
        </div>
      )}
    </form>
  );
}
