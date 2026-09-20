const { spawn } = require("child_process");

const port = process.env.PORT || "10000";
const host = "0.0.0.0";
const isWindows = process.platform === "win32";
const npxCmd = isWindows ? "npx.cmd" : "npx";

console.log(`=======================================================`);
console.log(`🚀 Iniciando Servidor Next.js na porta ${port} e host ${host}...`);
console.log(`=======================================================`);

// 1. Inicia o servidor Web Next.js
const webServer = spawn(
  npxCmd,
  ["next", "start", "-H", host, "-p", port],
  {
    stdio: "inherit",
    env: process.env,
    shell: true,
  }
);

webServer.on("exit", (code) => {
  console.log(`[Servidor Web] Finalizado com código ${code}`);
  process.exit(code || 0);
});

// 2. Inicia automaticamente o robô do WhatsApp Samuca em background (Render / Produção)
setTimeout(() => {
  console.log(`=======================================================`);
  console.log(`🤖 Iniciando Robô Samuca WhatsApp em background...`);
  console.log(`=======================================================`);

  const botProcess = spawn(
    npxCmd,
    ["tsx", "src/bot/whatsapp.ts"],
    {
      stdio: "inherit",
      env: process.env,
      shell: true,
    }
  );

  botProcess.on("exit", (code) => {
    console.warn(`[Samuca Bot] Processo do WhatsApp encerrou com código ${code}.`);
  });
}, 2500);
