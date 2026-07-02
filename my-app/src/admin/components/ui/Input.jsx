export default function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-600">{label}</label>}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}