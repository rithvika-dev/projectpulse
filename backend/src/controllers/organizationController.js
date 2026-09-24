const Organization = require('../models/Organization');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

// @desc    Create an organization
// @route   POST /api/organizations
// @access  Private
exports.createOrganization = async (req, res, next) => {
  try {
    const { name, description, industry, settings } = req.body;

    const organization = await Organization.create({
      name,
      description,
      industry: industry || 'Technology & Software',
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: req.user.role || 'organization_admin',
          joinedAt: new Date(),
        },
      ],
      settings: settings || {},
    });

    // Update user's organization reference
    await User.findByIdAndUpdate(req.user.id, {
      organization: organization._id,
      role: 'organization_admin',
    });

    await logActivity({
      actor: req.user.id,
      organization: organization._id,
      action: 'created_organization',
      entityType: 'Organization',
      entityId: organization._id,
      description: `${req.user.name} established organization "${organization.name}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizations (for superadmin or current user's org)
// @route   GET /api/organizations
// @access  Private
exports.getOrganizations = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'organization_admin' && req.user.organization) {
      query._id = req.user.organization;
    }

    const organizations = await Organization.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email role title avatar');

    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single organization by ID
// @route   GET /api/organizations/:id
// @access  Private
exports.getOrganizationById = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('owner', 'name email avatar title')
      .populate('members.user', 'name email role title department avatar');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (Org Admin / Owner)
exports.updateOrganization = async (req, res, next) => {
  try {
    const { name, description, industry, settings, logo } = req.body;

    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (industry) organization.industry = industry;
    if (settings) organization.settings = { ...organization.settings, ...settings };
    if (logo) organization.logo = logo;

    await organization.save();

    await logActivity({
      actor: req.user.id,
      organization: organization._id,
      action: 'updated_organization',
      entityType: 'Organization',
      entityId: organization._id,
      description: `${req.user.name} updated organization settings`,
    });

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (Org Admin only)
exports.deleteOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    await organization.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite a member to the organization
// @route   POST /api/organizations/:id/invite
// @access  Private (Org Admin / PM)
exports.inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const organizationId = req.params.id;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.organization && existingUser.organization.toString() === organizationId) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this organization',
      });
    }

    // Check if existing pending invitation
    const existingInvite = await Invitation.findOne({
      organization: organizationId,
      email: email.toLowerCase(),
      status: 'Pending',
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'An active invitation is already pending for this email address',
      });
    }

    const invitation = await Invitation.create({
      organization: organizationId,
      email: email.toLowerCase(),
      role: role || 'developer',
      invitedBy: req.user.id,
      status: 'Pending',
    });

    await logActivity({
      actor: req.user.id,
      organization: organization._id,
      action: 'invited_member',
      entityType: 'Organization',
      entityId: organization._id,
      description: `${req.user.name} sent an invitation to ${email} (${role || 'developer'})`,
    });

    // If the invited user is already in the platform, send notification
    if (existingUser) {
      await createNotification({
        recipient: existingUser._id,
        sender: req.user.id,
        title: 'Organization Invitation',
        message: `You have been invited to join "${organization.name}" as a ${role || 'developer'}.`,
        type: 'project_invitation',
        link: `/settings`,
      });
    }

    res.status(201).json({
      success: true,
      message: `Invitation successfully sent to ${email}`,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all invitations for an organization
// @route   GET /api/organizations/:id/invitations
// @access  Private
exports.getInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({ organization: req.params.id })
      .populate('invitedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a member from the organization
// @route   DELETE /api/organizations/:id/members/:userId
// @access  Private (Org Admin)
exports.removeMember = async (req, res, next) => {
  try {
    const { id: orgId, userId } = req.params;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    organization.members = organization.members.filter(
      (m) => m.user.toString() !== userId
    );
    await organization.save();

    await User.findByIdAndUpdate(userId, { $unset: { organization: 1 } });

    await logActivity({
      actor: req.user.id,
      organization: organization._id,
      action: 'removed_member',
      entityType: 'Organization',
      entityId: organization._id,
      description: `${req.user.name} removed a member from the organization`,
    });

    res.status(200).json({
      success: true,
      message: 'Member removed from organization successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member role in organization
// @route   PUT /api/organizations/:id/members/:userId/role
// @access  Private (Org Admin)
exports.updateMemberRole = async (req, res, next) => {
  try {
    const { id: orgId, userId } = req.params;
    const { role } = req.body;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const member = organization.members.find((m) => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'User is not a member of this organization' });
    }

    member.role = role;
    await organization.save();

    await User.findByIdAndUpdate(userId, { role });

    await logActivity({
      actor: req.user.id,
      organization: organization._id,
      action: 'updated_member_role',
      entityType: 'User',
      entityId: userId,
      description: `${req.user.name} updated user role to ${role}`,
    });

    res.status(200).json({
      success: true,
      message: `Member role updated to ${role}`,
    });
  } catch (error) {
    next(error);
  }
};
