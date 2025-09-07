import MobileContainer from "../components/MobileContainer";
import TopElement from "../components/TopElement";
import '../App.css';
import LogMini from "../components/LogMini";
import { useEffect, useState } from "react";
import normalizeLogs from "../utils/normalizeLogs";
import formatDate from "../utils/formatDate";
const DeletedData = () => {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 8;

  useEffect(() => {
    fetch("http://localhost:3000/db/1/logs")
      .then((res) => res.json())
      .then((data) => {
        const normalized = normalizeLogs(data);
        setLogs(normalized);
      });
  }, []);

  // Calculate pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  return (
    <MobileContainer>
      <TopElement title="Deleted Data" />
      <div className="mt-15" />

      {currentLogs.map((log) => (
        <LogMini
          key={log.id}
          date={formatDate(log.date)}
          subcategory={log.subcategory}
          value={log.value}
          unit={log.unit}
          description={log.description}
        />
      ))}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </MobileContainer>
  );
};

export default DeletedData;

