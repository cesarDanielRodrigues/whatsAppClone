import { sqliteConnect } from "../database/sqlite/index.js"

export const getDataFromDatabase = async () => {
  const db = await sqliteConnect()
  // Busca todas as conversas
  const conversations = await db.all("SELECT * FROM tb_conversations")
  // Busca todas as mensagens
  const messages = await db.all("SELECT * FROM tb_messages")
  return { conversations, messages }
}
