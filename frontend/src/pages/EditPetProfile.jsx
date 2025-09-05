import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaChevronDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditPetProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Check if this is a new pet or editing existing
  const isNewPet = id === 'new';

  // Pet data state - empty for new pets, filled for existing
  const [petData, setPetData] = useState({
    name: "",
    species: "Dog",
    breed: "",
    birthday: "",
    sex: "Male",
    description: "",
    profile_picture: null,
  });

  const [loading, setLoading] = useState(!isNewPet);
  const [breeds, setBreeds] = useState([]);
  const [breedsLoading, setBreedsLoading] = useState(true);
  const [species, setSpecies] = useState([]);
  const [speciesLoading, setSpeciesLoading] = useState(true);

  // Fetch species from database
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await fetch('http://localhost:3000/db/petSpecies');
        if (response.ok) {
          const speciesData = await response.json();
          console.log('Fetched species:', speciesData);
          setSpecies(speciesData);
        } else {
          console.error('Failed to fetch species');
        }
      } catch (error) {
        console.error('Error fetching species:', error);
      } finally {
        setSpeciesLoading(false);
      }
    };

    fetchSpecies();
  }, []);

  // Fetch breeds from database
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await fetch('http://localhost:3000/db/petBreeds');
        if (response.ok) {
          const breedsData = await response.json();
          console.log('Fetched breeds:', breedsData);
          setBreeds(breedsData);
        } else {
          console.error('Failed to fetch breeds');
        }
      } catch (error) {
        console.error('Error fetching breeds:', error);
      } finally {
        setBreedsLoading(false);
      }
    };

    fetchBreeds();
  }, []);

  // Fetch pet data when editing existing pet
  useEffect(() => {
    if (!isNewPet && id) {
      const fetchPet = async () => {
        try {
          const response = await fetch(`http://localhost:3000/pets/${id}`);
          if (response.ok) {
            const pet = await response.json();
            console.log('Fetched pet data:', pet);

            // Convert database fields to frontend format
            // Find the breed to get the species information
            const currentBreed = breeds.find(breed => breed.id === pet.pet_breed_id);
            const currentSpecies = currentBreed ? species.find(s => s.id === currentBreed.pet_species_id) : null;
            const speciesName = currentSpecies ? currentSpecies.species : "Dog";

            // Convert sex_id to sex
            let sex = "Male";
            if (pet.sex_id === 1) sex = "Male";
            else if (pet.sex_id === 2) sex = "Female";

            // Get the breed name from the current breed
            const breedName = currentBreed ? currentBreed.pet_breed : "";

            // Format birthday for date input (YYYY-MM-DD)
            let formattedBirthday = "";
            if (pet.birthday) {
              const date = new Date(pet.birthday);
              formattedBirthday = date.toISOString().split('T')[0];
            }

            setPetData({
              name: pet.name || "",
              species: speciesName,
              breed: breedName,
              birthday: formattedBirthday,
              sex: sex,
              description: pet.description || "",
              profile_picture: pet.profile_picture || null,
            });
          } else {
            console.error('Failed to fetch pet');
            alert('Failed to load pet data');
          }
        } catch (error) {
          console.error('Error fetching pet:', error);
          alert('Error loading pet data');
        } finally {
          setLoading(false);
        }
      };

      fetchPet();
    }
  }, [id, isNewPet, breeds, species]);

  const handleInputChange = (field, value) => {
    console.log(`Updating ${field} to:`, value);
    setPetData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // If species is changed, reset breed to empty and filter breeds
      if (field === 'species') {
        newData.breed = ""; // Reset breed when species changes
      }

      console.log("New petData:", newData);
      return newData;
    });
  };

  // Filter breeds based on selected species
  const getFilteredBreeds = () => {
    if (!petData.species || speciesLoading) {
      console.log('No species selected or still loading species, returning all breeds');
      return breeds;
    }

    // Find the selected species ID
    const selectedSpecies = species.find(spec => spec.species === petData.species);
    if (!selectedSpecies) {
      console.log('Species not found in species array:', petData.species);
      return breeds;
    }

    console.log('Selected species:', selectedSpecies);
    console.log('All breeds:', breeds);

    // Filter breeds by pet_species_id and sort alphabetically
    const filteredBreeds = breeds
      .filter(breed => breed.pet_species_id === selectedSpecies.id)
      .sort((a, b) => a.pet_breed.localeCompare(b.pet_breed));
    console.log('Filtered breeds for species', selectedSpecies.species, ':', filteredBreeds);

    return filteredBreeds;
  };

  const handleUpdate = async () => {
    // Debug: log current state
    console.log("Current petData:", petData);
    console.log("Name:", petData.name, "Species:", petData.species);

    // Basic validation
    if (!petData.name || !petData.species) {
      toast.error("Please fill in at least the name and species fields.");
      return;
    }

    // Find the species ID from the selected species name
    const selectedSpecies = species.find(spec => spec.species === petData.species);
    const speciesId = selectedSpecies ? selectedSpecies.id : null;

    // Find the breed ID from the selected breed name (use filtered breeds)
    const selectedBreed = getFilteredBreeds().find(breed => breed.pet_breed === petData.breed);
    const breedId = selectedBreed ? selectedBreed.id : null;

    // Prepare data for API (convert species and breed names to IDs)
    const apiData = {
      ...petData,
      species_id: speciesId,
      breed_id: breedId
    };

    try {
      if (isNewPet) {
        // Add new pet to database
        const response = await fetch('http://localhost:3000/pets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });

        if (response.ok) {
          const newPet = await response.json();
          console.log("New pet added successfully:", newPet);
          toast.success("Pet added successfully!");
          // Navigate back to manage pets page
          navigate('/manage-pets');
        } else {
          console.error("Failed to add pet");
          toast.error("Failed to add pet. Please try again.");
        }
      } else {
        // Update existing pet in database
        const response = await fetch(`http://localhost:3000/pets/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });

        if (response.ok) {
          console.log("Pet updated successfully:", apiData);
          toast.success("Pet updated successfully!");
          // Navigate back to manage pets page
          navigate('/manage-pets');
        } else {
          console.error("Failed to update pet");
          toast.error("Failed to update pet. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving pet:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (isNewPet) {
      return; // Don't delete if it's a new pet
    }

    // Confirm deletion
    const confirmed = window.confirm(`Are you sure you want to delete ${petData.name}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/pets/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log("Pet deleted successfully");
        toast.success(`${petData.name} has been deleted successfully.`);
        // Navigate back to manage pets page
        navigate('/manage-pets');
      } else {
        console.error("Failed to delete pet");
        toast.error("Failed to delete pet. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("An error occurred while deleting the pet. Please try again.");
    }
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
                className="text-red-500 text-xl focus:outline-none cursor-pointer hover:text-red-700 transition-colors"
              >
                <img
                  src="/src/assets/delete.svg"
                  alt="Delete"
                  className="w-6 h-6 filter-red-500"
                  style={{ filter: 'invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' }}
                />
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-6 py-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">Loading pet data...</div>
            </div>
          ) : (
            <>
              {/* Pet Profile Picture */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  {isNewPet ? (
                    <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-[#fcfaec] flex items-center justify-center">
                      <FaPlus className="text-gray-400 text-4xl" />
                    </div>
                  ) : (
                    <img
                      src={petData.profile_picture || "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=facearea&w=256&h=256&facepad=2"}
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
                  disabled={speciesLoading}
                >
                  <option value="">Select a species</option>
                  {species.map((spec) => (
                    <option key={spec.id} value={spec.species}>
                      {spec.species}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-3 text-[#355233] pointer-events-none" />
              </div>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                breed
              </label>
              <div className="relative">
                <select
                  value={petData.breed}
                  onChange={(e) => handleInputChange("breed", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355233] focus:border-transparent appearance-none bg-[#fcfaec]"
                  disabled={breedsLoading || speciesLoading}
                >
                  <option value="">Select a breed</option>
                  {getFilteredBreeds().map((breed) => (
                    <option key={breed.id} value={breed.pet_breed}>
                      {breed.pet_breed}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-3 text-[#355233] pointer-events-none" />
              </div>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                birthday
              </label>
              <input
                type="date"
                value={petData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
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
            </>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default EditPetProfile;
