import Message from "./Message";
import Input from "./Input";

export default function ChatList({ chats, onSend, onUpload, onAnswer }) {
  return (
    <div className="flex-1">
      <h3>Chats</h3>
      <div className="chats-card">
        {chats.map((chat) => (
          <Message key={chat._id} {...chat} onAnswer={onAnswer} />
        ))}
      </div>
      <Input onSend={onSend} onUpload={onUpload} />
    </div>
  );
}
