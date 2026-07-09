"use client";

import { useEffect, useRef, useState } from "react";

import { getConnection } from "../../services/signalr";
import * as signalR from "@microsoft/signalr";

const connectionRef = useRef<signalR.HubConnection | null>(null);

interface User {
  id: string;
  userName: string;
  profilePictureUrl?: string | null;
}

interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
}

export default function MessagesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    async function connect() {
        if (!token) return;
        const connection = await getConnection(token);

        connectionRef.current = connection;
        connection.on("ReceiveMessage", (message) => {
            setMessages(old => [...old, message]);
        });

        connection.on("LoadHistory", history => {
            setMessages(history);
        });

    }
    connect();

  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter((u) =>
        u.userName.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  async function loadUsers() {
    try {
      const response = await fetch("http://localhost:5166/api/identity/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMessages(userId: string) {
    setLoadingMessages(true);

    try {
      const response = await fetch(
        `http://localhost:5166/api/chat/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function sendMessage() {
    if (!selectedUser) return;
    if (message.trim() === "") return;

    try {
      const response = await fetch(
        "http://localhost:5166/api/chat/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId: selectedUser.id,
            content: message,
          }),
        }
      );

      if (!response.ok) {
        console.error(await response.text());
        return;
      }

      setMessage("");

      await loadMessages(selectedUser.id);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl h-200 mx-auto bg-white rounded-xl shadow-md overflow-hidden flex">

        {/* LEFT PANEL */}

        <div className="w-80 border-r flex flex-col">

          <div className="bg-gray-100 p-6 border-b">
            <h1 className="text-3xl font-bold">
              Messages
            </h1>

            <p className="text-gray-500 mt-2">
              Start a conversation with anyone.
            </p>
          </div>

          <div className="p-4 border-b">

            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-[#2e386d]"
            />

          </div>

          <div className="flex-1 overflow-y-auto">

            {filteredUsers.map((user) => (

              <button
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  loadMessages(user.id);
                }}
                className={`w-full px-5 py-4 text-left hover:bg-gray-100 transition ${
                  selectedUser?.id === user.id
                    ? "bg-gray-100"
                    : ""
                }`}
              >

                <div className="flex items-center gap-4">

                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      className="w-12 h-12 rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#2e386d] text-white flex items-center justify-center font-bold text-lg">
                      {user.userName[0].toUpperCase()}
                    </div>
                  )}

                  <div>

                    <p className="font-semibold">
                      {user.userName}
                    </p>

                    <p className="text-sm text-gray-400">
                      Click to open chat
                    </p>

                  </div>

                </div>

              </button>

            ))}

          </div>

        </div>

        {/* RIGHT PANEL */}

        <div className="flex-1 flex flex-col bg-gray-50">

          {!selectedUser ? (

            <div className="flex-1 flex items-center justify-center">

              <div className="text-center">

                <div className="text-7xl mb-5">
                  💬
                </div>

                <h2 className="text-3xl font-bold">
                  Your Messages
                </h2>

                <p className="text-gray-500 mt-2">
                  Choose a user from the left to start chatting.
                </p>

              </div>

            </div>

          ) : (

            <>

              {/* HEADER */}

              <div className="bg-gray-100 border-b p-5 flex items-center gap-4">

                {selectedUser.profilePictureUrl ? (
                  <img
                    src={selectedUser.profilePictureUrl}
                    className="w-12 h-12 rounded-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#2e386d] text-white flex items-center justify-center font-bold">
                    {selectedUser.userName[0].toUpperCase()}
                  </div>
                )}

                <div>

                  <h2 className="font-bold text-xl">
                    {selectedUser.userName}
                  </h2>

                  <p className="text-green-600 text-sm">
                    Ready to chat
                  </p>

                </div>

              </div>

              {/* MESSAGES */}

              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {loadingMessages ? (

                  <div className="text-center text-gray-400">
                    Loading...
                  </div>

                ) : messages.length === 0 ? (

                  <div className="text-center text-gray-400 mt-20">

                    <div className="text-5xl mb-3">
                      👋
                    </div>

                    <p>
                      No messages yet.
                    </p>

                    <p className="text-sm mt-2">
                      Start the conversation!
                    </p>

                  </div>

                ) : (

                  messages.map((msg, index) => {

                    const received =
                      msg.senderId === selectedUser.id;

                    return (

                      <div
                        key={index}
                        className={`flex ${
                          received
                            ? "justify-start"
                            : "justify-end"
                        }`}
                      >

                        <div
                          className={`max-w-md px-5 py-3 rounded-2xl shadow ${
                            received
                              ? "bg-white"
                              : "bg-[#2e386d] text-white"
                          }`}
                        >

                          <p>{msg.content}</p>

                          <div className="text-xs opacity-60 mt-2">

                            {new Date(msg.sentAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}

                          </div>

                        </div>

                      </div>

                    );

                  })

                )}

              </div>

              {/* INPUT */}

              <div className="border-t bg-white p-5 flex gap-3">

                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder={`Message ${selectedUser.userName}...`}
                  className="flex-1 rounded-full border border-gray-300 px-6 py-3 outline-none focus:ring-2 focus:ring-[#2e386d]"
                />

                <button
                  onClick={sendMessage}
                  className="px-8 rounded-full bg-[#2e386d] text-white font-semibold hover:bg-[#b0dcde] hover:text-black transition-all duration-300"
                >
                  Send
                </button>

              </div>

            </>

          )}

        </div>

      </div>
    </div>
  );
}