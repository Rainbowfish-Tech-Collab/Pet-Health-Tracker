function CustomNotification({ closeToast, data }){

  return (
    <div className="flex flex-col w-full">
      <h3
        className={`text-sm text-center font-semibold`}
      >
        {data.title}
      </h3>
      <div className="flex items-center justify-between">
        <span
            className="material-symbols-outlined cursor-pointer hover:text-[#355233] transition-colors"
            onClick={closeToast}
        >
            arrow_back_ios
        </span>
        <p className="text-sm text-center">{data.content}</p>
        <span
            className={`material-symbols-outlined cursor-pointer rounded-xl p-1 border-1 border-transparent text-white hover:text-black hover:border-black hover:border transition-colors`}
            onClick={() => {closeToast(); data.function(); }}
          >
            {data.icon}
        </span>
      </div>
    </div>
  );
}

export default CustomNotification;
