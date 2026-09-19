const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
  
  const email = "mlesant14@gmail.com";
  const password = "Cb07a163*";
  const hash = await bcrypt.hash(password, 10);

  // Verifica se já existe
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    // Atualiza para ADMIN e nova senha
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash, role: "ADMIN", name: "Administrador" }
    });
    console.log("✅ Conta ADMIN atualizada com sucesso!");
  } else {
    // Cria nova conta ADMIN
    await prisma.user.create({
      data: {
        name: "Administrador",
        email,
        passwordHash: hash,
        role: "ADMIN",
        phone: "79998340176"
      }
    });
    console.log("✅ Conta ADMIN criada com sucesso!");
  }

  console.log("📧 Email:", email);
  console.log("🔑 Senha: Cb07a163*");
  console.log("👤 Role: ADMIN");
  
  await prisma.$disconnect();
}

main().catch(console.error);
