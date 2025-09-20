import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Phone, MapPin, Star } from 'lucide-react';
import { ChatMessage, Driver } from '@/types';

export const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: 'driver1',
      receiverId: 'customer1',
      message: "Hello! I'm Mike, your delivery driver. I'm heading to the restaurant now.",
      timestamp: new Date(Date.now() - 300000),
      type: 'driver'
    },
    {
      id: '2',
      senderId: 'customer1',
      receiverId: 'driver1',
      message: "Hi Mike! Thank you for the update. How long do you think it will take?",
      timestamp: new Date(Date.now() - 240000),
      type: 'user'
    },
    {
      id: '3',
      senderId: 'driver1',
      receiverId: 'customer1',
      message: "I should be there in about 15 minutes to pick up your order, then another 10 minutes to your location.",
      timestamp: new Date(Date.now() - 180000),
      type: 'driver'
    },
    {
      id: '4',
      senderId: 'customer1',
      receiverId: 'driver1',
      message: "Perfect! I'll be waiting. Thank you!",
      timestamp: new Date(Date.now() - 120000),
      type: 'user'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [currentUser] = useState<'user' | 'driver'>('user');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const driver: Driver = {
    id: 'driver1',
    name: 'Mike Johnson',
    phone: '+1987654321',
    rating: 4.8,
    isAvailable: true,
    currentLocation: { lat: 40.7128, lng: -74.0060 }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser === 'user' ? 'customer1' : 'driver1',
      receiverId: currentUser === 'user' ? 'driver1' : 'customer1',
      message: newMessage.trim(),
      timestamp: new Date(),
      type: currentUser
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout role="customer">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Driver Info Header */}
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {driver.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <CardTitle className="text-lg">{driver.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {driver.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {driver.phone}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="success">Online</Badge>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Track
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Chat with Driver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages Container */}
            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === currentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === currentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border shadow-sm'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.type === currentUser
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Messages */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Quick Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "I'm waiting outside",
                "Please call when you arrive",
                "Can you leave it at the door?",
                "Thank you for the delivery!"
              ].map((quickMessage, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewMessage(quickMessage)}
                  className="justify-start text-left"
                >
                  {quickMessage}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};