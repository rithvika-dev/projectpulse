// Role hierarchy and permissions
const ROLE_HIERARCHY = {
  organization_admin: 5,
  project_manager: 4,
  team_lead: 3,
  developer: 2,
  stakeholder: 1,
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource. Required roles: [${roles.join(', ')}]`,
        errors: ['Insufficient role permissions'],
      });
    }

    next();
  };
};

// Check if user is at least a specific role level
const authorizeMinLevel = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required',
      });
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Action requires at least '${minRole}' privileges.`,
        errors: ['Insufficient role level'],
      });
    }

    next();
  };
};

module.exports = {
  authorize,
  authorizeMinLevel,
  ROLE_HIERARCHY,
};
