import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db/pool.js';

function isWordBoundary(text: string, index: number, keywordLength: number) {
  const before = text[index - 1];
  const after = text[index + keywordLength];
  const boundary = (char?: string) => !char || /\s|[();,]/.test(char);
  return boundary(before) && boundary(after);
}

function getNextWord(text: string, startIndex: number) {
  let idx = startIndex;
  while (idx < text.length && /\s/.test(text[idx]!)) {
    idx += 1;
  }

  let word = '';
  while (idx < text.length && /[A-Za-z_]/.test(text[idx]!)) {
    word += text[idx];
    idx += 1;
  }

  return word.toUpperCase();
}

function splitSqlStatements(script: string) {
  const statements: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;
  let beginEndDepth = 0;

  for (let i = 0; i < script.length; i += 1) {
    const char = script[i];
    const next = script[i + 1];
    const twoChars = char + next;

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        current += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        current += '*/';
        i += 1;
      }
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
      if (twoChars === '--' || char === '#') {
        inLineComment = true;
        continue;
      }
      if (twoChars === '/*') {
        inBlockComment = true;
        i += 1;
        continue;
      }

      const upperSlice = script.slice(i).toUpperCase();
      if (upperSlice.startsWith('BEGIN') && isWordBoundary(script, i, 5)) {
        beginEndDepth += 1;
      } else if (upperSlice.startsWith('END') && isWordBoundary(script, i, 3)) {
        const followingWord = getNextWord(script, i + 3);
        if (!['IF', 'WHILE', 'REPEAT', 'LOOP', 'CASE'].includes(followingWord)) {
          beginEndDepth = Math.max(0, beginEndDepth - 1);
        }
      }
    }

    if (char === "'" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
    } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
    }

    if (char === ';' && !inSingleQuote && !inDoubleQuote && !inBacktick && beginEndDepth === 0) {
      const statement = current.trim();
      if (statement.length > 0) {
        statements.push(statement);
      }
      current = '';
      continue;
    }

    current += char;
  }

  const finalStatement = current.trim();
  if (finalStatement.length > 0) {
    statements.push(finalStatement);
  }

  return statements;
}

async function runMigrations() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const backendRoot = path.resolve(currentDir, '..', '..');
  const projectRoot = path.resolve(backendRoot, '..');
  const databaseDir = path.resolve(projectRoot, 'database');

  const entries = await readdir(databaseDir);
  const sqlFiles = entries
    .filter((file) => file.endsWith('.sql'))
    .sort();

  console.log(`Applying migrations from ${databaseDir}`);

  for (const file of sqlFiles) {
    const fullPath = path.join(databaseDir, file);
    const script = await readFile(fullPath, 'utf8');
    const client = await db.getClient();
    const statements = splitSqlStatements(script);

    console.log(`\n🏗️  Running ${file}`);

    try {
      await client.beginTransaction();
      for (const [index, statement] of statements.entries()) {
        try {
          await client.query(statement);
        } catch (statementError) {
          console.error(`❌ Failed statement #${index + 1} in ${file}:`, statement);
          throw statementError;
        }
      }
      await client.commit();
      console.log(`✅ Completed ${file}`);
    } catch (error) {
      await client.rollback();
      console.error(`❌ Error while running ${file}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  await db.end();
}

runMigrations().catch((error) => {
  console.error('Migration process failed:', error);
  process.exitCode = 1;
});
