export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`grid h-10 place-items-center ${className}`}>
      <span
        role="status"
        aria-label="Loading"
        className={`box-border inline-block aspect-square h-full animate-[spin_0.5s_linear_infinite] rounded-full border-4 border-[color-mix(in_srgb,var(--color-icon-brand)_20%,transparent)] border-t-(--color-icon-brand)`}
      />
    </div>
  );
}
