export default function Message({
  _id,
  message,
  user,
  type,
  url,
  filename,
  options,
  isMe,
  answer,
  createdAt,
  onAnswer,
}) {
  const position = isMe ? "right" : "left";
  return (
    <div className={`message message-${position}`}>
      <div>
        <label>{isMe ? "You" : user.name}</label>
        {type === "image" && <img src={url} />}
        {type === "document" && (
          <a href={url} target="_blank">
            {filename}
          </a>
        )}
        <p>{message}</p>
        {type === "options" &&
          (answer ? (
            <p>You answered: {answer}</p>
          ) : (
            <ul>
              {options.map((opt, i) => (
                <li className="option" key={i} onClick={() => onAnswer(_id, i)}>
                  {opt.name}
                </li>
              ))}
            </ul>
          ))}
        <small>{createdAt}</small>
      </div>
    </div>
  );
}
