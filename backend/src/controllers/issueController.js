const Issue = require('../models/Issue');
const Project = require('../models/Project');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

// @desc    Create an issue
// @route   POST /api/issues
// @access  Private
exports.createIssue = async (req, res, next) => {
  try {
    const { title, description, project, assignee, severity, priority, status } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const issueCount = await Issue.countDocuments({ project });
    const issueCode = `ISS-${issueCount + 1}`;

    const issue = await Issue.create({
      title,
      description: description || '',
      issueCode,
      project,
      reporter: req.user.id,
      assignee: assignee || undefined,
      severity: severity || 'Minor',
      priority: priority || 'Medium',
      status: status || 'Open',
    });

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project,
      action: 'created_issue',
      entityType: 'Issue',
      entityId: issue._id,
      description: `${req.user.name} reported issue "${issue.title}" [${issue.issueCode}] (${issue.severity})`,
    });

    if (assignee && assignee.toString() !== req.user.id.toString()) {
      await createNotification({
        recipient: assignee,
        sender: req.user.id,
        title: 'Issue Assigned',
        message: `${req.user.name} assigned issue "${issue.title}" [${issue.issueCode}] to you.`,
        type: 'issue_assigned',
        link: `/projects/${project}/issues`,
      });
    }

    const populated = await Issue.findById(issue._id)
      .populate('reporter', 'name email avatar title')
      .populate('assignee', 'name email avatar title')
      .populate('project', 'name projectCode');

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all issues with filters
// @route   GET /api/issues
// @access  Private
exports.getIssues = async (req, res, next) => {
  try {
    const { project, status, severity, priority, assignee, search, sort = '-createdAt' } =
      req.query;

    const query = {};
    if (project) query.project = project;
    if (status && status !== 'all') query.status = status;
    if (severity && severity !== 'all') query.severity = severity;
    if (priority && priority !== 'all') query.priority = priority;
    if (assignee && assignee !== 'all') query.assignee = assignee;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { issueCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const issues = await Issue.find(query)
      .populate('reporter', 'name email avatar title')
      .populate('assignee', 'name email avatar title')
      .populate('project', 'name projectCode')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
// @access  Private
exports.getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email avatar title phone department')
      .populate('assignee', 'name email avatar title phone department')
      .populate('project', 'name projectCode')
      .populate('attachments.uploader', 'name avatar');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
exports.updateIssue = async (req, res, next) => {
  try {
    const { title, description, assignee, severity, priority, status, resolution } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const previousStatus = issue.status;

    if (title) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (assignee !== undefined) issue.assignee = assignee || null;
    if (severity) issue.severity = severity;
    if (priority) issue.priority = priority;
    if (status) issue.status = status;
    if (resolution !== undefined) issue.resolution = resolution;

    await issue.save();

    if (status && status !== previousStatus) {
      await logActivity({
        actor: req.user.id,
        organization: req.user.organization,
        project: issue.project,
        action: status === 'Resolved' ? 'resolved_issue' : 'updated_issue_status',
        entityType: 'Issue',
        entityId: issue._id,
        description: `${req.user.name} changed issue "${issue.title}" [${issue.issueCode}] status to ${status}`,
      });
    }

    const updated = await Issue.findById(issue._id)
      .populate('reporter', 'name email avatar title')
      .populate('assignee', 'name email avatar title')
      .populate('project', 'name projectCode');

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add attachment to issue
// @route   POST /api/issues/:id/attachments
// @access  Private
exports.addAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.attachments.push({
      name: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploader: req.user.id,
      uploadedAt: new Date(),
    });

    await issue.save();

    const updated = await Issue.findById(issue._id).populate('attachments.uploader', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Attachment added to issue',
      data: updated.attachments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    await issue.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
