import { FastifyInstance } from "fastify";
import { callNewPage } from "../functions/call-new-page.js";

export const runWhatsappAutomationRoute = async (app: FastifyInstance) => {
	app.get("/", async (request, reply) => {
        callNewPage()
        return null
	});
};
