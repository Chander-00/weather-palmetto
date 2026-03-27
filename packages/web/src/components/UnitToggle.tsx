interface UnitToggleProps {
  units: 'metric' | 'imperial';
  onToggle: (units: 'metric' | 'imperial') => void;
}

export function UnitToggle({ units, onToggle }: UnitToggleProps) {
  return (
    <div className="flex bg-bg-secondary rounded-lg overflow-hidden">
      <button
        className={`py-1.5 px-3 border-none text-sm font-medium transition-all duration-200 cursor-pointer ${
          units === 'imperial' ? 'bg-accent text-white' : 'bg-transparent text-text-secondary'
        }`}
        onClick={() => onToggle('imperial')}
      >
        &deg;F
      </button>
      <button
        className={`py-1.5 px-3 border-none text-sm font-medium transition-all duration-200 cursor-pointer ${
          units === 'metric' ? 'bg-accent text-white' : 'bg-transparent text-text-secondary'
        }`}
        onClick={() => onToggle('metric')}
      >
        &deg;C
      </button>
    </div>
  );
}
