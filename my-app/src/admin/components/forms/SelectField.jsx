export default function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm">{label}</label>}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="border px-3 py-2 rounded"
      >
        <option value="">Select...</option>

        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}