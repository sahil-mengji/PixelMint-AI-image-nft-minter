const Button = ({ onClick, disabled, children, className = '' }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 
      ${disabled 
        ? 'bg-gray-300 cursor-not-allowed' 
        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
      } ${className}`}
    >
      {children}
    </button>
  );

export default Button;