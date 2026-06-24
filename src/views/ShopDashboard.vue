<template>
  <div class="sd-root">
    <!-- ══ 背景光斑 ══ -->
    <div class="bg-ambient">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-orb orb-3"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="sd-shell">
      <!-- ══ 顶栏 ══ -->
      <header class="sd-topbar">
        <div class="tb-left">
          <div class="tb-brand" @click="$router.push('/home')">
            <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
              <rect width="40" height="40" rx="10" fill="#A07830"/>
              <path d="M10 26 Q20 12 30 26" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>
              <circle cx="20" cy="18" r="3" fill="#FFF"/>
            </svg>
            <div class="tb-name">
              <span class="tbn-main">云梦</span>
              <span class="tbn-divider">·</span>
              <span class="tbn-sub">商家后台</span>
            </div>
          </div>
          <nav class="tb-nav">
            <a href="#" :class="['tbn-link', { active: activeTab === 'overview' }]" @click.prevent="activeTab = 'overview'"><LayoutDashboard :size="14" stroke-width="2"/> 概览</a>
            <a href="#" :class="['tbn-link', { active: activeTab === 'products' }]" @click.prevent="activeTab = 'products'"><Package :size="14" stroke-width="2"/> 商品</a>
            <a href="#" :class="['tbn-link', { active: activeTab === 'orders' }]" @click.prevent="activeTab = 'orders'"><ClipboardList :size="14" stroke-width="2"/> 订单</a>
            <a href="#" :class="['tbn-link', { active: activeTab === 'data' }]" @click.prevent="activeTab = 'data'"><BarChart3 :size="14" stroke-width="2"/> 数据</a>
            <a href="#" :class="['tbn-link', { active: activeTab === 'settings' }]" @click.prevent="activeTab = 'settings'"><Settings :size="14" stroke-width="2"/> 设置</a>
          </nav>
        </div>
        <div class="tb-right">
          <button class="tb-icon-btn" @click="$router.push('/shop/notice')">
            <Bell :size="17" stroke-width="1.5"/>
            <span class="badge" v-if="unreadNoticeCount > 0">{{ unreadNoticeCount }}</span>
          </button>
          <div class="tb-user" @click.stop="toggleUserMenu">
            <div class="tbu-avatar">{{ (shopInfo.nickname || '商')[0] }}</div>
            <span class="tbu-name">{{ shopInfo.nickname || '商家' }}</span>
            <ChevronDown :size="13" stroke-width="2" class="tbu-chev" :class="{ open: showUserMenu }"/>
            <!-- 下拉菜单 -->
            <div v-if="showUserMenu" class="tbu-dropdown" @click.stop>
              <button class="tbu-dd-item" @click="logout">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- ══ 主体 ══ -->
      <main class="sd-main">

        <!-- ═══════════ 概览 Tab ═══════════ -->
        <template v-if="activeTab === 'overview'">
        <!-- ── 欢迎行 ── -->
        <div class="welcome-row">
          <div>
            <h1 class="wr-title">
              午后好<span class="wr-wave">👋</span>
            </h1>
            <p class="wr-sub">欢迎回到 {{ shopInfo.shopName || '云梦商家后台' }}</p>
          </div>
          <div class="wr-actions">
            <button class="btn-primary" @click="activeTab = 'products'">
              <Plus :size="15" stroke-width="2.5"/>
              发布商品
            </button>
            <button class="btn-secondary">
              <Eye :size="15" stroke-width="1.8"/>
              预览店铺
            </button>
          </div>
        </div>

        <!-- ── 核心数据卡片 ── -->
        <div class="stats-row">
          <div class="stat-card" v-for="card in statCards" :key="card.label">
            <div class="sc-top">
              <div class="sc-icon-wrap" :style="{ background: card.iconBg }">
                <component :is="card.icon" :size="18" stroke-width="1.8"/>
              </div>
              <span :class="['sc-trend', card.trend > 0 ? 'up' : 'down']">
                <component :is="card.trend > 0 ? TrendingUp : TrendingUp" :size="12"/>
                {{ Math.abs(card.trend) }}%
              </span>
            </div>
            <div class="sc-body">
              <span class="sc-num">{{ card.value }}</span>
              <span class="sc-label">{{ card.label }}</span>
            </div>
          </div>
        </div>

        <!-- ── 双栏内容 ── -->
        <div class="content-grid">
          <!-- 左栏 -->
          <div class="cg-left">
            <!-- 收入趋势 -->
            <div class="panel panel-chart">
              <div class="panel-head">
                <h3 class="ph-title">收入趋势</h3>
                <div class="ph-tabs">
                  <button v-for="p in ['7天','30天','季度']" :key="p"
                    :class="['pht-btn', { active: chartPeriod === p }]"
                    @click="chartPeriod = p">{{ p }}</button>
                </div>
              </div>
              <div class="chart-area">
                <div class="chart-y">
                  <span v-for="y in chartYLabels" :key="y">{{ y }}</span>
                </div>
                <div class="chart-main">
                  <svg viewBox="0 0 560 180" preserveAspectRatio="none" class="chart-svg">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#A07830" stop-opacity="0.18"/>
                        <stop offset="100%" stop-color="#A07830" stop-opacity="0.01"/>
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#C9A84C"/>
                        <stop offset="100%" stop-color="#A07830"/>
                      </linearGradient>
                    </defs>
                    <path :d="chartPath" fill="url(#areaGrad)" stroke="none"/>
                    <path :d="chartPath" fill="none" stroke="url(#lineGrad)" stroke-width="2.2"
                      stroke-linecap="round" stroke-linejoin="round"/>
                    <circle v-for="(pt, i) in chartPoints" :key="i"
                      :cx="pt.x" :cy="pt.y" r="3.5"
                      fill="#FFFFFF" stroke="#A07830" stroke-width="2"/>
                  </svg>
                  <div class="chart-x">
                    <span v-for="d in chartXLabels" :key="d">{{ d }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 最近订单 -->
            <div class="panel">
              <div class="panel-head">
                <h3 class="ph-title">待处理订单</h3>
                <button class="ph-link">查看全部 <ArrowUpRight :size="12"/></button>
              </div>
              <div class="order-mini-list">
                <div v-for="o in recentOrders" :key="o.id" class="om-item">
                  <div class="omi-icon" :class="statusClass(o.rawStatus)">
                    <ShoppingBag :size="16" stroke-width="1.5"/>
                  </div>
                  <div class="omi-info">
                    <p class="omi-product">{{ o.product }}</p>
                    <p class="omi-no">{{ o.orderNo }} · {{ o.time }}</p>
                  </div>
                  <div class="omi-meta">
                    <span class="omi-price">¥{{ o.amount }}</span>
                    <span :class="['omi-status', statusClass(o.rawStatus)]">{{ statusLabel(o.rawStatus) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右栏 -->
          <div class="cg-right">
            <!-- 快捷操作 -->
            <div class="panel">
              <div class="panel-head">
                <h3 class="ph-title">快捷操作</h3>
              </div>
              <div class="quick-actions">
                <button v-for="act in quickActions" :key="act.label" class="qa-btn" @click="act.tab && (activeTab = act.tab)">
                  <div class="qa-icon-wrap" :style="{ background: act.bg }">
                    <component :is="act.icon" :size="17" stroke-width="1.8"/>
                  </div>
                  <span class="qa-label">{{ act.label }}</span>
                </button>
              </div>
            </div>

            <!-- 店铺健康度 -->
            <div class="panel">
              <div class="panel-head">
                <h3 class="ph-title">店铺健康度</h3>
                <span class="ph-badge excellent">优秀</span>
              </div>
              <div class="health-grid">
                <div v-for="h in healthItems" :key="h.label" class="hg-item">
                  <div class="hgi-top">
                    <span class="hgi-label">{{ h.label }}</span>
                    <span class="hgi-score">{{ h.score }}<small>/100</small></span>
                  </div>
                  <div class="hgi-bar">
                    <div class="hgi-fill" :style="{ width: h.score + '%', background: h.color }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 系统公告 -->
            <div class="panel panel-announce">
              <div class="panel-head">
                <h3 class="ph-title"><Zap :size="14" stroke-width="2"/> 系统公告</h3>
              </div>
              <div class="ann-list">
                <div v-for="a in announcements" :key="a.id" class="ann-item" @click="$router.push('/shop/notice')">
                  <span class="ann-tag" :style="{ background: a.isRead ? '#F0EDE4' : '#FDE8C8' }">{{ a.isRead ? '已读' : '系统' }}</span>
                  <p class="ann-text">{{ a.title }}</p>
                  <span class="ann-time"><Clock :size="10"/> {{ fmtAnnTime(a.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── 订单表格 ── -->
        <div class="panel">
          <div class="panel-head">
            <h3 class="ph-title">全部订单</h3>
            <div class="ph-filters">
              <button v-for="f in ['全部','待付款','待发货','已完成']" :key="f"
                :class="['phf-btn', { active: orderFilter === f }]"
                @click="orderFilter = f">{{ f }}</button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>商品</th>
                  <th>买家</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in allOrders" :key="o.id">
                  <td><span class="dt-mono">{{ o.orderNo }}</span></td>
                  <td>
                    <div class="dt-product">
                        <div class="dtp-img">{{ o.product[0] }}</div>
                        <span>{{ o.product }}</span>
                    </div>
                  </td>
                  <td>{{ o.buyer }}</td>
                  <td><strong>¥{{ o.amount }}</strong></td>
                  <td><span :class="['dt-status', statusClass(o.rawStatus)]">{{ statusLabel(o.rawStatus) }}</span></td>
                  <td><span class="dt-mono">{{ o.time }}</span></td>
                  <td>
                    <button class="dt-action">详情</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </template>
        <!-- ═══════════ /概览 ═══════════ -->

        <!-- ═══════════ 商品 Tab ═══════════ -->
        <ShopProducts v-if="activeTab === 'products'" />

        <!-- ═══════════ 订单 Tab ═══════════ -->
        <ShopOrders v-if="activeTab === 'orders'" />

        <!-- ═══════════ 数据 Tab ═══════════ -->
        <div v-if="activeTab === 'data'" class="data-placeholder">
          <div class="dp-inner">
            <BarChart3 :size="48" stroke-width="1" />
            <h2>数据分析</h2>
            <p>销售趋势、商品排行、用户画像等数据看板即将上线</p>
          </div>
        </div>

        <!-- ═══════════ 设置 Tab ═══════════ -->
        <ShopSettings v-if="activeTab === 'settings'" />

      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  LayoutDashboard, TrendingUp, ShoppingBag, Package, Eye,
  DollarSign, Plus, ClipboardList, BarChart3, Settings,
  Zap, Star, ChevronDown, Bell, Clock, ArrowUpRight
} from 'lucide-vue-next'
import ShopProducts from './ShopProducts.vue'
import ShopOrders from './ShopOrders.vue'
import ShopSettings from './ShopSettings.vue'
import { getShopStatus, getShopDetail, getShopStats, getShopOrders, getRevenueTrend } from '../api/shop'
import { getNoticePage, getUnreadNoticeCount } from '../api/user'

const activeTab = ref('overview')
const router = useRouter()
const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('isLogin')
  localStorage.removeItem('userName')
  ElMessage.success('已退出登录')
  router.push('/shop/register')
}

// 点击其他地方关闭菜单
const closeUserMenu = (e) => {
  if (showUserMenu.value) showUserMenu.value = false
}

const shopInfo = reactive({
  shopName: '云梦商家后台',
  nickname: '',
  shopId: null,
})

const chartPeriod = ref('7天')

// 金额：分 → 元
function toYuan(cents) {
  if (cents == null) return '—'
  return (cents / 100).toFixed(2)
}

const statCards = ref([
  { label: '全部商品',   value: '...', trend: 0, icon: Package,      iconBg: 'linear-gradient(135deg, #E8D5F5, #A78BFA)' },
  { label: '上架中',     value: '...', trend: 0, icon: ShoppingBag,  iconBg: 'linear-gradient(135deg, #D5F0E2, #34D399)' },
  { label: '今日销售额', value: '...', trend: 0, icon: DollarSign,   iconBg: 'linear-gradient(135deg, #FAE8C8, #D9A53C)' },
  { label: '店铺浏览',   value: '...', trend: 0, icon: Eye,          iconBg: 'linear-gradient(135deg, #DBEAFE, #60A5FA)' },
])

const quickActions = [
  { icon: Plus,       label: '发布商品',   tab: 'products', bg: 'linear-gradient(135deg, #FAE8C8, #D9A53C)' },
  { icon: ClipboardList, label: '订单管理', tab: 'orders',   bg: 'linear-gradient(135deg, #E8D5F5, #A78BFA)' },
  { icon: Settings,   label: '店铺装修',   tab: 'settings', bg: 'linear-gradient(135deg, #D5F0E2, #34D399)' },
  { icon: BarChart3,  label: '数据分析',   tab: 'data',     bg: 'linear-gradient(135deg, #DBEAFE, #60A5FA)' },
  { icon: Star,       label: '评价管理',   tab: '',         bg: 'linear-gradient(135deg, #FEE4D0, #FB923C)' },
  { icon: LayoutDashboard, label: '营销工具', tab: '',       bg: 'linear-gradient(135deg, #FCE7F3, #F472B6)' },
]

const healthItems = [
  { label: '商品质量',  score: 96, color: 'linear-gradient(90deg, #34D399, #059669)' },
  { label: '发货速度',  score: 88, color: 'linear-gradient(90deg, #D9A53C, #B8860A)' },
  { label: '服务态度',  score: 94, color: 'linear-gradient(90deg, #60A5FA, #2563EB)' },
  { label: '物流评分',  score: 82, color: 'linear-gradient(90deg, #A78BFA, #7C3AED)' },
]

const announcements = ref([])
const unreadNoticeCount = ref(0)

// 订单状态映射（string枚举）
const STATUS_MAP = {
  PENDING_PAYMENT: { label: '待付款', cls: 'os-pending' },
  PAID:             { label: '待发货', cls: 'os-waiting' },
  SHIPPED:          { label: '已发货', cls: 'os-shipped' },
  COMPLETED:        { label: '已完成', cls: 'os-done' },
  CANCELLED:        { label: '已取消', cls: 'os-cancel' },
}
function statusLabel(s) { return STATUS_MAP[s]?.label || s }
function statusClass(s) { return STATUS_MAP[s]?.cls || '' }

const recentOrders = ref([])
const allOrders = ref([])

const orderFilter = ref('全部')

// Chart data
const chartData7 = [4200, 3800, 5100, 4600, 6800, 7200, 12850]
const chartData30 = [3800,4200,3900,4600,5100,4800,5300,6200,5800,6500,7100,6800,7300,6900,7600,8100,7800,8500,9200,8900,9600,9400,10100,9800,10500,11200,10800,11500,12100,12850]
const chartDataQ = [3800,4200,5100,6200,5800,7100,6800,8500,9200,9600,10500,12850]

const chartData = computed(() => {
  if (chartPeriod.value === '30天') return chartData30
  if (chartPeriod.value === '季度') return chartDataQ
  return chartData7
})

const chartXLabels = computed(() => {
  const data = chartData.value
  if (data.length <= 7) return ['周一','周二','周三','周四','周五','周六','周日'].slice(0, data.length)
  return data.map((_, i) => `${i+1}`)
})

const maxVal = computed(() => Math.max(...chartData.value, 1))

const chartYLabels = computed(() => {
  const max = maxVal.value
  return [max, Math.round(max*0.75), Math.round(max*0.5), Math.round(max*0.25), 0].map(v => {
    if (v >= 1000) return (v/1000).toFixed(1) + 'k'
    return String(v)
  })
})

const spX = (i) => {
  const data = chartData.value
  return 20 + (i / (data.length - 1)) * 520
}
const spY = (v) => 160 - (v / maxVal.value) * 140

const chartPoints = computed(() =>
  chartData.value.map((v, i) => ({ x: spX(i), y: spY(v) }))
)

const chartPath = computed(() => {
  const pts = chartPoints.value
  if (!pts.length) return ''
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  return d + ` L ${spX(chartData.value.length-1)} 160 L ${spX(0)} 160 Z`
})

// ─── 加载真实数据 ───
onMounted(async () => {
  // 点击外部关闭用户菜单
  document.addEventListener('click', closeUserMenu)

  // 1. 店铺详情
  try {
    const statusRes = await getShopStatus()
    // statusRes = { code:200, data:{ hasShop, shopId, shopName } }
    const statusData = statusRes
    if (statusData.shopId) {
      shopInfo.shopId = statusData.shopId
      shopInfo.shopName = statusData.shopName || shopInfo.shopName

      const detailRes = await getShopDetail(statusData.shopId)
      // detailRes = { code:200, data:{ id, shopName, logo, description, status, ... } }
      const detail = detailRes
      if (detail) {
        shopInfo.shopName = detail.shopName || shopInfo.shopName
        shopInfo.nickname = detail.shopName || shopInfo.nickname
      }
    }
  } catch { /* 使用默认值 */ }

  // 2. 仪表盘数据
  try {
    const statsRes = await getShopStats()
    // statsRes = { code:200, data:{ totalProducts, activeProducts, ... } }
    const stats = statsRes
    if (stats) {
      statCards.value[0].value = String(stats.totalProducts ?? '—')
      statCards.value[1].value = String(stats.activeProducts ?? '—')
    }
  } catch { /* 使用默认值 */ }

  // 3. 最近订单
  try {
    const orderRes = await getShopOrders({ page: 1, size: 5 })
    // orderRes = { code:200, data:{ total, pages, list:[...] } }
    const orderData = orderRes
    if (orderData && Array.isArray(orderData.list)) {
      const raw = orderData.list.slice(0, 3)
      recentOrders.value = raw.map(o => ({
        id: o.id,
        orderNo: (o.id || '').slice(-12),
        product: o.productName || '—',
        amount: toYuan(o.totalAmount),
        rawStatus: o.status,
        time: fmtTime(o.createTime),
      }))
      allOrders.value = raw.map(o => ({
        id: o.id,
        orderNo: (o.id || '').slice(-12),
        product: o.productName || '—',
        buyer: o.buyerName || '—',
        amount: toYuan(o.totalAmount),
        rawStatus: o.status,
        time: fmtDate(o.createTime),
      }))
    }
  } catch { /* 使用默认值 */ }

  // 4. 系统公告 & 未读数
  try {
    const [noticeRes, count] = await Promise.all([
      getNoticePage({ page: 1, size: 3 }),
      getUnreadNoticeCount().catch(() => 0)
    ])
    if (noticeRes && Array.isArray(noticeRes.records)) {
      announcements.value = noticeRes.records.slice(0, 3)
    }
    unreadNoticeCount.value = typeof count === 'number' ? count : (count?.data ?? 0)
  } catch (e) { console.error('[ShopDashboard] 加载公告失败:', e) /* 使用默认值 */ }
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
})

function fmtTime(d) {
  if (!d) return '-'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return String(d)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}
function fmtAnnTime(t) {
  if (!t) return '-'
  const dt = new Date(String(t).replace('T', ' ').replace(/-/g, '/'))
  if (isNaN(dt.getTime())) return String(t).slice(0, 10)
  const now = new Date()
  const diff = now - dt
  if (diff < 3600000) return `${Math.floor(diff/60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff/3600000)}小时前`
  if (diff < 259200000) return `${Math.floor(diff/86400000)}天前`
  const pad = n => String(n).padStart(2, '0')
  return `${dt.getMonth()+1}-${pad(dt.getDate())}`
}
function fmtDate(d) {
  if (!d) return '-'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return String(d)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Noto+Sans+SC:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* ═══════ 根 ═══════ */
.sd-root {
  --bg-page:    #F7F4ED;
  --bg-card:    #FFFFFF;
  --bg-elevated:#FAF8F4;
  --bg-input:   #F5F1E8;
  --gold:       #A07830;
  --gold-dim:   #8C6308;
  --gold-light: #C9A84C;
  --gold-glow:  rgba(160, 120, 48, 0.12);
  --gold-soft:  rgba(160, 120, 48, 0.05);
  --text-primary:   #1A1712;
  --text-secondary: #5C5546;
  --text-tertiary:  #9B9484;
  --border:     #E0D8C4;
  --border-light:#EDE7D6;
  --error:      #C0392B;
  --green:      #27AE60;
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  18px;
  --radius-xl:  24px;

  min-height: 100vh;
  background: var(--bg-page);
  font-family: 'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: hidden;
}
* { box-sizing: border-box; margin: 0; padding: 0; }

/* ═══════ 背景 ═══════ */
.bg-ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.bg-orb {
  position: absolute; border-radius: 50%;
  filter: blur(140px); opacity: 0.1;
}
.orb-1 {
  width: 700px; height: 700px;
  background: radial-gradient(circle, var(--gold) 0%, transparent 70%);
  top: -250px; right: -200px;
}
.orb-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(201,168,76,0.5) 0%, transparent 70%);
  bottom: 10%; left: -180px;
  opacity: 0.06;
}
.orb-3 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(160,120,48,0.4) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.04;
}
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(160,120,48,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(160,120,48,0.04) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(circle at 50% 30%, black 30%, transparent 70%);
}

/* ═══════ 外壳 ═══════ */
.sd-shell { position: relative; z-index: 1; min-height: 100vh; }

/* ═══════ 顶栏 ═══════ */
.sd-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; height: 64px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
  position: sticky; top: 0; z-index: 100;
}
.tb-left { display: flex; align-items: center; gap: 40px; }
.tb-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.tb-name { display: flex; align-items: baseline; gap: 4px; }
.tbn-main {
  font-family: 'Playfair Display', serif;
  font-size: 16px; font-weight: 700;
  color: var(--text-primary); letter-spacing: 0.04em;
}
.tbn-divider { color: var(--gold); font-size: 14px; font-weight: 400; }
.tbn-sub { font-size: 12px; color: var(--text-tertiary); font-weight: 400; letter-spacing: 0.08em; }
.tb-nav { display: flex; gap: 4px; }
.tbn-link {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px;
  font-size: 13px; color: var(--text-tertiary);
  text-decoration: none; font-weight: 500;
  transition: all 0.2s;
}
.tbn-link:hover { color: var(--text-primary); background: var(--gold-soft); }
.tbn-link.active { color: var(--gold); background: var(--gold-soft); font-weight: 600; }

.tb-right { display: flex; align-items: center; gap: 16px; }
.tb-icon-btn {
  position: relative; width: 38px; height: 38px;
  border: 1px solid var(--border-light); border-radius: 10px;
  background: var(--bg-card); color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.tb-icon-btn:hover { border-color: var(--gold-light); color: var(--gold); }
.badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 18px; height: 18px;
  background: var(--error); color: #FFF;
  font-size: 10px; font-weight: 600; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace;
}
.tb-user { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 10px 4px 4px; border-radius: 10px; transition: background 0.2s; position: relative; }
.tb-user:hover { background: var(--gold-soft); }
.tbu-avatar {
  width: 32px; height: 32px; border-radius: 9px;
  background: linear-gradient(135deg, var(--gold-dim), var(--gold));
  color: #FFF; font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.tbu-name { font-size: 13px; color: var(--text-primary); font-weight: 500; }
.tbu-chev { color: var(--text-tertiary); transition: transform 0.2s; }
.tbu-chev.open { transform: rotate(180deg); }

/* 用户下拉菜单 */
.tbu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 140px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  overflow: hidden;
  z-index: 200;
}
.tbu-dd-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}
.tbu-dd-item:hover {
  background: rgba(192,57,43,0.06);
  color: #C0392B;
}

/* ═══════ 主体 ═══════ */
.sd-main { max-width: 1280px; margin: 0 auto; padding: 32px 32px 60px; }

/* ═══════ 欢迎行 ═══════ */
.welcome-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
.wr-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px; font-weight: 700; color: var(--text-primary);
}
.wr-wave { display: inline-block; margin-left: 6px; animation: wave 1.5s ease-in-out infinite; }
@keyframes wave { 0%,100% { transform: rotate(0); } 25% { transform: rotate(15deg); } 75% { transform: rotate(-10deg); } }
.wr-sub { margin-top: 4px; font-size: 13px; color: var(--text-tertiary); }
.wr-actions { display: flex; gap: 10px; }

.btn-primary, .btn-secondary {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border-radius: 10px;
  font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.25s;
  font-family: inherit;
}
.btn-primary {
  background: linear-gradient(135deg, var(--gold-dim), var(--gold));
  color: #FFF; border: none;
  box-shadow: 0 2px 12px rgba(160,120,48,0.25);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(160,120,48,0.35);
}
.btn-secondary {
  background: var(--bg-card); color: var(--text-secondary);
  border: 1.5px solid var(--border);
}
.btn-secondary:hover { border-color: var(--gold-light); color: var(--gold); }

/* ═══════ 数据卡片 ═══════ */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 28px; }
.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg); padding: 22px 24px;
  border: 1px solid var(--border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px -8px var(--gold-glow);
  border-color: var(--gold-light);
}
.sc-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.sc-icon-wrap {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #FFFFFF;
}
.sc-trend {
  display: flex; align-items: center; gap: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 600; padding: 3px 8px;
  border-radius: 6px;
}
.sc-trend.up   { color: #059669; background: #ECFDF5; }
.sc-trend.down { color: #DC2626; background: #FEF2F2; }
.sc-body { display: flex; flex-direction: column; gap: 2px; }
.sc-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 26px; font-weight: 700; color: var(--text-primary);
  letter-spacing: -0.02em;
}
.sc-label { font-size: 12px; color: var(--text-tertiary); font-weight: 500; }

/* ═══════ 双栏 ═══════ */
.content-grid { display: grid; grid-template-columns: 1fr 380px; gap: 20px; margin-bottom: 24px; }
.cg-left, .cg-right { display: flex; flex-direction: column; gap: 20px; }

/* ═══════ 面板 ═══════ */
.panel {
  background: var(--bg-card); border-radius: var(--radius-lg);
  padding: 24px; border: 1px solid var(--border-light);
}
.panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.ph-title {
  font-family: 'Playfair Display', serif;
  font-size: 16px; font-weight: 600; color: var(--text-primary);
  display: flex; align-items: center; gap: 8px;
}
.ph-link {
  font-size: 12px; color: var(--gold); background: none; border: none;
  cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 3px;
  transition: opacity 0.2s; font-family: inherit;
}
.ph-link:hover { opacity: 0.7; }
.ph-tabs { display: flex; gap: 4px; background: var(--bg-input); border-radius: 8px; padding: 3px; }
.pht-btn {
  padding: 5px 14px; border-radius: 6px; border: none;
  font-size: 12px; color: var(--text-tertiary); cursor: pointer;
  background: transparent; font-weight: 500; transition: all 0.2s;
  font-family: inherit;
}
.pht-btn.active { background: var(--bg-card); color: var(--gold); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.ph-badge.excellent {
  padding: 4px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 600;
  background: linear-gradient(135deg, #D5F0E2, #A7F3D0);
  color: #065F46;
}
.ph-filters { display: flex; gap: 6px; }
.phf-btn {
  padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border-light);
  font-size: 12px; background: transparent; color: var(--text-tertiary);
  cursor: pointer; font-weight: 500; transition: all 0.2s;
  font-family: inherit;
}
.phf-btn:hover { border-color: var(--gold-light); color: var(--gold); }
.phf-btn.active { background: var(--gold-soft); border-color: var(--gold-light); color: var(--gold); }

/* ═══════ 图表 ═══════ */
.chart-area { display: flex; gap: 10px; }
.chart-y {
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 0 0 20px; font-size: 10px; color: var(--text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}
.chart-main { flex: 1; display: flex; flex-direction: column; }
.chart-svg { width: 100%; height: 180px; }
.chart-x {
  display: flex; justify-content: space-between;
  padding: 8px 4px 0; font-size: 10px; color: var(--text-tertiary);
}

/* ═══════ 迷你订单 ═══════ */
.order-mini-list { display: flex; flex-direction: column; }
.om-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-light);
  transition: background 0.2s;
}
.om-item:last-child { border-bottom: none; padding-bottom: 0; }
.om-item:hover { background: var(--gold-soft); margin: 0 -12px; padding: 14px 12px; border-radius: 8px; }
.omi-icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.omi-icon.os-waiting { background: #FEF3C7; color: #D97706; }
.omi-icon.os-pending  { background: #FEE2E2; color: #DC2626; }
.omi-icon.os-shipped { background: #DBEAFE; color: #2563EB; }
.omi-icon.os-done     { background: #D1FAE5; color: #059669; }
.omi-icon.os-cancel   { background: #F3F4F6; color: #6B7280; }
.omi-info { flex: 1; min-width: 0; }
.omi-product { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.omi-no { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
.omi-meta { text-align: right; }
.omi-price { font-size: 14px; font-weight: 700; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; }
.omi-status {
  display: block; font-size: 11px; font-weight: 600; margin-top: 2px;
}
.omi-status.os-waiting { color: #D97706; }
.omi-status.os-pending  { color: #DC2626; }
.omi-status.os-shipped  { color: #2563EB; }
.omi-status.os-done     { color: #059669; }
.omi-status.os-cancel   { color: #6B7280; }

/* ═══════ 快捷操作 ═══════ */
.quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.qa-btn {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 10px; border: 1px solid var(--border-light);
  border-radius: var(--radius-md); background: transparent;
  cursor: pointer; transition: all 0.25s;
  font-family: inherit;
}
.qa-btn:hover {
  border-color: var(--gold-light);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px -6px var(--gold-glow);
}
.qa-icon-wrap {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #FFFFFF;
}
.qa-label { font-size: 11px; color: var(--text-secondary); font-weight: 500; }

/* ═══════ 健康度 ═══════ */
.health-grid { display: flex; flex-direction: column; gap: 14px; }
.hg-item { display: flex; flex-direction: column; gap: 6px; }
.hgi-top { display: flex; justify-content: space-between; }
.hgi-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
.hgi-score { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; color: var(--text-primary); }
.hgi-score small { font-size: 10px; color: var(--text-tertiary); font-weight: 400; }
.hgi-bar {
  height: 6px; border-radius: 3px; background: var(--bg-input);
  overflow: hidden;
}
.hgi-fill { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

/* ═══════ 公告 ═══════ */
.ann-list { display: flex; flex-direction: column; gap: 12px; }
.ann-item { display: flex; flex-wrap: wrap; gap: 6px; align-items: baseline; }
.ann-tag {
  padding: 2px 8px; border-radius: 4px;
  font-size: 10px; font-weight: 600; color: #92400E;
}
.ann-text { font-size: 12px; color: var(--text-secondary); cursor: pointer; flex: 1; }
.ann-text:hover { color: var(--gold); }
.ann-time {
  font-size: 10px; color: var(--text-tertiary);
  display: flex; align-items: center; gap: 3px;
  width: 100%; margin-top: 2px;
}

/* ═══════ 数据表格 ═══════ */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left; padding: 12px 14px;
  font-size: 11px; font-weight: 600; color: var(--text-tertiary);
  text-transform: uppercase; letter-spacing: 0.06em;
  border-bottom: 2px solid var(--border-light);
}
.data-table td {
  padding: 14px;
  font-size: 13px; color: var(--text-secondary);
  border-bottom: 1px solid var(--border-light);
}
.data-table tbody tr {
  transition: background 0.2s;
}
.data-table tbody tr:hover { background: var(--gold-soft); }
.dt-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
.dt-product { display: flex; align-items: center; gap: 10px; }
.dtp-img {
  width: 36px; height: 36px; border-radius: 8px;
  background: var(--bg-input); display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.dt-status {
  padding: 3px 10px; border-radius: 5px;
  font-size: 11px; font-weight: 600;
}
.dt-status.os-waiting { background: #FEF3C7; color: #92400E; }
.dt-status.os-pending  { background: #FEE2E2; color: #991B1B; }
.dt-status.os-shipped  { background: #DBEAFE; color: #1E40AF; }
.dt-status.os-done     { background: #D1FAE5; color: #065F46; }
.dt-status.os-cancel   { background: #F3F4F6; color: #6B7280; }
.dt-action {
  padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border-light);
  background: transparent; font-size: 11px; color: var(--text-tertiary);
  cursor: pointer; font-weight: 500; transition: all 0.2s;
  font-family: inherit;
}
.dt-action:hover { border-color: var(--gold); color: var(--gold); }

/* ═══════ 数据占位 ═══════ */
.data-placeholder {
  display: flex; align-items: center; justify-content: center;
  min-height: 400px;
}
.dp-inner {
  text-align: center;
  color: var(--text-tertiary);
}
.dp-inner h2 {
  font-family: 'Playfair Display', serif;
  font-size: 22px; margin: 16px 0 8px;
  color: var(--text-secondary);
}
.dp-inner p {
  font-size: 13px;
}

/* ═══════ 响应式 ═══════ */
@media (max-width: 1100px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .content-grid { grid-template-columns: 1fr; }
  .tb-nav { display: none; }
  .sd-main { padding: 20px 16px 40px; }
  .sd-topbar { padding: 0 16px; }
}
@media (max-width: 640px) {
  .stats-row { grid-template-columns: 1fr; }
  .welcome-row { flex-direction: column; gap: 12px; }
  .wr-actions { flex-direction: column; width: 100%; }
  .wr-actions button { width: 100%; justify-content: center; }
  .quick-actions { grid-template-columns: repeat(2, 1fr); }
}
</style>
