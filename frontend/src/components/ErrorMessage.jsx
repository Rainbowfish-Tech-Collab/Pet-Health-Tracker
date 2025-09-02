const ErrorMessage = ({ message }) => 
  message && (
    <div className="text-red-600 text-center mb-2 text-sm font-medium">
      {message}
    </div>
  )


export default ErrorMessage;