export default function FileUpload({ label, onChange, multiple = true }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm">{label}</label>}

      <input
        type="file"
        multiple={multiple}
        onChange={onChange}
        className="border p-2 rounded"
      />
    </div>
  );
}