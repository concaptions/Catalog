import { useCatalogFeed } from './hooks/useCatalogFeed';
import { InvoiceForm } from './components/InvoiceForm';

export default function App() {
  const feed = useCatalogFeed();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">LVDTS — Vendor Invoice</h1>
          {feed.status === 'loading' && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
              Loading catalog
            </span>
          )}
          {feed.status === 'success' && (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Catalog live · {feed.items.length} items
            </span>
          )}
          {feed.status === 'error' && (
            <span className="flex items-center gap-1.5 text-xs text-red-500">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Feed unavailable
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {feed.status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading pricing catalog…</p>
          </div>
        )}

        {feed.status === 'error' && (
          <div className="max-w-md mx-auto mt-16">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <svg
                className="w-10 h-10 text-red-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
              <p className="text-red-700 font-semibold text-base mb-1">Pricing data unavailable</p>
              <p className="text-red-500 text-sm mb-4">
                Unable to load the catalog from the pricing feed. Please try again.
              </p>
              <button
                onClick={feed.retry}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {feed.status === 'success' && <InvoiceForm items={feed.items} />}
      </main>
    </div>
  );
}
