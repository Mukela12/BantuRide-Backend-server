import Notification from '../models/Notification.js';

// Get all notifications
export const getAllNotifications = async (req, res) => {
    const { userId, driverId } = req.query;
    try {
        const filter = userId ? { userId } : { driverId };
        const notifications = await Notification.find(filter);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get unread notifications
export const getUnreadNotifications = async (req, res) => {
    const { userId, driverId } = req.query;
    try {
        const filter = userId ? { userId, read: false } : { driverId, read: false };
        const notifications = await Notification.find(filter);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get read notifications
export const getReadNotifications = async (req, res) => {
    const { userId, driverId } = req.query;
    try {
        const filter = userId ? { userId, read: true } : { driverId, read: true };
        const notifications = await Notification.find(filter);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    try {
        const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark notification as unread
export const markAsUnread = async (req, res) => {
    const { notificationId } = req.params;
    try {
        const notification = await Notification.findByIdAndUpdate(notificationId, { read: false }, { new: true });
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
