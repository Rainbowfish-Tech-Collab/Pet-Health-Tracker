import "../App.css";

const LogMini = ({ date, subcategory, value, unit, description }) => {

  function abbreviations(unit){
    switch(unit){
      case "capsule":
        return "cap";
      case "tablets":
        return "tab";
      default:
        return unit;
    }
  }

  return (
    <div className="w-full bg-(--orange-300) rounded-lg p-1.5 gap-y-0 pb-0.5 mb-1 text-xs merriweather-sans log-mini">
      {/* First row: 48% date | 52% (subcategory + value/unit) */}
      <div className="grid grid-cols-[48%_52%] items-center">
        <div className="text-left">{date}</div>
        <div className = "grid grid-cols-[60%_50%] items-center">
          <div className="pl-2 text-left">{subcategory} </div><div className="text-left">{value} {abbreviations(unit)}</div>
        </div>
        
      </div>

      {/* Second row: description (70%) | icons (30%) */}
      <div className="grid grid-cols-[70%_30%] items-center ">
        <div className="truncate italic">{description}</div>
        <div className="flex justify-end gap-2">
          {/* Icons go here */}
          <span className={`material-symbols-rounded cursor-pointer rounded-xl border-1 border-transparent text-[var(--success)] hover:text-black hover:border-black hover:border transition-colors`} >
            task_alt
          </span>
          <span className={`material-symbols-rounded cursor-pointer rounded-xl border-1 border-transparent text-[var(--error)] hover:text-black hover:border-black hover:border transition-colors`} >
            delete
          </span>
        </div>
      </div>
    </div>
  );
};

export default LogMini;