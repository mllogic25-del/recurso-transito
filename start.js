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
//    + detecta conexão "zumbi" (processo vivo mas WhatsApp morto)
// ============================================================
const { Client } = require("pg"); // disponível no Render (PostgreSQL)

async function checkStaleConnection() {
  // Só checa conexão zumbi se o processo estiver vivo
  if (!botProcess || botProcess.killed) return false;

  // Tenta consultar o banco de dados (DATABASE_URL disponível no Render)
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return false; // ambiente local sem DB externo — pula

  let client;
  try {
    client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();

    const result = await client.query(
      `SELECT value FROM "WhatsappSession" WHERE id = $1 LIMIT 1`,
      ["samuca_STATUS"]
    );

    if (result.rows.length === 0) return false;

    const data = JSON.parse(result.rows[0].value);
    if (data.status !== "CONNECTED") return false; // não é zumbi, está desconectado normalmente

    const lastUpdate = new Date(data.updatedAt).getTime();
    const staleLimitMs = 12 * 60 * 1000; // 12 minutos (heartbeat é a cada 5, margem de 2x)
    const isStale = (Date.now() - lastUpdate) > staleLimitMs;

    if (isStale) {
      const minutesOld = Math.floor((Date.now() - lastUpdate) / 60000);
      console.warn(`[Samuca Watchdog] 🧟 CONEXÃO ZUMBI detectada! Status CONNECTED há ${minutesOld} minutos sem atualização. Matando processo...`);
      return true;
    }

    console.log(`[Samuca Watchdog] ✅ Heartbeat OK — último update há ${Math.floor((Date.now() - lastUpdate) / 1000)}s`);
    return false;
  } catch (err) {
    console.warn("[Samuca Watchdog] Não foi possível verificar stale no DB:", err.message);
    return false;
  } finally {
    try { if (client) await client.end(); } catch (_) {}
  }
}

function startWatchdog() {
  setInterval(async () => {
    const processAlive = botProcess && !botProcess.killed;

    if (!processAlive) {
      console.warn(`[Samuca Watchdog] 🔍 Verificação: bot NÃO está rodando. Reiniciando...`);
      startBot("watchdog-detected-offline");
      return;
    }

    // Testa se o processo do OS ainda responde (sinal 0 = não mata, só verifica)
    try {
      process.kill(botProcess.pid, 0);
    } catch (_) {
      console.warn(`[Samuca Watchdog] 🔍 Processo PID ${botProcess.pid} não respondeu. Reiniciando...`);
      botProcess = null;
      isBotRunning = false;
      startBot("watchdog-process-dead");
      return;
    }

    // Verifica conexão zumbi (processo vivo mas WhatsApp silenciosamente morto)
    const isZombie = await checkStaleConnection();
    if (isZombie) {
      if (botProcess && !botProcess.killed) {
        botProcess.kill("SIGTERM");
      }
      botProcess = null;
      isBotRunning = false;
      setTimeout(() => startBot("watchdog-zombie-kill"), BOT_RESTART_DELAY_MS);
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
