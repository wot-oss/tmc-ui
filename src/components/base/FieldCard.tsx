const FieldCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className="mt-3 flex items-baseline gap-4">
      <h2 className="text-textLabel text-sm font-medium">{label}</h2>
      <p className="text-textValue text-2xl tracking-tight">{value}</p>
    </div>
  );
};
export default FieldCard;
