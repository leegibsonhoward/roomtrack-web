import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { useAuth } from "../auth/AuthContext";

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
  const { refreshAuth } = useAuth();

  const selectedAsset = room?.assets.find(
    asset => asset.id === selectedAssetId,
  );
  useEffect(() => {
    let ignore = false;

    async function loadRoom() {
      try {
        const response = await fetch(`/rooms/${roomId}`);

        if (response.status === 401) {
          // Recheck the session so ProtectedRoute can redirect to login.
          await refreshAuth();
          return;
        }

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
  }, [refreshAuth, roomId]);

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

    let saved = false;

    try {
      const response = await fetch(
        `/rooms/${roomId}/assets/${selectedAsset.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ condition }),
        },
      );

      if (response.status === 401) {
        await refreshAuth();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to update asset.");
      }

      // The asset is saved, even if the following refresh fails.
      saved = true;

      const roomResponse = await fetch(`/rooms/${roomId}`);

      if (roomResponse.status === 401) {
        await refreshAuth();
        return;
      }

      if (!roomResponse.ok) {
        throw new Error("Unable to refresh room.");
      }

      const result: RoomResponse = await roomResponse.json();

      setRoom(result.data);
      setSelectedAssetId(null);
    } catch {
      setSaveError(
        saved
          ? "Asset saved, but room details could not be refreshed. Reload the page."
          : "Unable to save asset. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }
  return (
    <main>
      <Link to="/dashboard">Back to Dashboard</Link>

      <header className="room-header">
        <h1>Room {room.number}</h1>

        <span
          className={`room-status ${
            room.isComplete ? "status-complete" : "status-attention"
          }`}
        >
          {room.isComplete ? "Complete" : "Needs Attention"}
        </span>
      </header>

      <h2>Assets</h2>

      <ul className="asset-list">
        {room.assets.map(asset => (
          <li key={asset.id}>
            <button
              aria-expanded={selectedAssetId === asset.id}
              aria-controls={`asset-editor-${asset.id}`}
              type="button"
              className="asset-button"
              onClick={() => {
                if (isSaving) return;

                // Tapping the selected asset closes its editor.
                if (selectedAssetId === asset.id) {
                  setSelectedAssetId(null);
                  return;
                }

                // Selecting another asset opens its editor with its current condition.
                setSelectedAssetId(asset.id);
                setCondition(asset.condition);
                setSaveError("");
              }}
            >
              <span>{asset.type.replaceAll("_", " ")}</span>

              <span className={`asset-condition condition-${asset.condition}`}>
                {asset.condition}
              </span>
            </button>

            {selectedAssetId === asset.id && selectedAsset && (
              <section id={`asset-editor-${asset.id}`} className="asset-editor">
                <h3>Edit {selectedAsset.type.replaceAll("_", " ")}</h3>

                <p>Current condition: {selectedAsset.condition}</p>

                <label htmlFor="condition">New condition</label>

                <select
                  id="condition"
                  value={condition}
                  onChange={event =>
                    setCondition(event.target.value as Asset["condition"])
                  }
                >
                  <option value="good">Good</option>
                  <option value="damaged">Damaged</option>
                  <option value="missing">Missing</option>
                </select>

                <div className="editor-actions">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || condition === selectedAsset.condition}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAssetId(null)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>

                {saveError && <p role="alert">{saveError}</p>}
              </section>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default RoomPage;
