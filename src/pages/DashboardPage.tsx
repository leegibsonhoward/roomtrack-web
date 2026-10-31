import { useEffect, useState } from "react";
import { Link } from "react-router";

import { useAuth } from "../auth/AuthContext";

type Room = {
  id: number;
  number: number;
  isComplete: boolean;
};

type RoomsResponse = {
  success: boolean;
  message: string;
  data: Room[];
};

function DashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { refreshAuth } = useAuth();

  // Calculate summary totals from the rooms instead
  // of storing duplicate state.
  const totalRooms = rooms.length;

  const completeRooms = rooms.filter(room => room.isComplete).length;

  const incompleteRooms = totalRooms - completeRooms;
  useEffect(() => {
    let ignore = false;

    async function loadRooms() {
      try {
        const response = await fetch("/api/rooms");

        if (response.status === 401) {
          // The session has expired; update shared authentication state.
          await refreshAuth();
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to retrieve rooms.");
        }

        const result: RoomsResponse = await response.json();

        if (!ignore) {
          setRooms(result.data);
        }
      } catch {
        if (!ignore) {
          setError("Unable to load rooms.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadRooms();

    // Prevent an outdated request from updating state after unmounting.
    return () => {
      ignore = true;
    };
  }, [refreshAuth]);

  return (
    <main>
      <h1>Dashboard</h1>

      {error && <p role="alert">{error}</p>}
      {isLoading && <p role="status">Loading rooms...</p>}
      {!isLoading && !error && (
        <>
          <section className="dashboard-summary">
            <h2>Room Summary</h2>

            <div className="summary-grid">
              <div className="summary-card">
                <span>Total Rooms</span>
                <strong>{totalRooms}</strong>
              </div>

              <div className="summary-card">
                <span>Complete</span>
                <strong>{completeRooms}</strong>
              </div>

              <div className="summary-card">
                <span>Needs Attention</span>
                <strong>{incompleteRooms}</strong>
              </div>
            </div>
          </section>

          <h2>Rooms</h2>

          <ul className="room-list">
            {rooms.map(room => (
              <li key={room.id}>
                <Link to={`/rooms/${room.id}`} className="room-link">
                  <span>Room {room.number}</span>

                  <span
                    className={`room-status ${
                      room.isComplete ? "status-complete" : "status-attention"
                    }`}
                  >
                    {room.isComplete ? "Complete" : "Needs Attention"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default DashboardPage;
