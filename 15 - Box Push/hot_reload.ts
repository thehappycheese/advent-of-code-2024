export function createHotReloadMiddleware(watchPath: string, script_route = "/hmr.js", socket_route="/hmrws") {
    const clients = new Set<WebSocket>();
  
    // File watcher for HMR
    const watcher = Deno.watchFs(watchPath);
    const debounceTime = 100; // Debounce time in milliseconds
    let lastEventTime = 0;
  
    (async (clients) => {
      for await (const event of watcher) {
        const currentTime = Date.now();
  
        if (currentTime - lastEventTime < debounceTime) {
          continue; // Debounce the events
        }
  
        lastEventTime = currentTime;
  
        if (event.kind === "modify") {
          console.log("File modified:", event.paths);
          for (const client of clients) {
            client.send("reload");
          }
        }
      }
    })(clients);
  
    return async function hmrMiddleware(request: Request): Response | null {
      const { pathname } = new URL(request.url);
  
      // WebSocket connection
      if (pathname === socket_route) {
        const { socket, response } = Deno.upgradeWebSocket(request);
        socket.onopen = () => clients.add(socket);
        socket.onclose = () => clients.delete(socket);
        socket.onerror = () => clients.delete(socket);
        return response;
      }
  
      // HMR client script
      if (pathname === `${script_route}`) {
        return new Response(
          `const ws = new WebSocket("ws:/"+location.host+"${socket_route}");
          ws.onmessage = (event) => {
            if (event.data === "reload") {
              location.reload();
            }
          };`,
          {
            headers: { "content-type": "application/javascript" },
          }
        );
      }
  
      // Not handled by HMR
      return null;
    };
  }
  