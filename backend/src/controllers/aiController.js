const Report = require('../models/Report');
const User = require('../models/User');

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

async function fetchReportsContext() {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const [reports, users] = await Promise.all([
    Report.find({ weekStart: { $gte: fourWeeksAgo }, status: 'submitted' })
      .populate('user', 'name email role')
      .populate('project', 'name')
      .sort({ weekStart: -1 })
      .limit(50),
    User.find({ role: 'team_member' }).select('name email'),
  ]);

  const context = reports.map((r) => ({
    member: r.user.name,
    week: `${r.weekStart.toISOString().split('T')[0]} to ${r.weekEnd.toISOString().split('T')[0]}`,
    project: r.project?.name,
    tasksCompleted: r.tasksCompleted,
    tasksPlanned: r.tasksPlanned,
    blockers: r.blockers,
    hoursWorked: r.hoursWorked,
  }));

  return { context, teamMembers: users.map((u) => u.name) };
}

async function callOllama(messages) {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: { temperature: 0.7, num_predict: 1024 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || 'No response generated.';
}

function buildFallbackResponse(question, { context, teamMembers }) {
  const blockerReports = context.filter((r) => r.blockers?.trim());
  const recentTasks = context.slice(0, 5);

  if (/blocker|challenge|issue/i.test(question)) {
    if (blockerReports.length === 0) return 'No open blockers reported in the last 4 weeks.';
    return `Recent blockers:\n${blockerReports
      .map((r) => `- ${r.member} (${r.project}): ${r.blockers}`)
      .join('\n')}`;
  }

  if (/summary|overview|team/i.test(question)) {
    return `Team Summary (last 4 weeks):\n- Team members: ${teamMembers.join(', ')}\n- Reports submitted: ${context.length}\n- Members with blockers: ${new Set(blockerReports.map((r) => r.member)).size}\n\nRecent work:\n${recentTasks.map((r) => `- ${r.member} worked on ${r.project}: ${r.tasksCompleted.split('\n')[0]}`).join('\n')}`;
  }

  return `Based on ${context.length} recent reports from ${teamMembers.length} team members. Try asking about blockers, team summary, or what a specific member worked on.`;
}

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const reportData = await fetchReportsContext();
    const systemPrompt = `You are an AI assistant for a weekly report dashboard. Answer questions about team activity based ONLY on the report data provided. Be concise and helpful. If data is insufficient, say so.

Team members: ${reportData.teamMembers.join(', ')}

Report data (last 4 weeks):
${JSON.stringify(reportData.context, null, 2)}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    let reply;
    let source = 'ollama';

    try {
      reply = await callOllama(messages);
    } catch {
      source = 'fallback';
      reply = buildFallbackResponse(message, reportData);
    }

    res.json({ reply, source });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeamSummary = async (req, res) => {
  try {
    const reportData = await fetchReportsContext();
    const prompt = `Generate a brief executive summary of the team's weekly reports. Include: 1) Key completed work highlights, 2) Recurring blockers, 3) Workload distribution observations. Keep it under 200 words.

Report data:
${JSON.stringify(reportData.context, null, 2)}`;

    let summary;
    try {
      summary = await callOllama([
        { role: 'system', content: 'You are a concise team report analyst.' },
        { role: 'user', content: prompt },
      ]);
    } catch {
      summary = buildFallbackResponse('team summary', reportData);
    }

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
