import fastify from "fastify";
import { callNewPage } from "./functions/call-new-page.js";
import { getDataRoute } from "./routes/getDataRoute.js";

const app = fastify();

// Inicia o Whatsapp assim que o servidor iniciar
callNewPage();

app.register(getDataRoute);

app.listen({ port: 3333 })
  .then(() => {
    console.log("Server is running");
  })
  .catch((err) => {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  });