const normalizeLogs = (data) => {
  return data.map((obj) => {

    // normalize unit
    let unit = obj.unit || "";
    if (obj.beats_per_minute !== undefined || obj.breaths_per_minute !== undefined) {
      unit = "bpm";
    } else if (obj.duration_in_hours !== undefined) {
      unit = "hr";
    }

    // normalize subcategory
    let subcategory = obj.subcategory || obj.name || "Unknown";
    if (subcategory === "Respiratory Rate") {
      subcategory = "Resp. Rate";
    }
    if (subcategory === "Bodily Function") {
      subcategory = "Bodily Func.";
    }

    return {
      date: obj.log_date,
      subcategory,
      value:
        obj.weight ??
        obj.glucose_level ??
        obj.beats_per_minute ??
        obj.breaths_per_minute ??
        obj.dosage ??
        obj.duration_in_hours ??
        obj.name ?? // for symptoms & bodily functions
        (obj.note ? "note" : ""),
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