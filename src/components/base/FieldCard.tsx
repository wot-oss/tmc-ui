const FieldCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className="mt-3 flex items-baseline gap-4">
      <h2 className="text-sm font-medium text-textLabel">{label}</h2>
      <p className="text-2xl tracking-tight text-textValue">{value}</p>
    </div>
  );
};
export default FieldCard;
