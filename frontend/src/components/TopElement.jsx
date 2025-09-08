//html and styling for a top element absolute positioned on a mobile container
import '../App.css';
const TopElement = ({ title, children }) => {
  return (
    <div className = "absolute top-0 flex justify-between w-full mb-6 p-2 px-4 pt-10 bg-[#FFF9DD] border-b border-gray-300 shadow-md shadow-gray-40">
      <span 
        className="material-symbols-outlined cursor-pointer p-1 text-[#355233] hover:text-[#99CC66] transition-colors"
        onClick={() => navigate(-1)}
      >
        arrow_back_ios
      </span>
      <h1 className="text-2xl text-[#355233] font-bold">{title}</h1>
      {children}
    </div>
  )
}

export default TopElement;