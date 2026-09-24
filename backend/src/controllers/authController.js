const User = require('../models/User');
const Organization = require('../models/Organization');
const { logActivity } = require('../services/activityService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, organizationName, organizationId } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
        errors: ['Email is already registered'],
      });
    }

    let userRole = role || 'developer';
    let targetOrgId = organizationId;

    // If user provided an organization name or if no organization exists yet, create organization
    let organization;
    if (organizationName) {
      // Create user first with temporary org or role
      const user = new User({
        name,
        email: email.toLowerCase(),
        password,
        role: userRole,
      });

      organization = await Organization.create({
        name: organizationName,
        owner: user._id,
        members: [{ user: user._id, role: userRole, joinedAt: new Date() }],
      });

      user.organization = organization._id;
      await user.save();

      const token = user.getSignedJwtToken();

      await logActivity({
        actor: user._id,
        organization: organization._id,
        action: 'created_organization',
        entityType: 'Organization',
        entityId: organization._id,
        description: `${user.name} created organization "${organization.name}"`,
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Organization created.',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization: organization._id,
            organizationName: organization.name,
            title: user.title,
            avatar: user.avatar,
          },
        },
      });
    }

    // If joining an existing org or without org
    if (targetOrgId) {
      organization = await Organization.findById(targetOrgId);
    } else {
      // Find first existing organization if any
      organization = await Organization.findOne();
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      organization: organization ? organization._id : undefined,
    });

    if (organization) {
      organization.members.push({
        user: user._id,
        role: userRole,
        joinedAt: new Date(),
      });
      await organization.save();
    }

    const token = user.getSignedJwtToken();

    await logActivity({
      actor: user._id,
      organization: organization ? organization._id : undefined,
      action: 'joined_organization',
      entityType: 'User',
      entityId: user._id,
      description: `${user.name} registered and joined the workspace.`,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: organization ? organization._id : null,
          organizationName: organization ? organization.name : 'NovaWorks',
          title: user.title,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('organization', 'name industry logo');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errors: ['Invalid credentials'],
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errors: ['Invalid credentials'],
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact your administrator.',
        errors: ['Account deactivated'],
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful. Welcome to ProjectPulse.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization ? user.organization._id : null,
          organizationName: user.organization ? user.organization.name : 'NovaWorks',
          title: user.title,
          department: user.department,
          phone: user.phone,
          bio: user.bio,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('organization', 'name industry description members logo settings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          title: user.title,
          department: user.department,
          phone: user.phone,
          bio: user.bio,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, title, department, bio, avatar } = req.body;

    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (title !== undefined) fieldsToUpdate.title = title;
    if (department !== undefined) fieldsToUpdate.department = department;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).populate('organization', 'name industry');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          organization: updatedUser.organization,
          title: updatedUser.title,
          department: updatedUser.department,
          phone: updatedUser.phone,
          bio: updatedUser.bio,
          avatar: updatedUser.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match our records.',
        errors: ['Invalid current password'],
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Get all users (for assignment & team member lists)
// @route   GET /api/auth/users
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.user.organization) {
      filter.organization = req.user.organization;
    }

    const users = await User.find(filter)
      .select('name email role title department avatar')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
