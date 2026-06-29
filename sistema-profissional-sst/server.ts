import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3010;

  // API Route to get the Google OAuth URL
  app.get("/api/auth/google/url", (req, res) => {
    let clientId = process.env.VITE_GOOGLE_CLIENT_ID || "109128618181-e8kg5qel6bf73sv6b1rcrjcj989te8ml.apps.googleusercontent.com";
    clientId = clientId.trim();
    console.log(`Iniciando OAuth com Client ID (primeiros 10 caracteres): ${clientId.substring(0, 10)}...`);

    const scope = req.query.scope as string || "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents";
    
    // In Cloud Run / AI Studio, we are behind a proxy. 
    // We must ensure the redirect URI uses HTTPS.
    const host = req.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const redirectUri = `${protocol}://${host}/auth/callback`;
    console.log(`OAuth Request:
      Client ID: ${clientId}
      Redirect URI: ${redirectUri}
      Host: ${host}
      Protocol: ${protocol}`);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "token",
      scope: scope,
      include_granted_scopes: "true",
      state: "pass-through value",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // OAuth Callback Route
  app.get(["/auth/callback", "/auth/callback/"], (req, res) => {
    // This page handles the token from the URL fragment (for response_type=token)
    // and sends it to the opener window via postMessage.
    res.send(`
      <html>
        <body>
          <script>
            // For response_type=token, the token is in the hash
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const token = params.get('access_token');
            
            if (window.opener) {
              if (token) {
                window.opener.postMessage({ type: 'OAUTH_TOKEN', token: token }, '*');
              } else {
                // If no token in hash, maybe it was an error or code flow
                const error = new URLSearchParams(window.location.search).get('error');
                window.opener.postMessage({ type: 'OAUTH_ERROR', error: error || 'Unknown error' }, '*');
              }
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Autenticação concluída. Esta janela fechará automaticamente.</p>
        </body>
      </html>
    `);
  });

// Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Modo desenvolvimento ativo. Iniciando servidor Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      console.log(`Requisição recebida: ${url}`);
      try {
        let template = await fs.readFile(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        console.error(`Erro ao processar index.html para ${url}:`, e);
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
