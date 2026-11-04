/*
 * GENERADO por scripts/construir-cometa.mjs a partir del server.ts del zip de
 * AI Studio. No editar a mano: se sobrescribe en cada actualización.
 *
 * Las funciones de sala, el emparejamiento y el manejo de mensajes son las
 * mismas líneas de server.ts. Cambia solo:
 *   - ws.on('message'|'close') -> addEventListener (WebSocket de Workers)
 *   - la constante OPEN del WebSocket -> 1
 *   - la memoria del cielo va al almacenamiento del Durable Object
 *     (cargarMemoria / alPersistir), no a .data/sky-memory.json
 *   - el registro por sala se limita a las 60 salas más recientes
 *
 * El estado vive a nivel de módulo, como en server.ts. Es seguro porque hay un
 * único Durable Object (Mundo) que usa este módulo.
 */
const SERVER_KITE_PALETTE_HEX = [
  0xdf7866, // Coral
  0xd996a0, // Rosa empolvado
  0xebd07a, // Amarillo mantequilla
  0xae94c4, // Lavanda
  0x6dafb0, // Turquesa
  0x7daec9, // Azul cielo
  0x7bb094, // Verde jade
  0xe3945b, // Naranja cálido
];

function pickNextRoomKiteColor(recentHexes: number[]): number {
  const recentSet = new Set(recentHexes.slice(-3));
  const pool = SERVER_KITE_PALETTE_HEX.filter((c) => !recentSet.has(c));
  const list = pool.length > 0 ? pool : SERVER_KITE_PALETTE_HEX;
  return list[Math.floor(Math.random() * list.length)];
}

interface ServerParticipant {
  id: string;
  slot: number;
  type: 'human' | 'generated';
  joinedAt: number;
  lastSeen: number;
  lastTugMs: number;
  lastSeq: number;
  retiring?: boolean;
}

interface SkyKiteRecord {
  id: string;
  x: number;
  y: number;
  z: number;
  colorHex: number;
  participantsCount: number;
  createdAt: number;
}

interface AuthoritativeKiteState {
  pos: [number, number, number];
  vel: [number, number, number];
  pitch: number;
  roll: number;
  yaw: number;
  sustainedFlightSec: number;
  windPhaseOffset: number;
  timestamp: number;
  authorityId: string;
}

interface ServerEnvironmentalEvent {
  id: string;
  type:
    | 'NONE'
    | 'VIENTO_CRUZADO'
    | 'CORRIENTE_DESCENDENTE'
    | 'TURBULENCIA'
    | 'FRENTE_DE_LLUVIA'
    | 'CORRIENTE_ASCENDENTE';
  directionSign: number;
  startedAtMs: number;
  onsetDurationMs: number;
  transitionDurationMs: number;
  activeDurationMs: number;
  recoveryDurationMs: number;
  intensity: number;
}

interface WorldRoom {
  id: string;
  createdAt: number;
  updatedAt: number;
  participants: Map<string, ServerParticipant>;
  skyKites: SkyKiteRecord[];
  activeKiteColorHex: number;
  environmentalEvent: ServerEnvironmentalEvent | null;
  authorityClientId: string | null;
  kiteState: AuthoritativeKiteState;
  processedEventIds: Set<string>;
}

interface PersistedSkyStore {
  globalKites: SkyKiteRecord[];
  rooms: Record<string, SkyKiteRecord[]>;
}

const persistedSkyStore: PersistedSkyStore = {
  globalKites: [],
  rooms: {},
};


const MAX_SALAS_GUARDADAS = 60;
let persistir: (store: PersistedSkyStore) => void = () => {};

export function alPersistir(fn: (store: PersistedSkyStore) => void): void {
  persistir = fn;
}

export function cargarMemoria(parsed: Partial<PersistedSkyStore> | undefined): void {
  if (!parsed) return;
  if (Array.isArray(parsed.globalKites)) {
    persistedSkyStore.globalKites = parsed.globalKites.slice(-40);
  }
  if (parsed.rooms && typeof parsed.rooms === 'object') {
    persistedSkyStore.rooms = parsed.rooms;
  }
}

function savePersistedSkyMemory(roomId: string, roomKites: SkyKiteRecord[]): void {
  persistedSkyStore.rooms[roomId] = roomKites.slice(-40);
  const mergedById = new Map<string, SkyKiteRecord>();
  for (const k of persistedSkyStore.globalKites) mergedById.set(k.id, k);
  for (const k of roomKites) mergedById.set(k.id, k);
  persistedSkyStore.globalKites = Array.from(mergedById.values())
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-40);

  // Cada partida nueva abre una sala con nombre al azar: sin tope, el registro
  // crecería para siempre. Se conservan las salas con la cometa más reciente.
  const ultima = (ks: SkyKiteRecord[]) =>
    ks.reduce((m, k) => Math.max(m, k.createdAt || 0), 0);
  const ids = Object.keys(persistedSkyStore.rooms);
  if (ids.length > MAX_SALAS_GUARDADAS) {
    ids
      .sort((a, b) => ultima(persistedSkyStore.rooms[b]) - ultima(persistedSkyStore.rooms[a]))
      .slice(MAX_SALAS_GUARDADAS)
      .forEach((id) => delete persistedSkyStore.rooms[id]);
  }
  persistir(persistedSkyStore);
}

const rooms = new Map<string, WorldRoom>();
const clientSockets = new Map<string, { ws: WebSocket; worldId: string }>();

function createEmptyRoom(roomId: string): WorldRoom {
  const now = Date.now();
  const initialSkyKites = (
    persistedSkyStore.rooms[roomId] && persistedSkyStore.rooms[roomId].length > 0
      ? persistedSkyStore.rooms[roomId]
      : persistedSkyStore.globalKites
  ).map((k) => ({ ...k }));
  const recentColors = initialSkyKites.map((k) => k.colorHex);

  return {
    id: roomId,
    createdAt: now,
    updatedAt: now,
    participants: new Map(),
    skyKites: initialSkyKites,
    activeKiteColorHex: pickNextRoomKiteColor(recentColors),
    environmentalEvent: null,
    authorityClientId: null,
    kiteState: {
      pos: [0, 9.2, 1.5],
      vel: [0, 0, 0],
      pitch: 0.36,
      roll: 0,
      yaw: 0,
      sustainedFlightSec: 0,
      windPhaseOffset: 0,
      timestamp: now,
      authorityId: '',
    },
    processedEventIds: new Set(),
  };
}

function cleanStaleParticipants(room: WorldRoom, now: number) {
  for (const [pid, part] of room.participants.entries()) {
    if (part.type === 'human' && now - part.lastSeen > 12000) {
      room.participants.delete(pid);
    }
  }
  const activeHumans = Array.from(room.participants.values())
    .filter((p) => p.type === 'human')
    .sort((a, b) => a.slot - b.slot || a.joinedAt - b.joinedAt);

  if (activeHumans.length === 0) {
    room.authorityClientId = null;
  } else if (
    !room.authorityClientId ||
    !room.participants.has(room.authorityClientId) ||
    room.participants.get(room.authorityClientId)?.type !== 'human'
  ) {
    room.authorityClientId = activeHumans[0].id;
  }
}

function findAndJoinRoomAtomically(
  clientId: string,
  requestedWorldId?: string | null
): { room: WorldRoom; assignedSlot: number } {
  const now = Date.now();

  const tryAllocateInRoom = (room: WorldRoom): number => {
    cleanStaleParticipants(room, now);
    const existing = room.participants.get(clientId);
    if (existing && existing.type === 'human') {
      existing.lastSeen = now;
      return existing.slot;
    }

    const humanParticipants = Array.from(room.participants.values()).filter(
      (p) => p.type === 'human'
    );
    if (humanParticipants.length >= 4) {
      return -1;
    }

    if (humanParticipants.length >= 1) {
      for (const p of room.participants.values()) {
        if (p.type === 'generated') {
          p.retiring = true;
        }
      }
    }

    const occupiedHumanSlots = new Set(humanParticipants.map((p) => p.slot));
    let chosenSlot = -1;
    for (let s = 0; s < 4; s++) {
      if (!occupiedHumanSlots.has(s)) {
        chosenSlot = s;
        break;
      }
    }
    if (chosenSlot === -1) return -1;

    for (const [k, p] of room.participants.entries()) {
      if (p.type === 'generated' && p.slot === chosenSlot) {
        room.participants.delete(k);
      }
    }

    room.participants.set(clientId, {
      id: clientId,
      slot: chosenSlot,
      type: 'human',
      joinedAt: now,
      lastSeen: now,
      lastTugMs: 0,
      lastSeq: 0,
    });

    cleanStaleParticipants(room, now);
    room.updatedAt = now;
    return chosenSlot;
  };

  if (requestedWorldId) {
    let room = rooms.get(requestedWorldId);
    if (!room) {
      room = createEmptyRoom(requestedWorldId);
      rooms.set(requestedWorldId, room);
    }
    const slot = tryAllocateInRoom(room);
    if (slot !== -1) {
      return { room, assignedSlot: slot };
    }
  }

  for (const room of rooms.values()) {
    cleanStaleParticipants(room, now);
    const humanCount = Array.from(room.participants.values()).filter(
      (p) => p.type === 'human'
    ).length;
    if (humanCount > 0 && humanCount < 4) {
      const slot = tryAllocateInRoom(room);
      if (slot !== -1) {
        return { room, assignedSlot: slot };
      }
    }
  }

  const newRoomId = 'cielo_' + Math.random().toString(36).substring(2, 8);
  const newRoom = createEmptyRoom(newRoomId);
  rooms.set(newRoomId, newRoom);
  const slot = tryAllocateInRoom(newRoom);
  return { room: newRoom, assignedSlot: Math.max(0, slot) };
}

function serializeRoomState(room: WorldRoom) {
  const participantsObj: Record<string, ServerParticipant> = {};
  for (const [k, v] of room.participants.entries()) {
    participantsObj[k] = v;
  }
  return {
    worldId: room.id,
    authorityClientId: room.authorityClientId,
    activeKiteColorHex: room.activeKiteColorHex,
    environmentalEvent: room.environmentalEvent,
    participants: participantsObj,
    skyKites: room.skyKites,
    kiteState: room.kiteState,
    serverTime: Date.now(),
  };
}

function broadcastToRoom(
  worldId: string,
  payload: unknown,
  excludeClientId?: string
) {
  const raw = JSON.stringify(payload);
  for (const [cid, info] of clientSockets.entries()) {
    if (info.worldId === worldId && cid !== excludeClientId) {
      if (info.ws.readyState === 1 /* OPEN */) {
        info.ws.send(raw);
      }
    }
  }
}


export function estadoSalud() {
  return {
    status: 'ok',
    activeRooms: rooms.size,
    connectedClients: clientSockets.size,
  };
}

export function manejarConexion(ws: WebSocket): void {
    let boundClientId: string | null = null;
    let boundWorldId: string | null = null;

    ws.addEventListener('message', (ev: MessageEvent) => {
      const data = ev.data;
      try {
        const msg = JSON.parse(data.toString());
        const now = Date.now();

        if (msg.type === 'JOIN_WORLD') {
          const clientId = String(
            msg.clientId || 'p_' + Math.random().toString(36).slice(2, 9)
          );
          const requestedWorldId = msg.worldId ? String(msg.worldId) : null;

          const { room, assignedSlot } = findAndJoinRoomAtomically(
            clientId,
            requestedWorldId
          );
          boundClientId = clientId;
          boundWorldId = room.id;
          clientSockets.set(clientId, { ws, worldId: room.id });

          ws.send(
            JSON.stringify({
              type: 'WORLD_JOINED',
              assignedSlot,
              ...serializeRoomState(room),
            })
          );

          broadcastToRoom(
            room.id,
            {
              type: 'ROOM_STATE_SYNC',
              ...serializeRoomState(room),
            },
            clientId
          );
          return;
        }

        if (!boundWorldId || !boundClientId) return;
        const room = rooms.get(boundWorldId);
        if (!room) return;

        if (msg.type === 'TUG_EVENT') {
          const eventId = String(msg.eventId || `${boundClientId}_${now}`);
          if (room.processedEventIds.has(eventId)) return;
          room.processedEventIds.add(eventId);
          if (room.processedEventIds.size > 400) {
            const first = room.processedEventIds.values().next().value;
            if (first) room.processedEventIds.delete(first);
          }

          const part = room.participants.get(boundClientId);
          const slot =
            typeof msg.slot === 'number' ? msg.slot : part?.slot ?? 0;
          if (part) {
            part.lastSeen = now;
            part.lastTugMs = now;
            part.lastSeq = Math.max(part.lastSeq, Number(msg.seq || 0));
          }

          broadcastToRoom(
            room.id,
            {
              type: 'REMOTE_TUG_EVENT',
              eventId,
              seq: Number(msg.seq || 0),
              senderId: boundClientId,
              slot,
              windSwell: Number(msg.windSwell ?? 0.5),
              timestamp: now,
            },
            boundClientId
          );
          return;
        }

        if (msg.type === 'HEARTBEAT') {
          const part = room.participants.get(boundClientId);
          if (part) {
            part.lastSeen = now;
          }
          cleanStaleParticipants(room, now);

          for (const [k, p] of room.participants.entries()) {
            if (
              p.type === 'generated' &&
              p.retiring &&
              now - p.lastSeen > 2800
            ) {
              room.participants.delete(k);
            }
          }

          ws.send(
            JSON.stringify({
              type: 'ROOM_STATE_SYNC',
              ...serializeRoomState(room),
            })
          );
          return;
        }

        if (msg.type === 'SPAWN_GENERATED') {
          cleanStaleParticipants(room, now);
          const occupied = new Set(
            Array.from(room.participants.values()).map((p) => p.slot)
          );
          let freeSlot = -1;
          for (let s = 0; s < 4; s++) {
            if (!occupied.has(s)) {
              freeSlot = s;
              break;
            }
          }
          if (freeSlot !== -1) {
            const genId = `wind_spirit_${freeSlot}`;
            room.participants.set(genId, {
              id: genId,
              slot: freeSlot,
              type: 'generated',
              joinedAt: now,
              lastSeen: now,
              lastTugMs: 0,
              lastSeq: 0,
              retiring: false,
            });
            broadcastToRoom(room.id, {
              type: 'ROOM_STATE_SYNC',
              ...serializeRoomState(room),
            });
          }
          return;
        }

        if (msg.type === 'KITE_AUTHORITY_STATE') {
          if (room.authorityClientId === boundClientId && msg.kiteState) {
            room.kiteState = {
              pos: msg.kiteState.pos || [0, 9.2, 1.5],
              vel: msg.kiteState.vel || [0, 0, 0],
              pitch: Number(msg.kiteState.pitch ?? 0.36),
              roll: Number(msg.kiteState.roll ?? 0),
              yaw: Number(msg.kiteState.yaw ?? 0),
              sustainedFlightSec: Number(
                msg.kiteState.sustainedFlightSec ?? 0
              ),
              windPhaseOffset: Number(msg.kiteState.windPhaseOffset ?? 0),
              timestamp: now,
              authorityId: boundClientId,
            };
            broadcastToRoom(
              room.id,
              {
                type: 'KITE_AUTHORITY_UPDATE',
                kiteState: room.kiteState,
              },
              boundClientId
            );
          }
          return;
        }

        if (msg.type === 'SET_ENVIRONMENTAL_EVENT') {
          if (msg.event) {
            room.environmentalEvent = msg.event as ServerEnvironmentalEvent;
          } else {
            room.environmentalEvent = null;
          }
          broadcastToRoom(room.id, {
            type: 'ENVIRONMENTAL_EVENT_SYNC',
            environmentalEvent: room.environmentalEvent,
          });
          return;
        }

        if (msg.type === 'SET_KITE_COLOR') {
          const nextHex = Number(msg.colorHex);
          if (SERVER_KITE_PALETTE_HEX.includes(nextHex)) {
            room.activeKiteColorHex = nextHex;
          } else {
            const recent = room.skyKites.map((k) => k.colorHex);
            room.activeKiteColorHex = pickNextRoomKiteColor([
              ...recent,
              room.activeKiteColorHex,
            ]);
          }
          broadcastToRoom(room.id, {
            type: 'KITE_COLOR_SYNC',
            activeKiteColorHex: room.activeKiteColorHex,
          });
          return;
        }

        if (msg.type === 'SAVE_SKY_KITE' && msg.kite) {
          const kite: SkyKiteRecord = {
            ...msg.kite,
            colorHex: room.activeKiteColorHex,
          };
          if (!room.skyKites.some((k) => k.id === kite.id)) {
            room.skyKites.push(kite);
            if (room.skyKites.length > 40) {
              room.skyKites.shift();
            }
            savePersistedSkyMemory(room.id, room.skyKites);

            // Select next flight's random kite color avoiding recent colors
            const recentColors = room.skyKites.map((k) => k.colorHex);
            room.activeKiteColorHex = pickNextRoomKiteColor(recentColors);

            broadcastToRoom(room.id, {
              type: 'SKY_KITE_ADDED',
              kite,
              skyKites: room.skyKites,
              nextKiteColorHex: room.activeKiteColorHex,
            });
          }
          return;
        }
      } catch (_err) {
        // Ignore malformed packets
      }
    });

    ws.addEventListener('close', () => {
      if (boundClientId) {
        clientSockets.delete(boundClientId);
      }
      if (boundWorldId && boundClientId) {
        const room = rooms.get(boundWorldId);
        if (room) {
          room.participants.delete(boundClientId);
          cleanStaleParticipants(room, Date.now());
          broadcastToRoom(room.id, {
            type: 'ROOM_STATE_SYNC',
            ...serializeRoomState(room),
          });
        }
      }
    });
}
