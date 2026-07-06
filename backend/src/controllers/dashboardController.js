const Report = require('../models/Report');
const User = require('../models/User');
const Project = require('../models/Project');

const getWeekBounds = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { weekStart: wsParam } = req.query;
    const { weekStart, weekEnd } = wsParam
      ? { weekStart: new Date(wsParam), weekEnd: new Date(new Date(wsParam).getTime() + 6 * 86400000) }
      : getWeekBounds();

    const [teamMembers, weekReports, allProjects, recentReports] = await Promise.all([
      User.find({ role: 'team_member' }).select('name email'),
      Report.find({
        weekStart: { $gte: weekStart, $lte: weekEnd },
      }).populate('user', 'name email').populate('project', 'name color'),
      Project.find().select('name color'),
      Report.find({ status: 'submitted' })
        .populate('user', 'name')
        .populate('project', 'name')
        .sort({ submittedAt: -1 })
        .limit(10),
    ]);

    const submittedUserIds = new Set(
      weekReports.filter((r) => r.status === 'submitted').map((r) => r.user._id.toString())
    );
    const totalMembers = teamMembers.length;
    const submittedCount = submittedUserIds.size;
    const complianceRate = totalMembers > 0 ? Math.round((submittedCount / totalMembers) * 100) : 0;

    const openBlockers = weekReports.filter(
      (r) => r.status === 'submitted' && r.blockers && r.blockers.trim().length > 0
    ).length;

    const submissionStatus = teamMembers.map((member) => {
      const memberReports = weekReports.filter((r) => r.user._id.toString() === member._id.toString());
      const hasSubmitted = memberReports.some((r) => r.status === 'submitted');
      const isLate = !hasSubmitted && new Date() > weekEnd;
      return {
        userId: member._id,
        name: member.name,
        status: hasSubmitted ? 'submitted' : isLate ? 'late' : 'pending',
        reportCount: memberReports.length,
      };
    });

    const eightWeeksAgo = new Date(weekStart);
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const trendReports = await Report.find({
      status: 'submitted',
      weekStart: { $gte: eightWeeksAgo },
    })
      .populate('user', 'name')
      .sort({ weekStart: 1 });

    const tasksTrend = {};
    trendReports.forEach((r) => {
      const key = r.weekStart.toISOString().split('T')[0];
      if (!tasksTrend[key]) tasksTrend[key] = { week: key, teamTotal: 0, byUser: {} };
      const taskCount = r.tasksCompleted.split('\n').filter((t) => t.trim()).length;
      tasksTrend[key].teamTotal += taskCount;
      const userName = r.user.name;
      tasksTrend[key].byUser[userName] = (tasksTrend[key].byUser[userName] || 0) + taskCount;
    });

    const projectDistribution = {};
    weekReports
      .filter((r) => r.status === 'submitted')
      .forEach((r) => {
        const name = r.project?.name || 'Unknown';
        const taskCount = r.tasksCompleted.split('\n').filter((t) => t.trim()).length;
        projectDistribution[name] = (projectDistribution[name] || 0) + taskCount;
      });

    res.json({
      weekStart,
      weekEnd,
      summary: {
        totalSubmitted: submittedCount,
        totalMembers,
        complianceRate,
        openBlockers,
      },
      submissionStatus,
      tasksTrend: Object.values(tasksTrend),
      projectDistribution: Object.entries(projectDistribution).map(([name, count]) => ({ name, count })),
      recentActivity: recentReports,
      projects: allProjects,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
