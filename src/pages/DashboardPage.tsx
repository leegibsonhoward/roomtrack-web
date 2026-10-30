import { useEffect, useState } from "react";
import { Link } from "react-router";

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
  // Calculate summary totals from the rooms instead
  // of storing duplicate state.
  const totalRooms = rooms.length;

const completeRooms = rooms.filter(
  (room) => room.isComplete
).length;

const incompleteRooms = totalRooms - completeRooms;
  useEffect(() => {
    let ignore = false;

    async function loadRooms() {
      try {
        const response = await fetch("/rooms");

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
      }
    }

    void loadRooms();


    // Prevent an outdated request from updating state after unmounting.
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main>
      <h1>Dashboard</h1>

      {error && <p role="alert">{error}</p>}

      <section>
        <h2>Room Summary</h2>

        <p>Total Rooms: {totalRooms}</p>
        <p>Complete: {completeRooms}</p>
        <p>Needs Attention: {incompleteRooms}</p>
      </section>

      <h2>Rooms</h2>
      <ul>
  {rooms.map((room) => (
    <li key={room.id}>
      {/* Use the database ID for navigation, not the room number. */}
      <Link to={`/rooms/${room.id}`}>
        Room {room.number}
      </Link>
      {" — "}
      {room.isComplete ? "Complete" : "Needs Attention"}
    </li>
  ))}
</ul>
    </main>
  );
}

export default DashboardPage;