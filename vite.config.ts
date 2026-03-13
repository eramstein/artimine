import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    svelte(),
    {
      name: 'save-card-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/save-card') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const newCard = JSON.parse(body);
                const filePath = path.resolve(__dirname, 'src/data/_all_cards.json');
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                let allCards = JSON.parse(fileContent);

                const existingIndex = allCards.findIndex((c: any) => c.id === newCard.id);
                if (existingIndex !== -1) {
                  allCards[existingIndex] = newCard;
                } else {
                  allCards.push(newCard);
                }

                // Sort cards by name
                allCards.sort((a: any, b: any) =>
                  (a.name || a.id).localeCompare(b.name || b.id)
                );

                fs.writeFileSync(filePath, JSON.stringify(allCards, null, 2), 'utf-8');

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (error) {
                console.error('Error saving card:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to save card' }));
              }
            });
          } else {
            next();
          }
        });
      },
    },
  ],
  base: command === 'serve' ? '/' : '/artimine/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
}));
