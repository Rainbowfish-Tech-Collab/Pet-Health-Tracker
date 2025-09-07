const formatDate = isoString => {
  if (!isoString) return "";

  const date = new Date(isoString);

  // Use browser locale (automatically picks user’s settings)
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",  // "Jan", "Feb"...
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default formatDate;