
//html and styling for our mobile containers
import '../App.css';
const MobileContainer = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#222]">
				<div className="bg-[#fcfaec] rounded-2xl shadow-lg p-6 sm:p-10 w-[350px] flex flex-col items-center border-8 border-[#222] text-left relative max-h-[672px] h-screen overflow-y-auto">
          {children}
        </div>
    </div>
  )
}

export default MobileContainer;