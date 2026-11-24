import { EventEmitter } from 'events';
import { Request, Response } from 'express';
import { NotificationModel, NotificationType, NotificationDocument } from '../db/models/Notification.js';
import { connectToDatabase } from '../db/mongodb.js';

class NotificationEmitter extends EventEmitter {}
export const notificationEmitter = new NotificationEmitter();
// Increase limit for concurrent admin connections
notificationEmitter.setMaxListeners(50);

export interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: 'order' | 'product' | 'payment' | 'shipping' | 'refund';
  metadata?: Record<string, any>;
  dedupKey?: string;
  isDemo?: boolean;
}

/**
 * Creates and persists a genuine business notification, with strict deduplication
 * and real-time push to all connected admin SSE clients.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<NotificationDocument | null> {
  try {
    await connectToDatabase();

    // 1. Event Deduplication Check
    if (params.dedupKey) {
      const existing = await NotificationModel.findOne({ dedupKey: params.dedupKey });
      if (existing) {
        // Notification for this exact business event has already been recorded
        return existing;
      }
    }

    // 2. Persist in database
    const notification = await NotificationModel.create({
      type: params.type,
      title: params.title,
      message: params.message,
      entityId: params.entityId,
      entityType: params.entityType || 'order',
      metadata: params.metadata || {},
      dedupKey: params.dedupKey,
      isDemo: Boolean(params.isDemo),
      read: false,
    });

    // 3. Broadcast to all active admin SSE connections
    const broadcastPayload = {
      _id: notification._id.toString(),
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      subtitle: notification.message,
      message: notification.message,
      entityId: notification.entityId,
      entityType: notification.entityType,
      read: notification.read,
      readAt: notification.readAt,
      isDemo: notification.isDemo,
      createdAt: notification.createdAt,
    };
    notificationEmitter.emit('notification', broadcastPayload);

    // Also update unread count
    const unreadCount = await NotificationModel.countDocuments({ read: false });
    notificationEmitter.emit('unread_count', { unreadCount, count: unreadCount });

    return notification;
  } catch (err: any) {
    // If Mongo unique constraint collision on dedupKey (concurrency / retry burst)
    if (err?.code === 11000) {
      if (params.dedupKey) {
        return NotificationModel.findOne({ dedupKey: params.dedupKey });
      }
      return null;
    }
    console.error('[NotificationService Error]', err.message);
    return null;
  }
}

/**
 * Get paginated notifications and total unread count
 */
export async function getNotifications(params?: {
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
}) {
  await connectToDatabase();

  const limit = Math.min(params?.limit || 20, 50);
  const page = Math.max(params?.page || 1, 1);
  const filter: any = {};

  if (params?.unreadOnly) {
    filter.read = false;
  }

  const [notifications, unreadCount, total] = await Promise.all([
    NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    NotificationModel.countDocuments({ read: false }),
    NotificationModel.countDocuments(filter),
  ]);

  return {
    notifications: notifications.map((n) => ({
      id: (n._id as any).toString(),
      type: n.type,
      title: n.title,
      subtitle: n.message,
      message: n.message,
      entityId: n.entityId,
      entityType: n.entityType,
      read: n.read,
      readAt: n.readAt,
      isDemo: n.isDemo,
      createdAt: n.createdAt,
    })),
    unreadCount,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string) {
  await connectToDatabase();

  const updated = await NotificationModel.findByIdAndUpdate(
    id,
    { read: true, readAt: new Date() },
    { new: true }
  );

  const unreadCount = await NotificationModel.countDocuments({ read: false });
  notificationEmitter.emit('unread_count', { unreadCount });

  return { success: Boolean(updated), unreadCount };
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  await connectToDatabase();

  await NotificationModel.updateMany(
    { read: false },
    { read: true, readAt: new Date() }
  );

  notificationEmitter.emit('unread_count', { unreadCount: 0 });

  return { success: true, unreadCount: 0 };
}

/**
 * Real-time Server-Sent Events (SSE) stream handler for administrators.
 * Automatically pushes live events and unread counts, with 25s keep-alive ping.
 */
export async function handleNotificationStream(req: Request, res: Response) {
  await connectToDatabase();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial connected payload
  const initialUnread = await NotificationModel.countDocuments({ read: false });
  res.write(
    `event: init\ndata: ${JSON.stringify({
      status: 'connected',
      unreadCount: initialUnread,
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  // Listener for new notifications
  const onNotification = (data: any) => {
    res.write(`event: notification\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Listener for unread count changes
  const onUnreadCount = (data: any) => {
    res.write(`event: unread_count\ndata: ${JSON.stringify(data)}\n\n`);
    res.write(`event: count\ndata: ${JSON.stringify(data)}\n\n`);
  };

  notificationEmitter.on('notification', onNotification);
  notificationEmitter.on('unread_count', onUnreadCount);

  // Keep-alive heartbeat every 25 seconds
  const heartbeatTimer = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeatTimer);
    notificationEmitter.off('notification', onNotification);
    notificationEmitter.off('unread_count', onUnreadCount);
  });
}
