import { useState } from "react";

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