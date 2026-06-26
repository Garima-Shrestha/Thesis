import db from './database.js';

// Seed badges
const badges = [
  { name: 'First Step', description: 'Solve your first challenge.', trigger_type: 'problems_solved', trigger_value: 1 },
  { name: 'Problem Solver', description: 'Solve 5 challenges.', trigger_type: 'problems_solved', trigger_value: 5 },
  { name: 'On A Roll', description: 'Solve 10 challenges.', trigger_type: 'problems_solved', trigger_value: 10 },
  { name: 'Streaker', description: 'Maintain a 3 day streak.', trigger_type: 'streak', trigger_value: 3 },
  { name: 'Dedicated', description: 'Maintain a 7 day streak.', trigger_type: 'streak', trigger_value: 7 },
  { name: 'XP Hunter', description: 'Earn 500 total XP.', trigger_type: 'total_xp', trigger_value: 500 },
];

const insertBadge = db.prepare(`
  INSERT OR IGNORE INTO badges (name, description, trigger_type, trigger_value)
  VALUES (?, ?, ?, ?)
`);
for (const b of badges) {
  insertBadge.run(b.name, b.description, b.trigger_type, b.trigger_value);
}

// Seed groups
const groups = [
  { name: 'Group A — Basics', description: 'Fundamental Java concepts. Unlocked by default.', order_index: 1 },
  { name: 'Group B — Control Flow', description: 'Conditions and loops. Unlocked after completing Group A.', order_index: 2 },
  { name: 'Group C — Data Structures', description: 'Arrays and strings. Unlocked after completing Group B.', order_index: 3 },
];

const insertGroup = db.prepare(`
  INSERT OR IGNORE INTO challenge_groups (name, description, order_index, created_at)
  VALUES (?, ?, ?, ?)
`);
for (const g of groups) {
  insertGroup.run(g.name, g.description, g.order_index, new Date().toISOString());
}

const groupA = db.prepare('SELECT id FROM challenge_groups WHERE order_index = 1').get();
const groupB = db.prepare('SELECT id FROM challenge_groups WHERE order_index = 2').get();
const groupC = db.prepare('SELECT id FROM challenge_groups WHERE order_index = 3').get();

// Seed challenges
const challenges = [
  {
    group_id: groupA.id,
    title: 'Hello World',
    description: 'Print "Hello, World!" to the console.',
    difficulty: 'beginner', level_required: 1, xp_reward: 30, topic_tag: 'basics',
    inputs: [''], outputs: ['Hello, World!'],
    solution: `print("Hello, World!")`,
  },
  {
    group_id: groupA.id,
    title: 'Sum of Two Numbers',
    description: 'You will be given two numbers, each on a separate line. Read them and print their sum.',
    difficulty: 'beginner', level_required: 1, xp_reward: 30, topic_tag: 'basics',
    inputs: ['3\n5', '10\n20'], outputs: ['8', '30'],
    solution: `a = int(input())\nb = int(input())\nprint(a + b)`,
  },
  {
    group_id: groupA.id,
    title: 'Print Your Name',
    description: 'Read a name from input and print "Hello, [name]!".',
    difficulty: 'beginner', level_required: 1, xp_reward: 30, topic_tag: 'basics',
    inputs: ['Ammy', 'Alice'], outputs: ['Hello, Ammy!', 'Hello, Alice!'],
    solution: `name = input()\nprint(f"Hello, {name}!")`,
  },
  {
    group_id: groupB.id,
    title: 'Even or Odd',
    description: 'Read an integer and print "Even" if it is even, "Odd" if it is odd.',
    difficulty: 'beginner', level_required: 1, xp_reward: 30, topic_tag: 'conditions',
    inputs: ['4', '7'], outputs: ['Even', 'Odd'],
    solution: `n = int(input())\nprint("Even" if n % 2 == 0 else "Odd")`,
  },
  {
    group_id: groupB.id,
    title: 'FizzBuzz',
    description: 'Read N. Print numbers 1 to N. Multiples of 3 → "Fizz", multiples of 5 → "Buzz", both → "FizzBuzz".',
    difficulty: 'intermediate', level_required: 2, xp_reward: 60, topic_tag: 'loops',
    inputs: ['5', '15'],
    outputs: ['1\n2\nFizz\n4\nBuzz', '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz'],
    solution: `n = int(input())\nfor i in range(1, n+1):\n    if i % 15 == 0: print("FizzBuzz")\n    elif i % 3 == 0: print("Fizz")\n    elif i % 5 == 0: print("Buzz")\n    else: print(i)`,
  },
  {
    group_id: groupB.id,
    title: 'Sum of N Numbers',
    description: 'Read N then print the sum of numbers from 1 to N.',
    difficulty: 'beginner', level_required: 1, xp_reward: 30, topic_tag: 'loops',
    inputs: ['5', '10'], outputs: ['15', '55'],
    solution: `n = int(input())\nprint(sum(range(1, n+1)))`,
  },
  {
    group_id: groupC.id,
    title: 'Count Even Numbers',
    description: 'Read N on the first line, then N space-separated integers on the second. Count how many are even.',
    difficulty: 'intermediate', level_required: 2, xp_reward: 60, topic_tag: 'arrays',
    inputs: ['5\n2 3 8 1 4', '4\n1 1 1 1'], outputs: ['3', '0'],
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nprint(sum(1 for x in nums if x % 2 == 0))`,
  },
  {
    group_id: groupC.id,
    title: 'Reverse a String',
    description: 'Read a string and print it reversed.',
    difficulty: 'intermediate', level_required: 2, xp_reward: 60, topic_tag: 'strings',
    inputs: ['hello', 'java'], outputs: ['olleh', 'avaj'],
    solution: `s = input()\nprint(s[::-1])`,
  },
];

const insertChallenge = db.prepare(`
  INSERT OR IGNORE INTO challenges (group_id, title, description, difficulty, level_required, xp_reward, topic_tag, solution_code, is_published, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
`);

const insertTestCase = db.prepare(`
  INSERT INTO test_cases (challenge_id, input, expected_output, is_sample)
  VALUES (?, ?, ?, ?)
`);

for (const c of challenges) {
  const result = insertChallenge.run(c.group_id, c.title, c.description, c.difficulty, c.level_required, c.xp_reward, c.topic_tag, c.solution || null, new Date().toISOString());
  const challengeId = result.lastInsertRowid;
  for (let i = 0; i < c.inputs.length; i++) {
    insertTestCase.run(challengeId, c.inputs[i], c.outputs[i], i === 0 ? 1 : 0);
  }
}

console.log('Seeding complete.');