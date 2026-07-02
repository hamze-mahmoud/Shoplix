export default function CategorySearch({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search categories..."
      className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-green-400 outline-none"
    />
  );
}