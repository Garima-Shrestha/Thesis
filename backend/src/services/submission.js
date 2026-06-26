import db from '../database/database.js';
import { awardXP, updateStreak, checkBadges, checkGroupUnlock } from './gamification.js';
import { exec } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import os from 'os';
import pathModule from 'path';


const toBase64 = (str) => Buffer.from(str).toString('base64');
const fromBase64 = (str) => Buffer.from(str, 'base64').toString('utf8');


export const runCode = async (code, challengeId) => {
  const testCases = db.prepare(`
    SELECT * FROM test_cases WHERE challenge_id = ? AND is_sample = 1
  `).all(challengeId);


  return await executeAgainstCases(code, testCases);
};


export const submitCode = async (userId, challengeId, code) => {
  const testCases = db.prepare(`
    SELECT * FROM test_cases WHERE challenge_id = ?
  `).all(challengeId);


  const results = await executeAgainstCases(code, testCases);
  const allPassed = results.every(r => r.passed);
  const status = allPassed ? 'accepted' : 'wrong_answer';


  db.prepare(`
    INSERT INTO submissions (user_id, challenge_id, code, status, submitted_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, challengeId, code, status, new Date().toISOString());


  if (allPassed) {
    const alreadySolved = db.prepare(`
      SELECT id FROM submissions
      WHERE user_id = ? AND challenge_id = ? AND status = 'accepted'
    `).all(userId, challengeId);


    if (alreadySolved.length === 1) {
      const challenge = db.prepare('SELECT xp_reward FROM challenges WHERE id = ?').get(challengeId);
      awardXP(userId, challenge.xp_reward, 'challenge_solved', challengeId);
      updateStreak(userId);
      db.prepare(`
        UPDATE users SET problems_solved = problems_solved + 1 WHERE id = ?
      `).run(userId);
      checkBadges(userId);
      checkGroupUnlock(userId);
    }
  }


  return { status, results };
};


const executeAgainstCases = async (code, testCases) => {
  const results = [];
  const tmpDir = pathModule.join(os.tmpdir(), `gcp_${Date.now()}`);
  
  try {
    await mkdir(tmpDir, { recursive: true });
    const javaFile = pathModule.join(tmpDir, 'Main.java');
    await writeFile(javaFile, code);

    // Compile
    const compileError = await new Promise((resolve) => {
      exec(`javac "${javaFile}"`, (error, stdout, stderr) => {
        resolve(stderr || null);
      });
    });

    if (compileError) {
      for (const tc of testCases) {
        results.push({
          passed: false,
          expected: tc.expected_output,
          actual: compileError.trim(),
          status: 'Compilation Error',
        });
      }
      return results;
    }

    // Run against each test case
    for (const tc of testCases) {
      const output = await new Promise((resolve) => {
        const process = exec(`java -cp "${tmpDir}" Main`, (error, stdout, stderr) => {
          resolve({ stdout: stdout || '', stderr: stderr || '', error });
        });
        if (tc.input) {
          process.stdin.write(tc.input);
        }
        process.stdin.end();
      });

      // const actualOutput = output.stdout.trim();
      // const expectedOutput = tc.expected_output.trim();
      // const passed = actualOutput === expectedOutput;

      const actualOutput = output.stdout.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const expectedOutput = tc.expected_output.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const passed = actualOutput === expectedOutput;

      results.push({
        passed,
        expected: expectedOutput,
        actual: actualOutput || output.stderr.trim() || 'No output',
        status: passed ? 'Accepted' : output.error ? 'Runtime Error' : 'Wrong Answer',
      });
    }
  } catch (err) {
    console.log('Execution error:', err.message);
    for (const tc of testCases) {
      results.push({ passed: false, expected: tc.expected_output, actual: err.message, status: 'Error' });
    }
  } finally {
    // Cleanup temp files
    exec(`rmdir /s /q "${tmpDir}"`);
  }

  return results;
};