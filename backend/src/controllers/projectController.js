const Project = require('../models/Project');
const User = require('../models/User');

exports.getProjects = async (_req, res) => {
  const projects = await Project.find()
    .populate('assignedMembers', 'name email')
    .populate('createdBy', 'name')
    .sort({ name: 1 });
  res.json({ projects });
};

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id });
    await project.populate('assignedMembers', 'name email');
    res.status(201).json({ project });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Project name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedMembers', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Project name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.assignMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.assignedMembers = memberIds;
    await project.save();

    await User.updateMany({ _id: { $in: memberIds } }, { $addToSet: { assignedProjects: project._id } });
    await project.populate('assignedMembers', 'name email');
    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
