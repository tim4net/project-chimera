const WebSocket = require('ws');

(async () => {
  try {
    const ws = new WebSocket('ws://localhost:9222');

    ws.on('open', () => {
      console.log('Connected to MCP server');
      ws.send(JSON.stringify({
        id: 1,
        method: 'Page.navigate',
        params: {
          url: 'http://localhost:3000',
        },
      }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data);
      if (message.method === 'Runtime.consoleAPICalled') {
        console.log('PAGE LOG:', message.params.args[0].value);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  } catch (error) {
    console.error(error);
  }
})();
