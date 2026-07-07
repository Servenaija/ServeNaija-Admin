import { useState, useRef, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import Avatar from '../../components/UI/Avatar';
import Button from '../../components/UI/Button';
import { useApp } from '../../context/AppContext';
import type { Conversation, Message } from '../../types';
import {
  Send, Phone, Plus, Search, MessageSquare, Image, CheckCheck, Check,
} from 'lucide-react';

const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
const fmtConvDate = (d: string) => {
  const now = new Date();
  const date = new Date(d);
  const diff = now.getTime() - date.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
};

const ADMIN_ID = 'admin';

export default function ChatPage() {
  const { conversations, setConversations, messages, setMessages, providers, customers } = useApp();
  const [activeConvId, setActiveConvId] = useState<string | null>(conversations[0]?.id ?? null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeMessages = activeConvId ? (messages[activeConvId] ?? []) : [];

  const filteredConvs = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.participants.some((p) => p.name.toLowerCase().includes(q));
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, activeMessages.length]);

  const getOtherParticipant = (conv: Conversation) =>
    conv.participants.find((p) => p.userId !== ADMIN_ID) ?? conv.participants[0];

  const handleSend = () => {
    if (!input.trim() || !activeConvId) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConvId,
      senderId: ADMIN_ID,
      senderType: 'admin',
      senderName: 'Admin',
      senderAvatar: null,
      text: input.trim(),
      imageUrl: null,
      type: 'text',
      readBy: [],
      deletedAt: null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] ?? []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              lastMessage: {
                text: input.trim(), imageUrl: null,
                senderId: ADMIN_ID, senderType: 'admin',
                timestamp: new Date().toISOString(),
              },
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
    setInput('');
  };

  const startNewConversation = (userId: string, userType: 'provider' | 'customer', userName: string) => {
    // Check if conversation already exists
    const existing = conversations.find((c) =>
      c.participants.some((p) => p.userId === userId) &&
      c.participants.some((p) => p.userId === ADMIN_ID)
    );
    if (existing) {
      setActiveConvId(existing.id);
      setShowNewChat(false);
      return;
    }

    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participants: [
        { userId: ADMIN_ID, actorType: 'admin', name: 'Admin', avatar: null },
        { userId, actorType: userType, name: userName, avatar: null },
      ],
      lastMessage: null,
      unreadCounts: {},
      bookingId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({ ...prev, [newConvId]: [] }));
    setActiveConvId(newConvId);
    setShowNewChat(false);
  };

  const allUsers = [
    ...providers.map((p) => ({ id: p.id, name: p.fullName, type: 'provider' as const, sub: p.service.category, phone: p.phoneNumber })),
    ...customers.map((c) => ({ id: c.id, name: c.fullName, type: 'customer' as const, sub: c.location.city || 'Customer', phone: c.phoneNumber })),
  ];

  return (
    <Layout title="Chat">
      <div className="flex h-[calc(100vh-130px)] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800 text-sm">Conversations</h2>
              <button
                onClick={() => setShowNewChat(!showNewChat)}
                className="p-1.5 rounded-lg bg-[#165B43] text-white hover:bg-[#0e3f2e] transition-colors"
                title="New conversation"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* New Chat User Search */}
            {showNewChat && (
              <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Start new conversation</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => startNewConversation(u.id, u.type, u.name)}
                      className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-white transition-colors text-left"
                    >
                      <Avatar name={u.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{u.name}</p>
                        <p className="text-[10px] text-gray-500">{u.sub} · {u.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#165B43]/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConvs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">No conversations</div>
            ) : (
              filteredConvs
                .slice()
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((conv) => {
                  const other = getOtherParticipant(conv);
                  const unread = conv.unreadCounts[ADMIN_ID] ?? 0;
                  const isActive = conv.id === activeConvId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`flex items-start gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${isActive ? 'bg-[#165B43]/5 border-l-2 border-l-[#165B43]' : ''}`}
                    >
                      <div className="relative">
                        <Avatar name={other.name} size="sm" />
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D6A643] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-semibold text-gray-800 truncate">{other.name}</p>
                          {conv.lastMessage && (
                            <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                              {fmtConvDate(conv.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">
                          {conv.lastMessage
                            ? `${conv.lastMessage.senderType === 'admin' ? 'You: ' : ''}${conv.lastMessage.text}`
                            : 'No messages yet'}
                        </p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 inline-block font-medium ${
                          other.actorType === 'provider' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {other.actorType}
                        </span>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeConv ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            {(() => {
              const other = getOtherParticipant(activeConv);
              const userDetail = other.actorType === 'provider'
                ? providers.find((p) => p.id === other.userId)
                : customers.find((c) => c.id === other.userId);
              const phone = userDetail?.phoneNumber;

              return (
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white">
                  <div className="flex items-center gap-3">
                    <Avatar name={other.name} size="md" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{other.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 capitalize">{other.actorType}</span>
                        {phone && (
                          <a href={`tel:${phone}`} className="text-xs text-[#165B43] font-mono hover:underline flex items-center gap-0.5">
                            <Phone size={9} />{phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {phone && (
                      <a href={`tel:${phone}`}>
                        <Button variant="secondary" size="sm" icon={<Phone size={14} />}>Call</Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
              {activeMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare size={40} className="mb-2 opacity-20" />
                  <p className="text-sm">No messages yet. Start the conversation.</p>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isAdmin = msg.senderId === ADMIN_ID;
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      {!isAdmin && (
                        <Avatar name={msg.senderName} size="sm" />
                      )}
                      <div className={`max-w-xs lg:max-w-md ml-2 mr-2 ${isAdmin ? 'order-first' : ''}`}>
                        {!isAdmin && (
                          <p className="text-[10px] text-gray-500 mb-1 ml-1">{msg.senderName}</p>
                        )}
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                          isAdmin
                            ? 'bg-[#165B43] text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                        }`}>
                          {msg.imageUrl ? (
                            <img src={msg.imageUrl} alt="attachment" className="rounded-lg max-w-full" />
                          ) : (
                            <p className="leading-relaxed">{msg.text}</p>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[10px] text-gray-400">{fmtTime(msg.createdAt)}</span>
                          {isAdmin && (
                            msg.readBy.length > 0
                              ? <CheckCheck size={11} className="text-[#D6A643]" />
                              : <Check size={11} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Image size={18} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#165B43]/20"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-xl bg-[#165B43] text-white hover:bg-[#0e3f2e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-3 opacity-20" />
            <p className="text-sm">Select a conversation to start chatting</p>
            <p className="text-xs mt-1">Or start a new chat with a provider or customer</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
