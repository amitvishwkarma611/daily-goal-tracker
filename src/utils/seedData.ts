import { Goal, Task, DailyProductivityRecord } from '../types';

export function getTodayDateString(): string {
  // Return YYYY-MM-DD in local time
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateStringOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Product Architecture & Sprint Delivery',
    description: 'Ship core v1.0 milestones, API reliability, and documentation',
    category: 'Career',
    targetDate: getDateStringOffset(20),
    color: '#2563eb', // blue
    createdAt: getDateStringOffset(-30),
  },
  {
    id: 'goal-2',
    title: '30-Day Endurance & Physical Health',
    description: 'Daily 5km run or resistance training, mobility, and 2.5L hydration',
    category: 'Health',
    targetDate: getDateStringOffset(15),
    color: '#059669', // emerald
    createdAt: getDateStringOffset(-20),
  },
  {
    id: 'goal-3',
    title: 'Master Systems Design & Concurrency',
    description: 'Read 2 chapters weekly and implement distributed cache patterns',
    category: 'Learning',
    targetDate: getDateStringOffset(25),
    color: '#7c3aed', // violet
    createdAt: getDateStringOffset(-15),
  },
  {
    id: 'goal-4',
    title: 'Deep Focus & Digital Mindfulness',
    description: 'Zero social media before 11am, evening review, 7.5h sleep cadence',
    category: 'Focus',
    targetDate: getDateStringOffset(30),
    color: '#d97706', // amber
    createdAt: getDateStringOffset(-10),
  },
];

export function generateInitialTasks(): Task[] {
  const tasks: Task[] = [];
  const today = getTodayDateString();

  // Tasks for TODAY
  tasks.push(
    {
      id: 'task-today-1',
      goalId: 'goal-2',
      title: 'Morning 5km tempo run & mobility stretches',
      notes: 'Completed in 26m 40s. Good pace and low resting heart rate.',
      priority: 'high',
      timeSlot: 'morning',
      estimatedMinutes: 45,
      date: today,
      completed: true,
      completedAt: `${today}T07:15:00Z`,
      createdAt: `${today}T06:00:00Z`,
    },
    {
      id: 'task-today-2',
      goalId: 'goal-4',
      title: 'Morning stillness & daily goal review (no screen time)',
      notes: 'Hydrated with lemon water, planned top 3 critical priorities.',
      priority: 'medium',
      timeSlot: 'morning',
      estimatedMinutes: 20,
      date: today,
      completed: true,
      completedAt: `${today}T07:45:00Z`,
      createdAt: `${today}T06:00:00Z`,
    },
    {
      id: 'task-today-3',
      goalId: 'goal-1',
      title: 'Architect decoupled state container & unit test coverage',
      notes: 'Pure functions in rules.ts with 100% test coverage.',
      priority: 'high',
      timeSlot: 'morning',
      estimatedMinutes: 90,
      date: today,
      completed: true,
      completedAt: `${today}T10:30:00Z`,
      createdAt: `${today}T08:00:00Z`,
    },
    {
      id: 'task-today-4',
      goalId: 'goal-1',
      title: 'Refactor progress calculation & weekly breakdown charts',
      notes: 'Ensure tabular figures and zero-pill typographic discipline.',
      priority: 'high',
      timeSlot: 'afternoon',
      estimatedMinutes: 60,
      date: today,
      completed: true,
      completedAt: `${today}T13:45:00Z`,
      createdAt: `${today}T08:00:00Z`,
    },
    {
      id: 'task-today-5',
      goalId: 'goal-3',
      title: 'Read chapter 4: Distributed Consensus & Raft protocol',
      notes: 'Take notes on leader election edge cases and log replication.',
      priority: 'medium',
      timeSlot: 'afternoon',
      estimatedMinutes: 45,
      date: today,
      completed: true,
      completedAt: `${today}T15:30:00Z`,
      createdAt: `${today}T08:00:00Z`,
    },
    {
      id: 'task-today-6',
      goalId: 'goal-1',
      title: 'Finalize PR review for authentication & session caching',
      notes: 'Verify token expiration handling and cookie security flags.',
      priority: 'high',
      timeSlot: 'afternoon',
      estimatedMinutes: 45,
      date: today,
      completed: false,
      createdAt: `${today}T08:00:00Z`,
    },
    {
      id: 'task-today-7',
      goalId: 'goal-2',
      title: 'Evening hydration target check (reach 2.5 Liters)',
      notes: 'Currently at 2.0L, fill evening carafe.',
      priority: 'low',
      timeSlot: 'evening',
      estimatedMinutes: 10,
      date: today,
      completed: false,
      createdAt: `${today}T08:00:00Z`,
    },
    {
      id: 'task-today-8',
      goalId: 'goal-4',
      title: 'Record daily productivity journal & prepare tomorrow priorities',
      notes: 'Review accomplishments and set tomorrow top 3 goals.',
      priority: 'medium',
      timeSlot: 'evening',
      estimatedMinutes: 15,
      date: today,
      completed: false,
      createdAt: `${today}T08:00:00Z`,
    }
  );

  // Past 14 days of realistic task history
  const pastSeedTemplates = [
    { title: 'Morning 5km trail run', pri: 'high', slot: 'morning', mins: 40, g: 'goal-2' },
    { title: 'High-leverage sprint milestone execution', pri: 'high', slot: 'morning', mins: 90, g: 'goal-1' },
    { title: 'Systems design chapter study & diagrams', pri: 'medium', slot: 'afternoon', mins: 45, g: 'goal-3' },
    { title: 'Code audit and latency optimization', pri: 'high', slot: 'afternoon', mins: 60, g: 'goal-1' },
    { title: 'Daily hydration and posture mobility check', pri: 'low', slot: 'evening', mins: 15, g: 'goal-2' },
    { title: 'Evening reflection & next day schedule', pri: 'medium', slot: 'evening', mins: 20, g: 'goal-4' },
  ];

  for (let offset = -1; offset >= -21; offset--) {
    const pastDate = getDateStringOffset(offset);
    // Determine random but high completion rate (75% to 100%)
    const daySeed = Math.abs(offset * 17);
    const numTasks = 4 + (daySeed % 3); // 4 to 6 tasks

    for (let j = 0; j < numTasks; j++) {
      const template = pastSeedTemplates[j % pastSeedTemplates.length];
      // 80% chance of completed
      const isCompleted = (daySeed + j) % 5 !== 0;

      tasks.push({
        id: `task-past-${offset}-${j}`,
        goalId: template.g,
        title: template.title,
        priority: template.pri as any,
        timeSlot: template.slot as any,
        estimatedMinutes: template.mins,
        date: pastDate,
        completed: isCompleted,
        completedAt: isCompleted ? `${pastDate}T17:00:00Z` : undefined,
        createdAt: `${pastDate}T07:00:00Z`,
      });
    }
  }

  return tasks;
}

export function generateInitialProductivityRecords(): DailyProductivityRecord[] {
  const records: DailyProductivityRecord[] = [];
  const today = getTodayDateString();

  records.push({
    date: today,
    focusRating: 5,
    notes: 'Exceptional morning momentum. Completed deep work architectural modules without interruption.',
    wins: [
      'Completed 5km run at sub-5:20 pace',
      'Architected clean decoupled state engine with full test suite',
      'Zero context switching before lunch',
    ],
    obstacles: 'Mid-afternoon energy dip averted with a 15-minute brisk walk.',
    updatedAt: `${today}T14:00:00Z`,
  });

  const sampleWins = [
    ['Shipped database indexing patch', 'Stayed hydrated all day', 'Finished concurrency chapter'],
    ['100% adherence to no-screens morning', 'Closed 4 blocking tickets', 'Great evening workout'],
    ['Delivered design system refactor', 'Clean code review session', 'Zero distractions during deep focus block'],
    ['Hit 10k steps and completed study session', 'Resolved memory leak in cache', 'Solid 8h sleep previous night'],
  ];

  for (let offset = -1; offset >= -21; offset--) {
    const pastDate = getDateStringOffset(offset);
    const rating = offset % 3 === 0 ? 4 : 5;
    const winIndex = Math.abs(offset) % sampleWins.length;

    records.push({
      date: pastDate,
      focusRating: rating,
      notes: `Maintained deliberate focus on key objectives. Closed critical milestones ahead of schedule.`,
      wins: sampleWins[winIndex],
      obstacles: offset % 4 === 0 ? 'Urgent client meeting interrupted afternoon block.' : undefined,
      updatedAt: `${pastDate}T19:30:00Z`,
    });
  }

  return records;
}
