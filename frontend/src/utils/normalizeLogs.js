const normalizeLogs = (data) => {
  return data.map((obj) => {
    let unit = obj.unit || "";
    if (obj.beats_per_minute !== undefined || obj.breaths_per_minute !== undefined) {
      unit = "bpm";
    } else if (obj.duration_in_hours !== undefined) {
      unit = "hr";
    }
    return {
      date: obj.log_date,
      subcategory: obj.subcategory || obj.name || "Unknown",
      value:
        obj.weight ??
        obj.glucose_level ??
        obj.beats_per_minute ??
        obj.breaths_per_minute ??
        obj.dosage ??
        obj.duration_in_hours ??
        obj.name ?? // for symptoms & bodily functions
        obj.note ?? "",
      unit,
      description:
        obj.description ||
        obj.symptom_description ||
        obj.note ||
        "",
    };
  });
}

export default normalizeLogs;