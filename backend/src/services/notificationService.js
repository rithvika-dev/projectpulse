const Notification = require('../models/Notification');

/**
 * Create a notification for a user or multiple users
 */
const createNotification = async ({
  recipient,
  sender,
  title,
  message,
  type = 'system',
  link = '',
}) => {
  try {
    // If recipient is self, skip notification
    if (sender && recipient && recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      link,
      read: false,
      createdAt: new Date(),
    });
    return notification;
  } catch (error) {
    console.error('[Notification Service Error] Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Bulk create notification for multiple recipients
 */
const notifyMany = async (recipients, { sender, title, message, type, link }) => {
  try {
    const notifications = recipients
      .filter((recId) => !sender || recId.toString() !== sender.toString())
      .map((recId) => ({
        recipient: recId,
        sender,
        title,
        message,
        type: type || 'system',
        link: link || '',
        read: false,
        createdAt: new Date(),
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('[Notification Service Error] Failed to bulk notify:', error.message);
  }
};

module.exports = { createNotification, notifyMany };
