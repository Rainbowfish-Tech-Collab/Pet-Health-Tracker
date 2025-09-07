import '../App.css';

const MobileContent = ({ children }) => {
  return (
    <div className="flex flex-col items-center p-6">
      {children}
    </div>
  )
}

export default MobileContent;