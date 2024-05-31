import express from 'express';
import {
    getAllNotifications,
    getUnreadNotifications,
    getReadNotifications,
    markAsRead,
    markAsUnread
} from '../controllers/NotificationsController';

const router = express.Router();

// Define routes
router.get('/notifications/all', getAllNotifications);
router.get('/notifications/unread', getUnreadNotifications);
router.get('/notifications/read', getReadNotifications);
router.put('/notifications/read/:notificationId', markAsRead);
router.put('/notifications/unread/:notificationId', markAsUnread);

export default router;
