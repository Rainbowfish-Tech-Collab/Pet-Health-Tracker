import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaChevronDown } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomNotification from "../components/CustomNotification.jsx";

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

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

  // Upload image directly to Cloudinary
  const uploadToCloudinary = async (file) => {
    try {
      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Please choose an image under 5MB.');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
      }

      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'pet_profiles'); // Cloudinary upload preset name
      // Temporarily remove folder to test
      // formData.append('folder', 'pet-profiles');

      // Debug: Log what we're sending
      console.log('Uploading to Cloudinary:');
      console.log('- File:', file.name, file.type, file.size);
      console.log('- Upload preset: pet_profiles');
      console.log('- Folder: pet-profiles');
      console.log('- Cloud name: dtlhmgfmv');

      // Upload directly to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dtlhmgfmv/image/upload`, // dtlhmgfmv is Cloudinary cloud name
        {
          method: 'POST',
          body: formData
        }
      );

      // Debug: Log response details
      console.log('Cloudinary response status:', response.status);
      console.log('Cloudinary response headers:', response.headers);

      if (!response.ok) {
        // Get the error details from Cloudinary
        const errorData = await response.json();
        console.error('Cloudinary error details:', errorData);
        throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      return data.secure_url; // Cloudinary URL
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Handle file selection and upload
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Show loading state
      setUploading(true);

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);

      // Update state with Cloudinary URL
      setPetData(prev => ({
        ...prev,
        profile_picture: cloudinaryUrl
      }));

      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
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

    try {
      // Send data to your backend (profile_picture is now a Cloudinary URL)
      const response = await fetch(
        isNewPet ? 'http://localhost:3000/pets' : `http://localhost:3000/pets/${id}`,
        {
          method: isNewPet ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: petData.name,
            species: petData.species,
            breed: petData.breed,
            birthday: petData.birthday,
            sex: petData.sex,
            description: petData.description,
            profile_picture: petData.profile_picture, // This is now a Cloudinary URL
            species_id: speciesId,
            breed_id: breedId
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(`${isNewPet ? 'New pet added' : 'Pet updated'} successfully:`, result);
        toast.success(`${isNewPet ? 'Pet added' : 'Pet updated'} successfully!`);
        // Navigate back to manage pets page
        navigate('/manage-pets');
      } else {
        console.error(`Failed to ${isNewPet ? 'add' : 'update'} pet`);
        toast.error(`Failed to ${isNewPet ? 'add' : 'update'} pet. Please try again.`);
      }
    } catch (error) {
      console.error("Error saving pet:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  function confirmDelete() {
    if (isNewPet) {
      return; // Don't delete if it's a new pet
    }

    toast.error(<CustomNotification /> , {
      position: "top-center",
      data: {
        title: "Delete Pet",
        content: (
          <>
            This will permanently delete {petData.name} and all associated data.<br />
            Are you sure?
          </>
        ),
        function: handleDelete,
        icon: "delete"
      },
      ariaLabel: `This will permanently delete ${petData.name} and all associated data. Are you sure?`,
      closeButton: false,
      autoClose: false,
      icon: false,
      theme: 'colored',
      style: {
        background: "#EB5757",
        color: "white"
      }
    });
  }

  const handleDelete = async () => {
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
              <span
                className="material-symbols-outlined cursor-pointer rounded-xl p-1 bg-[#EB5757] text-white hover:bg-[#f9713b] transition-colors"
                onClick={confirmDelete}
              >
                delete
              </span>
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
                  <div
                    className={`absolute bottom-2 right-2 bg-[#355233] text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white cursor-pointer hover:bg-[#2a4128] transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !uploading && fileInputRef.current.click()}
                  >
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaPlus size={12} />
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />

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
