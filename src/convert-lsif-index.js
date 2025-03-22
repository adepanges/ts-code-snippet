import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import { DATA_DIR } from './config.js';

const DATA_DIR = DATA_DIR || "./extracts"; // Assuming DATA_DIR is set in the environment
const LSIF_INDEX = path.join(DATA_DIR, 'index.lsif');

console.log(`Converting LSIF index file: ${LSIF_INDEX}`);

async function convertLsifIndex() {
  try {
    if (!fs.existsSync(LSIF_INDEX)) {
        throw new Error(`LSIF index file not found: ${LSIF_INDEX}`);
    }
    const lsifData = fs.readFileSync(LSIF_INDEX, 'utf-8');
    let rootDir = null;
    const documents = {};
    const foldingRanges = {};
    const edges = [];

    for (const row of lsifData.split('\n')) {
      if (!row.trim()) continue; // Skip empty lines

      try {
        const rowDict = JSON.parse(row);
        const vertexId = rowDict.id;

        if (rowDict.type === 'vertex' && rowDict.label === 'source') {
          rootDir = path.normalize(rowDict.workspaceRoot.replace('file://', ''));
        } else if (rowDict.type === 'vertex' && rowDict.label === 'document') {
          documents[vertexId] = rowDict;
        } else if (rowDict.type === 'vertex' && rowDict.label === 'foldingRangeResult') {
          foldingRanges[vertexId] = rowDict;
        } else if (rowDict.type === 'edge' && rowDict.label === 'textDocument/foldingRange') {
          edges.push([rowDict.outV, rowDict.inV]);
        }
      } catch (parseError) {
        console.error(`Error parsing JSON row: ${row}`, parseError);
        // Consider if you want to continue or throw the error
        continue; // Skip to the next line
      }
    }

    if (!rootDir) {
      throw new Error('Root directory not found in LSIF index.');
    }

    const entries = [];
    for (const [documentId, foldingRangeId] of edges) {
      const document = documents[documentId];
      const foldingRange = foldingRanges[foldingRangeId];

      if (!document || !foldingRange) {
        console.warn(`Document or folding range not found for IDs: ${documentId}, ${foldingRangeId}`);
        continue;
      }

      for (const currentRange of foldingRange.result) {
        if (currentRange.kind === 'imports') {
          continue;
        }

        const docPath = new URL(document.uri).pathname;
        const docText = fs.readFileSync(docPath, 'utf-8');
        const docLines = docText.split('\n');
        const { startLine, startCharacter, endLine, endCharacter } = currentRange;

        const codeSnippet = docLines.slice(startLine, endLine + 1).join('\n');
        const absPath = document.uri.replace('file://', '');
        const relPath = path.relative(rootDir, absPath);

        entries.push({
          file: relPath,
          start_line: startLine,
          start_character: startCharacter,
          end_line: endLine,
          end_character: endCharacter,
          code_snippet: codeSnippet,
        });
      }
    }

    const outputPath = path.join(DATA_DIR, 'qdrant_snippets.jsonl');
    const outputStream = fs.createWriteStream(outputPath);

    for (const entry of entries) {
      outputStream.write(JSON.stringify(entry) + '\n');
    }
    outputStream.end();
    console.log(`Successfully converted LSIF index to ${outputPath}`);

  } catch (error) {
    console.error('Error converting LSIF index:', error);
  }
}

convertLsifIndex();
