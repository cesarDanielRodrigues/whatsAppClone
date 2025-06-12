import puppeteer, { type Page } from "puppeteer"
import { sqliteConnect } from "../database/sqlite/index.js"

const db = await sqliteConnect()
const CHAT_LIST_SELECTOR = "#pane-side"
const QR_CODE_SELECTOR = "div[data-ref]"
const CONVERSATION_TITLE_SELECTOR = 'span[dir="auto"][title]'
const SELECTOR_TITLES = `${CHAT_LIST_SELECTOR} ${CONVERSATION_TITLE_SELECTOR}`
const MESSAGE_SELECTOR = "div.message-in, div.message-out"
// Seletor do banner
const BANNER_SELECTOR = 'div[role="dialog"], div[data-testid="download-app-banner"], div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5.xozqiw3.x1oa3qoh.x12fk4p8.xeuugli.x2lwn1j.x1qughib.x1q0g3np.x6s0dn4.xz9dl7a.x1a8lsjc.x10l6tqk.x1ey2m1c.xoz0ns6.xh8yej3.x150wa6m.x178xt8z.x13fuv20.xyj1x25'

const conversationTitle = async (page: Page, elements, index) => {
  const title = await page.evaluate((el) => el.textContent?.trim() || "", elements[index])
  return title
}

// Inserindo na tabela tb_conversations
const insertTitleinTb_conversations = async (title) => {
  await db.run("INSERT OR IGNORE INTO tb_conversations (conversation) VALUES (?)", title)
}

// Função para fechar o banner de download do WhatsApp, se existir
const closeDownloadBannerIfExists = async (page: Page) => {
  // Tenta encontrar o banner sem esperar
  const banner = await page.$(BANNER_SELECTOR)
  if (banner) {
    await banner.hover()
    const closeBtn = await banner.$("div:last-child > span:not([data-icon])")
    if (closeBtn) {
      await closeBtn.click()
    } else {
      console.log("Botão X não encontrado")
    }
  } else {
    console.log("Banner de download não encontrado.")
  }
}

//Buscando mensagens no whatsapp
const callMessages = async (page) => {
  const messages = await page.$$eval(MESSAGE_SELECTOR, (nodes) =>
    nodes.map((node) => {
      let text = ""
      let datetime = ""
      let sender = ""
      let prePlain = ""
      // Busca o texto da mensagem
      const textSpans = node.querySelectorAll("span.selectable-text span")
      if (textSpans.length > 0) {
        text = Array.from(textSpans)
          .map((s) => (s as any).textContent)
          .join(" ")
          .replace(/\s{2,}/g, " ")
          .trim()
      } else {
        text = "<<Mídia ou mensagem sem texto>>"
      }
      // Busca data-pre-plain-text em qualquer descendente
      const copyable = node.querySelector("[data-pre-plain-text]")
      if (copyable) {
        prePlain = copyable.getAttribute("data-pre-plain-text") || ""
      } else {
        prePlain = node.getAttribute("data-pre-plain-text") || ""
      }
      if (prePlain) {
        const timeMatch = prePlain.match(/\[(.*?)\]/)
        datetime = timeMatch ? timeMatch[1] : ""
        sender = prePlain
          .replace(/\[.*?\]\s*/, "")
          .replace(":", "")
          .trim()
      }
      return { sender, text, datetime }
    })
  )
  return messages
}

export const callNewPage = async () => {
  console.log("Iniciando o browser...")
  const browser = await puppeteer.launch({
    headless: false,
  })

  const page = await browser.newPage()
  // await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

  await page.goto("https://web.whatsapp.com/")

  console.log("Abrindo QR code para login...")
  await page.waitForSelector(QR_CODE_SELECTOR, {
    visible: true,
    timeout: 20000,
  })

  await page.waitForSelector(CHAT_LIST_SELECTOR, { timeout: 60000 })
  console.log("Login efetuado com sucesso!")

  await page.waitForSelector(SELECTOR_TITLES)

  // Loop para varredura constate
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const conversationElements = await page.$$(SELECTOR_TITLES)
    console.log(`Encontradas ${conversationElements.length} conversas.`)

    for (let i = 0; i < conversationElements.length; i++) {
      const title = await conversationTitle(page, conversationElements, i)

      await insertTitleinTb_conversations(title)

      // Busca novamente o elemento pelo título antes de clicar
      const safeTitle = title.replace(/"/g, '"')
      const conversation = await page.$(`${SELECTOR_TITLES}[title="${safeTitle}"]`)
      if (!conversation) {
        console.log(`Conversa com título "${title}" não encontrada para clicar.`)
        continue
      }
      await conversation.click()

      // Fecha o banner de download apenas na primeira execução
      if (i === 0) await closeDownloadBannerIfExists(page)

      // Aguarda o carregamento das mensagens
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Busca o texto da mensagem
      const getMessages = await callMessages(page)

      // Busca na tb_conversations o id
      const { id } = await db.get("SELECT id FROM tb_conversations WHERE conversation = ?", title)

      // Limpa as mensagens antigas da conversa antes de inserir as novas
      await db.run("DELETE FROM tb_messages WHERE id_conversation = ?", id)
      for (const message of getMessages) {
        await db.run("INSERT INTO tb_messages (id_conversation, sender, message, datetime) VALUES (?, ?, ?, ?)", id, message.sender, message.text, message.datetime)
      }
    }
  }
}
