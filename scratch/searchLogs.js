const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logFile = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\6bff2d56-dac2-4beb-9b3c-47f05a19136a\\.system_generated\\logs\\transcript.jsonl';

async function search() {
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lines = [];

  for await (const line of rl) {
    lines.push(line);
  }

  console.log(`Total lines: ${lines.length}`);
  console.log('Printing last 15 lines of transcript:');
  lines.slice(-15).forEach((line, idx) => {
    try {
      const parsed = JSON.parse(line);
      console.log(`[Step ${parsed.step_index}] ${parsed.source} (${parsed.type}):`);
      console.log(parsed.content ? parsed.content.substring(0, 800) : '(no content)');
      if (parsed.tool_calls) {
        console.log('Tool calls:', JSON.stringify(parsed.tool_calls, null, 2));
      }
    } catch {
      console.log(line.substring(0, 500));
    }
    console.log('-------------------------------------------');
  });
}

search();
