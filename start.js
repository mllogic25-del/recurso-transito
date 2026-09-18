const { spawn } = require("child_process");

const port = process.env.PORT || "10000";
const host = "0.0.0.0";

console.log(`=======================================================`);
console.log(`🚀 Iniciando Servidor Next.js na porta ${port} e host ${host}...`);
console.log(`=======================================================`);

const child = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "start", "-H", host, "-p", port],
  {
    stdio: "inherit",
    env: process.env,
    shell: true,
  }
);

child.on("exit", (code) => {
  console.log(`[Servidor] Finalizado com código ${code}`);
  process.exit(code || 0);
});
