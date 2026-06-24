<template>
  <div class="np-root">
    <header class="np-nav">
      <div class="npn-inner">
        <button class="npn-back" @click="$router.push('/my')">
          <ArrowLeft :size="16" stroke-width="2"/> 返回
        </button>
        <span class="npn-title">系统通知</span>
        <span class="npn-badge" v-if="unreadCount > 0">{{ unreadCount }} 条未读</span>
      </div>
    </header>

    <div class="np-body">
      <!-- 加载 -->
      <div v-if="loading" class="np-state">
        <div class="np-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!notices.length" class="np-state">
        <Bell :size="48" stroke-width="1" style="color:#C9A84C;margin-bottom:12px"/>
        <p>暂无系统通知</p>
        <span>管理员发送的通知会显示在这里</span>
      </div>

      <!-- 通知列表 -->
      <template v-else>
        <div
          v-for="item in notices"
          :key="item.id"
          :class="['np-card', { unread: !item.isRead }]"
          @click="handleRead(item)"
        >
          <div class="npc-left">
            <div class="npc-dot" v-if="!item.isRead"></div>
            <Bell :size="16" stroke-width="1.6" :class="item.isRead ? 'npc-icon-read' : 'npc-icon-unread'"/>
          </div>
          <div class="npc-body">
            <div class="npc-head">
              <span class="npc-title">{{ item.title }}</span>
              <span class="npc-time">{{ formatTime(item.createTime) }}</span>
            </div>
            <p class="npc-content">{{ item.content }}</p>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="np-pager">
          <button :disabled="page === 1" @click="page--; loadNotices()">上一页</button>
          <span class="npp-info">{{ page }} / {{ totalPages }}</span>
          <button :disabled="page === totalPages" @click="page++; loadNotices()">下一页</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bell, ArrowLeft } from 'lucide-vue-next'
import { getNoticePage, markNoticeRead } from '../api/user'

const notices = ref([])
const loading = ref(false)
const unreadCount = ref(0)
const page = ref(1)
const pageSize = 10
const totalPages = ref(1)

function formatTime(t) {
  if (!t) return '-'
  const s = String(t).replace('T', ' ')
  const d = new Date(s.replace(/-/g, '/'))
  if (isNaN(d.getTime())) return s.slice(0, 16)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function loadNotices() {
  loading.value = true
  try {
    const data = await getNoticePage({ page: page.value, size: pageSize })
    if (data) {
      notices.value = data.records || []
      totalPages.value = data.pages || Math.ceil((data.total || 0) / pageSize) || 1
      // 统计未读数
      unreadCount.value = notices.value.filter(n => !n.isRead).length
    }
  } catch (e) {
    console.error('[NoticePage] 加载通知失败:', e)
    notices.value = []
  } finally {
    loading.value = false
  }
}

async function handleRead(item) {
  if (item.isRead) return
  try {
    await markNoticeRead(item.id)
    item.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (e) {
    // 忽略
  }
}

onMounted(() => loadNotices())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.np-root {
  background: #F5F2EC;
  min-height: 100vh;
  font-family: 'Noto Sans SC','PingFang SC',sans-serif;
  color: #1A1A18;
}

/* ══ TOP NAV ══ */
.np-nav {
  background: rgba(250,250,248,0.97);
  border-bottom: 1px solid #E0D8C8;
  backdrop-filter: blur(20px);
  flex-shrink: 0;
}
.npn-inner {
  max-width: 720px; margin: 0 auto; padding: 0 24px;
  height: 56px; display: flex; align-items: center; gap: 14px;
}
.npn-back {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid #E0D8C8; border-radius: 100px;
  color: #4A4438; font-family: inherit; font-size: 13px;
  padding: 6px 14px; cursor: pointer; transition: .2s;
}
.npn-back:hover { border-color: #C9A84C; color: #A07830; }
.npn-title { font-size: 16px; font-weight: 500; flex: 1; }
.npn-badge {
  font-size: 12px; color: #FFF;
  background: linear-gradient(135deg, #A07830, #C9A84C);
  padding: 3px 10px; border-radius: 100px;
}

/* ══ BODY ══ */
.np-body {
  max-width: 720px; margin: 24px auto; padding: 0 24px 60px;
}

/* ══ STATE ══ */
.np-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 20px; color: #8A8070;
}
.np-state p { font-size: 15px; font-weight: 500; }
.np-state span { font-size: 13px; }
.np-spinner {
  width: 28px; height: 28px;
  border: 3px solid #E0D8C8; border-top-color: #C9A84C;
  border-radius: 50%; animation: np-spin .7s linear infinite;
}
@keyframes np-spin { to { transform: rotate(360deg) } }

/* ══ CARD ══ */
.np-card {
  display: flex; gap: 12px;
  background: #FFF; border: 1px solid #E0D8C8; border-radius: 12px;
  padding: 16px 18px; margin-bottom: 10px;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.np-card:hover { border-color: #C9A84C; box-shadow: 0 2px 12px rgba(160,120,48,0.08); }
.np-card.unread { border-left: 3px solid #A07830; background: #FFFBF5; }

.npc-left { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; padding-top: 2px; }
.npc-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #A07830; box-shadow: 0 0 6px rgba(160,120,48,0.4);
}
.npc-icon-unread { color: #A07830; }
.npc-icon-read { color: #C0B8A0; }

.npc-body { flex: 1; min-width: 0; }
.npc-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 6px; }
.npc-title { font-size: 14px; font-weight: 600; color: #1A1A18; }
.npc-time { font-size: 11px; color: #B0A898; white-space: nowrap; flex-shrink: 0; }
.npc-content { font-size: 13px; color: #5C5546; line-height: 1.7; word-break: break-word; }

/* ══ PAGER ══ */
.np-pager {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  margin-top: 24px;
}
.np-pager button {
  padding: 8px 18px; border: 1.5px solid #E0D8C8; border-radius: 8px;
  background: #FFF; color: #4A4438; font-family: inherit; font-size: 13px;
  cursor: pointer; transition: .2s;
}
.np-pager button:hover:not(:disabled) { border-color: #C9A84C; color: #A07830; }
.np-pager button:disabled { opacity: 0.4; cursor: not-allowed; }
.npp-info { font-size: 13px; color: #8A8070; font-weight: 500; }

/* ══ RESPONSIVE ══ */
@media(max-width:640px){ .npn-inner,.np-body{padding-left:16px;padding-right:16px} }
</style>
