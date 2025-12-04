/**
 * EventsPastToggle Component
 *
 * Dumb component that renders a checkbox for toggling between upcoming and past events.
 * This component is discrete and doesn't interfere with the main workflow.
 */

interface EventsPastToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const EventsPastToggle = ({ checked, onChange }: EventsPastToggleProps) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        id="show-past-events"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
        aria-label="Mostrar eventos pasados"
      />
      <label
        htmlFor="show-past-events"
        className="text-neutral-700 cursor-pointer select-none"
      >
        Mostrar eventos pasados
      </label>
    </div>
  );
};
