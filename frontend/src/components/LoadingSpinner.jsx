
export default function LoadingSpinner({ message = 'Memuat data...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="flex flex-col items-center justify-center py-24 gap-6"
    >

      <div className="relative w-16 h-16">
        <svg
          className="animate-spin w-16 h-16 text-borderSoft"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="2" />
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-accentHover"
               stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p className="font-playfair text-lg text-primary">{message}</p>
        <p className="font-crimson text-sm text-textSecondary mt-1">Mohon tunggu sebentar</p>
      </div>

      <div className="hidden sm:grid grid-cols-3 gap-4 mt-4 max-w-lg w-full px-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-lg overflow-hidden">
            <div className="animate-pulse bg-borderSoft h-36 w-full rounded-lg mb-2" />
            <div className="animate-pulse bg-borderSoft h-3 w-4/5 rounded mb-1.5" />
            <div className="animate-pulse bg-borderSoft h-2.5 w-3/5 rounded" />
          </div>
        ))}
      </div>

      <span className="sr-only">{message}</span>
    </div>
  )
}
