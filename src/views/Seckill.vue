<template>
  <div class="sk-root">
    <!-- ══ 顶部横幅 ══ -->
    <section class="sk-hero">
      <div class="sk-hero-inner">
        <div class="sk-hero-badge">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>限时秒杀</span>
        </div>
        <h1 class="sk-hero-title">FLASH SALE</h1>
        <p class="sk-hero-sub">手慢无 · 超值好物限时抢购</p>

        <!-- 进行中活动倒计时条 -->
        <div v-if="ongoingActivity" class="sk-hero-countdown">
          <span class="sk-hc-label">距结束</span>
          <div class="sk-hc-timer">
            <span class="sk-hc-block">{{ pad(ongoingCountdown.hours) }}</span>
            <span class="sk-hc-sep">:</span>
            <span class="sk-hc-block">{{ pad(ongoingCountdown.minutes) }}</span>
            <span class="sk-hc-sep">:</span>
            <span class="sk-hc-block">{{ pad(ongoingCountdown.seconds) }}</span>
          </div>
        </div>
      </div>
      <div class="sk-hero-decor">
        <div class="sk-hd-dot" v-for="i in 12" :key="i" :style="{ '--i': i }"></div>
      </div>
    </section>

    <!-- ══ 主内容 ══ -->
    <div class="sk-body">
      <div class="sk-loading" v-if="loading">
        <div class="sk-spinner"></div>
        <span>秒杀加载中...</span>
      </div>
      <template v-else>

        <!-- ══ 正在进行 ══ -->
        <section v-if="ongoingActivity" class="sk-section">
          <div class="sk-sec-head">
            <div class="sk-sh-left">
              <span class="sk-sh-dot ongoing"></span>
              <h2>正在进行</h2>
              <span class="sk-sh-tag">{{ ongoingActivity.name }}</span>
            </div>
          </div>

          <div class="sk-grid">
            <article v-for="item in ongoingItems" :key="item.id" class="sk-card">
              <div class="sk-card-img-wrap">
                <img
                  :src="item.image || item.imageUrl"
                  :alt="item.name"
                  class="sk-card-img"
                  @error="handleImgError"
                />
                <div class="sk-card-tag">秒杀</div>
              </div>
              <div class="sk-card-body">
                <h3 class="sk-card-name">{{ item.name }}</h3>
                <div class="sk-card-price">
                  <span class="sk-price-now">¥{{ toYuan(item.flashPrice) }}</span>
                  <span class="sk-price-old" v-if="item.originalPrice">¥{{ toYuan(item.originalPrice) }}</span>
                </div>
                <!-- 进度条 -->
                <div class="sk-progress">
                  <div class="sk-progress-bar">
                    <div class="sk-progress-fill" :style="{ width: progressPct(item) + '%' }"></div>
                  </div>
                  <span class="sk-progress-text">已抢 {{ progressPct(item) }}%</span>
                </div>
                <button
                  class="sk-buy-btn"
                  :disabled="item.stock <= 0"
                  @click="handleBuy(item)"
                >
                  {{ item.stock <= 0 ? '已抢光' : '立即抢购' }}
                </button>
              </div>
            </article>
            <div v-if="ongoingItems.length === 0" class="sk-empty">
              <p>暂无常驻秒杀商品</p>
            </div>
          </div>
        </section>

        <!-- ══ 即将开始 ══ -->
        <section v-if="upcomingActivities.length > 0" class="sk-section">
          <div class="sk-sec-head">
            <div class="sk-sh-left">
              <span class="sk-sh-dot upcoming"></span>
              <h2>即将开始</h2>
            </div>
          </div>

          <div v-for="act in upcomingActivities" :key="act.id" class="sk-upcoming-block">
            <div class="sk-up-head">
              <span class="sk-up-name">{{ act.name }}</span>
              <div class="sk-up-timer">
                <span class="sk-up-timer-label">距离开始</span>
                <span class="sk-up-timer-val">{{ upcomingCountdownMap[act.id] || '--' }}</span>
              </div>
            </div>
            <div class="sk-grid">
              <article v-for="item in (act.items || [])" :key="item.id" class="sk-card upcoming">
                <div class="sk-card-img-wrap">
                  <img
                    :src="item.image || item.imageUrl"
                    :alt="item.name"
                    class="sk-card-img"
                    @error="handleImgError"
                  />
                  <div class="sk-card-tag upcoming">即将</div>
                </div>
                <div class="sk-card-body">
                  <h3 class="sk-card-name">{{ item.name }}</h3>
                  <div class="sk-card-price">
                    <span class="sk-price-now">¥{{ toYuan(item.flashPrice) }}</span>
                    <span class="sk-price-old" v-if="item.originalPrice">¥{{ toYuan(item.originalPrice) }}</span>
                  </div>
                  <button class="sk-buy-btn upcoming" disabled>即将开始</button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <!-- ══ 全部空空 ══ -->
        <div v-if="!ongoingActivity && upcomingActivities.length === 0" class="sk-empty-full">
          <div class="sk-empty-icon">⚡</div>
          <h3>暂无秒杀活动</h3>
          <p>当前没有正在进行或即将开始的秒杀活动，敬请期待</p>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSeckillList } from '@/api/seckill'
import nofoundImage from '@/assets/images/nofound.png'

const router = useRouter()

const loading = ref(true)

// ─── 数据 ───
const ongoingActivity = ref(null)       // 当前进行中的活动
const ongoingItems = ref([])            // 进行中的商品
const upcomingActivities = ref([])      // 即将开始的活动列表（含商品）

// ─── 倒计时 ───
const ongoingCountdown = reactive({ hours: '00', minutes: '00', seconds: '00' })
const upcomingCountdownMap = reactive({})
let tickTimer = null

const pad = (n) => String(n).padStart(2, '0')

const toYuan = (fen) => {
  if (!fen && fen !== 0) return '--'
  return (Number(fen) / 100).toFixed(2)
}

const progressPct = (item) => {
  // stock=剩余, sold=已售, 总=stock+sold
  const total = (item.stock || 0) + (item.sold || 0)
  if (!total) return 0
  return Math.min(100, Math.round(((item.sold || 0) / total) * 100))
}

const handleImgError = (e) => {
  e.target.src = nofoundImage
}

// ─── 加载数据 ───
const fetchSeckillData = async () => {
  loading.value = true
  try {
    const res = await getSeckillList()
    // 后端返回扁平数组 [{id, name, startTime, endTime, items:[...]}]
    const list = Array.isArray(res) ? res : []
    const now = Date.now()

    // 按时间分类
    ongoingActivity.value = null
    ongoingItems.value = []
    upcomingActivities.value = []

    list.forEach(act => {
      const start = act.startTime ? new Date(String(act.startTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
      const end = act.endTime ? new Date(String(act.endTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0

      if (start && end && now >= start && now < end) {
        // 进行中
        ongoingActivity.value = act
        ongoingItems.value = (act.items || []).map(item => ({
          ...item,
          flashPrice: item.flashPrice,
          originalPrice: item.originalPrice,
          stock: item.stock,
          sold: item.sold || 0,
        }))
      } else if (start && now < start) {
        // 即将开始
        upcomingActivities.value.push(act)
      }
      // 已结束的忽略
    })
  } catch (err) {
    console.error('加载秒杀数据失败:', err)
  } finally {
    loading.value = false
  }
}

// ─── 倒计时逻辑 ───
const updateCountdowns = () => {
  const now = Date.now()

  // 进行中活动倒计时
  if (ongoingActivity.value?.endTime) {
    const end = new Date(String(ongoingActivity.value.endTime).replace(/-/g, '/').replace('T', ' ')).getTime()
    const diff = Math.max(0, Math.floor((end - now) / 1000))
    ongoingCountdown.hours = pad(Math.floor(diff / 3600))
    ongoingCountdown.minutes = pad(Math.floor((diff % 3600) / 60))
    ongoingCountdown.seconds = pad(diff % 60)
    // 结束则刷新数据
    if (diff <= 0) {
      fetchSeckillData()
    }
  }

  // 即将开始活动倒计时
  upcomingActivities.value.forEach(act => {
    if (act.startTime) {
      const start = new Date(String(act.startTime).replace(/-/g, '/').replace('T', ' ')).getTime()
      const diff = Math.max(0, Math.floor((start - now) / 1000))
      if (diff <= 0) {
        upcomingCountdownMap[act.id] = '即将开始'
        fetchSeckillData()
      } else {
        const h = pad(Math.floor(diff / 3600))
        const m = pad(Math.floor((diff % 3600) / 60))
        const s = pad(diff % 60)
        upcomingCountdownMap[act.id] = `${h}:${m}:${s}`
      }
    }
  })
}

// ─── 抢购 ───
const handleBuy = (item) => {
  if (!item.id) return
  router.push({ path: '/seckill/item/' + item.id })
}

// ─── 生命周期 ───
onMounted(async () => {
  await fetchSeckillData()
  if (ongoingActivity.value || upcomingActivities.value.length > 0) {
    tickTimer = setInterval(updateCountdowns, 1000)
  }
})

onUnmounted(() => {
  if (tickTimer) clearInterval(tickTimer)
})
</script>

<style scoped>
/* ══ 根 ══ */
.sk-root {
  min-height: 100vh;
  background: linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 360px, #F5F3EE 360px);
  --accent: #FF4757;
  --accent-soft: #FF6B81;
  --gold: #F7B731;
  --surface: #FFF;
  --surface-soft: #F9F7F2;
  --text: #1A1A18;
  --text2: #6B6B6B;
  --border: #E8E2D5;
  --radius: 14px;
  --shadow: 0 1px 3px rgba(0,0,0,.04), 0 6px 20px rgba(0,0,0,.06);
}

/* ══ 英雄区 ══ */
.sk-hero {
  position: relative;
  overflow: hidden;
  padding: 80px 32px 60px;
  text-align: center;
  color: #FFF;
}
.sk-hero-inner { position: relative; z-index: 1; }
.sk-hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.2);
  padding: 6px 18px; border-radius: 100px;
  font-size: 13px; font-weight: 600; margin-bottom: 18px;
}
.sk-hero-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: clamp(36px, 8vw, 64px); font-weight: 700;
  letter-spacing: 0.08em; margin-bottom: 8px;
}
.sk-hero-sub { font-size: 14px; color: rgba(255,255,255,.7); margin-bottom: 24px; }

/* 倒计时条 */
.sk-hero-countdown {
  display: inline-flex; align-items: center; gap: 12px;
  background: rgba(255,71,87,.15);
  border: 1px solid rgba(255,71,87,.3);
  padding: 10px 24px; border-radius: 100px;
}
.sk-hc-label { font-size: 13px; color: rgba(255,255,255,.8); }
.sk-hc-timer { display: flex; align-items: center; gap: 4px; }
.sk-hc-block {
  width: 36px; height: 38px; background: rgba(255,255,255,.15);
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; font-family: 'Space Mono', monospace;
}
.sk-hc-sep { font-size: 16px; font-weight: 600; }

/* 装饰点 */
.sk-hero-decor { position: absolute; inset: 0; z-index: 0; }
.sk-hd-dot {
  position: absolute; width: 4px; height: 4px; border-radius: 50%;
  background: rgba(255,255,255,.15);
  animation: float 4s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.6s);
  left: calc(var(--i) * 8% + 10%); top: calc(var(--i) * 12% + 10%);
}
@keyframes float {
  0%, 100% { transform: translateY(0); opacity: .3; }
  50% { transform: translateY(-16px); opacity: .8; }
}

/* ══ 主体 ══ */
.sk-body {
  max-width: 1200px; margin: -20px auto 60px;
  padding: 0 24px; position: relative; z-index: 1;
}

/* ══ 加载 ══ */
.sk-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 0; color: var(--text2); }
.sk-spinner {
  width: 32px; height: 32px; border: 3px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ 分区 ══ */
.sk-section { margin-bottom: 40px; }
.sk-sec-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; padding: 0 4px;
}
.sk-sh-left { display: flex; align-items: center; gap: 10px; }
.sk-sh-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.sk-sh-dot.ongoing { background: var(--accent); animation: pulse 1.5s ease-in-out infinite; }
.sk-sh-dot.upcoming { background: var(--gold); }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,71,87,.4); } 50% { box-shadow: 0 0 0 8px rgba(255,71,87,0); } }

.sk-sec-head h2 { font-size: 18px; font-weight: 700; color: var(--text); }
.sk-sh-tag {
  font-size: 12px; color: var(--accent); background: rgba(255,71,87,.08);
  padding: 2px 10px; border-radius: 6px; font-weight: 500;
}

/* ══ 商品网格 ══ */
.sk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
}

/* ══ 商品卡片 ══ */
.sk-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
  box-shadow: var(--shadow); transition: .25s;
}
.sk-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,.08), 0 12px 32px rgba(0,0,0,.08); }
.sk-card.upcoming { opacity: .85; }

.sk-card-img-wrap { position: relative; aspect-ratio: 1; overflow: hidden; background: #F5F2EA; }
.sk-card-img { width: 100%; height: 100%; object-fit: cover; transition: .3s; }
.sk-card:hover .sk-card-img { transform: scale(1.04); }
.sk-card-tag {
  position: absolute; top: 10px; left: 10px;
  background: linear-gradient(135deg, #FF4757, #FF6B81);
  color: #FFF; font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 6px;
}
.sk-card-tag.upcoming { background: linear-gradient(135deg, #F7B731, #FDCB6E); color: #1A1A18; }

.sk-card-body { padding: 14px; }
.sk-card-name {
  font-size: 14px; font-weight: 500; color: var(--text);
  margin-bottom: 8px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}

.sk-card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; }
.sk-price-now { font-size: 20px; font-weight: 700; color: var(--accent); font-family: 'Space Mono', monospace; }
.sk-price-old { font-size: 12px; color: var(--text2); text-decoration: line-through; }

/* 进度条 */
.sk-progress { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.sk-progress-bar {
  flex: 1; height: 6px; background: #F0EAE0; border-radius: 3px; overflow: hidden;
}
.sk-progress-fill {
  height: 100%; background: linear-gradient(90deg, #FF4757, #FF6B81);
  border-radius: 3px; transition: width .6s;
}
.sk-progress-text { font-size: 11px; color: var(--text2); white-space: nowrap; flex-shrink: 0; }

/* 抢购按钮 */
.sk-buy-btn {
  width: 100%; padding: 10px;
  border: none; border-radius: 10px;
  background: linear-gradient(135deg, #FF4757, #FF6B81);
  color: #FFF; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: .2s;
  font-family: inherit;
}
.sk-buy-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,71,87,.35); }
.sk-buy-btn:disabled { background: #E0D8C8; color: #B0A898; cursor: not-allowed; }
.sk-buy-btn.upcoming:disabled { background: linear-gradient(135deg, #F7B731, #FDCB6E); color: #1A1A18; opacity:.7; }

/* ══ 即将开始区块 ══ */
.sk-upcoming-block { margin-bottom: 32px; }
.sk-up-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; margin-bottom: 16px;
  background: #FFF; border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow);
}
.sk-up-name { font-size: 15px; font-weight: 600; color: var(--text); }
.sk-up-timer { display: flex; align-items: center; gap: 8px; }
.sk-up-timer-label { font-size: 12px; color: var(--text2); }
.sk-up-timer-val {
  font-size: 14px; font-weight: 700; color: var(--gold);
  font-family: 'Space Mono', monospace;
}

/* ══ 空态 ══ */
.sk-empty,
.sk-empty-full { text-align: center; padding: 60px 20px; color: var(--text2); }
.sk-empty-full { padding: 120px 20px; }
.sk-empty-icon { font-size: 48px; margin-bottom: 16px; }
.sk-empty-full h3 { font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
.sk-empty-full p { font-size: 14px; }

/* ══ 响应式 ══ */
@media (max-width: 768px) {
  .sk-hero { padding: 60px 20px 40px; }
  .sk-body { padding: 0 16px; }
  .sk-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
  .sk-card-body { padding: 10px; }
  .sk-price-now { font-size: 16px; }
}
@media (max-width: 480px) {
  .sk-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
