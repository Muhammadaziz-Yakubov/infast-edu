import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Search, Users, User, MessageSquare } from 'lucide-react';
import { getChatRooms, getChatMessages, markRoomRead } from '../api/chat';

interface ChatRoom {
  _id: string;
  name: string;
  type: 'GROUP' | 'DIRECT';
  groupId: string | null;
  avatar: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  participantCount: number;
  unreadCount?: number;
}

interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  text: string;
  createdAt: string;
  readBy: string[];
}

export const Chat: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentRoomIdRef = useRef<string | null>(null);

  // 1. Fetch Chat Rooms on Mount
  useEffect(() => {
    fetchRooms();

    // Setup Socket Connection
    const token = localStorage.getItem('admin_access_token');
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:3000';

    const socket = io(`${socketUrl}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected to namespace /chat');
    });

    socket.on('new-message', (message: ChatMessage) => {
      // If it's for the currently active room, add to message list
      if (currentRoomIdRef.current === message.roomId) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        // Auto mark as read
        markRoomRead(message.roomId).catch(console.error);
        socket.emit('mark-read', { roomId: message.roomId });
      }

      // Update room list preview
      setRooms((prevRooms) =>
        prevRooms
          .map((room) => {
            if (room._id === message.roomId) {
              return {
                ...room,
                lastMessage: message.text,
                lastMessageAt: message.createdAt,
                unreadCount:
                  currentRoomIdRef.current === room._id
                    ? 0
                    : (room.unreadCount || 0) + 1,
              };
            }
            return room;
          })
          .sort((a, b) => {
            const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return dateB - dateA;
          })
      );
    });

    socket.on('room-updated', (data: any) => {
      // General update for last messages in rooms
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room._id === data.roomId) {
            return {
              ...room,
              lastMessage: data.lastMessage,
              lastMessageAt: data.lastMessageAt,
            };
          }
          return room;
        }).sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA;
        })
      );
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Update currentRoomIdRef when activeRoom changes
  useEffect(() => {
    currentRoomIdRef.current = activeRoom ? activeRoom._id : null;
    if (activeRoom) {
      fetchMessages(activeRoom._id);
      // Join Room inside WebSocket
      if (socketRef.current) {
        socketRef.current.emit('join-room', { roomId: activeRoom._id });
        socketRef.current.emit('mark-read', { roomId: activeRoom._id });
      }
      // Mark Read via REST API
      markRoomRead(activeRoom._id).catch(console.error);
      // Reset unread count locally
      setRooms((prev) =>
        prev.map((r) => (r._id === activeRoom._id ? { ...r, unreadCount: 0 } : r))
      );
    }
  }, [activeRoom]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      const data = await getChatRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      setLoadingMessages(true);
      const data = await getChatMessages(roomId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom || !socketRef.current) return;

    socketRef.current.emit('send-message', {
      roomId: activeRoom._id,
      text: inputText.trim(),
    });

    setInputText('');
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8.5rem)] rounded-xl border bg-card overflow-hidden">
      {/* Rooms Sidebar */}
      <div className="w-80 border-r flex flex-col bg-card shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold mb-3">Chatlar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-md bg-secondary border border-transparent focus:border-border outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {loadingRooms ? (
            <div className="flex justify-center items-center h-32">
              <span className="text-sm text-muted-foreground">Yuklanmoqda...</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Chatlar topilmadi
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = activeRoom?._id === room._id;
              return (
                <button
                  key={room._id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left p-4 transition-colors flex items-start gap-3 hover:bg-secondary/40 ${
                    isActive ? 'bg-secondary' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary font-bold text-primary shrink-0 relative">
                    {room.type === 'GROUP' ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    {room.unreadCount && room.unreadCount > 0 ? (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                        {room.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-semibold text-sm truncate">{room.name}</h3>
                      {room.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(room.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                       {room.lastMessage
                         ? room.lastMessage.startsWith('[image:')
                           ? '🖼️ Rasm'
                           : room.lastMessage.startsWith('[voice:')
                           ? '🎤 Ovozli xabar'
                           : room.lastMessage.startsWith('[sticker:')
                           ? '✨ Sticker'
                           : room.lastMessage
                         : 'Xabarlar yo\'q'
                       }
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-background/30">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-card select-none">
              <div>
                <h3 className="font-semibold text-base">{activeRoom.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  {activeRoom.type === 'GROUP' ? (
                    <>
                      <Users className="w-3 h-3" />
                      {activeRoom.participantCount} ta a'zo
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" />
                      Yakkama-yakka chat
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <span className="text-sm text-muted-foreground">Yuklanmoqda...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-muted-foreground gap-2">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
                  <span className="text-sm">Xabarlar yo'q. Birinchi bo'lib yozing!</span>
                </div>
              ) : (
                messages.map((message) => {
                  const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
                  const isCurrentAdmin = message.senderId === adminUser._id;
                  const text = message.text;

                  const isImage = text.startsWith('[image:') && text.endsWith(']');
                  const isVoice = text.startsWith('[voice:') && text.endsWith(']');
                  const isSticker = text.startsWith('[sticker:') && text.endsWith(']');

                  const timeStr = new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const renderContent = () => {
                    if (isImage) {
                      const uri = text.substring(7, text.length - 1);
                      return (
                        <div>
                          <img src={uri} alt="rasm" className="rounded-lg max-w-[240px] max-h-[180px] object-cover" />
                          <span className={`text-[9px] block text-right mt-1 ${isCurrentAdmin ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{timeStr}</span>
                        </div>
                      );
                    }
                    if (isSticker) {
                      const emoji = text.substring(9, text.length - 1);
                      return (
                        <div>
                          <span style={{ fontSize: 48 }}>{emoji}</span>
                          <span className="text-[9px] block text-muted-foreground mt-1">{timeStr}</span>
                        </div>
                      );
                    }
                    if (isVoice) {
                      const inner = text.substring(7, text.length - 1);
                      const firstColon = inner.indexOf(':');
                      const duration = firstColon !== -1 ? inner.substring(0, firstColon) : inner;
                      const voiceUri = firstColon !== -1 ? inner.substring(firstColon + 1) : '';
                      return (
                        <div className="flex items-center gap-3 min-w-[180px]">
                          {voiceUri ? (
                            <audio controls src={voiceUri} className="h-8" style={{ maxWidth: 180 }} />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>🎤</span>
                              <span className="text-sm">Ovozli xabar • {duration} soniya</span>
                            </div>
                          )}
                          <span className={`text-[9px] ${isCurrentAdmin ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{timeStr}</span>
                        </div>
                      );
                    }
                    return (
                      <div>
                        <p className="whitespace-pre-wrap break-words">{text}</p>
                        <span className={`text-[9px] block text-right mt-1 ${isCurrentAdmin ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{timeStr}</span>
                      </div>
                    );
                  };

                  return (
                    <div
                      key={message._id}
                      className={`flex flex-col ${isCurrentAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="max-w-[70%]">
                        {!isCurrentAdmin && (
                          <span className="text-[10px] text-muted-foreground ml-2 mb-1 block">
                            {message.senderName}
                          </span>
                        )}
                        <div
                          className={`rounded-lg px-4 py-2 text-sm ${
                            isSticker
                              ? 'bg-transparent p-0'
                              : isCurrentAdmin
                              ? 'bg-primary text-primary-foreground rounded-tr-none'
                              : 'bg-card text-card-foreground rounded-tl-none border'
                          }`}
                        >
                          {renderContent()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-card flex gap-3">
              <input
                type="text"
                placeholder="Xabar yozing..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2 rounded-md bg-secondary border border-transparent focus:border-border outline-none text-sm transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-muted-foreground gap-2">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 animate-bounce" />
            <p className="text-sm">Suhbatni boshlash uchun chapdan chatni tanlang</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
