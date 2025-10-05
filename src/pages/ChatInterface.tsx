import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

export const ChatInterface = () => {
  const { orderId } = useParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [contactId, setContactId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (selectedOrder && contactId) {
      fetchMessages();
      
      const channel = supabase
        .channel('chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `order_id=eq.${selectedOrder.id}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedOrder, contactId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOrder = async () => {
    const { data } = await supabase
      .from('orders' as any)
      .select('*')
      .eq('id', orderId)
      .single();

    if (data) {
      setSelectedOrder(data);
      
      if (profile?.role === 'customer') {
        setContactId(data.driver_id);
      } else if (profile?.role === 'driver') {
        setContactId(data.customer_id);
      }
    }
  };

  const fetchMessages = async () => {
    if (!selectedOrder) return;

    const { data } = await supabase
      .from('chat_messages' as any)
      .select('*, sender:profiles!chat_messages_sender_id_fkey(full_name)')
      .eq('order_id', selectedOrder.id)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder || !contactId) return;

    const { error } = await supabase
      .from('chat_messages' as any)
      .insert({
        order_id: selectedOrder.id,
        sender_id: user?.id,
        receiver_id: contactId,
        message: newMessage.trim()
      } as any);

    if (error) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } else {
      setNewMessage('');
    }
  };

  if (!selectedOrder) {
    return (
      <Layout role={profile?.role}>
        <Card className="p-8 text-center text-gray-500">
          No active order selected
        </Card>
      </Layout>
    );
  }

  return (
    <Layout role={profile?.role}>
      <Card className="flex flex-col h-[600px]">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Order #{selectedOrder.id.slice(0, 8)}</h2>
          <p className="text-sm text-gray-600">
            {profile?.role === 'customer' ? 'Chat with your driver' : 'Chat with customer'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <p className="text-xs font-semibold mb-1">{msg.sender?.full_name || 'Unknown'}</p>
                <p>{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
            />
            <Button onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
};
