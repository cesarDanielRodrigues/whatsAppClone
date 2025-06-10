import puppeteer from "puppeteer";

export const callNewPage = async () => {
	const CHAT_LIST_SELECTOR = "#pane-side"
	const QR_CODE_SELECTOR = "div[data-ref]"
	const CONVERSATION_TITLE_SELECTOR = 'span[dir="auto"][title]'

	console.log("Iniciando o browser...");
	const browser = await puppeteer.launch({
		headless: false,
	});

	const page = await browser.newPage();
	await page.setUserAgent(
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
	);

	await page.goto("https://web.whatsapp.com/");

	console.log("Abrindo QR code para login...");
	await page.waitForSelector(QR_CODE_SELECTOR, {
		visible: true,
		timeout: 20000,
	});

	await page.waitForSelector(CHAT_LIST_SELECTOR, { timeout: 60000 });
	console.log("Login efetuado com sucesso!");
};


