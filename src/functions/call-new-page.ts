import puppeteer, { Page } from "puppeteer"

const INFORMATION = {}
const CHAT_LIST_SELECTOR = "#pane-side"
const QR_CODE_SELECTOR = "div[data-ref]"
const CONVERSATION_TITLE_SELECTOR = 'span[dir="auto"][title]'
const SELECTOR_TITLES = `${CHAT_LIST_SELECTOR} ${CONVERSATION_TITLE_SELECTOR}`
// Seletor do banner
const BANNER_SELECTOR =
  'div[role="dialog"], div[data-testid="download-app-banner"], div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5.xozqiw3.x1oa3qoh.x12fk4p8.xeuugli.x2lwn1j.x1qughib.x1q0g3np.x6s0dn4.xz9dl7a.x1a8lsjc.x10l6tqk.x1ey2m1c.xoz0ns6.xh8yej3.x150wa6m.x178xt8z.x13fuv20.xyj1x25'

const conversations = async (page) => {
  const conversationTitles = await page.$$eval(SELECTOR_TITLES, (elements) =>
    elements.map((e) => e.textContent?.trim() || "")
  )
  console.log("Títulos das conversas:", conversationTitles)
}

// Função para fechar o banner de download do WhatsApp, se existir
async function closeDownloadBannerIfExists(page: Page) {
  const banner = await page.waitForSelector(BANNER_SELECTOR, { timeout: 5000 })
  if (banner) {
    await banner.hover()
    // Buscando o último span vazio dentro do banner
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

export const callNewPage = async () => {
  console.log("Iniciando o browser...")
  const browser = await puppeteer.launch({
    headless: false,
  })

  const page = await browser.newPage()
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  )

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
      conversations(page)
      const conversation = conversationElements[i]
      await conversation.click()
      // Fecha o banner de download apenas na primeira execução
      i === 0 ? await closeDownloadBannerIfExists(page) : null
      // Aguarda o carregamento das mensagens
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Seletores para mensagens, remetentes e horários
      const MESSAGE_SELECTOR = "div.message-in, div.message-out"
      const messages = await page.$$eval(MESSAGE_SELECTOR, (nodes) =>
        nodes.map((node) => {
          // Busca o texto da mensagem
          let text = ""
          const textSpans = node.querySelectorAll("span.selectable-text span")
          if (textSpans.length > 0) {
            text = Array.from(textSpans)
              .map((s) => (s as any).textContent)
              .join(" ")
              .trim()
          }

          // Busca data-pre-plain-text em qualquer descendente
          let datetime = ""
          let sender = ""
          let prePlain = ""
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

          // Fallbacks
          if (!datetime) {
            const meta = node.querySelector('span[data-testid="msg-meta"]')
            if (meta && meta.textContent) {
              datetime = meta.textContent.trim()
            }
          }
          if (!sender) {
            const senderSpan = node.querySelector('span[dir="auto"][class*=""]')
            if (senderSpan && senderSpan.textContent) {
              sender = senderSpan.textContent.trim()
            }
          }

          return { text, sender, datetime }
        })
      )

      console.log(`Mensagens da conversa ${i + 1}:`, messages)
      // Loga mensagens sem sender e datetime para debug

      // Aguarda um pouco antes de ir para a próxima conversa
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Aguarda 30 segundos antes de varrer novamente
    await new Promise((resolve) => setTimeout(resolve, 30000))
  }
}
