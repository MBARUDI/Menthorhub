// services/maximoBrasilService.ts

export interface ChatRequest {
  prompt: string;
}

export interface ChatResponse {
  resultado: string;
}

export const maximoBrasilService = {
  async enviarPrompt(prompt: string): Promise<string> {
    const urlAPI = "https://www.maximobrasil.imb.br";

    try {
      const response = await fetch(urlAPI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        let erroMensagem = `Erro HTTP: ${response.status}`;
        try {
            const erroDados = await response.json();
            erroMensagem = erroDados.error || erroMensagem;
        } catch (e) {
            // Se a resposta não for JSON (ex: erro de rota do Cloudflare)
        }
        throw new Error(erroMensagem);
      }

      const dados: ChatResponse = await response.json();
      return dados.resultado;
      
    } catch (error: any) {
      console.error("Falha na requisição para a API Máximo Brasil:", error.message);
      throw error;
    }
  }
};
