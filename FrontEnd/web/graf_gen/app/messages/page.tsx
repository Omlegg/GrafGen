"use client";

import { useEffect, useRef, useState } from "react";
import { getConnection } from "../../services/signalr";
import * as signalR from "@microsoft/signalr";

// --- Components ---

/**
 * Sub-component to handle independent profile picture loading
 * Preserves your original Tailwind classes
 */
function UserAvatar({ profilePictureUrl, userName, token, className }: { 
  profilePictureUrl?: string | null, 
  userName: string, 
  token: string | null,
  className?: string 
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!profilePictureUrl) return;

    async function fetchPfp() {
      try {
        const response = await fetch(`http://localhost:5166/api/identity/profile-picture/${profilePictureUrl}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const blob = await response.blob();
          setSrc(URL.createObjectURL(blob));
        }
      } catch (err) {
        console.error("Failed to load PFP", err);
      }
    }
    fetchPfp();
  }, [profilePictureUrl, token]);
  

  if (src) {
    return <img src={src} className={className} alt="" />;
  }

  // Fallback for when there is no PFP
  return (
    <div className="w-12 h-12 rounded-full bg-[#2e386d] text-white flex items-center justify-center font-bold text-lg">
      {userName[0].toUpperCase()}
    </div>
  );
}

// --- Main Page ---

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
  const [token, setToken] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const selectedUserRef = useRef<User | null>(null);

  useEffect(() => {
  
    setToken(localStorage.getItem("accessToken"));
    loadUsers();
    if (!connectionRef.current) return;

    const connection = connectionRef.current;

    // This listener will now handle messages from YOU and the OTHER PERSON
    // as long as the server broadcasts them to the group.
    connection.on("ReceiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    connection.on("LoadHistory", (history: Message[]) => {
      setMessages(history);
    });

    return () => {
      connection.off("ReceiveMessage");
      connection.off("LoadHistory");
    };
  }, []);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // 3. Update your connection useEffect
    useEffect(() => {
    if (!token) return;
    
    async function connect() {
      const connection = await getConnection(token!);
      connectionRef.current = connection;
      
      // Just append the message when it arrives
      connection.on("ReceiveMessage", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
    }
    connect();
    
    return () => { connectionRef.current?.stop(); };
  }, [token]);

  useEffect(() => {
    setFilteredUsers(users.filter((u) => u.userName.toLowerCase().includes(search.toLowerCase())));
  }, [search, users]);

  async function loadUsers() {
    const t = localStorage.getItem("accessToken");
    try {
      const response = await fetch("http://localhost:5166/api/identity/users", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (err) { console.error(err); }
  }
  async function selectUser(user: User) {
  setSelectedUser(user);
    
    if (selectedUser) {
      await connectionRef.current?.invoke("LeaveChat", selectedUser.id);
    }
    
    await connectionRef.current?.invoke("JoinChat", user.id);
  }

  async function loadMessages(otherUserId: string) {
    setLoadingMessages(true);
    try {
      // 1. Fetch messages as before
      const response = await fetch(`http://localhost:5166/api/chat/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setMessages(await response.json());

      // 2. TELL SIGNALR TO JOIN THE ROOM
      // This assumes your Hub has a method called "JoinRoom"
      if (connectionRef.current) {
          await connectionRef.current.invoke("JoinRoom", otherUserId);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingMessages(false); }
  }

  async function sendMessage() {
    if (!selectedUser || message.trim() === "") return;
    
    try {
      const response = await fetch("http://localhost:5166/api/chat/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedUser.id, content: message }),
      });

      if (response.ok) {
        setMessage("");
        // Simply reload the message list to get the new state 
        // This is the most reliable way to ensure consistency
        await loadMessages(selectedUser.id);
      }
    } catch (err) { 
      console.error("Send failed", err); 
    }
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl h-200 mx-auto bg-white rounded-xl shadow-md overflow-hidden flex">
        {/* LEFT PANEL */}
        <div className="w-80 border-r flex flex-col">
          <div className="bg-gray-100 p-6 border-b">
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-gray-500 mt-2">Start a conversation with anyone.</p>
          </div>
          <div className="p-4 border-b">
            <input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-[#2e386d]" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((user) => (
              <button key={user.id} onClick={() => { setSelectedUser(user); loadMessages(user.id); }} className={`w-full px-5 py-4 text-left hover:bg-gray-100 transition ${selectedUser?.id === user.id ? "bg-gray-100" : ""}`}>
                <div className="flex items-center gap-4">
                  <UserAvatar profilePictureUrl={user.profilePictureUrl} userName={user.userName} token={token} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{user.userName}</p>
                    <p className="text-sm text-gray-400">Click to open chat</p>
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
                <div className="text-7xl mb-5">💬</div>
                <h2 className="text-3xl font-bold">Your Messages</h2>
                <p className="text-gray-500 mt-2">Choose a user from the left to start chatting.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gray-100 border-b p-5 flex items-center gap-4">
                <UserAvatar profilePictureUrl={selectedUser.profilePictureUrl} userName={selectedUser.userName} token={token} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h2 className="font-bold text-xl">{selectedUser.userName}</h2>
                  <p className="text-green-600 text-sm">Ready to chat</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (<div className="text-center text-gray-400">Loading...</div>) : 
                messages.length === 0 ? (<div className="text-center text-gray-400 mt-20">No messages yet.</div>) : 
                messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.senderId === selectedUser.id ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-md px-5 py-3 rounded-2xl shadow ${msg.senderId === selectedUser.id ? "bg-white" : "bg-[#2e386d] text-white"}`}>
                      <p>{msg.content}</p>
                      <div className="text-xs opacity-60 mt-2">
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t bg-white p-5 flex gap-3">
                <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} placeholder={`Message ${selectedUser.userName}...`} className="flex-1 rounded-full border border-gray-300 px-6 py-3 outline-none focus:ring-2 focus:ring-[#2e386d]" />
                <button onClick={sendMessage} className="px-8 rounded-full bg-[#2e386d] text-white font-semibold hover:bg-[#b0dcde] hover:text-black transition-all duration-300">Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}