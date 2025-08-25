import { useState } from "react";

// const validatePassword = () => {
//   const [error, setError] = useState("");
//   const checkPassword = useCallback((password, passwordCheck) => {
//     const passwordRegex = /^(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/;

//     if (passwordCheck && password !== passwordCheck) {
//       setError("Passwords do not match");
//       return false;
//     } else if (!passwordRegex.test(password)) {
//       setError(
//         "Password must be at least 6 characters long and include at least one special character and one number."
//       );
//       return false;
//     } else {
//       setError("");
//       return true;
//     }
//   }, []);

//   return { error, checkPassword };
// }

const validate = () => {
  const [errors, setErrors] = useState("");

  const validatePassword = (password, passwordCheck) => {
    if (passwordCheck && password !== passwordCheck) {
      setErrors((prev) => ({ ...prev, password: "Passwords do not match" }));
      return false;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setErrors((prev) => ({
        ...prev,
        password:
          "Password must be at least 6 characters long and include a number and special character."
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, password: "" }));
    return true;
  };

  const validateEmail = (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email address" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  return { validatePassword, validateEmail, errors };
}

export default validate;