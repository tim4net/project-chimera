/**
 * WebSocket Test Component
 *
 * Simple component to test WebSocket connection and basic functionality.
 * Can be removed after WebSocket integration is complete.
 */

import { useEffect, useState } from 'react';
import { useWebSocket, ServerEvents, ConnectionStatus } from '../hooks/useWebSocket';

export function WebSocketTest() {
  const [messages, setMessages] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState('');

  const ws = useWebSocket({
    autoConnect: true,
    autoAuthenticate: false,
    onConnect: () => {
      addMessage('Connected to WebSocket server');
    },
    onDisconnect: (reason) => {
      addMessage(`Disconnected: ${reason}`);
    },
    onError: (error) => {
      addMessage(`Error: ${error}`);
    },
  });

  const addMessage = (msg: string) => {
    setMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    // Listen for server messages
    ws.on(ServerEvents.CONNECTED, (data: any) => {
      addMessage(`Server says: ${data.message}`);
    });

    ws.on(ServerEvents.DM_MESSAGE, (data: any) => {
      addMessage(`DM: ${data.message}`);
    });

    ws.on(ServerEvents.ERROR, (data: any) => {
      addMessage(`Server error: ${data.error}`);
    });

    return () => {
      ws.off(ServerEvents.CONNECTED, () => {});
      ws.off(ServerEvents.DM_MESSAGE, () => {});
      ws.off(ServerEvents.ERROR, () => {});
    };
  }, [ws]);

  const handleSendMessage = () => {
    if (!testMessage.trim()) return;

    ws.sendChatMessage('test-character-id', testMessage);
    addMessage(`Sent: ${testMessage}`);
    setTestMessage('');
  };

  const getStatusColor = () => {
    switch (ws.status) {
      case ConnectionStatus.CONNECTED:
      case ConnectionStatus.AUTHENTICATED:
        return 'text-green-500';
      case ConnectionStatus.CONNECTING:
        return 'text-yellow-500';
      case ConnectionStatus.ERROR:
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">WebSocket Test Console</h2>

        {/* Status */}
        <div className="mb-4 p-3 bg-gray-700 rounded">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Connection Status:</span>
            <span className={`font-bold ${getStatusColor()}`}>
              {ws.status.toUpperCase()}
            </span>
          </div>
          {ws.socket && (
            <div className="text-sm text-gray-400 mt-1">
              Socket ID: {ws.socket.id}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mb-4 space-y-2">
          <button
            onClick={() => ws.connect()}
            disabled={ws.isConnected}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Connect
          </button>
          <button
            onClick={() => ws.disconnect()}
            disabled={!ws.isConnected}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Disconnect
          </button>
        </div>

        {/* Message Input */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Enter test message..."
              disabled={!ws.isConnected}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 disabled:bg-gray-800"
            />
            <button
              onClick={handleSendMessage}
              disabled={!ws.isConnected || !testMessage.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="bg-gray-900 rounded p-4 h-64 overflow-y-auto">
          <div className="text-sm font-mono space-y-1">
            {messages.length === 0 ? (
              <div className="text-gray-500">No messages yet...</div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="text-gray-300">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clear Log */}
        <button
          onClick={() => setMessages([])}
          className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Log
        </button>
      </div>
    </div>
  );
}
