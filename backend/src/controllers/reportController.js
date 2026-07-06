const Report = require('../models/Report');

const populateOpts = [
  { path: 'project', select: 'name color' },
  { path: 'user', select: 'name email' },
];

exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .populate(populateOpts)
      .sort({ weekStart: -1 });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate(populateOpts);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const isOwner = report.user._id.toString() === req.user._id.toString();
    const isManager = req.user.role === 'manager';
    if (!isOwner && !isManager) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const report = await Report.create({ ...req.body, user: req.user._id });
    await report.populate(populateOpts);
    res.status(201).json({ report });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A report for this week and project already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowed = ['weekStart', 'weekEnd', 'project', 'tasksCompleted', 'tasksPlanned', 'blockers', 'hoursWorked', 'notes', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) report[field] = req.body[field];
    });

    if (req.body.status === 'submitted' && report.status !== 'submitted') {
      report.submittedAt = new Date();
    }

    await report.save();
    await report.populate(populateOpts);
    res.json({ report });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A report for this week and project already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (report.status === 'submitted') {
      return res.status(400).json({ message: 'Cannot delete a submitted report' });
    }
    await report.deleteOne();
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeamReports = async (req, res) => {
  try {
    const { weekStart, weekEnd, userId, projectId, status } = req.query;
    const filter = {};

    if (weekStart || weekEnd) {
      filter.weekStart = {};
      if (weekStart) filter.weekStart.$gte = new Date(weekStart);
      if (weekEnd) filter.weekStart.$lte = new Date(weekEnd);
    }
    if (userId) filter.user = userId;
    if (projectId) filter.project = projectId;
    if (status) filter.status = status;

    const reports = await Report.find(filter).populate(populateOpts).sort({ weekStart: -1 });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
