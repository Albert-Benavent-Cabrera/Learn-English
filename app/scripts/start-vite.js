const { createServer } = require('vite');

(async () => {
    const server = await createServer({
        configFile: './vite.config.ts',
        mode: 'development',
    });
    await server.listen();
    server.printUrls();
})();
