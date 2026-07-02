export default function DatePicker({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm">{label}</label>}

      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="border px-3 py-2 rounded"
      />
    </div>
  );
}