import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaChevronDown } from "react-icons/fa";

const EditPetProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Check if this is a new pet or editing existing
  const isNewPet = id === 'new';

  // Pet data state - empty for new pets, filled for existing
  const [petData, setPetData] = useState({
    name: isNewPet ? "" : "Whiskers",
    species: isNewPet ? "Dog" : "Dog",
    breed: isNewPet ? "" : "Domestic Shorthair",
    birthday: isNewPet ? "" : "04/23",
    sex: isNewPet ? "Male" : "M",
    description: isNewPet ? "" : "about me - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vehicula enim vitae justo volutpat, sit amet pellentesque elit rutrum.",
  });

  const handleInputChange = (field, value) => {
    console.log(`Updating ${field} to:`, value);
    setPetData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      console.log("New petData:", newData);
      return newData;
    });
  };

  const handleUpdate = async () => {
    // Debug: log current state
    console.log("Current petData:", petData);
    console.log("Name:", petData.name, "Species:", petData.species);

    // Basic validation
    if (!petData.name || !petData.species) {
      alert("Please fill in at least the name and species fields.");
      return;
    }

    try {
      if (isNewPet) {
        // Add new pet to database
        const response = await fetch('http://localhost:3000/pets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(petData),
        });

        if (response.ok) {
          const newPet = await response.json();
          console.log("New pet added successfully:", newPet);
          // Navigate back to manage pets page
          navigate('/manage-pets');
        } else {
          console.error("Failed to add pet");
          alert("Failed to add pet. Please try again.");
        }
      } else {
        // Update existing pet in database
        const response = await fetch(`http://localhost:3000/pets/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(petData),
        });

        if (response.ok) {
          console.log("Pet updated successfully:", petData);
          // Navigate back to manage pets page
          navigate('/manage-pets');
        } else {
          console.error("Failed to update pet");
          alert("Failed to update pet. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving pet:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDelete = () => {
    // Handle delete logic here
    console.log("Deleting pet profile");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#222]">
      <div className="w-[680px] min-h-[600px] bg-[#fcfaec] rounded-2xl border-8 border-[#222] flex flex-col p-0">
        {/* Header with light beige background */}
        <div className="w-full bg-[#f5f5dc] px-4 pt-6 pb-3 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-[#355233] text-xl focus:outline-none cursor-pointer"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-2xl font-bold text-[#355233]">
              {isNewPet ? "Add New Pet" : "Edit Pet Profile"}
            </h1>
            {!isNewPet && (
              <button
                onClick={handleDelete}
                className="text-red-500 text-xl focus:outline-none cursor-pointer"
              >
                <img
                  src="/src/assets/delete.svg"
                  alt="Delete"
                  className="w-6 h-6"
                />
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-6 py-6">
          {/* Pet Profile Picture */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {isNewPet ? (
                <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-[#fcfaec] flex items-center justify-center">
                  <FaPlus className="text-gray-400 text-4xl" />
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2"
                  alt="Pet profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#fcfaec] shadow"
                />
              )}
              {/* Add photo overlay */}
              <div className="absolute bottom-2 right-2 bg-[#355233] text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white">
                <FaPlus size={12} />
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                name
              </label>
              <input
                type="text"
                value={petData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355233] focus:border-transparent"
              />
            </div>

            {/* Species */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                species
              </label>
              <div className="relative">
                <select
                  value={petData.species}
                  onChange={(e) => handleInputChange("species", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355233] focus:border-transparent appearance-none bg-[#fcfaec]"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Small Animals">Small Animals</option>
                  <option value="Reptile">Reptile</option>
                  <option value="Horse">Horse</option>
                  <option value="Fish">Fish</option>
                  <option value="Livestock">Livestock</option>
                  <option value="Other">Other</option>
                </select>
                <FaChevronDown className="absolute right-3 top-3 text-[#355233] pointer-events-none" />
              </div>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                breed
              </label>
              <input
                type="text"
                value={petData.breed}
                onChange={(e) => handleInputChange("breed", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355233] focus:border-transparent"
              />
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                birthday MM/DD
              </label>
              <input
                type="text"
                value={petData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                placeholder="MM/DD"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355233] focus:border-transparent"
              />
            </div>

            {/* Sex */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                sex
              </label>
              <div className="relative">
                <select
                  value={petData.sex}
                  onChange={(e) => handleInputChange("sex", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355233] focus:border-transparent appearance-none bg-[#fcfaec]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <FaChevronDown className="absolute right-3 top-3 text-[#355233] pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                description
              </label>
              <textarea
                value={petData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355233] focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Update Button */}
          <div className="mt-8">
            <button
              onClick={handleUpdate}
              className="w-full bg-[#355233] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#2a4128] transition-colors focus:outline-none focus:ring-2 focus:ring-[#355233] focus:ring-offset-2"
            >
              {isNewPet ? "Add Pet" : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPetProfile;
