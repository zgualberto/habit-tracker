import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Loads `.env.test` before the Nest configuration module reads `process.env`,
 * so the end-to-end suite always targets the dedicated test database.
 */
const environmentFilePath = resolve(__dirname, '..', '.env.test');
const environmentFileContents = readFileSync(environmentFilePath, 'utf8');

for (const environmentLine of environmentFileContents.split('\n')) {
  const trimmedLine = environmentLine.trim();

  if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
    continue;
  }

  const separatorIndex = trimmedLine.indexOf('=');
  if (separatorIndex === -1) {
    continue;
  }

  const variableName = trimmedLine.slice(0, separatorIndex).trim();
  const variableValue = trimmedLine.slice(separatorIndex + 1).trim();

  process.env[variableName] = variableValue;
}

process.env.NODE_ENVIRONMENT = 'test';
