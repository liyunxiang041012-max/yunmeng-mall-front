<template>
  <div class="sn-root">
    <!-- 顶栏 -->
    <header class="sn-nav">
      <div class="snn-inner">
        <button class="snn-back" @click="$router.push('/shop/dashboard')">
          <ArrowLeft :size="16" stroke-width="2"/> 返回后台
        </button>
        <span class="snn-title">系统公告</span>
        <span class="snn-badge" v-if="unreadCount > 0">{{ unreadCount }} 条未读</span>
      </div>
    </header>

    <!-- 主体 -->
    <div class="sn-body">
      <!-- 加载 -->
      <div v-if="loading" class="sn-state">
        <div class="sn-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空 -->
      <div v-else-if="!notices.length" class="sn-state">
        <Megaphone :size="48" stroke-width="1" style="color:#C9A84C;margin-bottom:12px"/>
        <p>暂无系统公告</p>
        <span>管理员发送的公告会显示在这里</span>
      </div>

      <!-- 列表 -->
      <template v-else>
        <div
          v-for="item in notices"
          :key="item.id"
          class="sn-card"
          :class="{ unread: !item.isRead }"
          @click="handleRead(item)"
        >
          <div class="snc-top">
            <div class="snc-dot" v-if="!item.isRead"></div>
            <Megaphone :size="16" stroke-width="1.5" :class="item.isRead ? 'snc-icon-read' : 'snc-icon-new'"/>
            <h3 class="snc-title">{{ item.title }}</h3>
            <span class="snc-time">{{ formatTime(item.createTime) }}</span>
          </div>
          <p class="snc-content">{{ item.content }}</p>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="sn-pager">
          <button :disabled="page === 1" @click="page--; loadNotices()">上一页</button>
          <span class="snp-info">{{ page }} / {{ totalPages }}</span>
          <button :disabled="page === totalPages" @click="page++; loadNotices()">下一页</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Megaphone, ArrowLeft } from 'lucide-vue-next'
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
      unreadCount.value = notices.value.filter(n => !n.isRead).length
    }
  } catch (e) {
    console.error('[ShopNotice] 加载公告失败:', e)
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
  } catch { /* 忽略 */ }
}

onMounted(() => loadNotices())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.sn-root {
  background: #F7F4ED;
  min-height: 100vh;
  font-family: 'Noto Sans SC','PingFang SC',sans-serif;
  color: #1A1712;
}

/* ══ 顶栏 ══ */
.sn-nav {
  background: rgba(255,255,255,0.96);
  border-bottom: 1px solid #E0D8C4;
  backdrop-filter: blur(20px);
  position: sticky; top: 0; z-index: 10;
}
.snn-inner {
  max-width: 800px; margin: 0 auto; padding: 0 24px;
  height: 56px; display: flex; align-items: center; gap: 14px;
}
.snn-back {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid #D4C9A8; border-radius: 100px;
  color: #5C5546; font-family: inherit; font-size: 13px;
  padding: 6px 14px; cursor: pointer; transition: .2s;
}
.snn-back:hover { border-color: #C9A84C; color: #A07830; }
.snn-title { font-size: 17px; font-weight: 600; flex: 1; color: #3D2E1A; }
.snn-badge {
  font-size: 12px; color: #FFF;
  background: linear-gradient(135deg, #A07830, #C9A84C);
  padding: 3px 10px; border-radius: 100px;
  font-weight: 500;
}

/* ══ 主体 ══ */
.sn-body {
  max-width: 800px; margin: 24px auto; padding: 0 24px 80px;
}

/* 状态 */
.sn-state {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 80px 20px; color: #9B9484;
}
.sn-state p { font-size: 15px; font-weight: 500; }
.sn-state span { font-size: 13px; }

.sn-spinner {
  width: 28px; height: 28px;
  border: 3px solid #E0D8C4; border-top-color: #C9A84C;
  border-radius: 50%; animation: sn-spin .7s linear infinite;
}
@keyframes sn-spin { to { transform: rotate(360deg) } }

/* ══ 卡片 ══ */
.sn-card {
  background: #FFF; border: 1px solid #E0D8C4; border-radius: 14px;
  padding: 18px 20px; margin-bottom: 12px;
  cursor: pointer; transition: all .25s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.sn-card:hover { border-color: #C9A84C; box-shadow: 0 4px 20px rgba(160,120,48,0.08); }
.sn-card.unread {
  border-left: 4px solid #A07830;
  background: linear-gradient(135deg, #FFFBF5 0%, #FFF 100%);
}

.snc-top {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}
.snc-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  background: #A07830; box-shadow: 0 0 8px rgba(160,120,48,0.4);
}
.snc-icon-new { color: #A07830; flex-shrink: 0; }
.snc-icon-read { color: #C0B8A0; flex-shrink: 0; }
.snc-title {
  font-size: 15px; font-weight: 600; color: #1A1712; flex: 1;
}
.snc-time {
  font-size: 12px; color: #B0A898; white-space: nowrap; flex-shrink: 0;
}
.snc-content {
  font-size: 14px; color: #5C5546; line-height: 1.8;
  padding-left: 34px; word-break: break-word;
}

/* ══ 分页 ══ */
.sn-pager {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  margin-top: 28px;
}
.sn-pager button {
  padding: 8px 18px; border: 1.5px solid #D4C9A8; border-radius: 8px;
  background: #FFF; color: #5C5546; font-family: inherit; font-size: 13px;
  cursor: pointer; transition: .2s;
}
.sn-pager button:hover:not(:disabled) { border-color: #C9A84C; color: #A07830; }
.sn-pager button:disabled { opacity: 0.4; cursor: not-allowed; }
.snp-info { font-size: 13px; color: #9B9484; font-weight: 500; }

@media(max-width:640px){ .snn-inner,.sn-body{padding-left:16px;padding-right:16px} }
</style>
