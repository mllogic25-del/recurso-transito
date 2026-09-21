const { spawn } = require("child_process");

const port = process.env.PORT || "10000";
const host = "0.0.0.0";
const isWindows = process.platform === "win32";
const npxCmd = isWindows ? "npx.cmd" : "npx";

// ============================================================
// CONFIG DO WATCHDOG
// ============================================================
const BOT_INITIAL_DELAY_MS  = 5000;   // Aguarda 5s antes de iniciar o bot (Web server estabilizar)
const BOT_RESTART_DELAY_MS  = 5000;   // Aguarda 5s entre cada reinício
const WATCHDOG_INTERVAL_MS  = 60000;  // Verifica a cada 60 segundos se o bot ainda está vivo
const MAX_RESTARTS_IN_HOUR  = 10;     // Máximo de reinícios por hora (evita loop infinito)

let botProcess = null;
let isBotRunning = false;
let restartCount = 0;
let restartWindowStart = Date.now();

// ============================================================
// 1. INICIA O SERVIDOR WEB NEXT.JS
// ============================================================
console.log(`=======================================================`);
console.log(`🚀 Iniciando Servidor Next.js na porta ${port} e host ${host}...`);
console.log(`=======================================================`);

const webServer = spawn(npxCmd, ["next", "start", "-H", host, "-p", port], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

webServer.on("exit", (code) => {
  console.log(`[Servidor Web] Finalizado com código ${code}`);
  process.exit(code || 0);
});

// ============================================================
// 2. FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO DO BOT COM WATCHDOG
// ============================================================
function startBot(reason = "startup") {
  // Verifica se o processo atual ainda está vivo
  if (botProcess && !botProcess.killed) {
    try {
      // Manda sinal 0 para checar se o processo responde (não mata, só testa)
      process.kill(botProcess.pid, 0);
      console.log(`[Samuca Watchdog] Bot ainda está em execução (PID: ${botProcess.pid}). Não reinicializando.`);
      return;
    } catch (_) {
      // Processo morreu mas a referência ainda existe — limpa e reinicia
      botProcess = null;
      isBotRunning = false;
    }
  }

  // Proteção anti-loop: max restarts por hora
  const now = Date.now();
  if (now - restartWindowStart > 3600000) {
    // Passou 1 hora, reseta o contador
    restartCount = 0;
    restartWindowStart = now;
  }

  if (restartCount >= MAX_RESTARTS_IN_HOUR) {
    console.error(`[Samuca Watchdog] ⚠️  Limite de ${MAX_RESTARTS_IN_HOUR} reinícios/hora atingido. Aguardando próxima janela.`);
    return;
  }

  restartCount++;
  isBotRunning = false;

  console.log(`=======================================================`);
  console.log(`🤖 Iniciando Robô Samuca WhatsApp... (motivo: ${reason}) [reinício ${restartCount}/${MAX_RESTARTS_IN_HOUR}]`);
  console.log(`=======================================================`);

  try {
    botProcess = spawn(npxCmd, ["tsx", "src/bot/whatsapp.ts"], {
      stdio: "inherit",
      env: process.env,
      shell: true,
      detached: false,
    });

    botProcess.on("spawn", () => {
      isBotRunning = true;
      console.log(`[Samuca Watchdog] ✅ Bot iniciado com PID ${botProcess.pid}`);
    });

    botProcess.on("error", (err) => {
      console.error(`[Samuca Watchdog] ❌ Erro ao iniciar processo do bot:`, err.message);
      isBotRunning = false;
      botProcess = null;
      // Reagenda novo início após delay
      setTimeout(() => startBot("error-recovery"), BOT_RESTART_DELAY_MS);
    });

    botProcess.on("exit", (code, signal) => {
      isBotRunning = false;
      const exitDesc = signal ? `sinal ${signal}` : `código ${code}`;
      console.warn(`[Samuca Watchdog] ⚠️  Bot encerrou (${exitDesc}). Reagendando reinício em ${BOT_RESTART_DELAY_MS / 1000}s...`);
      botProcess = null;
      // Reinicialização automática após queda
      setTimeout(() => startBot("auto-restart-after-exit"), BOT_RESTART_DELAY_MS);
    });

  } catch (err) {
    console.error(`[Samuca Watchdog] Exceção ao iniciar bot:`, err);
    isBotRunning = false;
    botProcess = null;
    setTimeout(() => startBot("exception-recovery"), BOT_RESTART_DELAY_MS * 2);
  }
}

// ============================================================
// 3. WATCHDOG PERIÓDICO — verifica a cada 60s se o bot responde
// ============================================================
function startWatchdog() {
  setInterval(() => {
    const processAlive = botProcess && !botProcess.killed;

    if (!processAlive) {
      console.warn(`[Samuca Watchdog] 🔍 Verificação: bot NÃO está rodando. Reiniciando...`);
      startBot("watchdog-detected-offline");
      return;
    }

    // Testa se o processo realmente responde
    try {
      process.kill(botProcess.pid, 0);
      console.log(`[Samuca Watchdog] ✅ Verificação OK — Bot ativo (PID: ${botProcess.pid})`);
    } catch (_) {
      console.warn(`[Samuca Watchdog] 🔍 Processo PID ${botProcess.pid} não respondeu. Reiniciando...`);
      botProcess = null;
      isBotRunning = false;
      startBot("watchdog-process-dead");
    }
  }, WATCHDOG_INTERVAL_MS);
}

// ============================================================
// 4. PONTO DE ENTRADA — inicia bot + watchdog após Web estabilizar
// ============================================================
setTimeout(() => {
  startBot("initial-startup");
  startWatchdog();
}, BOT_INITIAL_DELAY_MS);

// ============================================================
// 5. TRATAMENTO DE SINAIS DO SISTEMA — mata o bot junto com o servidor
// ============================================================
function gracefulShutdown(signal) {
  console.log(`\n[Samuca Watchdog] Sinal ${signal} recebido. Encerrando bot e servidor...`);
  if (botProcess && !botProcess.killed) {
    botProcess.kill("SIGTERM");
  }
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT",  () => gracefulShutdown("SIGINT"));
