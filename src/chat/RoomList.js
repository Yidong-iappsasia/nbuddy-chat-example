import Room from "./Room";

export default function RoomList({ rooms, onSelect }) {
  return (
    <div>
      <h3>Rooms</h3>
      <div className="card">
        {rooms.map((room) => (
          <Room key={room._id} {...room} onClick={() => onSelect(room)} />
        ))}
      </div>
    </div>
  );
}
