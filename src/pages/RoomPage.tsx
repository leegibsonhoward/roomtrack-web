import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

type Asset = {
  id: number;
  room_id: number;
  type: string;
  condition: "good" | "damaged" | "missing";
};

type MissingAsset = {
  type: string;
  required: number;
  actual: number;
  missing: number;
};

type Room = {
  id: number;
  number: number;
  assets: Asset[];
  isComplete: boolean;
  damagedAssets: Asset[];
  missingAssets: MissingAsset[];
};

type RoomResponse = {
  success: boolean;
  message: string;
  data: Room;
};

function RoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [condition, setCondition] = useState<Asset["condition"]>("good");
const [isSaving, setIsSaving] = useState(false);
const [saveError, setSaveError] = useState("");

  const selectedAsset = room?.assets.find(
  (asset) => asset.id === selectedAssetId
);
  useEffect(() => {
    let ignore = false;

    async function loadRoom() {
      try {
        const response = await fetch(`/rooms/${roomId}`);

        if (!response.ok) {
          throw new Error("Unable to retrieve room.");
        }

        const result: RoomResponse = await response.json();

        if (!ignore) {
          setRoom(result.data);
        }
      } catch {
        if (!ignore) {
          setError("Unable to load room.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadRoom();

    // Ignore an outdated response if the room changes or the page unmounts.
    return () => {
      ignore = true;
    };
  }, [roomId]);

  if (isLoading) {
    return <p>Loading room...</p>;
  }

  if (error || !room) {
    return <p role="alert">{error || "Room not found."}</p>;
  }

  async function handleSave() {
  if (!selectedAsset || isSaving) return;

  setIsSaving(true);
  setSaveError("");

  try {
    const response = await fetch(
      `/rooms/${roomId}/assets/${selectedAsset.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ condition }),
      }
    );

    if (!response.ok) {
      throw new Error("Unable to update asset.");
    }

    // Reload the room so asset conditions and completion status
    // reflect the backend's latest calculations.
    const roomResponse = await fetch(`/rooms/${roomId}`);

    if (!roomResponse.ok) {
      throw new Error("Unable to refresh room.");
    }

    const result: RoomResponse = await roomResponse.json();

    setRoom(result.data);
    setSelectedAssetId(null);
  } catch {
    setSaveError("Unable to save or refresh the asset. Please try again.");
  } finally {
    setIsSaving(false);
  }
}

  return (
    <main>
      <Link to="/dashboard">Back to Dashboard</Link>

      <h1>Room {room.number}</h1>

      <p>
        Status: {room.isComplete ? "Complete" : "Needs Attention"}
      </p>

      <h2>Assets</h2>

      <ul>
  {room.assets.map((asset) => (
    <li key={asset.id}>
      <button
        type="button"
        onClick={() => {
  setSelectedAssetId(asset.id);
  setCondition(asset.condition);
}}
      >
        {asset.type.replaceAll("_", " ")} — {asset.condition}
      </button>
    </li>
  ))}
</ul>
{selectedAsset && (
  <section>
    <h2>Edit {selectedAsset.type.replaceAll("_", " ")}</h2>
    <p>Current condition: {selectedAsset.condition}</p>
<div>
  <label htmlFor="condition">New condition</label>

  <select
    id="condition"
    value={condition}
    onChange={(event) =>
      setCondition(event.target.value as Asset["condition"])
    }
  >
    <option value="good">Good</option>
    <option value="damaged">Damaged</option>
    <option value="missing">Missing</option>
  </select>
</div>
<button
  type="button"
  onClick={handleSave}
  disabled={isSaving || condition === selectedAsset.condition}
>
  {isSaving ? "Saving..." : "Save"}
</button>

{saveError && <p role="alert">{saveError}</p>}
    <button
      type="button"
      onClick={() => setSelectedAssetId(null)}
    >
      Cancel
    </button>
  </section>
)}
    </main>
  );
}

export default RoomPage;