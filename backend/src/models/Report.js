const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    tasksCompleted: { type: String, required: true, trim: true },
    tasksPlanned: { type: String, required: true, trim: true },
    blockers: { type: String, default: '', trim: true },
    hoursWorked: { type: Number, min: 0, default: null },
    notes: { type: String, default: '', trim: true },
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reportSchema.index({ user: 1, weekStart: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
