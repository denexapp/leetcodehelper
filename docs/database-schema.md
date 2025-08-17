# LeetCode Helper Database Schema

This document describes the database schema for the LeetCode Helper application, which tracks coding problems, attempts, and user progress.

## Entity Relationships

```
topics (1) ──── (many) problems
problems (1) ──── (many) attempts
problems (1) ──── (many) notes
auth.users (1) ──── (many) attempts
auth.users (1) ──── (many) notes
```

## Tables

### 1. Topics Table
**Purpose**: Categorizes problems by topic/category (e.g., "Arrays", "Dynamic Programming", "Trees")

| Field | Type | Description |
|-------|------|-------------|
| id | text (PK) | Unique identifier for the topic |
| name | varchar(255) | Topic name (unique) |
| createdAt | timestamp | When the topic was created |
| updatedAt | timestamp | When the topic was last updated |

**Example Records**:
- `{ id: "topic_1", name: "Arrays" }`
- `{ id: "topic_2", name: "Dynamic Programming" }`

### 2. Problems Table
**Purpose**: Stores LeetCode problem information and metadata

| Field | Type | Description |
|-------|------|-------------|
| id | text (PK) | Unique identifier for the problem |
| title | varchar(500) | Problem title |
| url | text | LeetCode problem URL (unique) |
| status | varchar(50) | Problem status: "solved", "attempted", "not_started" |
| topicId | text (FK) | References topics.id (cascade delete) |
| difficulty | varchar(20) | Difficulty level: "easy", "medium", "hard" |
| createdAt | timestamp | When the problem was added |
| updatedAt | timestamp | When the problem was last updated |

**Example Record**:
```json
{
  "id": "problem_1",
  "title": "Two Sum",
  "url": "https://leetcode.com/problems/two-sum/",
  "status": "solved",
  "topicId": "topic_1",
  "difficulty": "easy"
}
```

### 3. Attempts Table
**Purpose**: Tracks each attempt at solving a problem (multiple attempts per problem allowed)

| Field | Type | Description |
|-------|------|-------------|
| id | text (PK) | Unique identifier for the attempt |
| problemId | text (FK) | References problems.id (cascade delete) |
| date | timestamp | When the attempt was made |
| userId | text (FK) | References auth.users.id (cascade delete) |
| solvedSolo | boolean | Whether solved without help (default: false) |
| timeSpent | integer | Time spent in minutes |
| createdAt | timestamp | When the attempt record was created |
| updatedAt | timestamp | When the attempt record was last updated |

**Example Record**:
```json
{
  "id": "attempt_1",
  "problemId": "problem_1",
  "date": "2025-08-16T10:30:00Z",
  "userId": "user_123",
  "solvedSolo": true,
  "timeSpent": 45
}
```

### 4. Notes Table
**Purpose**: Stores user-specific notes for problems (solutions, insights, reminders)

| Field | Type | Description |
|-------|------|-------------|
| id | text (PK) | Unique identifier for the note |
| problemId | text (FK) | References problems.id (cascade delete) |
| content | text | Note content/body |
| userId | text (FK) | References auth.users.id (cascade delete) |
| createdAt | timestamp | When the note was created |
| updatedAt | timestamp | When the note was last updated |

**Example Record**:
```json
{
  "id": "note_1",
  "problemId": "problem_1",
  "content": "Use hash map for O(n) solution. Key insight: store complement values.",
  "userId": "user_123"
}
```

## Key Design Decisions

### 1. **Multiple Attempts per Problem**
- Users can have multiple attempts at the same problem
- Each attempt tracks time spent and whether solved independently
- Enables progress tracking over time

### 2. **User-Specific Data**
- Notes are user-specific (different users can have different notes for same problem)
- Attempts are user-specific (tracks individual progress)
- Problems and topics are shared across all users

### 3. **Status Tracking**
- Problem status reflects overall progress: "not_started" → "attempted" → "solved"
- Individual attempts track specific session details

### 4. **Flexible Content**
- Notes use `text` type for unlimited content length
- Problem titles use `varchar(500)` to accommodate long titles
- URLs are stored as `text` for flexibility

## Future Considerations

### Potential Enhancements
1. **Tags System**: Add many-to-many relationship between problems and tags
2. **Difficulty Scoring**: Add numeric difficulty scores in addition to easy/medium/hard
3. **Solution Storage**: Add table to store actual code solutions
4. **Performance Metrics**: Track runtime/memory performance from LeetCode
5. **Streaks**: Add streak tracking for consecutive days of solving
6. **Collections**: Allow users to create custom problem collections

### Indexing Strategy
- Index on `problems.topicId` for topic-based queries
- Index on `attempts.userId` and `attempts.problemId` for user progress queries
- Index on `notes.userId` and `notes.problemId` for note retrieval
- Index on `problems.difficulty` for difficulty-based filtering

## Migration Notes
- All foreign key relationships use CASCADE deletion for data integrity
- Real foreign key constraints implemented using Drizzle ORM `.references()` method
- Cross-schema references: leetcode tables reference auth.users table
- Timestamps use automatic defaults for creation/update tracking
- Text IDs allow for readable, meaningful identifiers
- Boolean fields have sensible defaults where applicable

## Foreign Key Implementation Details
```typescript
// Real foreign key constraints in Drizzle schema:
userId: text("user_id")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" })

problemId: text("problem_id")
  .notNull()
  .references(() => problems.id, { onDelete: "cascade" })

topicId: text("topic_id")
  .notNull()
  .references(() => topics.id, { onDelete: "cascade" })
```
