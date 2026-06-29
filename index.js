const TelegramBot = require('node-telegram-bot-api')
const mineflayer = require('mineflayer')

// ================== НАСТРОЙКИ ==================
const TOKEN = "8634910652:AAHZTT_UYgeow0pPjY6BWb8LE3_s1yvNtNU"
const OWNER_ID = 8465432674

const MC_CONFIG = {
  host: 'TweksMine.aternos.me',
  port: 54288,
  username: 'LoveTweksMine',
  version: '1.16.5'
}

const PASSWORD = "12349999"

// ================== ПЕРЕМЕННЫЕ ==================
let bot = null
let startTime = null
let reconnectTimeout = null
let manualStop = false

const tg = new TelegramBot(TOKEN, { polling: true })

// ================== ЗАЩИТА ==================
function checkAccess(msg) {
  if (msg.chat.id !== OWNER_ID) {
    tg.sendMessage(msg.chat.id, "⛔ Нет доступа")
    return false
  }
  return true
}

// ================== MINECRAFT БОТ ==================
function startBot() {
  if (bot) return

  manualStop = false

  bot = mineflayer.createBot(MC_CONFIG)
  startTime = Date.now()

  bot.on('spawn', () => {
    console.log("MC бот зашёл")
    tg.sendMessage(OWNER_ID, "🟢 Minecraft бот подключился")

    setTimeout(() => {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)

      setTimeout(() => {
        bot.chat(`/login ${PASSWORD}`)
      }, 3000)

    }, 3000)
  })

  bot.on('end', () => {
    console.log("MC бот отключился")
    bot = null

    if (manualStop) return

    tg.sendMessage(
      OWNER_ID,
      "🔴 Бот отключился\n🔄 Переподключение через 3 секунды..."
    )

    if (reconnectTimeout) clearTimeout(reconnectTimeout)

    reconnectTimeout = setTimeout(() => {
      startBot()
    }, 3000)
  })

  bot.on('kicked', (reason) => {
    console.log("Кик:", reason)

    tg.sendMessage(
      OWNER_ID,
      `⚠️ Бот был кикнут`
    )
  })

  bot.on('error', (err) => {
    console.log("Ошибка:", err.message)
  })
}

function stopBot() {
  if (!bot) return

  manualStop = true

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }

  bot.quit()
  bot = null
}

function getUptime() {
  if (!startTime) return "0 сек"

  return Math.floor((Date.now() - startTime) / 1000) + " сек"
}

// ================== МЕНЮ ==================
tg.onText(/\/start/, (msg) => {
  if (!checkAccess(msg)) return

  tg.sendMessage(msg.chat.id,
`🤖 Панель управления

Выберите действие:`, {
    reply_markup: {
      keyboard: [
        ["🟢 Запустить", "🔴 Остановить"],
        ["📊 Статус", "⏱ Время"]
      ],
      resize_keyboard: true
    }
  })
})

// ================== TELEGRAM ==================
tg.on('message', (msg) => {
  const text = msg.text
  const chatId = msg.chat.id

  if (!text) return
  if (!checkAccess(msg)) return

  if (text === "🟢 Запустить") {
    startBot()
    return tg.sendMessage(chatId, "✅ Бот запущен")
  }

  if (text === "🔴 Остановить") {
    stopBot()
    return tg.sendMessage(chatId, "⛔ Бот остановлен")
  }

  if (text === "📊 Статус") {
    return tg.sendMessage(chatId, bot ? "🟢 Онлайн" : "🔴 Оффлайн")
  }

  if (text === "⏱ Время") {
    return tg.sendMessage(chatId, "⏱ Работает: " + getUptime())
  }

  if (text.startsWith("💬 ")) {
    if (!bot) {
      return tg.sendMessage(chatId, "❌ Бот не запущен")
    }

    const mcMessage = text.slice(2)

    bot.chat(mcMessage)

    return tg.sendMessage(chatId, "📨 Отправлено в Minecraft")
  }
})

console.log("🤖 Панель управления запущена")
