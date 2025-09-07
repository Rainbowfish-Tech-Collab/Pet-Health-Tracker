const LogMini = ({ date, subcategory, value, unit, description }) => {
  return (
    <div>
      {date} - {subcategory} - {value} {unit}{" "}
      {description && `- ${description}`}
    </div>
  );
};

export default LogMini;