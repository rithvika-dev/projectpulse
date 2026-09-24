const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Organization = require('../models/Organization');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Invitation = require('../models/Invitation');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/projectpulse';
    console.log(`Connecting to database: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Team.deleteMany({}),
      Project.deleteMany({}),
      Milestone.deleteMany({}),
      Sprint.deleteMany({}),
      Task.deleteMany({}),
      Issue.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
      Invitation.deleteMany({}),
    ]);

    console.log('Seeding Users...');
    // Create Admin user first
    const adminUser = await User.create({
      name: 'Elena Rostova',
      email: 'admin@projectpulse.com',
      password: 'Admin@123',
      role: 'organization_admin',
      title: 'VP of Product Operations',
      department: 'Executive Leadership',
      phone: '+1 (555) 234-5678',
      bio: 'Leading agile engineering operations and company-wide strategic initiatives.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    const pmUser = await User.create({
      name: 'Marcus Vance',
      email: 'pm@projectpulse.com',
      password: 'Pm@123',
      role: 'project_manager',
      title: 'Principal Project Manager',
      department: 'Product Management',
      phone: '+1 (555) 345-6789',
      bio: 'Certified Scrum Master with 8+ years managing enterprise cloud deliverables.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    const leadUser = await User.create({
      name: 'Aria Thorne',
      email: 'lead@projectpulse.com',
      password: 'Lead@123',
      role: 'team_lead',
      title: 'Staff Software Engineer & Tech Lead',
      department: 'Product Engineering',
      phone: '+1 (555) 456-7890',
      bio: 'Specialized in microservices architecture, performance optimization, and developer mentoring.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    });

    const devUser = await User.create({
      name: 'Devon Reed',
      email: 'dev@projectpulse.com',
      password: 'Dev@123',
      role: 'developer',
      title: 'Senior Full-Stack Engineer',
      department: 'Product Engineering',
      phone: '+1 (555) 567-8901',
      bio: 'Enthusiastic React & Node.js specialist focused on design systems and resilient APIs.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    });

    const stakeholderUser = await User.create({
      name: 'Sophia Chen',
      email: 'stakeholder@projectpulse.com',
      password: 'Stakeholder@123',
      role: 'stakeholder',
      title: 'Director of Strategic Growth',
      department: 'Business Operations',
      phone: '+1 (555) 678-9012',
      bio: 'Monitoring delivery milestones, budget health, and product market readiness.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    });

    console.log('Seeding Organization NovaWorks...');
    const organization = await Organization.create({
      name: 'NovaWorks',
      description: 'Modern product engineering, design systems, and digital collaboration ecosystem.',
      industry: 'Software & Technology Enterprise',
      owner: adminUser._id,
      members: [
        { user: adminUser._id, role: 'organization_admin' },
        { user: pmUser._id, role: 'project_manager' },
        { user: leadUser._id, role: 'team_lead' },
        { user: devUser._id, role: 'developer' },
        { user: stakeholderUser._id, role: 'stakeholder' },
      ],
      settings: {
        allowMemberInvites: true,
        defaultProjectVisibility: 'organization',
        slackWebhookUrl: 'https://hooks.slack.com/services/novaworks/agile',
      },
    });

    // Link users to organization
    await User.updateMany({}, { organization: organization._id });

    console.log('Seeding Teams...');
    const engineeringTeam = await Team.create({
      name: 'Product Engineering',
      description: 'Core web architecture, backend APIs, and distributed database services.',
      organization: organization._id,
      teamLead: leadUser._id,
      members: [leadUser._id, devUser._id, pmUser._id],
      color: '#2F6B5F', // Forest Green
    });

    const designTeam = await Team.create({
      name: 'Design & UX',
      description: 'Design system, interaction design, UX research, and accessibility standards.',
      organization: organization._id,
      teamLead: pmUser._id,
      members: [pmUser._id, adminUser._id],
      color: '#C86B4A', // Terracotta
    });

    const qaTeam = await Team.create({
      name: 'QA & Reliability',
      description: 'Automated end-to-end regression suites, load testing, and security assurance.',
      organization: organization._id,
      teamLead: leadUser._id,
      members: [leadUser._id, devUser._id],
      color: '#C7A35A', // Muted Gold
    });

    console.log('Seeding Projects...');
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const projectPortal = await Project.create({
      name: 'Customer Portal',
      description: 'Unified customer account portal featuring self-service analytics, subscription management, and secure document vault.',
      projectCode: 'PRJ-CP',
      organization: organization._id,
      projectManager: pmUser._id,
      team: engineeringTeam._id,
      members: [adminUser._id, pmUser._id, leadUser._id, devUser._id, stakeholderUser._id],
      status: 'Active',
      priority: 'High',
      startDate: oneMonthAgo,
      endDate: twoMonthsLater,
      progress: 68,
      budget: 85000,
      tags: ['SaaS', 'Frontend', 'React', 'Security'],
      color: '#2F6B5F',
    });

    const projectMobile = await Project.create({
      name: 'Mobile Application',
      description: 'Next-generation iOS & Android native application with offline sync and biometrics login.',
      projectCode: 'PRJ-MOB',
      organization: organization._id,
      projectManager: pmUser._id,
      team: designTeam._id,
      members: [pmUser._id, leadUser._id, devUser._id],
      status: 'Active',
      priority: 'Critical',
      startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      endDate: threeMonthsLater,
      progress: 42,
      budget: 120000,
      tags: ['Mobile', 'iOS', 'Android', 'OfflineSync'],
      color: '#C86B4A',
    });

    const projectAutomation = await Project.create({
      name: 'Internal Automation',
      description: 'Automated CI/CD compliance workflows, data pipeline ingestion, and internal microservice health bots.',
      projectCode: 'PRJ-AUTO',
      organization: organization._id,
      projectManager: pmUser._id,
      team: qaTeam._id,
      members: [pmUser._id, leadUser._id],
      status: 'Planning',
      priority: 'Medium',
      startDate: now,
      endDate: threeMonthsLater,
      progress: 15,
      budget: 45000,
      tags: ['DevOps', 'CI/CD', 'Docker', 'Automation'],
      color: '#C7A35A',
    });

    // Link projects to teams
    engineeringTeam.projects = [projectPortal._id];
    await engineeringTeam.save();
    designTeam.projects = [projectMobile._id];
    await designTeam.save();
    qaTeam.projects = [projectAutomation._id];
    await qaTeam.save();

    console.log('Seeding Milestones...');
    const m1 = await Milestone.create({
      title: 'Beta Release v1.0',
      description: 'Core billing flows, user authentication, and profile onboarding complete.',
      project: projectPortal._id,
      startDate: oneMonthAgo,
      dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      progress: 75,
      owner: leadUser._id,
    });

    const m2 = await Milestone.create({
      title: 'SOC2 & Security Compliance Audit',
      description: 'Third-party penetration testing and end-to-end token encryption verification.',
      project: projectPortal._id,
      startDate: now,
      dueDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      status: 'Not Started',
      progress: 0,
      owner: pmUser._id,
    });

    const m3 = await Milestone.create({
      title: 'Mobile Offline Database Sync Engine',
      description: 'Implement SQLite local sync bridge with conflict resolution algorithms.',
      project: projectMobile._id,
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      progress: 50,
      owner: devUser._id,
    });

    console.log('Seeding Sprints...');
    const sprint1 = await Sprint.create({
      name: 'Sprint 1: Core Architecture & Auth',
      project: projectPortal._id,
      goal: 'Deliver JWT authentication, role guards, and baseline DB models.',
      startDate: oneMonthAgo,
      endDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      status: 'Completed',
    });

    const sprint2 = await Sprint.create({
      name: 'Sprint 2: Real-time Kanban & Analytics',
      project: projectPortal._id,
      goal: 'Implement smooth drag-and-drop Kanban board, workload dashboard, and polymorphic comments.',
      startDate: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: 'Active',
    });

    const sprint3 = await Sprint.create({
      name: 'Sprint 3: Integrations & Webhooks',
      project: projectPortal._id,
      goal: 'Webhook engine, email notifications, and automated report exports.',
      startDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
      status: 'Planned',
    });

    const sprintMob1 = await Sprint.create({
      name: 'Sprint M-1: Design System & Navigation',
      project: projectMobile._id,
      goal: 'Figma tokens, responsive Cupertino/Material layout shell, and tab controllers.',
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      status: 'Active',
    });

    console.log('Seeding Tasks across Kanban columns...');
    const taskData = [
      {
        title: 'Design high-fidelity dashboard wireframes in Figma',
        description: 'Create human-designed layouts avoiding AI blue tropes, focusing on Forest Green & Terracotta palettes.',
        taskCode: 'PRJ-CP-1',
        project: projectPortal._id,
        sprint: sprint1._id,
        assignee: pmUser._id,
        reporter: adminUser._id,
        priority: 'High',
        status: 'Done',
        storyPoints: 5,
        dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        labels: ['Design', 'UI/UX'],
        order: 0,
      },
      {
        title: 'Setup MongoDB Mongoose schemas with indexing',
        description: 'Build robust models for Organization, Team, Project, Task, Sprint, Issue, and Notification.',
        taskCode: 'PRJ-CP-2',
        project: projectPortal._id,
        sprint: sprint1._id,
        assignee: leadUser._id,
        reporter: pmUser._id,
        priority: 'Critical',
        status: 'Done',
        storyPoints: 8,
        dueDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        labels: ['Backend', 'Database'],
        order: 1,
      },
      {
        title: 'Implement drag-and-drop Kanban board with optimistic updates',
        description: 'Ensure smooth visual transitions between Backlog, To Do, In Progress, Review, and Done columns.',
        taskCode: 'PRJ-CP-3',
        project: projectPortal._id,
        sprint: sprint2._id,
        assignee: devUser._id,
        reporter: leadUser._id,
        priority: 'High',
        status: 'In Progress',
        storyPoints: 5,
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        labels: ['Frontend', 'Kanban', 'React'],
        order: 0,
      },
      {
        title: 'Build Recharts workload distribution chart',
        description: 'Display member story point load, pending tasks vs completed items clearly without clutter.',
        taskCode: 'PRJ-CP-4',
        project: projectPortal._id,
        sprint: sprint2._id,
        assignee: devUser._id,
        reporter: pmUser._id,
        priority: 'Medium',
        status: 'Review',
        storyPoints: 3,
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        labels: ['Analytics', 'Recharts'],
        order: 0,
      },
      {
        title: 'Multer attachment upload endpoint with validation',
        description: 'Restrict files to 15MB and safe mime types; store file metadata in MongoDB.',
        taskCode: 'PRJ-CP-5',
        project: projectPortal._id,
        sprint: sprint2._id,
        assignee: leadUser._id,
        reporter: pmUser._id,
        priority: 'High',
        status: 'To Do',
        storyPoints: 3,
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        labels: ['Backend', 'Security', 'Multer'],
        order: 0,
      },
      {
        title: 'Draft automated Slack webhook dispatch service',
        description: 'Send task status changes and milestone notifications to configured company Slack webhooks.',
        taskCode: 'PRJ-CP-6',
        project: projectPortal._id,
        sprint: sprint3._id,
        assignee: devUser._id,
        reporter: pmUser._id,
        priority: 'Low',
        status: 'Backlog',
        storyPoints: 2,
        dueDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        labels: ['Integrations', 'Webhooks'],
        order: 0,
      },
      {
        title: 'Configure biometric face ID and fingerprint auth flow',
        description: 'Seamless integration with native iOS Keychain and Android Keystore.',
        taskCode: 'PRJ-MOB-1',
        project: projectMobile._id,
        sprint: sprintMob1._id,
        assignee: devUser._id,
        reporter: leadUser._id,
        priority: 'Critical',
        status: 'In Progress',
        storyPoints: 8,
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        labels: ['Mobile', 'Security'],
        order: 0,
      },
      {
        title: 'Create offline reconciliation conflict resolution rules',
        description: 'Timestamp-based LWW (Last-Write-Wins) with manual prompt fallback for conflicting edits.',
        taskCode: 'PRJ-MOB-2',
        project: projectMobile._id,
        sprint: sprintMob1._id,
        assignee: leadUser._id,
        reporter: pmUser._id,
        priority: 'High',
        status: 'To Do',
        storyPoints: 5,
        dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        labels: ['Sync', 'Database'],
        order: 0,
      },
    ];

    const createdTasks = await Task.insertMany(taskData);

    // Link tasks into sprint arrays
    sprint1.tasks = [createdTasks[0]._id, createdTasks[1]._id];
    await sprint1.save();

    sprint2.tasks = [createdTasks[2]._id, createdTasks[3]._id, createdTasks[4]._id];
    await sprint2.save();

    sprintMob1.tasks = [createdTasks[6]._id, createdTasks[7]._id];
    await sprintMob1.save();

    console.log('Seeding Issues...');
    const issuesData = [
      {
        title: 'JWT expiry refresh race condition during multi-tab edit',
        description: 'When multiple browser tabs make simultaneous requests near the 7-day token expiry, one request receives a 401 before token refreshes.',
        issueCode: 'ISS-1',
        project: projectPortal._id,
        reporter: devUser._id,
        assignee: leadUser._id,
        severity: 'Major',
        priority: 'High',
        status: 'In Progress',
      },
      {
        title: 'SVG Icon pixel snapping blur on retina displays',
        description: 'Navigation icons in sidebar appear slightly soft on 2x DPI displays when rendered at fractional pixel bounds.',
        issueCode: 'ISS-2',
        project: projectPortal._id,
        reporter: pmUser._id,
        assignee: devUser._id,
        severity: 'Minor',
        priority: 'Low',
        status: 'Open',
      },
      {
        title: 'Memory leak during large CSV report export',
        description: 'Exporting 50k rows causes memory usage spike exceeding node default limit before streams are flushed.',
        issueCode: 'ISS-3',
        project: projectPortal._id,
        reporter: leadUser._id,
        assignee: leadUser._id,
        severity: 'Critical',
        priority: 'Critical',
        status: 'Resolved',
        resolution: 'Refactored backend export logic to use Node.js Transform streams instead of buffering the whole dataset in RAM.',
      },
      {
        title: 'Push notification sound latency on Android 14',
        description: 'Notification audio alert plays 1.2s after banner renders on foreground devices.',
        issueCode: 'ISS-4',
        project: projectMobile._id,
        reporter: devUser._id,
        assignee: devUser._id,
        severity: 'Minor',
        priority: 'Medium',
        status: 'Open',
      },
    ];

    const createdIssues = await Issue.insertMany(issuesData);

    console.log('Seeding Comments...');
    await Comment.create([
      {
        entityType: 'Task',
        entityId: createdTasks[2]._id, // Kanban task
        author: leadUser._id,
        content: 'I have added the drag-and-drop animation hooks. Please verify keyboard accessibility for reordering.',
      },
      {
        entityType: 'Task',
        entityId: createdTasks[2]._id,
        author: devUser._id,
        content: 'Verified! Added keyboard Up/Down/Space keys to move task between columns smoothly.',
      },
      {
        entityType: 'Issue',
        entityId: createdIssues[0]._id,
        author: leadUser._id,
        content: 'Investigating this now. Will add a mutex queue to the Axios interceptor.',
      },
      {
        entityType: 'Project',
        entityId: projectPortal._id,
        author: pmUser._id,
        content: 'Sprint 2 is 70% complete with 3 days remaining. Great momentum team!',
      },
    ]);

    console.log('Seeding Activity Feed...');
    await Activity.insertMany([
      {
        actor: adminUser._id,
        organization: organization._id,
        project: projectPortal._id,
        action: 'created_project',
        entityType: 'Project',
        entityId: projectPortal._id,
        description: 'Elena Rostova established project "Customer Portal" [PRJ-CP]',
        timestamp: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        actor: pmUser._id,
        organization: organization._id,
        project: projectPortal._id,
        action: 'started_sprint',
        entityType: 'Sprint',
        entityId: sprint2._id,
        description: 'Marcus Vance started Sprint "Sprint 2: Real-time Kanban & Analytics"',
        timestamp: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
      },
      {
        actor: devUser._id,
        organization: organization._id,
        project: projectPortal._id,
        action: 'updated_task_status',
        entityType: 'Task',
        entityId: createdTasks[2]._id,
        description: 'Devon Reed moved task "Implement drag-and-drop Kanban board" to In Progress',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        actor: leadUser._id,
        organization: organization._id,
        project: projectPortal._id,
        action: 'resolved_issue',
        entityType: 'Issue',
        entityId: createdIssues[2]._id,
        description: 'Aria Thorne resolved critical issue "Memory leak during large CSV report export"',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('Seeding Notifications...');
    await Notification.insertMany([
      {
        recipient: devUser._id,
        sender: leadUser._id,
        title: 'Task Assigned',
        message: 'Aria Thorne assigned task "Implement drag-and-drop Kanban board" to you.',
        type: 'task_assigned',
        link: `/projects/${projectPortal._id}/tasks`,
        read: false,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        recipient: pmUser._id,
        sender: devUser._id,
        title: 'Task Ready for Review',
        message: 'Devon Reed marked "Build Recharts workload distribution chart" as Review.',
        type: 'task_status_changed',
        link: `/projects/${projectPortal._id}/tasks`,
        read: false,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        recipient: adminUser._id,
        sender: pmUser._id,
        title: 'Milestone Approaching Deadline',
        message: 'Milestone "Beta Release v1.0" is due in 15 days.',
        type: 'milestone_approaching',
        link: `/projects/${projectPortal._id}/milestones`,
        read: false,
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      },
      {
        recipient: devUser._id,
        sender: leadUser._id,
        title: 'New Comment',
        message: 'Aria Thorne commented on task "Implement drag-and-drop Kanban board".',
        type: 'task_commented',
        link: `/projects/${projectPortal._id}/tasks`,
        read: true,
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
    ]);

    console.log('Seeding Invitations...');
    await Invitation.create({
      organization: organization._id,
      email: 'alex.consultant@partner.com',
      role: 'stakeholder',
      invitedBy: adminUser._id,
      status: 'Pending',
    });

    console.log('====================================================');
    console.log('✅ ProjectPulse Database Successfully Seeded!');
    console.log('====================================================');
    console.log('Demo Credentials for All Roles:');
    console.log('----------------------------------------------------');
    console.log('👑 Org Admin:    admin@projectpulse.com       / Admin@123');
    console.log('📋 Project Mgr:  pm@projectpulse.com          / Pm@123');
    console.log('⚡ Team Lead:    lead@projectpulse.com        / Lead@123');
    console.log('💻 Developer:    dev@projectpulse.com         / Dev@123');
    console.log('📊 Stakeholder:  stakeholder@projectpulse.com / Stakeholder@123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
