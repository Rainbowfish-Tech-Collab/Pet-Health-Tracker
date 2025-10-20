import React, { useState } from "react";

const DropdownButton = ({expanded, onClick}) => {
      return (
        <button
          className={`material-symbols-rounded text-(--green01-300) hover:text-(--green01) 
            transition-transform duration-300 ease-in-out
            ${expanded ? 'rotate-90' : 'rotate-0'}`}
          onClick={onClick}
        >
          play_arrow
        </button>
      );
    };

export default DropdownButton;