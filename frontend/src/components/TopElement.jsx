//html and styling for a top element absolute positioned on a mobile container
import '../App.css';
import { useNavigate } from 'react-router-dom';


const TopElement = ({ title, children }) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-50 flex justify-between w-full p-2 px-4 pt-10 bg-(--cream-100) border-b border-gray-400 shadow-gray-400 shadow-sm/70">
      {/* Left button */}
      <span 
        className="material-symbols-rounded cursor-pointer p-1 text-(--green01) hover:text-(--green03) transition-colors"
        onClick={() => navigate(-1)}
      >
        arrow_back_ios
      </span>

      {/* Title */}
      <h1
        className={`${!children && 'left-1/2 transform -translate-x-1/2'} text-2xl text-(--green01) font-bold text-center whitespace-nowrap overflow-hidden text-ellipsis`}
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