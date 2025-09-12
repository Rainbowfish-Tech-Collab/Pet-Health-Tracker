import '../App.css';

const MobileContent = ({ children, ...props }) => {
  return (
    <div className="flex flex-col items-center p-6" {...props}>
      {children}
    </div>
  )
}

export default MobileContent;