const Input = ({ label, type, value, onChange, placeholder, min, max, step, className = '' }) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none 
        focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      />
    </div>
  );

export default Input;