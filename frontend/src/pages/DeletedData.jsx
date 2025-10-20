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

  // Returns true if the log matches the dropdown key.
  // Key format expected: top[.subcategory[.remainder]]
  // remainder may contain additional dots (we join any extra parts for comparison).
  function matchActiveKey(log, rawKey) {
    if (!rawKey) return false;
    const parts = String(rawKey).split(".");
    if (parts.length === 0) return false;

    const top = norm(parts[0]); // e.g. "stat", "activity", "medication"
    const logType = norm(log.type);
    if (top !== logType) return false; // top-level must match

    // top-only key -> match all of that type
    if (parts.length === 1) return true;

    // prepare normalized log fields
    const sub = norm(log.subcategory);
    const unit = norm(log.unit);
    const value = norm(String(log.value));

    const second = norm(parts[1] ?? "");

    // handle stat.fixed.X (promoted fixed values)
    if (second === "fixed") {
      if (parts.length < 3) return false;
      const remainder = parts.slice(2).join(".");
      return norm(remainder) === sub;
    }

    // if only two parts: match if second equals subcategory, unit, or value
    if (parts.length === 2) {
      return second === sub || second === unit || second === value;
    }

    // three-or-more parts: join remainder for third comparison
    const remainder = parts.slice(2).join(".");
    // require subcategory to match the second part, then check remainder against unit/value
    if (second !== sub) return false;
    const third = norm(remainder);
    return third === unit || third === value;
  }

  // build list of active keys (raw keys as sent from Dropdown)
  const activeKeys = useMemo(
    () => Object.keys(activeFilters).filter((k) => activeFilters[k]),
    [activeFilters]
  );

  // final filtered logs:
  // - if no active keys, show all
  // - keys grouped by top-level (e.g. "medication") are evaluated per-group
  //   * For medication: types and dosages are combined with the rules described in the UI:
  //       - top-only ("medication") => match all medication logs
  //       - types selected + dosages selected => require type match AND (any) dosage match
  //       - only types selected => require any type match
  //       - only dosages selected => require any dosage match
  //   * For non-medication groups fall back to: any selected key for that group matching the log is sufficient
  // - groups for different top-levels are ORed (a log matching its group's constraints is included)
  const filteredLogs = useMemo(() => {
    if (activeKeys.length === 0) return logs;

    // group keys by their top-level segment
    const groups = activeKeys.reduce((acc, key) => {
      const top = String(key).split(".")[0]?.toLowerCase() || key;
      acc[top] = acc[top] || [];
      acc[top].push(key);
      return acc;
    }, {});

    return logs.filter((log) => {
      const logTop = String(log.type ?? "").toLowerCase();
      const group = groups[logTop];
      if (!group) return false;

      // top-only selected (e.g. "medication") -> include all of that type
      if (group.some((k) => String(k).toLowerCase() === logTop)) return true;

      // Special handling for medication
      if (logTop === "medication") {
        // classify selected keys as "type keys" (their second segment equals the log.subcategory)
        // vs "dosage keys" (others). Use lowercase compare.
        const subNormalized = String(log.subcategory ?? "").toLowerCase().trim();

        const typeKeys = group.filter((k) => {
          const parts = String(k).split(".");
          return parts.length >= 2 && parts[1].toLowerCase().trim() === subNormalized;
        });
        const dosageKeys = group.filter((k) => {
          const parts = String(k).split(".");
          // dosage keys are those not classified as typeKeys (includes keys that match unit/value or other forms)
          return !(parts.length >= 2 && parts[1].toLowerCase().trim() === subNormalized);
        });

        // helper to test whether any key in an array matches this log
        const anyMatches = (keysArr) => keysArr.some((k) => matchActiveKey(log, k));

        if (typeKeys.length > 0 && dosageKeys.length > 0) {
          // require at least one matching type AND at least one matching dosage
          return anyMatches(typeKeys) && anyMatches(dosageKeys);
        }
        if (typeKeys.length > 0) {
          return anyMatches(typeKeys);
        }
        if (dosageKeys.length > 0) {
          return anyMatches(dosageKeys);
        }
        return false;
      }

      // Default behavior for other top-level groups:
      // include the log if any key in its group matches the log
      return group.some((key) => matchActiveKey(log, key));
    });
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
      <MobileContent className="p-2 h-auto">
        <Dropdown data={dropdown} onFilter={setActiveFilters} />

        <hr className="my-2 border-gray-300" />

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
        <div className="flex justify-center items-center gap-2 text-(--green01) font-bold my-7">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="material-symbols-rounded text-(--green01) rotate-180 cursor-pointer"
          >
            play_arrow
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="material-symbols-rounded text-(--green01) cursor-pointer"
          >
            play_arrow
          </button>
        </div>
      </MobileContent>
    </MobileContainer>
  );
};

export default DeletedData;
