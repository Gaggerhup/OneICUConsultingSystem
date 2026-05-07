#!/usr/bin/env node

import fs from 'node:fs';
import readline from 'node:readline';

function parseArgs(argv) {
  const args = {
    stdin: false,
    file: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--stdin':
        args.stdin = true;
        break;
      case '--file':
        args.file = argv[++i] ?? '';
        break;
      default:
        throw new Error(`Unsupported argument: ${token}`);
    }
  }

  return args;
}

function ensure(value, label) {
  if (!value) {
    throw new Error(`Missing required argument: ${label}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.stdin) {
    ensure(args.file, '--file');
  }

  const input = args.stdin
    ? process.stdin
    : fs.createReadStream(args.file, { encoding: 'utf8' });

  if (args.stdin) {
    process.stdin.setEncoding('utf8');
  }

  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  let statement = '';
  let statementCount = 0;

  for await (const line of rl) {
    if (!statement && /^\s*(--|#)/.test(line)) {
      continue;
    }

    statement += line;
    statement += '\n';

    if (line.trimEnd().endsWith(';')) {
      const sql = statement.trim();
      if (sql) {
        process.stdout.write(sql);
        process.stdout.write('\0');
        statementCount += 1;
      }
      statement = '';
    }
  }

  if (statement.trim()) {
    process.stdout.write(statement.trim());
    process.stdout.write('\0');
    statementCount += 1;
  }

  process.stderr.write(`ok|${statementCount}|0\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
