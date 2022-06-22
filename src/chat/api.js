import { createClass } from "asteroid";

/**
 * Production: https://admin.nbuddy.info
 * Staging: https://admin.stag.nbuddy.info
 * Development: https://admin.dev.nbuddy.info
 */
const baseUrl = "https://admin.stag.nbuddy.info/api/v3";

const authToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2MjgxYjRiNDIyNjBhODZlODMwZGFlYzkiLCJpYXQiOjE2NTQyNjQwNDZ9.JN5i2sLVjvjpkA5952jgHh7adGTMt-rf9VrnA336Ajc";

const headers = {
  Accept: "application/json",
  Authorization: `Bearer ${authToken}`,
};

const getChatToken = async () => {
  const response = await fetch(`${baseUrl}/users/chat_token`, {
    headers,
  });
  return response.json();
};

const getSignedUrl = async ({ name, type, ext }) => {
  const response = await fetch(`${baseUrl}/s3/signurl`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, type, ext }),
  });
  return response.json();
};

/**
 * Production: wss://dreamtalk.io/websocket
 * Staging: wss://stag.dreamtalk.io/websocket
 * Development: wss://dev.dreamtalk.io/websocket
 */
const endpoint = "wss://stag.dreamtalk.io/websocket";

const Asteroid = createClass();
export const asteroid = new Asteroid({
  endpoint,
  autoConnect: false,
});

export default {
  userId: null,
  async getUser() {
    const response = await fetch(`${baseUrl}/users`, { headers });
    const { user_id } = await response.json();
    this.userId = user_id;
  },
  async connectChat(onConnected, onReceiveData, onDisconnected) {
    const { token } = await getChatToken();
    asteroid.connect();
    await asteroid.call("login", { resume: token });
    onConnected();
    asteroid.ddp.on("added", onReceiveData);
    asteroid.ddp.on("changed", onReceiveData);
    asteroid.ddp.on("disconnect", onDisconnected);
    return function disconnectChat() {
      asteroid.ddp.off("disconnect", onDisconnected);
      asteroid.ddp.off("added", onReceiveData);
      asteroid.ddp.off("changed", onReceiveData);
      asteroid.disconnect();
    };
  },
  async getRooms() {
    const response = await asteroid.call("rooms.list", { skip: 0, size: 50 });
    console.log("getRooms", response);
    return response;
  },
  async getChats(roomId) {
    const response = await asteroid.call("chats.list", {
      roomId,
      skip: 0,
      size: 50,
    });
    console.log("getChats", response);
    return response;
  },
  subscribeRooms() {
    return subscribe("rooms.all", {
      fromLastChatAt: new Date().valueOf(),
    });
  },
  subscribeChats(roomId) {
    return subscribe("chats.inRoom", {
      roomId,
      fromCreatedAt: new Date().valueOf(),
    });
  },
  roomSeen(id) {
    asteroid.call("rooms.seen", { id });
  },
  getRoomMembers(roomId) {
    return asteroid.call("roomMembers.inRoom", { roomId });
  },
  answerQuestion(id, option) {
    return asteroid.call("chats.selectOption", { id, option });
  },
  async sendMessage(roomId, message) {
    await asteroid.call("chats.insert", {
      roomId,
      message,
      key:
        new Date().valueOf() +
        roomId +
        this.userId +
        Math.random().toString(36).substring(7), // unique string
    });
    this.roomSeen(roomId);
  },
  async uploadFile(roomId, { file, ...params }) {
    const type = params.ext === "pdf" ? "Document" : "Image";
    const { url, signedRequest } = await getSignedUrl({
      ...params,
      type: "chat_image",
    });
    await fetch(signedRequest, { method: "PUT", body: file });
    asteroid.call(`chats.insert${type}`, {
      roomId,
      message: "",
      url,
    });
  },
};

function subscribe(type, params) {
  const sub = asteroid.subscribe(type, params);
  return function unsubscribe() {
    asteroid.unsubscribe(sub.id);
  };
}
