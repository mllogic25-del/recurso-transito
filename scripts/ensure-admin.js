const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const pass12345678 = await bcrypt.hash("12345678", 10);

    // Conta principal de Márcio Santos (Login: 199902000706 | E-mail de Recuperação: mllogic25@gmail.com | Senha: 12345678)
    // Remove qualquer conta temporária residual para evitar duplicidade
    await prisma.user.deleteMany({
      where: {
        email: "199902000706@autorecurso.com.br",
      },
    });

    const marcioUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: "mllogic25@gmail.com" },
          { cpf: "199902000706" },
        ],
      },
    });

    if (marcioUser) {
      await prisma.user.update({
        where: { id: marcioUser.id },
        data: {
          name: "Márcio Santos",
          email: "mllogic25@gmail.com",
          cpf: "199902000706",
          phone: "79998340176",
          passwordHash: pass12345678,
          role: "ADMIN",
        },
      });
      console.log(`[Ensure Admin] Conta mllogic25@gmail.com vinculada ao login 199902000706 com senha 12345678.`);
    } else {
      await prisma.user.create({
        data: {
          name: "Márcio Santos",
          email: "mllogic25@gmail.com",
          cpf: "199902000706",
          phone: "79998340176",
          passwordHash: pass12345678,
          role: "ADMIN",
        },
      });
      console.log(`[Ensure Admin] Conta mllogic25@gmail.com criada com login 199902000706 e senha 12345678.`);
    }

    const admins = [
      {
        email: "mlesant14@gmail.com",
        name: "Administrador",
        phone: "79981686787",
      },
      {
        email: "admin@autorecurso.com.br",
        name: "Administrador do Sistema",
        phone: "(11) 99999-8888",
      },
    ];

    for (const a of admins) {
      const existing = await prisma.user.findUnique({
        where: { email: a.email.toLowerCase() },
      });

      if (!existing) {
        await prisma.user.create({
          data: {
            name: a.name,
            email: a.email.toLowerCase(),
            passwordHash: adminPassword,
            role: "ADMIN",
            phone: a.phone,
          },
        });
        console.log(`[Ensure Admin] Administrador ${a.email} criado com sucesso (senha inicial: admin123).`);
      } else if (existing.role !== "ADMIN") {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: "ADMIN" },
        });
        console.log(`[Ensure Admin] Perfil de ${a.email} atualizado para ADMIN.`);
      }
    }
  } catch (error) {
    console.error("[Ensure Admin] Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
