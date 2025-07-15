import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';

const ManagePetProfile = () => {
  const navigate = useNavigate();

  // Example pet data
  const pets = [
    {
      id: 1,
      name: 'Whiskers',
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#222]">
      <div className="w-[340px] min-h-[600px] bg-[#fcfaec] rounded-2xl border-8 border-[#222] flex flex-col items-center p-0">
        {/* Header */}
        <div className="w-full flex items-center px-4 pt-6 pb-3">
          <button onClick={() => navigate(-1)} className="mr-2 text-[#355233] text-xl focus:outline-none">
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-medium text-[#355233]">Manage your pets</h1>
        </div>
        <div className="w-full border-b border-gray-300 mb-6" />

        {/* Pet profile */}
        <div className="flex flex-col items-center w-full gap-8 mt-4">
          {/* Existing pet */}
          <div className="flex flex-col items-center">
            <img
              src={pets[0].image}
              alt={pets[0].name}
              className="w-28 h-28 rounded-full object-cover border-4 border-[#fcfaec] shadow"
            />
            <span className="mt-2 text-base text-black font-medium">{pets[0].name}</span>
          </div>

          {/* Add pet button */}
          <button
            className="relative flex flex-col items-center focus:outline-none"
            aria-label="Add pet"
          >
            <div className="w-32 h-32 bg-[#AAD1A1] rounded-full flex items-center justify-center">
              <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
                <path d="M40 10c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zm0 46c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zm-23-23c0-4 3-7 7-7s7 3 7 7-3 7-7 7-7-3-7-7zm46 0c0-4 3-7 7-7s7 3 7 7-3 7-7 7-7-3-7-7zm-23 7c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12z" fill="#7CB77A"/>
              </svg>
              <span className="absolute bottom-3 right-3 bg-[#222] text-white rounded-full p-1 border-2 border-white">
                <FaPlus size={18} />
              </span>
            </div>
            <span className="mt-2 text-base text-black font-medium">Add pet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagePetProfile;
