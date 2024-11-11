const Card = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {title && (
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );

  export default  Card;