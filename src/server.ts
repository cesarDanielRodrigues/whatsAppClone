import fastify from "fastify";
import { runWhatsappAutomationRoute } from "./routes/run-whatsapp-automation-route.js";

const app = fastify();

app.register(runWhatsappAutomationRoute);

app.listen({ port: 3333 })
  .then(() => {
    console.log("Server is running");
  })
  .catch((err) => {
    console.error("Erro ao iniciar o servidor:", err);
    process.exit(1);
  });