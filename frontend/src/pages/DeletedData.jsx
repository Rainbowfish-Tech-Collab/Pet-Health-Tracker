import MobileContainer from "../components/MobileContainer";
import TopElement from "../components/TopElement";
import MobileContent from "../components/MobileContent";
import '../App.css';
import LogMini from "../components/LogMini";
import { useMemo, useEffect, useState } from "react";
import normalizeLogs from "../utils/normalizeLogs";
import formatDate from "../utils/formatDate";
import Dropdown from "../components/Dropdown";

const DeletedData = () => {
  const [logs, setLogs] = useState([]);
  const [dropdown, setDropdown] = useState({});
  const [activeFilters, setActiveFilters] = useState({}); // applied when user presses "Apply Filters"
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 8;

  useEffect(() => {
    fetch("http://localhost:3000/db/1/logs")
      .then((res) => res.json())
      .then((data) => {
        const normalized = normalizeLogs(data);
        // keep server-sorted or ensure sorting here
        normalized.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLogs(normalized);
      });

    fetch("http://localhost:3000/db/logs/dropdown")
      .then((res) => res.json())
      .then((data) => setDropdown(data));
  }, []);

  // reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  console.log("logs", logs);
  const norm = (s) => String(s ?? "").toLowerCase().trim();

  // --- HELPERS: split key but preserve remainder (so "Resp. Rate" stays intact) ---
  function splitKeyPreserveRemainder(key) {
    if (!key) return [];
    const firstDot = key.indexOf('.');
    if (firstDot === -1) return [key];
    const secondDot = key.indexOf('.', firstDot + 1);
    if (secondDot === -1) {
      // only one dot found -> [top, remainder]
      return [key.slice(0, firstDot), key.slice(firstDot + 1)];
    }
    // two or more dots found -> [top, second, remainder]
    return [
      key.slice(0, firstDot),
      key.slice(firstDot + 1, secondDot),
      key.slice(secondDot + 1), // remainder (may contain dots)
    ];
  }

  // map lowercased dropdown segments to the normalized subcategory strings used in logs
  const segmentMap = {
    "respiratory rate": "Resp. Rate",
    "bodily function": "Bodily Func.",
    // add more mappings here if needed
  };

  // normalize a single segment (case-insensitive) -> returns mapped display string (not lowercased)
  function normalizeDropdownSegment(seg) {
    if (seg == null) return seg;
    const trimmed = String(seg).trim();
    const lower = trimmed.toLowerCase();
    return segmentMap[lower] ?? trimmed;
  }

  // produce normalized parts for the incoming key (preserves remainder for last part)
  function parseKeyNormalized(key) {
    const parts = splitKeyPreserveRemainder(key);
    // apply mapping only to the non-remainder parts; for remainder (index >=2) we map the whole remainder
    if (parts.length === 0) return parts;
    if (parts.length === 1) return [normalizeDropdownSegment(parts[0])];
    if (parts.length === 2) {
      return [normalizeDropdownSegment(parts[0]), normalizeDropdownSegment(parts[1])];
    }
    // 3 parts: top, second, remainder (map second and remainder)
    return [
      normalizeDropdownSegment(parts[0]),
      normalizeDropdownSegment(parts[1]),
      normalizeDropdownSegment(parts[2]),
    ];
  }

  // Returns true if the log matches the dropdown key
  function matchActiveKey(log, rawKey) {
    // parse and normalize the key segments
    const parts = parseKeyNormalized(rawKey);
    if (!parts || parts.length === 0) return false;

    // operate using case-insensitive normalized strings
    const top = norm(parts[0]); // e.g. "stat", "activity", "medication"
    const logType = norm(log.type);

    // top-level must match the log type (activity, symptom, medication, stat...)
    if (top !== logType) return false;

    // top-level only: show all of that type
    if (parts.length === 1) return true;

    // handle stat.fixed.X (promoted fixed values)
    if (norm(parts[1]) === "fixed") {
      if (parts.length < 3) return false;
      return norm(parts[2]) === norm(log.subcategory);
    }

    // now parts[1] is usually a subcategory or a unit/value
    const second = norm(parts[1] ?? "");
    const sub = norm(log.subcategory);
    const unit = norm(log.unit);
    const value = norm(String(log.value));

    // quick match: if second equals normalized subcategory
    if (second === sub) return true;

    // Special-case equivalences (keeps readability and explicitness)
    const equivalentSub =
      (second === "respiratory rate" && sub === "resp. rate") ||
      (second === "bodily function" && sub === "bodily func.");

    if (parts.length === 2) {
      return (
        second === sub ||
        equivalentSub ||
        second === unit ||
        second === value
      );
    }

    // parts.length >= 3: e.g., stat.Weight.kg OR medication.Antibiotic.capsule
    // for keys produced with a remainder, parts[2] may include dots and we preserved it above
    const third = norm(parts[2] ?? "");

    // require the subcategory to match the second part (or equivalent)
    if (!(second === sub || equivalentSub)) return false;

    // check third part vs unit or value
    return third === unit || third === value;
  }

  // build list of active keys (raw keys as sent from Dropdown)
  const activeKeys = useMemo(
    () => Object.keys(activeFilters).filter((k) => activeFilters[k]),
    [activeFilters]
  );

  // final filtered logs: if no active keys, show all
  const filteredLogs = useMemo(() => {
    if (activeKeys.length === 0) return logs;
    return logs.filter((log) => activeKeys.some((key) => matchActiveKey(log, key)));
  }, [logs, activeKeys]);

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage));

  const showTimestamps = JSON.parse(localStorage.getItem("showTimestamps")) ?? true;

  // debugging helpers (uncomment while testing)
//   useEffect(() => {
//     console.log("activeKeys:", activeKeys);
//     if (logs.length) console.log("sample log:", logs[0]);
//     console.log("filtered count:", filteredLogs.length);
//   }, [activeKeys, logs, filteredLogs]);

  return (
    <MobileContainer>
      <TopElement title="Deleted Data" />
      <MobileContent className="p-2 pt-2">
        <Dropdown data={dropdown} onFilter={setActiveFilters} />

        <hr className="my-4 border-gray-300" />

        {currentLogs.map((log) => {
          const { datePart, timePart } = formatDate(log.date);
          return (
            <LogMini
              key={log.id}
              date={showTimestamps ? `${datePart} - ${timePart}` : datePart}
              subcategory={log.subcategory}
              value={log.value}
              unit={log.unit}
              description={log.description}
            />
          );
        })}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </MobileContent>
    </MobileContainer>
  );
};

export default DeletedData;
