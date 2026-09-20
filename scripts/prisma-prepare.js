const fs = require("fs");
const path = require("path");

const schemaPath = path.resolve(__dirname, "../prisma/schema.prisma");

if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, "utf8");
  const dbUrl = process.env.DATABASE_URL || "";
  const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
  const targetProvider = isPostgres ? "postgresql" : "sqlite";

  if (!schema.includes(`provider = "${targetProvider}"`)) {
    schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${targetProvider}"`);
    fs.writeFileSync(schemaPath, schema, "utf8");
    console.log(`[Prisma Prepare] Provedor ajustado para "${targetProvider}" com sucesso.`);
  } else {
    console.log(`[Prisma Prepare] Provedor "${targetProvider}" já configurado.`);
  }
} else {
  console.warn("[Prisma Prepare] schema.prisma não encontrado.");
}
