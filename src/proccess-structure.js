const { exec, execSync } = require("child_process");

const filePath = "./extracts/qdrant_snippets.jsonl";

// Count the lines in the file
const countLines = () => {
  return new Promise((resolve, reject) => {
    execSync(`wc -l ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error counting lines: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.error(`Error: ${stderr}`);
        reject(new Error(stderr));
        return;
      }

      // Extract the number of lines from wc -l output
      const lineCount = parseInt(stdout.trim().split(" ")[0]);
      console.log(`File has ${lineCount} lines`);
      resolve(lineCount);
    });
  });
};

// Read a specific line from a file
const readLine = (filePath, lineNumber) => {
  return new Promise((resolve, reject) => {
    exec(`sed -n '${lineNumber}p' ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error reading line ${lineNumber}: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.error(`Error: ${stderr}`);
        reject(new Error(stderr));
        return;
      }

      const lineContent = stdout.trim();
      console.log(`Line ${lineNumber}: ${lineContent}`);
      resolve(lineContent);
    });
  });
};


// Usage example:
async function main() {
  try {
    console.log("Counting lines..." + filePath);
    const lineCount = await countLines();
    console.log(`File has ${lineCount} lines`);
    for (let i = 1; i <= lineCount; i++) {
      const lineContent = await readLine(filePath, i);
      console.log(`Line ${i}: ${lineContent}`);
    }
    // do something with lineCount
  } catch (error) {
    console.error('Failed to count lines:', error);
  }
}


main();