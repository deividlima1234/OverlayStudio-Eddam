import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { db } from './db/index.js';
import { overlays } from './db/schema.js';
import { eq } from 'drizzle-orm';

const fastify = Fastify({ logger: true });

// Registrar CORS
fastify.register(cors, { origin: '*' });

// Registrar WebSocket
fastify.register(fastifyWebsocket);

// Registrar rutas
fastify.register(async function (fastify) {
  
  // ==========================================
  // WEBSOCKET (ROOMS)
  // ==========================================
  // Ahora manejamos las salas (rooms) por overlayId
  const rooms = new Map<string, Set<any>>();

  fastify.get('/ws/:overlayId', { websocket: true }, (connection: any, req: any) => {
    const socket = connection.socket || connection;
    const { overlayId } = req.params as { overlayId: string };
    
    console.log(`Cliente conectado a la sala: ${overlayId}`);
    
    if (!rooms.has(overlayId)) {
      rooms.set(overlayId, new Set());
    }
    rooms.get(overlayId)!.add(socket);

    socket.on('message', (message: any) => {
      console.log(`Mensaje en sala ${overlayId}:`, message.toString());
      
      const clients = rooms.get(overlayId);
      if (clients) {
        clients.forEach(client => {
          if (client.readyState === 1 && client !== socket) {
            client.send(message.toString());
          }
        });
      }
    });
    
    socket.on('close', () => {
      console.log(`Cliente desconectado de la sala: ${overlayId}`);
      const clients = rooms.get(overlayId);
      if (clients) {
        clients.delete(socket);
        if (clients.size === 0) {
          rooms.delete(overlayId); // Limpiar sala vacía
        }
      }
    });
  });

  // ==========================================
  // API REST (PERSISTENCIA)
  // ==========================================
  
  // Guardar/Actualizar Overlay
  fastify.post('/api/overlays/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { name, type, settings } = req.body as any;
    
    try {
      const existing = await db.select().from(overlays).where(eq(overlays.id, id));
      
      if (existing.length > 0) {
        await db.update(overlays).set({ name, type, settings, updatedAt: new Date() }).where(eq(overlays.id, id));
      } else {
        await db.insert(overlays).values({ id, name, type, settings });
      }
      return { success: true };
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Obtener Overlay
  fastify.get('/api/overlays/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    try {
      const result = await db.select().from(overlays).where(eq(overlays.id, id));
      if (result.length > 0) {
        return result[0];
      }
      reply.code(404).send({ error: 'Not found' });
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });
});

fastify.get('/', async () => {
  return { hello: 'Eddam Overlay Studio API v2 (Multi-Room & DB)' };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
