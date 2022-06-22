import "./ChatApp.scss";
import { useState, useEffect, useReducer, useMemo, useRef } from "react";
import api from "./api";
import RoomList from "./RoomList";
import ChatList from "./ChatList";
import MemberList from "./MemberList";
import chatReducer, {
  connected,
  disconnected,
  setRooms,
  setChats,
  receiveData,
  initialState,
} from "./chatReducer";

export default function Chat() {
  const timeout = useRef();
  const [countDownSecond, setCountDownSecond] = useState(null);
  const countDown = (seconds, callback) => {
    setCountDownSecond(seconds);
    function tick() {
      timeout.current = setTimeout(() => {
        setCountDownSecond(--seconds);
        if (seconds === 0) {
          timeout.current = null;
          return callback();
        }
        tick();
      }, 1000);
    }
    tick();
  };
  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { isConnected, rooms, chats, users } = state;
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomMembers, setRoomMembers] = useState([]);

  const getRooms = async () => {
    const { data } = await api.getRooms();
    dispatch(setRooms(data));
  };

  useEffect(() => {
    let disconnect;
    async function connectChat() {
      await api.getUser();
      disconnect = await api.connectChat(
        () => dispatch(connected()),
        (params) => dispatch(receiveData(params)),
        () => {
          dispatch(disconnected());
          countDown(10, connectChat);
        }
      );
      await getRooms();
      api.subscribeRooms();
    }
    countDown(3, connectChat);
    return () => {
      if (disconnect) disconnect();
    };
  }, []);

  const getChats = async (roomId) => {
    const { data } = await api.getChats(roomId);
    dispatch(setChats(data));
  };

  const getRoomMembers = async (roomId) => {
    setRoomMembers(await api.getRoomMembers(roomId));
  };

  const sendMessage = (message) => {
    api.sendMessage(selectedRoom._id, message);
  };

  const uploadFile = (data) => {
    api.uploadFile(selectedRoom._id, data);
  };

  useEffect(() => {
    if (!selectedRoom) return;
    let unsubscribeChats;
    api.roomSeen(selectedRoom._id);
    getChats(selectedRoom._id).then(() => {
      unsubscribeChats = api.subscribeChats(selectedRoom._id);
    });
    getRoomMembers(selectedRoom._id);
    return () => {
      if (unsubscribeChats) unsubscribeChats();
    };
  }, [selectedRoom]);

  const roomArray = useMemo(() => {
    const data = Object.values(state.rooms);

    const publicRooms = data.filter(
      (room) => room.name === "Nutritionist Support" && !room.extra?.name
    );
    const organizationRooms = data
      .filter(
        (room) => room.name === "Nutritionist Support" && room.extra?.name
      )
      .map((room) => ({ ...room, name: room.extra.name }));
    const myPeerSupportRooms = data
      .filter(
        (room) => room.name === "Peer Support" && room.user.uid === api.userId
      )
      .map((room) => ({ ...room, name: "My Peer Support Group" }));
    const otherPeerSupportRooms = data
      .filter(
        (room) => room.name === "Peer Support" && room.user.uid !== api.userId
      )
      .map((room) => ({ ...room, name: `${room.user.name}'s Support Group` }));
    return publicRooms
      .concat(organizationRooms)
      .concat(myPeerSupportRooms)
      .concat(otherPeerSupportRooms);
  }, [rooms]);

  const chatsArray = useMemo(() => {
    return Object.values(chats).reduce((result, chat) => {
      const isMe = chat.uid === api.userId;
      if (!isMe && !chat.user) {
        const user = users[chat.uid];
        if (!user) return result;
        chat.user = user;
      }
      if (chat.type === "options") {
        chat.answer = chat.options?.find((opt) =>
          opt.uids.includes(api.userId)
        )?.name;
      }
      result.push({
        ...chat,
        isMe: chat.uid === api.userId,
        createdAt: new Date(chat.createdAt.$date).toLocaleString(),
      });
      return result;
    }, []);
  }, [chats, users]);

  if (!isConnected)
    return <div>Connecting to chat in {countDownSecond} seconds</div>;

  return (
    <div className="container">
      <RoomList rooms={roomArray} onSelect={(room) => setSelectedRoom(room)} />
      {selectedRoom && (
        <ChatList
          chats={chatsArray}
          onSend={sendMessage}
          onUpload={uploadFile}
          onAnswer={api.answerQuestion}
        />
      )}
      {selectedRoom && <MemberList members={roomMembers} />}
    </div>
  );
}
