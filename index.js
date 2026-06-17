const TelegramBot = require('node-telegram-bot-api')
const mineflayer = require('mineflayer')

// ================== НАСТРОЙКИ ==================
const TOKEN = "8634910652:AAEdvpCj49c07EyBzviOe18M8g2pWqq05g4"
const OWNER_ID = 8465432674 // <-- твой Telegram ID

const MC_CONFIG = {
  host: 'TweksMine.aternos.me',
  port: 23351,
  username: 'LoveTweksMine',
  version: '1.16.5'
}

const PASSWORD = "12349999"

// ================== ПЕРЕМЕННЫЕ ==================
let bot = null
let startTime = null

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

  bot = mineflayer.createBot(MC_CONFIG)
  startTime = Date.now()

  bot.on('spawn', () => {
    console.log("MC бот зашёл")

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
  })

  bot.on('error', (err) => {
    console.log("Ошибка:", err.message)
  })
}

function stopBot() {
  if (!bot) return
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
        ["📊 Статус", "⏱ Время"],
        ["💬 Отправить сообщение"]
      ],
      resize_keyboard: true
    }
  })
})

// ================== ЛОГИКА ==================
tg.on('message', (msg) => {
  const text = msg.text
  const chatId = msg.chat.id

  if (!text) return
  if (!checkAccess(msg)) return

  // ▶️ запуск
  if (text === "🟢 Запустить") {
    startBot()
    return tg.sendMessage(chatId, "✅ Бот запущен")
  }

  // ⛔ стоп
  if (text === "🔴 Остановить") {
    stopBot()
    return tg.sendMessage(chatId, "⛔ Бот остановлен")
  }

  // 📊 статус
  if (text === "📊 Статус") {
    return tg.sendMessage(chatId, bot ? "🟢 Онлайн" : "🔴 Оффлайн")
  }

  // ⏱ время
  if (text === "⏱ Время") {
    return tg.sendMessage(chatId, "⏱ Работает: " + getUptime())
  }

  // 💬 отправка в Minecraft
  if (text.startsWith("💬 ")) {
    if (!bot) {
      return tg.sendMessage(chatId, "❌ Бот не запущен")
    }

    const mcMessage = text.slice(2)

    bot.chat(mcMessage)

    return tg.sendMessage(chatId, "📨 Отправлено в Minecraft: " + mcMessage)
  }
})

console.log("🤖 Панель управления запущена")
