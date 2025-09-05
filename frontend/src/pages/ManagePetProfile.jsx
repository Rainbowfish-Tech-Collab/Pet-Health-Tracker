import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus } from "react-icons/fa";

const ManagePetProfile = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pets from database
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch('http://localhost:3000/pets');
        if (response.ok) {
          const petsData = await response.json();
          setPets(petsData);
        } else {
          console.error('Failed to fetch pets');
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#222]">
      <div className="w-[680px] min-h-[600px] bg-[#fcfaec] rounded-2xl border-8 border-[#222] flex flex-col items-center p-0">
        {/* Header with light beige background */}
        <div className="w-full bg-[#f5f5dc] px-4 pt-6 pb-3 rounded-t-2xl">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-2 text-[#355233] text-xl focus:outline-none cursor-pointer"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-medium text-[#355233]">
              Manage your pets
            </h1>
          </div>
        </div>
        <div className="w-full border-b border-gray-300 mb-6" />

        {/* Pet profile */}
        <div className="flex flex-col items-center w-full gap-8 mt-4">
          {loading ? (
            <div className="text-gray-600">Loading pets...</div>
          ) : (
            <>
              {/* Existing pets */}
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/edit-pet/${pet.id}`)}
                >
                  <img
                    src={pet.profile_picture || "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2"}
                    alt={pet.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#fcfaec] shadow"
                  />
                  <span className="mt-2 text-base text-gray-700 font-medium">
                    {pet.name}
                  </span>
                </div>
              ))}

              {/* Add pet button */}
              <button
                onClick={() => navigate('/edit-pet/new')}
                className="relative flex flex-col items-center focus:outline-none cursor-pointer"
                aria-label="Add pet"
              >
                <div className="w-32 h-32 bg-[#AAD1A1] rounded-full flex items-center justify-center relative">
                  {/* Paw print icon */}
                  <img
                    src="/src/assets/paw.png"
                    alt="Paw print"
                    className="w-16 h-16"
                  />
                  {/* Plus icon overlay */}
                  <div className="absolute -bottom-2 -right-2 bg-[#355233] text-white rounded-full w-10 h-10 flex items-center justify-center border-4 border-[#fcfaec]">
                    <FaPlus size={16} />
                  </div>
                </div>
                <span className="mt-2 text-base text-gray-700 font-medium">
                  Add pet
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePetProfile;
