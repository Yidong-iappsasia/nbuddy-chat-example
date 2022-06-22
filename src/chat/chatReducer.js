import api from "./api";

export const initialState = {
  isConnected: false,
  rooms: {},
  chats: {},
  users: {},
  roomMembers: {},
};

export default function chatReducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case "CONNECTED": {
      return { ...state, isConnected: true };
    }
    case "DISCONNECTED": {
      return initialState;
    }
    case "SET_ROOMS": {
      return { ...state, rooms: normalize(payload) };
    }
    case "SET_CHATS": {
      return { ...state, chats: normalize(payload) };
    }
    case "RECEIVE_ROOMS": {
      const room = { ...state.rooms[payload._id], ...payload };
      return { ...state, rooms: { ...state.rooms, [payload._id]: room } };
    }
    case "RECEIVE_CHATS": {
      const chat = { ...state.chats[payload._id], ...payload };
      return { ...state, chats: { ...state.chats, [payload._id]: chat } };
    }
    case "RECEIVE_USERS": {
      const user = { ...state.users[payload.uid], ...payload };
      return { ...state, users: { ...state.users, [payload.uid]: user } };
    }
    case "RECEIVE_ROOMMEMBERS": {
      const roomMember = { ...state.roomMembers[payload._id], ...payload };
      const newState = {
        ...state,
        roomMembers: { ...state.roomMembers, [payload._id]: roomMember },
      };
      if (roomMember && roomMember.uid === api.userId) {
        const room = newState.rooms[roomMember.roomId];
        if (room) room.unseenChats = roomMember.unseenChats;
      }
      return newState;
    }
    default:
      return state;
  }
}
export const connected = () => ({
  type: "CONNECTED",
});
export const disconnected = (payload) => ({
  type: "DISCONNECTED",
  payload,
});
export const setRooms = (payload) => ({
  type: "SET_ROOMS",
  payload,
});
export const setChats = (payload) => ({
  type: "SET_CHATS",
  payload,
});
export const receiveData = ({ collection, id, fields }) => ({
  type: `RECEIVE_${collection.toUpperCase()}`,
  payload: {
    _id: id,
    ...fields,
  },
});

function normalize(data) {
  return data.reduce((result, item) => {
    result[item._id] = item;
    return result;
  }, {});
}
