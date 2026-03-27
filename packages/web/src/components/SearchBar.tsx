import { useState, type FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocationSearch: () => void;
  loading: boolean;
}

export function SearchBar({ onSearch, onLocationSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form className="flex gap-3 mb-8 flex-wrap sm:flex-nowrap" onSubmit={handleSubmit}>
      <div className="relative flex-1 basis-full sm:basis-auto">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-secondary"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="w-full py-3 pl-11 pr-4 bg-bg-secondary border-2 border-transparent rounded-xl text-text-primary text-base outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_4px_rgba(108,99,255,0.3)] placeholder:text-text-secondary"
          placeholder="Search city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="py-3 px-6 bg-accent text-white rounded-xl font-medium transition-all duration-200 hover:bg-accent-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        disabled={loading || !query.trim()}
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
      <button
        type="button"
        className="py-3 px-4 bg-bg-secondary text-text-secondary rounded-xl transition-all duration-200 hover:bg-bg-card hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onLocationSearch}
        disabled={loading}
        title="Use my location"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      </button>
    </form>
  );
}
