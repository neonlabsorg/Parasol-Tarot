/**
 * @deprecated No longer used - replaced by rembg API (@remove-background-ai/rembg.js)
 * This file is kept for reference only.
 */
import { spawn } from "child_process";

export function removeBackgroundWithRembg(inputBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Try "rembg" first, fallback to "python -m rembg" if not in PATH
    const proc = spawn("rembg", ["i", "-", "-"], {
      shell: true, // Use shell to find rembg in PATH
    });

    const chunks: Buffer[] = [];
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      chunks.push(chunk as Buffer);
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("error", (err) => {
      // If "rembg" command not found, try "python -m rembg"
      if (err.message.includes("ENOENT") || err.message.includes("not found")) {
        console.log("[removeBackgroundWithRembg] rembg not in PATH, trying python -m rembg");
        const pythonProc = spawn("python", ["-m", "rembg", "i", "-", "-"], {
          shell: true,
        });

        const pythonChunks: Buffer[] = [];
        let pythonStderr = "";

        pythonProc.stdout.on("data", (chunk) => {
          pythonChunks.push(chunk as Buffer);
        });

        pythonProc.stderr.on("data", (chunk) => {
          pythonStderr += chunk.toString();
        });

        pythonProc.on("error", (pythonErr) => {
          reject(new Error(`Failed to run rembg: ${pythonErr.message}`));
        });

        pythonProc.on("close", (code) => {
          if (code !== 0) {
            return reject(new Error(`rembg exited with code ${code}: ${pythonStderr}`));
          }
          resolve(Buffer.concat(pythonChunks));
        });

        pythonProc.stdin.write(inputBuffer);
        pythonProc.stdin.end();
        return;
      }
      reject(err);
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`rembg exited with code ${code}: ${stderr}`));
      }
      resolve(Buffer.concat(chunks));
    });

    // send image data to rembg stdin
    proc.stdin.write(inputBuffer);
    proc.stdin.end();
  });
}

