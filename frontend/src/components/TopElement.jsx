//html and styling for a top element absolute positioned on a mobile container
import '../App.css';
import { useNavigate } from 'react-router-dom';


const TopElement = ({ title, children }) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-50 flex justify-between w-full p-2 px-4 pt-10 bg-[#FFF9DD] border-b border-gray-400 shadow-gray-400 shadow-sm/70">
      {/* Left button */}
      <span 
        className="material-symbols-rounded cursor-pointer p-1 text-[#355233] hover:text-[#99CC66] transition-colors"
        onClick={() => navigate(-1)}
      >
        arrow_back_ios
      </span>

      {/* Title */}
      <h1
        className="left-1/2 transform -translate-x-1/2 text-2xl text-[#355233] font-bold text-center whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ maxWidth: 'calc(100% - 80px)' }} // adjust based on left+right widths
      >
        {title}
      </h1>

      {/* Right children(button) */}
      {children}
    </div>
  )
}


export default TopElement;