'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetch('/api/messages').then(r => r.json()).then(d => setConversations(d.data || []));
  }, [user, authLoading]);

  useEffect(() => {
    if (selectedUser) fetch(`/api/messages/${selectedUser}`).then(r => r.json()).then(d => setMessages(d.data || []));
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!selectedUser || !newMsg.trim()) return;
    await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ receiverId: selectedUser, content: newMsg }) });
    setNewMsg('');
    fetch(`/api/messages/${selectedUser}`).then(r => r.json()).then(d => setMessages(d.data || []));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="grid md:grid-cols-3 gap-6" style={{ height: '600px' }}>
        <Card className="overflow-hidden">
          <CardHeader className="p-3 border-b"><CardTitle className="text-sm">Conversations</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-y-auto" style={{ maxHeight: '540px' }}>
            {conversations.length > 0 ? conversations.map(msg => {
              const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
              return (
                <div key={otherId} className={`p-3 border-b cursor-pointer hover:bg-muted transition-colors ${selectedUser === otherId ? 'bg-emerald/5' : ''}`} onClick={() => setSelectedUser(otherId)}>
                  <p className="font-medium text-sm">{otherId === msg.senderId ? msg.sender?.fullName || 'User' : msg.receiver?.fullName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{msg.content}</p>
                </div>
              );
            }) : <p className="p-4 text-sm text-muted-foreground">No conversations yet</p>}
          </CardContent>
        </Card>
        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              <CardHeader className="p-3 border-b"><CardTitle className="text-sm">Chat</CardTitle></CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '480px' }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 text-sm ${msg.senderId === user?.id ? 'bg-emerald text-emerald-foreground' : 'bg-muted'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="p-3 border-t flex gap-2">
                <Input placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} />
                <Button onClick={sendMessage} size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center"><div className="text-center"><MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Select a conversation</p></div></div>
          )}
        </Card>
      </div>
    </div>
  );
}
