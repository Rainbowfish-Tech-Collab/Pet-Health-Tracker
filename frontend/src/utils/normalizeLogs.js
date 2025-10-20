const normalizeLogs = (data) => {
  return data.map((obj) => {

    // deduce type (used for filtering)
    let type = "other";
    if (obj.activity_type_id !== undefined || obj.duration_in_hours !== undefined) {
      type = "activity";
    } else if (obj.symptom_type_id !== undefined || obj.symptom_date !== undefined) {
      type = "symptom";
    } else if (obj.function_id !== undefined || obj.bodily_function_date !== undefined) {
      type = "bodily func.";
    } else if (obj.medication_type_id !== undefined || obj.medication_date !== undefined) {
      type = "medication";
    } else if (
      obj.stat_id !== undefined ||
      obj.weight !== undefined ||
      obj.glucose_level !== undefined ||
      obj.beats_per_minute !== undefined ||
      obj.breaths_per_minute !== undefined ||
      obj.other_stat_id !== undefined
    ) {
      type = "stat";
    }
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

    // normalize the value
    const value =
      obj.weight ??
      obj.glucose_level ??
      obj.beats_per_minute ??
      obj.breaths_per_minute ??
      obj.dosage ??
      obj.duration_in_hours ??
      obj.name ??
      (obj.note ? "note" : "");

    const description = obj.description || obj.symptom_description || obj.note || "";

    return {
      type,
      date: obj.log_date,
      subcategory,
      value,
      unit,
      description
    };
  });
}

export default normalizeLogs;