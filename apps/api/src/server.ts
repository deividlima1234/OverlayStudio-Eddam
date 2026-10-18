import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors';
import bcrypt from 'bcryptjs';
import { db } from './db/index.js';
import { overlays, users, verificationCodes } from './db/schema.js';
import { eq, and, or, isNull, desc, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import { sendResetCodeEmail } from './mailer.js';

const fastify = Fastify({ 
  logger: true,
  bodyLimit: 15 * 1024 * 1024 // 15MB para soportar imágenes grandes
});

// Registrar CORS
fastify.register(cors, { 
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Registrar JWT para autenticación
const JWT_SECRET = process.env.JWT_SECRET || 'eddam-super-secret-overlay-studio-key-2026';
fastify.register(fastifyJwt, {
  secret: JWT_SECRET
});

// Registrar WebSocket
fastify.register(fastifyWebsocket);

// Registrar rutas
fastify.register(async function (fastify) {

  // Decorador para verificar autenticación de forma opcional o estricta
  const getAuthUser = async (req: any) => {
    try {
      await req.jwtVerify();
      return req.user as { id: string; email: string; name: string };
    } catch {
      return null;
    }
  };
  
  // ==========================================
  // AUTENTICACIÓN (LOGIN / REGISTRO / ME)
  // ==========================================

  // Registro de nuevo usuario
  fastify.post('/api/auth/register', async (req, reply) => {
    const { name, email, password } = req.body as any;

    if (!email || !password || !name) {
      return reply.code(400).send({ error: 'Nombre, correo y contraseña son obligatorios' });
    }

    try {
      // Verificar si el correo ya existe
      const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
      if (existingUser.length > 0) {
        return reply.code(409).send({ error: 'Ya existe una cuenta registrada con este correo electrónico' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = 'usr_' + crypto.randomUUID();
      const userAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;

      await db.insert(users).values({
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        avatar: userAvatar,
        createdAt: new Date(),
      });

      const token = fastify.jwt.sign({ 
        id: userId, 
        email: email.toLowerCase().trim(), 
        name: name.trim() 
      }, { expiresIn: '30d' });

      return {
        success: true,
        token,
        user: {
          id: userId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          avatar: userAvatar
        }
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Error al registrar usuario: ' + error.message });
    }
  });

  // Inicio de Sesión
  fastify.post('/api/auth/login', async (req, reply) => {
    const { email, password } = req.body as any;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Correo y contraseña son obligatorios' });
    }

    try {
      const userList = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
      if (userList.length === 0) {
        return reply.code(401).send({ error: 'Credenciales inválidas. Correo o contraseña incorrectos' });
      }

      const user = userList[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return reply.code(401).send({ error: 'Credenciales inválidas. Correo o contraseña incorrectos' });
      }

      const token = fastify.jwt.sign({ 
        id: user.id, 
        email: user.email, 
        name: user.name 
      }, { expiresIn: '30d' });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Error al iniciar sesión: ' + error.message });
    }
  });

  // Obtener perfil actual verificado
  fastify.get('/api/auth/me', async (req, reply) => {
    try {
      await req.jwtVerify();
      const authUser = req.user as any;
      const userList = await db.select().from(users).where(eq(users.id, authUser.id));
      if (userList.length === 0) {
        return reply.code(404).send({ error: 'Usuario no encontrado' });
      }
      const user = userList[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      };
    } catch {
      return reply.code(401).send({ error: 'Token no válido o expirado' });
    }
  });

  // 1. Solicitar código de recuperación de contraseña (6 dígitos)
  fastify.post('/api/auth/forgot-password', async (req, reply) => {
    const { email } = req.body as any;

    if (!email || typeof email !== 'string') {
      return reply.code(400).send({ error: 'Debes proporcionar un correo electrónico válido' });
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
      // Asegurar que la tabla verification_codes exista
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS verification_codes (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          code VARCHAR(10) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT false NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);

      // Buscar si el usuario existe
      const userList = await db.select().from(users).where(eq(users.email, cleanEmail));
      
      // Si no existe, devolvemos éxito para evitar enumeración maliciosa de cuentas
      if (userList.length === 0) {
        return {
          success: true,
          message: 'Si el correo está registrado, recibirás un código de verificación en breve.'
        };
      }

      const user = userList[0];

      // Generar código numérico aleatorio de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Invalidar códigos previos no usados para este correo
      await db.delete(verificationCodes).where(eq(verificationCodes.email, cleanEmail));

      // Guardar nuevo código
      await db.insert(verificationCodes).values({
        id: 'code_' + crypto.randomUUID(),
        email: cleanEmail,
        code,
        expiresAt,
        used: false,
        createdAt: new Date(),
      });

      // Enviar correo (o loguear en consola en desarrollo)
      await sendResetCodeEmail({
        to: cleanEmail,
        code,
        userName: user.name
      });

      return {
        success: true,
        message: 'Código de verificación enviado correctamente a tu correo.'
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Error al procesar la solicitud de recuperación: ' + error.message });
    }
  });

  // 2. Verificar código de 6 dígitos
  fastify.post('/api/auth/verify-code', async (req, reply) => {
    const { email, code } = req.body as any;

    if (!email || !code) {
      return reply.code(400).send({ error: 'Correo y código son obligatorios' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    try {
      const records = await db
        .select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.email, cleanEmail),
            eq(verificationCodes.code, cleanCode),
            eq(verificationCodes.used, false)
          )
        );

      if (records.length === 0) {
        return reply.code(400).send({ error: 'El código ingresado es incorrecto o no existe.' });
      }

      const codeRecord = records[0];

      if (new Date() > new Date(codeRecord.expiresAt)) {
        return reply.code(400).send({ error: 'El código ha expirado. Por favor solicita uno nuevo.' });
      }

      return {
        success: true,
        message: 'Código verificado correctamente.'
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Error al verificar el código: ' + error.message });
    }
  });

  // 3. Restablecer contraseña con código ya verificado
  fastify.post('/api/auth/reset-password', async (req, reply) => {
    const { email, code, newPassword } = req.body as any;

    if (!email || !code || !newPassword) {
      return reply.code(400).send({ error: 'Correo, código y nueva contraseña son obligatorios' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    if (newPassword.length < 6) {
      return reply.code(400).send({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    try {
      // Buscar código válido no usado
      const records = await db
        .select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.email, cleanEmail),
            eq(verificationCodes.code, cleanCode),
            eq(verificationCodes.used, false)
          )
        );

      if (records.length === 0) {
        return reply.code(400).send({ error: 'El código ingresado es incorrecto o no existe.' });
      }

      const codeRecord = records[0];

      if (new Date() > new Date(codeRecord.expiresAt)) {
        return reply.code(400).send({ error: 'El código ha expirado. Por favor solicita uno nuevo.' });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña del usuario
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.email, cleanEmail));

      // Marcar código como utilizado
      await db.update(verificationCodes)
        .set({ used: true })
        .where(eq(verificationCodes.id, codeRecord.id));

      return {
        success: true,
        message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.'
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Error al restablecer la contraseña: ' + error.message });
    }
  });

  
  // ==========================================
  // WEBSOCKET (ROOMS AISLADAS POR OVERLAY ID)
  // ==========================================
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
  // API REST: OVERLAYS CON AISLAMIENTO MULTI-TENANT
  // ==========================================
  
  // Guardar / Actualizar Overlay (Protegido por usuario)
  fastify.post('/api/overlays/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { name, type, settings } = req.body as any;
    const user = await getAuthUser(req);
    const userId = user ? user.id : null;

    try {
      const existing = await db.select().from(overlays).where(eq(overlays.id, id));
      
      if (existing.length > 0) {
        const currentOverlay = existing[0];
        
        // Verificación de propiedad: si el overlay tiene dueño y no coincide, prohibir edición
        if (currentOverlay.userId && userId && currentOverlay.userId !== userId) {
          return reply.code(403).send({ 
            error: 'Acceso Denegado: Este overlay pertenece a otro usuario y no puede ser modificado.' 
          });
        }

        const updateData: any = { settings, updatedAt: new Date() };
        if (name) updateData.name = name;
        if (type) updateData.type = type;
        // Si no tenía dueño asignado previamente, vincularlo al usuario actual
        if (!currentOverlay.userId && userId) {
          updateData.userId = userId;
        }

        await db.update(overlays).set(updateData).where(eq(overlays.id, id));
      } else {
        // Crear nuevo overlay asociado al usuario autenticado
        await db.insert(overlays).values({ 
          id, 
          userId,
          name: name || 'Proyecto Sin Nombre', 
          type: type || 'publicidad', 
          settings: settings || {} 
        });
      }
      return { success: true };
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Eliminar Overlay (Solo el dueño puede eliminarlo)
  fastify.delete('/api/overlays/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const user = await getAuthUser(req);
    const userId = user ? user.id : null;

    try {
      const existing = await db.select().from(overlays).where(eq(overlays.id, id));
      if (existing.length === 0) {
        return reply.code(404).send({ error: 'Overlay no encontrado' });
      }

      const currentOverlay = existing[0];
      if (currentOverlay.userId && userId && currentOverlay.userId !== userId) {
        return reply.code(403).send({ error: 'Acceso Denegado: No tienes permisos para eliminar este overlay' });
      }

      await db.delete(overlays).where(eq(overlays.id, id));
      return { success: true };
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Obtener Overlays (Filtrado estricto por usuario)
  fastify.get('/api/overlays', async (req, reply) => {
    const user = await getAuthUser(req);

    try {
      if (user) {
        // Devuelve únicamente los overlays del usuario logueado o overlays demo sin dueño
        const result = await db.select().from(overlays).where(
          or(eq(overlays.userId, user.id), isNull(overlays.userId))
        );
        return result;
      } else {
        // Para visitantes no logueados, solo mostrar overlays demo públicos
        const result = await db.select().from(overlays).where(isNull(overlays.userId));
        return result;
      }
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Obtener un Overlay específico (Permite a OBS leer la configuración del render de forma pública y segura)
  fastify.get('/api/overlays/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    try {
      const result = await db.select().from(overlays).where(eq(overlays.id, id));
      if (result.length > 0) {
        return result[0];
      }
      reply.code(404).send({ error: 'Overlay no encontrado' });
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });
});

fastify.get('/', async () => {
  return { 
    name: 'Eddam Overlay Studio API v3 (Multi-Tenant & JWT Auth)',
    status: 'online'
  };
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
