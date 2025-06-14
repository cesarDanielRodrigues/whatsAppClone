import { FastifyInstance } from "fastify"
import { MessageConversation } from "../functions/call-new-page.js"

interface BodyParams {
  conversationId: number
  message: string
}

export const sendMessageRoute = async (app: FastifyInstance) => {
  app.post("/send-message", async (request,reply) => {
    const { conversationId, message } = request.body as BodyParams
    
    await MessageConversation(conversationId, message)

    return reply.status(200).send({ message: "Mensagem enviada com sucesso." })
  })
}
