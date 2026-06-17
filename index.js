const TelegramBot = require('node-telegram-bot-api')
const mineflayer = require('mineflayer')

// ===== TELEGRAM =====
const TOKEN = "8634910652:AAEdvpCj49c07EyBzviOe18M8g2pWqq05g4"

const tg = new TelegramBot(TOKEN, { polling: true })

// ===== MC CONFIG =====
const CONFIG = {
  host: 'TweksMine.aternos.me',
  port: 23351,
  username: 'LoveTweksMine',
  version: '1.16.5'
}

const PASSWORD = "12349999"

let bot = null
let startTime = null

// ===== START BOT =====
function startBot() {
  if (bot) return

  bot = mineflayer.createBot(CONFIG)
  startTime = Date.now()

  bot.on('spawn', () => {
    console.log("MC bot started")

    setTimeout(() => {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
      setTimeout(() => {
        bot.chat(`/login ${PASSWORD}`)
      }, 3000)
    }, 3000)
  })

  bot.on('end', () => {
    console.log("MC bot stopped")
    bot = null
  })

  bot.on('error', (err) => {
    console.log("Error:", err.message)
  })
}

// ===== STOP BOT =====
function stopBot() {
  if (!bot) return
  bot.quit()
  bot = null
}

// ===== UPTIME =====
function getUptime() {
  if (!startTime) return "0s"
  const sec = Math.floor((Date.now() - startTime) / 1000)
  return `${sec}s`
}

// ===== TELEGRAM BUTTONS =====
tg.onText(/\/start/, (msg) => {
  tg.sendMessage(msg.chat.id, "MC Control Panel", {
    reply_markup: {
      keyboard: [
        ["▶️ Start", "⏹ Stop"],
        ["📊 Status", "⏱ Uptime"]
      ],
      resize_keyboard: true
    }
  })
})

tg.on('message', (msg) => {
  const text = msg.text
  const chatId = msg.chat.id

  if (!text) return

  if (text === "▶️ Start") {
    startBot()
    tg.sendMessage(chatId, "Bot started")
  }

  if (text === "⏹ Stop") {
    stopBot()
    tg.sendMessage(chatId, "Bot stopped")
  }

  if (text === "📊 Status") {
    tg.sendMessage(chatId, bot ? "Online 🟢" : "Offline 🔴")
  }

  if (text === "⏱ Uptime") {
    tg.sendMessage(chatId, getUptime())
  }
})

console.log("Telegram control bot running")