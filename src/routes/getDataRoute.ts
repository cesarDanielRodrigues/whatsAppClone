import { FastifyInstance } from "fastify";
import { getDataFromDatabase } from "../functions/get-data-from-database.js";

export const getDataRoute = async (app: FastifyInstance) => {
	app.get("/", async () => {
        const data = await getDataFromDatabase();

        return data;
	});
};
