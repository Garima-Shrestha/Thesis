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
    difficulty: 'beginner',
    level_required: 1,
    xp_reward: 30,
    topic_tag: 'basics',
    inputs: [''],
    outputs: ['Hello, World!'],
    solution: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  },
  {
    group_id: groupA.id,
    title: 'Sum of Two Numbers',
    description: 'Read two integers from input and print their sum.',
    difficulty: 'beginner',
    level_required: 1,
    xp_reward: 30,
    topic_tag: 'basics',
    inputs: ['3 5', '10 20'],
    outputs: ['8', '30'],
    solution: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}`,
  },
  {
    group_id: groupA.id,
    title: 'Print Your Name',
    description: 'Read a name from input and print "Hello, [name]!".',
    difficulty: 'beginner',
    level_required: 1,
    xp_reward: 30,
    topic_tag: 'basics',
    inputs: ['Ammy', 'Alice'],
    outputs: ['Hello, Ammy!', 'Hello, Alice!'],
    solution: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String name = sc.nextLine();\n        System.out.println("Hello, " + name + "!");\n    }\n}`,
  },
  {
    group_id: groupB.id,
    title: 'Even or Odd',
    description: 'Read an integer and print "Even" if it is even, "Odd" if it is odd.',
    difficulty: 'beginner',
    level_required: 1,
    xp_reward: 30,
    topic_tag: 'conditions',
    inputs: ['4', '7'],
    outputs: ['Even', 'Odd'],
    solution: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(n % 2 == 0 ? "Even" : "Odd");\n    }\n}`,
  },
  {
    group_id: groupB.id,
    title: 'FizzBuzz',
    description: 'Read a number N. Print numbers 1 to N. For multiples of 3 print "Fizz", multiples of 5 print "Buzz", multiples of both print "FizzBuzz".',
    difficulty: 'intermediate',
    level_required: 2,
    xp_reward: 60,
    topic_tag: 'loops',
    inputs: ['5', '15'],
    outputs: ['1\n2\nFizz\n4\nBuzz', '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz'],
    solution: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) System.out.println("FizzBuzz");\n            else if (i % 3 == 0) System.out.println("Fizz");\n            else if (i % 5 == 0) System.out.println("Buzz");\n            else System.out.println(i);\n        }\n    }\n}`,
  },
  {
    group_id: groupB.id,
    title: 'Sum of N Numbers',
    description: 'Read N then print the sum of numbers from 1 to N.',
    difficulty: 'beginner',
    level_required: 1,
    xp_reward: 30,
    topic_tag: 'loops',
    inputs: ['5', '10'],
    outputs: ['15', '55'],
    solution: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int sum = 0;\n        for (int i = 1; i <= n; i++) sum += i;\n        System.out.println(sum);\n    }\n}`,
  },
  {
    group_id: groupC.id,
    title: 'Count Even Numbers',
    description: 'Read N integers and count how many are even. First line is N, second line is N space-separated integers.',
    difficulty: 'intermediate',
    level_required: 2,
    xp_reward: 60,
    topic_tag: 'arrays',
    inputs: ['5\n2 3 8 1 4', '4\n1 1 1 1'],
    outputs: ['3', '0'],
    solution: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int count = 0;\n        for (int i = 0; i < n; i++) {\n            if (sc.nextInt() % 2 == 0) count++;\n        }\n        System.out.println(count);\n    }\n}`,
  },
  {
    group_id: groupC.id,
    title: 'Reverse a String',
    description: 'Read a string and print it reversed.',
    difficulty: 'intermediate',
    level_required: 2,
    xp_reward: 60,
    topic_tag: 'strings',
    inputs: ['hello', 'java'],
    outputs: ['olleh', 'avaj'],
    solution: `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(new StringBuilder(s).reverse().toString());\n    }\n}`,
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