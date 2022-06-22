import { useState, useRef } from "react";

export default function ChatInput({ onSend, onUpload }) {
  const fileRef = useRef();
  const [message, setMessage] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message) return;
    onSend(message);
    setMessage("");
  };
  const handleClickUpload = () => {
    fileRef.current.click();
  };
  const handleUpload = (e) => {
    const file = e.target.files[0];
    console.log(file, file.name.split(".").pop());
    // onUpload({
    //   name: file.name,
    //   ext: file.name.split(".").pop(),
    //   file,
    // });
  };
  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button type="submit">Send</button>
      <button type="button" onClick={handleClickUpload}>
        Upload
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf|image/*"
        style={{ display: "none" }}
        onChange={handleUpload}
      />
    </form>
  );
}
