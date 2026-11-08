const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const pass12345678 = await bcrypt.hash("12345678", 10);

    // Usuário administrador solicitado especificamente
    const customAdminEmail = "199902000706@autorecurso.com.br";
    const customAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: customAdminEmail },
          { email: "199902000706" },
          { cpf: "199902000706" },
        ],
      },
    });

    if (!customAdmin) {
      await prisma.user.create({
        data: {
          name: "Administrador 199902000706",
          email: customAdminEmail,
          passwordHash: pass12345678,
          role: "ADMIN",
          cpf: "199902000706",
        },
      });
      console.log(`[Ensure Admin] Administrador 199902000706 criado com senha 12345678.`);
    } else {
      await prisma.user.update({
        where: { id: customAdmin.id },
        data: {
          passwordHash: pass12345678,
          role: "ADMIN",
          cpf: "199902000706",
        },
      });
      console.log(`[Ensure Admin] Administrador 199902000706 atualizado com senha 12345678.`);
    }

    const admins = [
      {
        email: "mlesant14@gmail.com",
        name: "Administrador",
        phone: "79981686787",
      },
      {
        email: "mllogic25@gmail.com",
        name: "Márcio Santos",
        phone: "79998340176",
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
