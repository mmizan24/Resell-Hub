import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(scriptDir, "..");
const serverDir = path.resolve(appDir, "..", "..", "resell-server");
const serverEntry = path.join(serverDir, "index.js");

function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host });

    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });

    socket.once("error", () => {
      resolve(false);
    });
  });
}

function waitForPort(port, host = "127.0.0.1", timeoutMs = 15000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const poll = async () => {
      if (await isPortOpen(port, host)) {
        resolve();
        return;
      }

      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Timed out waiting for ${host}:${port}`));
        return;
      }

      setTimeout(poll, 250);
    };

    void poll();
  });
}

function spawnProcess(command, args, options = {}) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  });
}

async function main() {
  const backendRunning = await isPortOpen(5000);
  const nextRunning = await isPortOpen(3000);
  let startedServer = false;
  let serverProcess = null;

  if (!backendRunning && nextRunning) {
    console.log("Next.js is already running on port 3000. Starting the ResellHUB API in the background...");
    serverProcess = spawnProcess(process.execPath, [serverEntry], {
      cwd: serverDir,
      env: process.env,
      detached: true,
    });
    serverProcess.unref();
    await waitForPort(5000);
    return;
  }

  if (!backendRunning) {
    console.log("Starting ResellHUB API on port 5000...");
    serverProcess = spawnProcess(process.execPath, [serverEntry], {
      cwd: serverDir,
      env: process.env,
    });
    startedServer = true;
    await waitForPort(5000);
  } else {
    console.log("ResellHUB API already running on port 5000.");
  }

  if (nextRunning) {
    console.log("Next.js is already running on port 3000. ResellHUB dev is ready.");
    return;
  }

  const nextProcess = spawnProcess(process.execPath, [
    path.join(appDir, "node_modules", "next", "dist", "bin", "next"),
    "dev",
  ], {
    cwd: appDir,
    env: process.env,
  });

  const shutdown = () => {
    if (nextProcess && !nextProcess.killed) {
      nextProcess.kill();
    }

    if (startedServer && serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  nextProcess.on("exit", (code, signal) => {
    shutdown();
    process.exitCode = code ?? (signal ? 1 : 0);
  });

  if (startedServer) {
    serverProcess.on("exit", (code, signal) => {
      if (code && code !== 0) {
        console.error(`ResellHUB API exited with code ${code}${signal ? ` (${signal})` : ""}.`);
      }
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
