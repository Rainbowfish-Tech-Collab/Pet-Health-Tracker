const formatDate = isoString => {
  if (!isoString) return "";

  const date = new Date(isoString);

  // Use browser locale (automatically picks user’s settings)
  
  // Format date only
  const datePart = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  // Format time only
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  
  return { datePart, timePart }; 
}

export default formatDate;