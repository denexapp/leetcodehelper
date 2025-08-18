/**
 * Task Queue Algorithm for LeetCode Problem Scheduling
 * 
 * This algorithm prioritizes problems based on:
 * 1. Difficulty (easy → medium → hard)
 * 2. Previous attempts and spaced repetition intervals
 * 3. Whether the problem has been solved at least once
 */

export interface Problem {
  id: string;
  title: string;
  url: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topicName: string;
}

export interface Attempt {
  id: string;
  problemId: string;
  date: string;
  solvedSolo: boolean;
  timeSpent: number;
}

export interface TaskQueueItem {
  problem: Problem;
  priority: number;
  reason: string;
  lastAttempt?: Attempt;
  solvedCount: number;
  nextReviewDate?: Date;
  daysSinceLastSolved?: number;
}

// Spaced repetition intervals in days
const REPETITION_INTERVALS = {
  easy: [5, 10, 30, 30, 50, 50],
  medium: [3, 5, 10, 20, 30, 40, 50, 50],
  hard: [3, 5, 10, 20, 30, 40, 50, 50],
} as const;

// Priority weights for sorting
const PRIORITY_WEIGHTS = {
  NEVER_ATTEMPTED: 1000,
  ATTEMPTED_BUT_NOT_SOLVED: 900,
  DUE_FOR_REVIEW: 800,
  OVERDUE_REVIEW: 850,
} as const;

// Difficulty base priorities (lower number = higher priority)
const DIFFICULTY_PRIORITY = {
  easy: 100,
  medium: 200,
  hard: 300,
} as const;

/**
 * Calculate the next review date based on solved attempts count and difficulty
 */
function calculateNextReviewDate(
  difficulty: Problem['difficulty'],
  solvedCount: number,
  lastSolvedDate: Date
): Date {
  const intervals = REPETITION_INTERVALS[difficulty];
  const intervalIndex = Math.min(solvedCount - 1, intervals.length - 1);
  const daysToAdd = intervals[intervalIndex];
  
  const nextDate = new Date(lastSolvedDate);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  
  return nextDate;
}

/**
 * Get the most recent solved attempt for a problem
 */
function getLastSolvedAttempt(attempts: Attempt[]): Attempt | undefined {
  return attempts
    .filter(attempt => attempt.solvedSolo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

/**
 * Calculate days since a date
 */
function daysSince(date: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate the task queue with prioritized problems
 */
export function generateTaskQueue(
  problems: Problem[],
  attempts: Attempt[]
): TaskQueueItem[] {
  const now = new Date();
  const taskQueue: TaskQueueItem[] = [];

  // Group attempts by problem ID
  const attemptsByProblem = attempts.reduce((acc, attempt) => {
    if (!acc[attempt.problemId]) {
      acc[attempt.problemId] = [];
    }
    acc[attempt.problemId].push(attempt);
    return acc;
  }, {} as Record<string, Attempt[]>);

  // Process each problem
  for (const problem of problems) {
    const problemAttempts = attemptsByProblem[problem.id] || [];
    const lastSolvedAttempt = getLastSolvedAttempt(problemAttempts);
    const solvedCount = problemAttempts.filter(a => a.solvedSolo).length;
    const lastAttempt = problemAttempts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    let priority = DIFFICULTY_PRIORITY[problem.difficulty];
    let reason = '';
    let nextReviewDate: Date | undefined;
    let daysSinceLastSolved: number | undefined;

    if (solvedCount === 0) {
      // Never solved
      if (problemAttempts.length === 0) {
        priority += PRIORITY_WEIGHTS.NEVER_ATTEMPTED;
        reason = 'Never attempted';
      } else {
        priority += PRIORITY_WEIGHTS.ATTEMPTED_BUT_NOT_SOLVED;
        reason = 'Attempted but not solved';
      }
    } else {
      // Has been solved at least once
      const lastSolvedDate = new Date(lastSolvedAttempt!.date);
      nextReviewDate = calculateNextReviewDate(problem.difficulty, solvedCount, lastSolvedDate);
      daysSinceLastSolved = daysSince(lastSolvedDate);

      if (now >= nextReviewDate) {
        const daysOverdue = daysSince(nextReviewDate);
        if (daysOverdue > 0) {
          priority += PRIORITY_WEIGHTS.OVERDUE_REVIEW - daysOverdue; // More overdue = higher priority
          reason = `Review overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`;
        } else {
          priority += PRIORITY_WEIGHTS.DUE_FOR_REVIEW;
          reason = 'Due for review today';
        }
      } else {
        // Not due yet, lower priority
        const daysUntilDue = Math.ceil((nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        priority += 400; // Lower priority for future reviews
        reason = `Next review in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`;
      }
    }

    taskQueue.push({
      problem,
      priority,
      reason,
      lastAttempt,
      solvedCount,
      nextReviewDate,
      daysSinceLastSolved,
    });
  }

  // Sort by priority (lower number = higher priority), then by problem ID for consistency
  return taskQueue
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.problem.id.localeCompare(b.problem.id);
    });
}

/**
 * Filter task queue to only show tasks that need attention
 */
export function getActiveTaskQueue(
  problems: Problem[],
  attempts: Attempt[]
): TaskQueueItem[] {
  const fullQueue = generateTaskQueue(problems, attempts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Group attempts by problem ID for easier lookup
  const attemptsByProblem = attempts.reduce((acc, attempt) => {
    if (!acc[attempt.problemId]) {
      acc[attempt.problemId] = [];
    }
    acc[attempt.problemId].push(attempt);
    return acc;
  }, {} as Record<string, Attempt[]>);

  return fullQueue.filter(task => {
    const problemAttempts = attemptsByProblem[task.problem.id] || [];
    
    // Check if there was an attempt today that was not solved solo
    const todayAttempts = problemAttempts.filter(attempt => {
      const attemptDate = new Date(attempt.date);
      const attemptDay = new Date(attemptDate.getFullYear(), attemptDate.getMonth(), attemptDate.getDate());
      return attemptDay.getTime() === today.getTime();
    });
    
    // Filter out problems that were attempted today but not solved solo
    // This includes both "solved with help" and "didn't solve at all" cases
    const attemptedTodayButNotSolo = todayAttempts.some(attempt => !attempt.solvedSolo);
    
    // Filter out problems that were attempted today but not solved solo
    if (attemptedTodayButNotSolo) {
      return false;
    }

    // Include if never attempted or attempted but not solved
    if (task.solvedCount === 0) {
      return true;
    }

    // Include if due for review (today or overdue)
    if (task.nextReviewDate && now >= task.nextReviewDate) {
      return true;
    }

    // Exclude tasks that are not due yet
    return false;
  });
}

/**
 * Get queue statistics
 */
export function getQueueStats(taskQueue: TaskQueueItem[]) {
  const stats = {
    total: taskQueue.length,
    neverAttempted: 0,
    attemptedNotSolved: 0,
    dueForReview: 0,
    overdue: 0,
    byDifficulty: {
      easy: 0,
      medium: 0,
      hard: 0,
    },
  };

  for (const task of taskQueue) {
    stats.byDifficulty[task.problem.difficulty]++;

    if (task.solvedCount === 0) {
      if (task.lastAttempt) {
        stats.attemptedNotSolved++;
      } else {
        stats.neverAttempted++;
      }
    } else if (task.reason.includes('overdue')) {
      stats.overdue++;
    } else if (task.reason.includes('Due for review')) {
      stats.dueForReview++;
    }
  }

  return stats;
}
