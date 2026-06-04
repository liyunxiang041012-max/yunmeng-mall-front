<template>
  <div class="ai-page">
    <div class="bg-texture"></div>

    <!-- ══ 顶部导航 ══ -->
    <header class="ai-nav">
      <div class="nav-inner">
        <button class="nav-back" @click="$router.push('/home')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div class="nav-brand">
          <div class="nav-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <span class="nav-name">云梦 AI</span>
          <span class="nav-pulse"></span>
        </div>
        <button class="nav-clear" @click="clearChat" v-if="messages.length > 1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
        </button>
      </div>
    </header>

    <!-- ══ 消息区 ══ -->
    <div class="chat-body" ref="bodyRef">
      <div class="chat-list">
        <template v-for="(msg, i) in messages" :key="i">
          <div
            v-if="msg.role === 'ai'"
            class="msg-row msg-ai"
            :style="{ animationDelay: i === 0 ? '0s' : '0.06s' }"
          >
            <div class="msg-avatar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div class="msg-bubble">{{ msg.text }}</div>
          </div>
          <div
            v-else
            class="msg-row msg-user"
            :style="{ animationDelay: '0.06s' }"
          >
            <div class="msg-bubble msg-bubble--user">{{ msg.text }}</div>
          </div>
        </template>

        <!-- 快捷提问 -->
        <div class="quick-chips" v-if="messages.length === 1">
          <p class="chips-hint">试试这些</p>
          <div class="chips-row">
            <button
              v-for="(q, idx) in quickQuestions"
              :key="q"
              class="chip"
              :style="{ animationDelay: (0.12 + idx * 0.06) + 's' }"
              @click="sendQuick(q)"
            >
              <span class="chip-icon">
                <svg v-if="idx===0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
                <svg v-else-if="idx===1" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
                <svg v-else-if="idx===2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
              </span>
              {{ q }}
            </button>
          </div>
        </div>

        <!-- 思考中 -->
        <div v-if="thinking" class="msg-row msg-ai">
          <div class="msg-avatar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
          </div>
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ 输入区 ══ -->
    <footer class="chat-foot">
      <div class="input-shell">
        <div class="input-bar">
          <svg class="input-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            ref="inputRef"
            v-model="inputText"
            type="text"
            placeholder="告诉我你的需求…"
            :disabled="thinking"
            @keyup.enter="send"
          />
          <button
            class="send-btn"
            :class="{ ready: inputText.trim() && !thinking }"
            :disabled="!inputText.trim() || thinking"
            @click="send"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>
          </button>
        </div>
      </div>
      <p class="foot-note">AI 回答仅供参考，重要信息请以订单/商品页面为准</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { sendAiMessage, getAiHistory, clearAiHistory } from '@/api/ai'

const sessionId = ref(localStorage.getItem('ai_sessionId') || null)
const inputText   = ref('')
const thinking    = ref(false)
const restoring   = ref(false)
const bodyRef     = ref(null)
const inputRef    = ref(null)

const welcomeMsg  = '你好！我是云梦 AI 助手 ✦\n\n我可以帮你：\n• 查询订单状态和物流\n• 推荐商品和比价\n• 查看优惠券和使用情况\n• 解答购物疑问\n\n直接告诉我你的需求吧 ～'

const messages = ref([
  { role: 'ai', text: welcomeMsg }
])

const quickQuestions = [
  '帮我查最近订单',
  '推荐一款蓝牙耳机',
  '我有什么优惠券',
  '购物车有什么商品'
]

async function scrollToBottom() {
  await nextTick()
  if (bodyRef.value) {
    bodyRef.value.scrollTop = bodyRef.value.scrollHeight
  }
}

async function send() {
  const text = inputText.value.trim()
  if (!text || thinking.value) return
  messages.value.push({ role: 'user', text })
  inputText.value = ''
  await scrollToBottom()
  const payload = { message: text }
  if (sessionId.value) payload.sessionId = sessionId.value
  thinking.value = true
  try {
    const res = await sendAiMessage(payload)
    const data = res?.data || res
    const reply = data?.reply || '抱歉，我暂时无法回答这个问题，请稍后再试。'
    messages.value.push({ role: 'ai', text: reply })
    if (data?.sessionId && !sessionId.value) {
      sessionId.value = data.sessionId
      localStorage.setItem('ai_sessionId', data.sessionId)
    }
  } catch (err) {
    const status = err?.response?.status
    const errMsg = err?.response?.data?.message || err?.message || ''
    if (status === 404 || errMsg.includes('会话不存在') || errMsg.includes('已过期')) {
      sessionId.value = null
      localStorage.removeItem('ai_sessionId')
    }
    messages.value.push({ role: 'ai', text: '抱歉，AI 服务繁忙，请稍后重试' })
    ElMessage.error('AI 服务暂不可用，请稍后重试')
  } finally {
    thinking.value = false
    await scrollToBottom()
  }
}

function sendQuick(q) {
  inputText.value = q
  send()
}

async function clearChat() {
  if (sessionId.value) {
    try { await clearAiHistory(sessionId.value) } catch { /* ignore */ }
  }
  sessionId.value = null
  localStorage.removeItem('ai_sessionId')
  messages.value = [{ role: 'ai', text: welcomeMsg }]
  await scrollToBottom()
}

async function restoreHistory() {
  if (!sessionId.value) return
  restoring.value = true
  try {
    const res = await getAiHistory(sessionId.value)
    const data = res?.data || res
    const list = data?.messages
    if (Array.isArray(list) && list.length > 0) {
      messages.value = list.map(m => ({ role: m.role, text: m.text }))
    }
  } catch (err) {
    const status = err?.response?.status
    const errMsg = err?.response?.data?.message || err?.message || ''
    if (status === 404 || errMsg.includes('会话不存在') || errMsg.includes('已过期')) {
      sessionId.value = null
      localStorage.removeItem('ai_sessionId')
    }
  } finally {
    restoring.value = false
  }
}

onMounted(async () => {
  await restoreHistory()
  await scrollToBottom()
})
</script>

<style scoped>
/* ══════════════ 变量 ══════════════ */
.ai-page {
  --gold: #C9A84C;
  --gold-dk: #A07830;
  --warm-bg: #FAF7F0;
  --surface: #FFFEF9;
  --border: #E8E0D0;
  --text: #2C2416;
  --text2: #5C5344;
  --text3: #9B8E7A;
  --radius: 18px;
  --shadow-sm: 0 1px 3px rgba(44,36,22,0.04);
  --shadow-md: 0 4px 16px rgba(44,36,22,0.06);
  --shadow-lg: 0 8px 32px rgba(44,36,22,0.08);
}

/* ══════════════ 布局 ══════════════ */
.ai-page {
  display: flex; flex-direction: column;
  height: 100vh; width: 100%;
  background: var(--warm-bg);
  font-family: 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  position: relative; overflow: hidden;
  color: var(--text);
}

/* 背景质感 */
.bg-texture {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%),
    radial-gradient(ellipse 50% 40% at 80% 100%, rgba(160,120,48,0.04) 0%, transparent 60%);
  opacity: 0.8;
}

/* ══════════════ 导航 ══════════════ */
.ai-nav {
  flex-shrink: 0; position: relative; z-index: 2;
  background: rgba(255,254,249,0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  padding: 0 28px;
}
.nav-inner {
  display: flex; align-items: center; justify-content: space-between;
  height: 60px; max-width: 820px; margin: 0 auto; gap: 16px;
}

.nav-back {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 12px;
  background: transparent; border: 1px solid var(--border);
  color: var(--text3); cursor: pointer; transition: all 0.25s;
  flex-shrink: 0;
}
.nav-back:hover { background: #FFF; border-color: var(--gold); color: var(--gold-dk); }

.nav-brand { display: flex; align-items: center; gap: 10px; }
.nav-logo {
  width: 34px; height: 34px; border-radius: 12px;
  background: linear-gradient(135deg, var(--gold-dk), var(--gold));
  color: #FFF; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 12px rgba(201,168,76,0.25);
}
.nav-name { font-size: 15px; font-weight: 500; color: var(--text); letter-spacing: 1px; }
.nav-pulse {
  width: 7px; height: 7px; border-radius: 50%;
  background: #4CAF50;
  box-shadow: 0 0 8px rgba(76,175,80,0.5);
  animation: pulse-dot 2.5s ease-in-out infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }

.nav-clear {
  width: 34px; height: 34px; border-radius: 10px;
  background: transparent; border: 1px solid transparent;
  color: var(--text3); cursor: pointer; transition: all 0.25s;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.nav-clear:hover { border-color: #E8D0D0; color: #C0392B; background: #FFF5F5; }

/* ══════════════ 消息区 ══════════════ */
.chat-body {
  flex: 1; overflow-y: auto; padding: 32px 24px 16px;
  position: relative; z-index: 1;
  scroll-behavior: smooth;
}
.chat-body::-webkit-scrollbar { width: 4px; }
.chat-body::-webkit-scrollbar-track { background: transparent; }
.chat-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
.chat-body::-webkit-scrollbar-thumb:hover { background: #D0C8B8; }

.chat-list {
  max-width: 720px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 20px;
}

/* ══════════════ 消息行 ══════════════ */
.msg-row {
  display: flex; gap: 12px; align-items: flex-end;
  animation: msg-in 0.4s cubic-bezier(.22,1,.36,1) both;
  padding: 0 4px;
}
@keyframes msg-in {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.msg-user { flex-direction: row-reverse; }
.msg-ai   { padding-right: 60px; }
.msg-user { padding-left: 60px; }

/* ══════════════ 头像 ══════════════ */
.msg-avatar {
  width: 36px; height: 36px; border-radius: 14px; flex-shrink: 0;
  background: linear-gradient(145deg, #FAF7F0, #F0E8D8);
  border: 1px solid var(--border);
  color: var(--gold-dk);
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-sm);
}

/* ══════════════ 气泡 ══════════════ */
.msg-bubble {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius) var(--radius) var(--radius) 6px;
  padding: 14px 20px; font-size: 14px; line-height: 1.75;
  color: var(--text); font-weight: 350; max-width: 560px;
  white-space: pre-line; word-break: break-word;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.3s;
}
.msg-bubble:hover { box-shadow: var(--shadow-md); }

.msg-bubble--user {
  background: linear-gradient(145deg, var(--gold-dk), var(--gold));
  border-color: transparent;
  border-radius: var(--radius) var(--radius) 6px var(--radius);
  color: #FFF; font-weight: 400;
  box-shadow: 0 4px 18px rgba(160,120,48,0.2);
}
.msg-bubble--user:hover { box-shadow: 0 6px 24px rgba(160,120,48,0.3); }

/* ══════════════ 快捷提问 ══════════════ */
.quick-chips { padding: 6px 0 0 52px; }
.chips-hint {
  font-size: 11px; color: var(--text3); font-weight: 450;
  letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;
}
.chips-row { display: flex; flex-wrap: wrap; gap: 10px; }
.chip {
  display: flex; align-items: center; gap: 7px;
  background: var(--surface); border: 1px solid var(--border);
  color: var(--text2); font-family: inherit; font-size: 13px;
  padding: 10px 18px; border-radius: 14px; cursor: pointer;
  transition: all 0.25s; box-shadow: var(--shadow-sm);
  animation: chip-in 0.4s cubic-bezier(.22,1,.36,1) both;
}
@keyframes chip-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.chip:hover {
  border-color: var(--gold); color: var(--gold-dk);
  background: #FFFDF6; transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(201,168,76,0.12);
}
.chip-icon {
  width: 24px; height: 24px; border-radius: 8px;
  background: rgba(201,168,76,0.08);
  display: flex; align-items: center; justify-content: center;
  color: var(--gold-dk); flex-shrink: 0;
}

/* ══════════════ 思考动画 ══════════════ */
.typing-dots {
  display: flex; align-items: center; gap: 5px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius) var(--radius) var(--radius) 6px;
  padding: 16px 22px; box-shadow: var(--shadow-sm);
}
.typing-dots span {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--gold);
  animation: dot-bounce 1.4s ease-in-out infinite;
  opacity: 0.35;
}
.typing-dots span:nth-child(2) { animation-delay: .18s; }
.typing-dots span:nth-child(3) { animation-delay: .36s; }
@keyframes dot-bounce {
  0%,60%,100% { opacity: 0.25; transform: scale(0.7) translateY(0); }
  30% { opacity: 1; transform: scale(1) translateY(-6px); }
}

/* ══════════════ 输入区 ══════════════ */
.chat-foot {
  flex-shrink: 0; position: relative; z-index: 2;
  background: linear-gradient(to top, var(--warm-bg) 80%, transparent);
  padding: 12px 24px 18px;
}
.input-shell {
  max-width: 720px; margin: 0 auto;
}
.input-bar {
  display: flex; align-items: center; gap: 4px;
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: 20px; padding: 6px 8px 6px 18px;
  transition: all 0.3s; box-shadow: var(--shadow-sm);
}
.input-bar:focus-within {
  border-color: var(--gold);
  box-shadow: 0 0 0 4px rgba(201,168,76,0.08), var(--shadow-md);
}
.input-search-icon { color: var(--text3); flex-shrink: 0; opacity: 0.5; transition: opacity 0.3s; }
.input-bar:focus-within .input-search-icon { opacity: 0.8; color: var(--gold); }
.input-bar input {
  flex: 1; background: transparent; border: none;
  padding: 10px 4px; color: var(--text); font-family: inherit;
  font-size: 14px; outline: none;
}
.input-bar input::placeholder { color: #BFB5A2; font-weight: 300; }
.input-bar input:disabled { opacity: 0.45; }

.send-btn {
  width: 40px; height: 40px; border-radius: 14px;
  background: #EDE8DC; border: none;
  color: #BFB5A2; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s cubic-bezier(.22,1,.36,1);
}
.send-btn.ready {
  background: linear-gradient(135deg, var(--gold-dk), var(--gold));
  color: #FFF;
  box-shadow: 0 4px 16px rgba(160,120,48,0.3);
}
.send-btn.ready:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 22px rgba(160,120,48,0.45);
}
.send-btn:disabled { cursor: not-allowed; }

.foot-note {
  max-width: 720px; margin: 10px auto 0;
  font-size: 10px; color: var(--text3); text-align: center;
  letter-spacing: 0.5px; font-weight: 300;
}

/* ══════════════ 响应式 ══════════════ */
@media (max-width: 640px) {
  .chat-body { padding: 20px 14px 12px; }
  .msg-ai   { padding-right: 40px; }
  .msg-user { padding-left: 40px; }
  .msg-bubble { max-width: 100%; font-size: 13px; padding: 12px 16px; }
  .quick-chips { padding-left: 0; }
  .ai-nav { padding: 0 16px; }
  .chat-foot { padding: 10px 12px 14px; }
}
</style>
