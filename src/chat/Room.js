export default function Room({ name, unseenChats, onClick }) {
  return (
    <div className="room" onClick={onClick}>
      {name}
      <small>
        {unseenChats ? `${unseenChats} new message` : "No new messages"}
      </small>
    </div>
  );
}
