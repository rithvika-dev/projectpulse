const Activity = require('../models/Activity');

/**
 * Log activity in the database
 * @param {Object} data - Activity payload
 */
const logActivity = async ({
  actor,
  organization,
  project,
  action,
  entityType,
  entityId,
  description,
  metadata = {},
}) => {
  try {
    const activity = await Activity.create({
      actor,
      organization,
      project,
      action,
      entityType,
      entityId,
      description,
      metadata,
      timestamp: new Date(),
    });
    return activity;
  } catch (error) {
    console.error('[Activity Service Error] Failed to log activity:', error.message);
    // Non-blocking - don't crash main request
    return null;
  }
};

module.exports = { logActivity };
