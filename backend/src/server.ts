import fastify from "fastify";
import cors from '@fastify/cors';
import { callNewPage } from "./functions/call-new-page.js";
import { getDataRoute } from "./routes/getDataRoute.js";
import { sendMessageRoute } from "./routes/sendMessage.js";

const app = fastify();

// Habilita CORS para todas as origens
app.register(cors, {
  origin: true
});

// Inicia o Whatsapp assim que o servidor iniciar
callNewPage();

app.register(getDataRoute);
app.register(sendMessageRoute);

app.listen({ port: 3333 })
  .then(() => {
    console.log("Server is running");
  })
  .catch((err) => {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  });