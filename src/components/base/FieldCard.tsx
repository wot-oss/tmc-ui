const FieldCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className="mt-3 flex items-baseline gap-4">
      <h2 className="text-sm font-medium text-text-secondary">{label}</h2>
      {value && <p className="text-2xl tracking-tight text-text-primary">{value}</p>}
    </div>
  );
};
export default FieldCard;
