require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Report = require('./models/Report');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/weekly-reports');
  console.log('Connected to MongoDB');

  await Report.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});

  const manager = await User.create({
    name: 'Admin Manager',
    email: 'manager@example.com',
    password: 'password123',
    role: 'manager',
  });

  const members = await User.insertMany([
    { name: 'Alice Johnson', email: 'alice@example.com', password: await bcrypt.hash('password123', 12), role: 'team_member' },
    { name: 'Bob Smith', email: 'bob@example.com', password: await bcrypt.hash('password123', 12), role: 'team_member' },
    { name: 'Carol Davis', email: 'carol@example.com', password: await bcrypt.hash('password123', 12), role: 'team_member' },
    { name: 'David Lee', email: 'david@example.com', password: await bcrypt.hash('password123', 12), role: 'team_member' },
  ]);

  const projects = await Project.insertMany([
    { name: 'Client A', description: 'External client project', color: '#3b82f6', createdBy: manager._id, assignedMembers: [members[0]._id, members[1]._id] },
    { name: 'Internal Tooling', description: 'Internal dev tools', color: '#10b981', createdBy: manager._id, assignedMembers: [members[1]._id, members[2]._id] },
    { name: 'R&D', description: 'Research and development', color: '#8b5cf6', createdBy: manager._id, assignedMembers: [members[2]._id] },
    { name: 'Marketing', description: 'Marketing campaigns', color: '#f59e0b', createdBy: manager._id, assignedMembers: [members[3]._id] },
  ]);

  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);

  await Report.insertMany([
    {
      user: members[0]._id, weekStart, weekEnd, project: projects[0]._id,
      tasksCompleted: 'Completed API integration\nFixed login bug\nWrote unit tests',
      tasksPlanned: 'Deploy to staging\nCode review',
      blockers: 'Waiting on client API credentials',
      hoursWorked: 38, status: 'submitted', submittedAt: new Date(),
    },
    {
      user: members[1]._id, weekStart, weekEnd, project: projects[1]._id,
      tasksCompleted: 'Built CI/CD pipeline\nUpdated documentation',
      tasksPlanned: 'Add monitoring alerts',
      blockers: '', hoursWorked: 40, status: 'submitted', submittedAt: new Date(),
    },
    {
      user: members[2]._id, weekStart, weekEnd, project: projects[2]._id,
      tasksCompleted: 'Prototype ML model\nData collection',
      tasksPlanned: 'Model evaluation\nPresent findings',
      blockers: 'Need more training data',
      hoursWorked: 35, status: 'submitted', submittedAt: new Date(),
    },
    {
      user: members[0]._id, weekStart: lastWeekStart, weekEnd: lastWeekEnd, project: projects[0]._id,
      tasksCompleted: 'Sprint planning\nDatabase schema design',
      tasksPlanned: 'Start API development',
      blockers: '', hoursWorked: 36, status: 'submitted', submittedAt: new Date(lastWeekStart.getTime() + 86400000 * 4),
    },
    {
      user: members[3]._id, weekStart, weekEnd, project: projects[3]._id,
      tasksCompleted: 'Draft Q2 campaign',
      tasksPlanned: 'Finalize ad copy',
      blockers: '', hoursWorked: 30, status: 'draft',
    },
  ]);

  console.log('\nSeed data created successfully!\n');
  console.log('Manager: manager@example.com / password123');
  console.log('Members: alice@example.com, bob@example.com, carol@example.com, david@example.com / password123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
