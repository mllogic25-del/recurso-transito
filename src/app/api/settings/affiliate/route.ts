import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isAffiliateProgramActive, setAffiliateProgramActive } from "@/lib/settings";

export const dynamic = "force-dynamic";

// GET - Consulta pública se o programa de afiliados está ativo ou suspenso
export async function GET() {
  try {
    const active = await isAffiliateProgramActive();
    return NextResponse.json({ active });
  } catch (error: any) {
    return NextResponse.json({ active: true, error: error.message }, { status: 500 });
  }
}

// POST - Apenas Administrador pode ativar ou suspender o programa de afiliados
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 401 });
    }

    const body = await request.json();
    const { active } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "O campo 'active' (booleano) é obrigatório." },
        { status: 400 }
      );
    }

    const success = await setAffiliateProgramActive(active);

    if (!success) {
      return NextResponse.json(
        { error: "Falha ao salvar a configuração no banco de dados." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      active,
      message: active
        ? "Programa de afiliados ATIVADO com sucesso!"
        : "Programa de afiliados SUSPENSO com sucesso!",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
