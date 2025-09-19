import React, { useState } from "react";

const ArrowButton = ({expanded, onClick}) => {
      return (
        <button
          className={`material-symbols-rounded text-gray-500 hover:text-gray-700 
            transition-transform duration-300 ease-in-out
            ${expanded ? 'rotate-90' : 'rotate-0'}`}
          onClick={onClick}
        >
          play_arrow
        </button>
      );
    };

export default ArrowButton;