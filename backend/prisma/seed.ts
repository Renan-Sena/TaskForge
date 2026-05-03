import { prisma } from '../src/lib/prisma.js';

const templates = [
    {
        focus: 'construction',
        name: 'Construction',
        description: 'Manage construction projects, schedules, materials and documents.',
        icon: '🏗️',
        modules: [
            { id: 'kanban', name: 'Construction Stages', description: 'Foundation, structure, finishing...', enabled: true, icon: '📋' },
            { id: 'gantt', name: 'Schedule', description: 'Project timeline', enabled: true, icon: '📅' },
            { id: 'budget', name: 'Costs & Materials', description: 'Expense and supply tracking', enabled: false, icon: '💰' },
            { id: 'pages', name: 'Documents', description: 'Blueprints, permits, reports', enabled: true, icon: '📄' },
        ],
        columns: [
            { name: 'To Do', order: 1 },
            { name: 'In Progress', order: 2 },
            { name: 'Done', order: 3 },
        ],
        tasks: [
            { title: 'Site preparation', estimatedDays: 7 },
            { title: 'Foundation', estimatedDays: 15 },
            { title: 'Structure', estimatedDays: 20 },
            { title: 'Masonry', estimatedDays: 25 },
            { title: 'Electrical / Plumbing', estimatedDays: 18 },
            { title: 'Finishing', estimatedDays: 22 },
            { title: 'Inspection and handover', estimatedDays: 3 },
        ],
    },
    {
        focus: 'development',
        name: 'Software Development',
        description: 'Build and ship digital products.',
        icon: '💻',
        modules: [
            { id: 'kanban', name: 'Sprint Board', description: 'To Do, In Progress, Done', enabled: true, icon: '📋' },
            { id: 'pages', name: 'Documentation', description: 'Requirements, API docs', enabled: true, icon: '📄' },
            { id: 'calendar', name: 'Release Calendar', description: 'Deploy dates', enabled: false, icon: '📅' },
        ],
        columns: [
            { name: 'Backlog', order: 1 },
            { name: 'To Do', order: 2 },
            { name: 'In Progress', order: 3 },
            { name: 'Review', order: 4 },
            { name: 'Done', order: 5 },
        ],
        tasks: [
            { title: 'Set up development environment', estimatedDays: 2 },
            { title: 'Define scope and requirements', estimatedDays: 3 },
            { title: 'Create wireframes', estimatedDays: 5 },
            { title: 'Develop MVP', estimatedDays: 15 },
            { title: 'Testing and QA', estimatedDays: 5 },
            { title: 'Launch', estimatedDays: 2 },
        ],
    },
    {
        focus: 'marketing',
        name: 'Marketing',
        description: 'Plan campaigns, content and metrics.',
        icon: '📣',
        modules: [
            { id: 'kanban', name: 'Campaigns', description: 'Ideas, execution, analysis', enabled: true, icon: '📋' },
            { id: 'calendar', name: 'Editorial Calendar', description: 'Posts, emails, events', enabled: true, icon: '📅' },
            { id: 'pages', name: 'Briefs', description: 'Strategy documents', enabled: true, icon: '📄' },
        ],
        columns: [
            { name: 'Ideas', order: 1 },
            { name: 'Planning', order: 2 },
            { name: 'Execution', order: 3 },
            { name: 'Analysis', order: 4 },
            { name: 'Completed', order: 5 },
        ],
        tasks: [
            { title: 'Define target audience', estimatedDays: 2 },
            { title: 'Create editorial calendar', estimatedDays: 3 },
            { title: 'Produce content', estimatedDays: 10 },
            { title: 'Set up ads', estimatedDays: 4 },
            { title: 'Analyze results', estimatedDays: 3 },
        ],
    },
    {
        focus: 'design',
        name: 'Design',
        description: 'UX/UI and graphic design projects.',
        icon: '🎨',
        modules: [
            { id: 'kanban', name: 'Design Flow', description: 'Briefing, wireframe, prototype', enabled: true, icon: '📋' },
            { id: 'pages', name: 'References', description: 'Moodboards, style guides', enabled: true, icon: '📄' },
        ],
        columns: [
            { name: 'Briefing', order: 1 },
            { name: 'Research', order: 2 },
            { name: 'Wireframes', order: 3 },
            { name: 'Prototypes', order: 4 },
            { name: 'Finalized', order: 5 },
        ],
        tasks: [
            { title: 'Kick-off meeting', estimatedDays: 1 },
            { title: 'Reference research', estimatedDays: 3 },
            { title: 'Create wireframes', estimatedDays: 5 },
            { title: 'Interactive prototype', estimatedDays: 7 },
            { title: 'User testing', estimatedDays: 3 },
            { title: 'Final delivery', estimatedDays: 2 },
        ],
    },
    {
        focus: 'events',
        name: 'Events',
        description: 'Organize parties, conferences and workshops.',
        icon: '🎉',
        modules: [
            { id: 'kanban', name: 'Checklist', description: 'Tasks by category', enabled: true, icon: '📋' },
            { id: 'budget', name: 'Budget', description: 'Supplier expenses', enabled: true, icon: '💰' },
            { id: 'calendar', name: 'Agenda', description: 'Key dates', enabled: true, icon: '📅' },
            { id: 'pages', name: 'Contacts', description: 'Suppliers & partners', enabled: false, icon: '📄' },
        ],
        columns: [
            { name: 'Pre-event', order: 1 },
            { name: 'Event day', order: 2 },
            { name: 'Post-event', order: 3 },
        ],
        tasks: [
            { title: 'Set date and venue', estimatedDays: 1 },
            { title: 'Hire suppliers', estimatedDays: 14 },
            { title: 'Send invitations', estimatedDays: 5 },
            { title: 'Prepare materials', estimatedDays: 7 },
            { title: 'Run event', estimatedDays: 1 },
            { title: 'Satisfaction survey', estimatedDays: 3 },
        ],
    },
    {
        focus: 'education',
        name: 'Education',
        description: 'Plan courses, classes and academic work.',
        icon: '📚',
        modules: [
            { id: 'kanban', name: 'Study Plan', description: 'Subjects and tasks', enabled: true, icon: '📋' },
            { id: 'calendar', name: 'Schedule', description: 'Exams and deadlines', enabled: true, icon: '📅' },
            { id: 'pages', name: 'Notes', description: 'Summaries and materials', enabled: false, icon: '📄' },
        ],
        columns: [
            { name: 'To Study', order: 1 },
            { name: 'In Progress', order: 2 },
            { name: 'Reviewed', order: 3 },
        ],
        tasks: [
            { title: 'Read chapter 1', estimatedDays: 2 },
            { title: 'Do exercises', estimatedDays: 3 },
            { title: 'Prepare presentation', estimatedDays: 5 },
            { title: 'Review for exam', estimatedDays: 4 },
        ],
    },
    {
        focus: 'freelancer',
        name: 'Freelancer',
        description: 'Manage clients, deliveries and finances.',
        icon: '🧰',
        modules: [
            { id: 'kanban', name: 'Tasks', description: 'Deliverables and deadlines', enabled: true, icon: '📋' },
            { id: 'budget', name: 'Finance', description: 'Invoicing and expenses', enabled: true, icon: '💰' },
            { id: 'pages', name: 'Contracts', description: 'Agreements and briefings', enabled: false, icon: '📄' },
        ],
        columns: [
            { name: 'To Do', order: 1 },
            { name: 'In Progress', order: 2 },
            { name: 'Done', order: 3 },
        ],
        tasks: [
            { title: 'Define project scope', estimatedDays: 1 },
            { title: 'Execute main task', estimatedDays: 5 },
            { title: 'Review with client', estimatedDays: 2 },
            { title: 'Deliver and invoice', estimatedDays: 1 },
        ],
    },
    {
        focus: 'hr',
        name: 'HR & Recruitment',
        description: 'Recruitment, onboarding and people management.',
        icon: '👥',
        modules: [
            { id: 'kanban', name: 'Openings', description: 'Hiring stages', enabled: true, icon: '📋' },
            { id: 'calendar', name: 'Interviews', description: 'Candidate schedule', enabled: true, icon: '📅' },
            { id: 'pages', name: 'Policies', description: 'Internal documents', enabled: false, icon: '📄' },
        ],
        columns: [
            { name: 'Screening', order: 1 },
            { name: 'Interview', order: 2 },
            { name: 'Test', order: 3 },
            { name: 'Offer', order: 4 },
            { name: 'Hired', order: 5 },
        ],
        tasks: [
            { title: 'Post job opening', estimatedDays: 1 },
            { title: 'Screen resumes', estimatedDays: 3 },
            { title: 'Conduct interviews', estimatedDays: 5 },
            { title: 'Send offer letter', estimatedDays: 1 },
            { title: 'New hire onboarding', estimatedDays: 2 },
        ],
    },
];

async function main() {
    for (const t of templates) {
        await prisma.projectTemplate.upsert({
            where: { focus: t.focus },
            update: t,
            create: t,
        });
    }
    console.log('✅ Templates seeded successfully.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());