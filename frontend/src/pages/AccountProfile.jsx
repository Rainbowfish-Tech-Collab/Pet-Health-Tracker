import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import '../App.css';
import validate from '../components/validate.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

const Account = () => {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	// const [error, setError] = useState(null);
  const { validatePassword, validateEmail, errors } = validate();
  const pictureRef = useRef(null);
	const usernameRef = useRef(null);
	const emailRef = useRef(null);
  const navigate = useNavigate();
  
	useEffect(() => {
		fetch("http://localhost:3000/auth/status", {
			credentials: "include", //send cookies with the request
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data.user);
				setUser(data.user);
				setIsAuthenticated(data.isAuthenticated);
			});
	}, []);

	function handleChange(event) {
		const { id, value } = event.target;
		setUser((prevUser) => ({
			...prevUser,
			[id]: value,
		}));
		console.log(user);
	}

  function handleFileChange(event) {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      const maxSize = 500 * 1024 * 1024; // 500MB for both video and images
      if (file.size > maxSize) {
        alert(`File size too large. Please choose an image under 500MB.`);
        return;
      }
    }
  }

	function makeEditable(ref) {
		if (ref.current) {
			ref.current.readOnly = false; // make input editable
			ref.current.focus(); // focus the input
			ref.current.select(); // select all text
		}
	}

	// function validatePassword(password, passwordCheck) {
	// 	const passwordRegex = /^(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/;

	// 	if (passwordCheck && password !== passwordCheck) {
	// 		setError("Passwords do not match");
	// 		return false;
	// 	}

	// 	if (!passwordRegex.test(password)) {
	// 		setError(
	// 			"Password must be at least 6 characters long and include a number and special character."
	// 		);
	// 		return false;
	// 	}

	// 	return true;
	// }
	function handleSubmit(event) {
		event.preventDefault();

		if (user.password || user.passwordCheck) {
			const isValid = validatePassword(user.password, user.passwordCheck);
			if (!isValid) return; // stop if validation fails
		}

		setError(null); // reset error state

		fetch(`http://localhost:3000/users/${user.id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: user.username,
				email: user.email,
				profile_picture: user.profile_picture,
				password: user.password,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
			});
	}

  function handleDelete() {
    fetch(`http://localhost:3000/users/${user.id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setIsAuthenticated(false);
        setUser(null);
        fetch("http://localhost:3000/auth/logout", { method: "GET", credentials: "include" })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            navigate("/login");
          });
      });
  }

	if (!isAuthenticated) {
		return <div>Please log in first to view your account profile.</div>;
	}

	if (!user) {
		return <div>Loading...</div>;
	}

	return (
		<form id = "account-form" onSubmit={handleSubmit}>
			<div className="min-h-screen flex items-center justify-center bg-[#222]">
				<div className="bg-[#fcfaec] rounded-2xl shadow-lg p-6 sm:p-10 w-[350px] flex flex-col items-center border-8 border-[#222] text-left relative">
          <div className = "absolute top-0 flex justify-between w-full mb-6 p-2 px-4 pt-10 bg-[#FFF9DD] border-b border-gray-300 shadow-md shadow-gray-40">
            <span 
              className="material-symbols-outlined cursor-pointer p-1 text-[#355233] hover:text-[#99CC66] transition-colors"
              onClick={() => navigate(-1)}
            >
              arrow_back_ios
            </span>
            <h1 className="text-2xl text-[#355233] font-bold">Profile</h1>
            <span
              className="material-symbols-outlined cursor-pointer rounded-xl p-1 bg-[#EB5757] text-white hover:bg-[#F9A03B] transition-colors"
              onClick={handleDelete}
            >
              delete
            </span>
          </div>
					
          {/* Profile picture */}

          <div className="relative w-[150px] h-[150px] mb-4 mt-15">
            <img
              src={
                user.profile_picture ||
                "https://images.unsplash.com/photo-1543852786-1cf6624b9987?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2F0c3xlbnwwfHwwfHx8MA%3D%3D"
              }
              className="w-full h-full object-cover object-top rounded-full"
              alt="Profile Picture"
              id="pfp"
            />
            <input
              type="file"
              accept="image/*"
              ref = {pictureRef}
              className = "hidden"
              onChange={handleFileChange}
            />
            <span
              className="material-symbols-outlined cursor-pointer rounded-2xl p-1 bg-[#355233] text-white hover:bg-[#99CC66] transition-colors absolute bottom-2 right-2"
              onClick={() => pictureRef.current.click()}
            >
              photo_camera
            </span>
          </div>
					
          {/* Name */}
          {/* <input className = "m-2 text-center pointer-events-none" value={user.username} readOnly/> */}

					{/* username */}
					<label
						htmlFor="username"
						className="text-sm mb-1 block text-left w-full text-gray-500">
						username
					</label>
					<div className="flex items-center gap-2 mb-2 w-full">
						<input
							type="text"
							id="username"
							value={user.username}
							onChange={handleChange}
              onClick={() => makeEditable(usernameRef)}
							ref={usernameRef}
							readOnly
							className="bg-[#fffdf5] border border-black w-full px-3 py-2 rounded"
						/>
						<span
							className="material-symbols-outlined cursor-pointer rounded-xl p-0.75 bg-[#355233] text-white hover:bg-[#99CC66] transition-colors"
							onClick={() => makeEditable(usernameRef)}>
							edit
						</span>
					</div>

					{/* email */}
					<label
						htmlFor="email"
						className="text-sm mb-1 block text-left w-full text-gray-500">
						email
					</label>
					<div className="flex items-center gap-2 mb-4 w-full">
						<input
							type="email"
							id="email"
							value={user.email}
							onChange={handleChange}
							ref={emailRef}
							onClick={() => makeEditable(emailRef)}
							readOnly
							className="bg-[#fffdf5] border border-black w-full px-3 py-2 rounded"
						/>
						<span
							className="material-symbols-outlined cursor-pointer rounded-xl p-0.75 bg-[#355233] text-white hover:bg-[#99CC66] transition-colors"
							onClick={() => makeEditable(emailRef)}>
							edit
						</span>
					</div>

					{/* Password fields*/}
					<ErrorMessage message={errors.password} />
          
					<input
						type="password"
						id="password"
						placeholder="Password"
						onChange={handleChange}
						className="bg-[#fffdf5] border border-black w-full px-3 py-2 rounded mb-2"
					/>
					<input
						type="password"
						id="passwordCheck"
						placeholder="Confirm Password"
						onChange={handleChange}
						className="bg-[#fffdf5] border border-black w-full px-3 py-2 rounded mb-4"
					/>

					<button
						type="submit"
						className="w-full cursor-pointer bg-[#355233] text-white text-2xl font-semibold rounded py-2 mt-2 hover:bg-[#99CC66] transition-colors">
						Update
					</button>
				</div>
			</div>
		</form>
	);
};

export default Account;
