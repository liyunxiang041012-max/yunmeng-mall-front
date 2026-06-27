<template>
  <div class="coupon-page">

    <!-- ══ 兑换区 ══ -->
    <section class="redeem-hero">
      <div class="rh-texture"></div>
      <div class="rh-inner">
        <div class="rh-left">
          <span class="rh-eyebrow">REDEEM CODE</span>
          <h2 class="rh-title">兑换<span class="rh-title-em">专属</span>优惠</h2>
          <p class="rh-desc">输入您的专属兑换码，即刻解锁限定福利</p>
        </div>
        <div class="rh-form">
          <div class="rh-input-wrap">
            <svg class="rh-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
            <input
              v-model="redeemCode"
              placeholder="输入兑换码"
              class="rh-input"
              @keyup.enter="handleRedeem"
            />
            <span class="rh-input-divider"></span>
            <button class="rh-btn" :disabled="!redeemCode.trim() || redeeming" @click="handleRedeem">
              <span v-if="!redeeming">兑换</span>
              <span v-else class="rh-btn-loading">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ 领券中心 ══ -->
    <section class="section-block">
      <div class="section-head">
        <div class="sh-left">
          <span class="sh-eyebrow">CLAIM</span>
          <h2 class="sh-title">领券中心</h2>
        </div>
        <div class="sh-right">
          <span class="sh-count">{{ availableCoupons.length }} 张可领</span>
        </div>
      </div>

      <div class="coupon-grid" v-loading="availableLoading">
        <article v-for="c in availableCoupons" :key="c.id" :class="['claim-card', { 'is-claimed': c.claimed }]">
          <div class="claim-card-bg">
            <div class="claim-card-shimmer"></div>
          </div>
          <div class="claim-card-top">
            <div class="claim-amount">
              <span v-if="c.discountType !== 2" class="claim-currency">¥</span>
              <span class="claim-value">{{ c.discountAmount }}</span>
            </div>
          </div>
          <div class="claim-card-cutout">
            <div class="claim-cut c1"></div>
            <div class="claim-cut c2"></div>
          </div>
          <div class="claim-card-bottom">
            <p class="claim-name">{{ c.name }}</p>
            <p class="claim-desc">{{ c.description || '全场通用' }}</p>
            <div class="claim-meta">
              <span class="claim-condition" v-if="c.minAmount > 0">满 ¥{{ c.minAmount }} 可用</span>
              <span class="claim-condition no-limit" v-else>无门槛</span>
              <span class="claim-expire">{{ c.expireTime }} 到期</span>
            </div>
            <button v-if="!c.claimed" class="claim-btn" @click="handleClaim(c.id)">
              <span>立即领取</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <span v-else class="claim-done">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              已领取
            </span>
          </div>
        </article>

        <div v-if="!availableLoading && availableCoupons.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="8" y="14" width="48" height="36" rx="4" stroke="currentColor" stroke-width="1.5" opacity=".3"/><path d="M22 14V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6" stroke="currentColor" stroke-width="1.5" opacity=".3"/></svg>
          </div>
          <p class="empty-text">暂无可领取的优惠券</p>
        </div>
      </div>
    </section>

    <!-- ══ 我的优惠券 ══ -->
    <section class="section-block">
      <div class="section-head">
        <div class="sh-left">
          <span class="sh-eyebrow">MY WALLET</span>
          <h2 class="sh-title">我的优惠券</h2>
        </div>
        <div class="sh-right">
          <div class="my-tabs">
            <button
              v-for="t in statusTabs"
              :key="t.value"
              :class="['my-tab', { active: activeTab === t.value }]"
              @click="activeTab = t.value"
            >{{ t.label }}</button>
          </div>
        </div>
      </div>

      <div class="my-list" v-loading="myLoading">
        <div
          v-for="c in filteredMyCoupons"
          :key="c.id"
          :class="['my-card', { 'is-used': c.status === 'used', 'is-expired': c.status === 'expired' }]"
        >
          <div class="my-card-left">
            <div class="my-card-amount">
              <span v-if="c.discountType !== 2" class="my-card-currency">¥</span>
              <span class="my-card-value">{{ c.discountAmount }}</span>
            </div>
            <p class="my-card-condition" v-if="c.minAmount > 0">满 {{ c.minAmount }} 可用</p>
            <p class="my-card-condition" v-else>无门槛券</p>
          </div>

          <div class="my-card-body">
            <div class="my-card-stripe"></div>
            <div class="my-card-info">
              <div class="my-card-text">
                <p class="my-card-name">{{ c.name }}</p>
                <p class="my-card-desc">{{ c.description || '全场通用' }}</p>
                <p class="my-card-expire">{{ getExpireLabel(c) }}</p>
              </div>
              <div class="my-card-right">
                <span v-if="c.status === 'unused'" class="my-badge active">可使用</span>
                <span v-else-if="c.status === 'used'" class="my-badge used">已使用</span>
                <span v-else class="my-badge expired">已过期</span>
                <button v-if="c.status === 'unused'" class="my-use-btn" @click="goShopping">
                  去使用
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="my-card-overlay" v-if="c.status !== 'unused'"></div>
        </div>

        <div v-if="!myLoading && filteredMyCoupons.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="12" y="16" width="40" height="36" rx="6" stroke="currentColor" stroke-width="1.5" opacity=".3"/><circle cx="32" cy="34" r="8" stroke="currentColor" stroke-width="1.5" opacity=".3"/></svg>
          </div>
          <p class="empty-text">{{ activeTab === 'all' ? '还没有优惠券，快去领取吧' : '暂无此类优惠券' }}</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMyCoupons, getAvailableCoupons, claimCoupon, redeemCoupon } from '@/api/coupon'

const router = useRouter()

// ⚠️ 假数据开关 — 后端接口好了之后改成 false 即可
const USE_FAKE_DATA = false
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ─── 兑换 ───
const redeemCode = ref('')
const redeeming = ref(false)

const handleRedeem = async () => {
  const code = redeemCode.value.trim()
  if (!code) return
  redeeming.value = true
  // 假数据 - 后端好了删掉这一段
  if (USE_FAKE_DATA) {
    await delay(600)
    ElMessage.success('兑换成功！优惠券已发放到您的账户')
    myCoupons.value.unshift({
      id: Date.now(), name: '兑换专属券', description: '兑换码兑换',
      discountAmount: '20', minAmount: '99',
      expireTime: '2026-12-31', status: 'unused',
    })
    redeemCode.value = ''
    redeeming.value = false
    return
  }
  try {
    // 后端返回 void，无异常即成功
    await redeemCoupon(code)
    ElMessage.success('兑换成功！优惠券已发放到您的账户')
    redeemCode.value = ''
    loadMyCoupons()
  } catch (err) {
    ElMessage.error(err.message || '兑换失败，请检查兑换码')
  } finally {
    redeeming.value = false
  }
}

// ─── 可领取优惠券 ───
const availableCoupons = ref([])
const availableLoading = ref(false)

const loadAvailable = async () => {
  availableLoading.value = true
  // 假数据 - 后端好了删掉这一段
  if (USE_FAKE_DATA) {
    await delay(400)
    availableCoupons.value = [
      { id: 1, name: '新人专享券', description: '新用户专属福利', discountAmount: '30', minAmount: '0', expireTime: '2026-07-31', claimed: false },
      { id: 2, name: '满减狂欢券', description: '全场通用', discountAmount: '50', minAmount: '299', expireTime: '2026-06-30', claimed: false },
      { id: 3, name: '数码专场券', description: '数码品类专用', discountAmount: '100', minAmount: '899', expireTime: '2026-08-15', claimed: false },
      { id: 4, name: '夏日清凉券', description: '限时领取', discountAmount: '15', minAmount: '0', expireTime: '2026-07-15', claimed: false },
      { id: 5, name: '品牌特惠券', description: '指定品牌可用', discountAmount: '80', minAmount: '499', expireTime: '2026-06-20', claimed: true },
      { id: 6, name: '周末闪购券', description: '周末限定', discountAmount: '25', minAmount: '129', expireTime: '2026-06-10', claimed: false },
    ]
    availableLoading.value = false
    return
  }
  try {
    // GET /coupons/list 直接返回数组，非分页
    const res = await getAvailableCoupons()
    // 兼容多种后端返回格式：裸数组 / { list:[] } / { records:[] } / { data:[] }
    const list = Array.isArray(res) ? res : (res?.records ?? res?.list ?? res?.data ?? [])
    const now = Date.now()
    availableCoupons.value = list
      .filter(c => c.available !== false)  // 过滤不可领取的券
      .filter(c => !c.received)            // 过滤当前用户已领取的券
      .filter(c => {
        // 过滤未开始发放的券
        const begin = c.issueBeginTime ? new Date(String(c.issueBeginTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
        if (begin && now < begin) return false
        return true
      })
      .filter(c => {
        // 过滤已领完的券（totalNum 有值且已领完）
        if (c.totalNum && (c.receivedCount || 0) >= c.totalNum) return false
        return true
      })
      .filter(c => {
        // 过滤已过期的券
        const end = c.issueEndTime ? new Date(String(c.issueEndTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
        if (end && now > end) return false
        return true
      })
      .map(c => ({
        id: c.id,
        name: c.name,
        discountType: c.discountType,       // 保留原始类型，模板里区分显示
        description: formatDiscountType(c.discountType),
        discountAmount: formatAmount(c.discountValue, c.discountType),
        minAmount: formatAmountDisplay(c.thresholdAmount),
        expireTime: c.termDays ? `${c.termDays}天有效` : formatDate(c.termEndTime),
        claimed: c.received || false,
      }))
  } catch (err) {
    console.error('[可领优惠券] 加载失败:', err)
    ElMessage.error('加载可领优惠券失败，请稍后重试')
  } finally {
    availableLoading.value = false
  }
}

const formatDiscountType = (type) => {
  const map = {
    1: '每满减券',
    2: '折扣券',
    3: '无门槛券',
    4: '满减券',
  }
  return map[type] || '全场通用'
}

const handleClaim = async (id) => {
  // 假数据 - 后端好了删掉这一段
  if (USE_FAKE_DATA) {
    await delay(300)
    ElMessage.success('领取成功！')
    const item = availableCoupons.value.find(c => c.id === id)
    if (item) {
      item.claimed = true
      myCoupons.value.unshift({
        id: Date.now(), name: item.name, description: item.description,
        discountAmount: item.discountAmount, minAmount: item.minAmount,
        expireTime: item.expireTime, status: 'unused',
      })
    }
    return
  }
  try {
    // 后端返回 void，无异常即成功
    await claimCoupon(id)
    ElMessage.success('领取成功！')
    availableCoupons.value.forEach(c => { if (c.id === id) c.claimed = true })
    loadMyCoupons()
  } catch (err) {
    ElMessage.error(err.message || '领取失败')
  }
}

// ─── 我的优惠券 ───
const myCoupons = ref([])
const myLoading = ref(false)
const activeTab = ref('all')

const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '可使用', value: 'unused' },
  { label: '已使用', value: 'used' },
  { label: '已过期', value: 'expired' },
]

const loadMyCoupons = async () => {
  myLoading.value = true
  // 假数据 - 后端好了删掉这一段
  if (USE_FAKE_DATA) {
    await delay(400)
    myCoupons.value = [
      { id: 101, name: '双11预热券', description: '全场通用', discountAmount: '60', minAmount: '299', expireTime: '2026-06-20', status: 'unused' },
      { id: 102, name: '会员专享券', description: '会员等级专属', discountAmount: '40', minAmount: '199', expireTime: '2026-06-25', status: 'unused' },
      { id: 103, name: '品类满减券', description: '数码品类专用', discountAmount: '100', minAmount: '799', expireTime: '2026-05-15', status: 'used' },
      { id: 104, name: '新人礼包券', description: '新用户专享', discountAmount: '20', minAmount: '0', expireTime: '2026-04-30', status: 'used' },
      { id: 105, name: '年货节特惠', description: '限时活动', discountAmount: '50', minAmount: '259', expireTime: '2026-03-01', status: 'expired' },
      { id: 106, name: '开学季券', description: '学生专享', discountAmount: '30', minAmount: '129', expireTime: '2026-02-28', status: 'expired' },
    ]
    myLoading.value = false
    return
  }
  try {
    // GET /user-coupons/page 返回 { total, pages, list }，拦截器已解包
    const res = await getMyCoupons({ pageNo: 1, pageSize: 50 })
    // 兼容 MyBatis Plus 分页字段：records（默认）| list
    const list = res?.records ?? res?.list ?? []
    myCoupons.value = list.map(c => ({
      id: c.id,
      name: c.name,
      discountType: c.discountType,
      description: formatDiscountType(c.discountType),
      discountAmount: formatAmount(c.discountValue, c.discountType),
      minAmount: formatAmountDisplay(c.thresholdAmount),
      expireTime: formatDate(c.termEndTime),
      status: normalizeStatus(c.status),
    }))
  } catch (err) {
    console.error('[我的优惠券] 加载失败:', err)
    ElMessage.error('加载我的优惠券失败，请稍后重试')
  } finally {
    myLoading.value = false
  }
}

const filteredMyCoupons = computed(() => {
  if (activeTab.value === 'all') return myCoupons.value
  return myCoupons.value.filter(c => c.status === activeTab.value)
})

const getExpireLabel = (c) => {
  if (c.status === 'used') return '已使用'
  if (c.status === 'expired') return '已过期'
  return `有效期至 ${c.expireTime}`
}

const goShopping = () => {
  router.push('/home')
}

// ─── 工具 ───
const formatAmount = (val, discountType) => {
  if (!val && val !== 0) return '--'
  const n = Number(val)
  // 折扣券(discountType=2): discountValue 如 80=8折
  if (discountType === 2) {
    return `${(n / 10).toFixed(1)}折`.replace('.0折', '折')
  }
  // 满减类金额单位为分，除以100显示元
  return (n / 100).toFixed(n % 100 === 0 ? 0 : 2)
}

const formatAmountDisplay = (val) => {
  if (!val && val !== 0) return 0
  const n = Number(val)
  return (n / 100).toFixed(n % 100 === 0 ? 0 : 2)
}

const formatDate = (val) => {
  if (!val) return ''
  const s = String(val)
  // ISO 格式: "2026-06-30T11:29:46" → "2026-06-30"
  if (s.includes('T')) return s.split('T')[0]
  // 空格分隔: "2026-06-30 11:29:46" → "2026-06-30"
  if (s.includes(' ')) return s.split(' ')[0]
  if (s.includes('-')) return s
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return s
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch { return s }
}

const normalizeStatus = (s) => {
  if (!s && s !== 0) return 'unused'
  // 后端返回数字: 1=未使用, 2=已使用, 3=已过期
  if (s === 1 || s === '1' || String(s).toLowerCase() === 'unused') return 'unused'
  if (s === 2 || s === '2' || String(s).toLowerCase() === 'used') return 'used'
  if (s === 3 || s === '3' || String(s).toLowerCase() === 'expired') return 'expired'
  return 'unused'
}

// ─── 初始化 ───
onMounted(() => {
  loadAvailable()
  loadMyCoupons()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=JetBrains+Mono:wght@400;500&display=swap');

.coupon-page {
  --cream: #F9F5EC;
  --cream-deep: #F0E8D5;
  --espresso: #1C1814;
  --espresso-soft: #3A3228;
  --gold-foil: #C4A24E;
  --gold-deep: #8B6914;
  --gold-pale: #E8D5A3;
  --gold-mist: rgba(196, 162, 78, 0.08);
  --gold-glow: rgba(196, 162, 78, 0.18);
  --rose: #B8444A;
  --rose-soft: #D4797D;
  --stone: #A09888;
  --stone-light: #C8C0B4;
  --white-soft: #FFFDF8;
  --shadow-card: 0 1px 2px rgba(28, 24, 20, 0.04), 0 4px 16px rgba(28, 24, 20, 0.06);
  --shadow-lift: 0 2px 4px rgba(28, 24, 20, 0.03), 0 12px 32px rgba(28, 24, 20, 0.1);
  --shadow-btn: 0 2px 8px rgba(139, 105, 20, 0.25);
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --font-display: 'Playfair Display', 'Noto Serif SC', serif;
  --font-body: 'Noto Sans SC', 'PingFang SC', sans-serif;
  --font-mono: 'JetBrains Mono', 'Space Mono', monospace;

  background: linear-gradient(180deg, #F9F5EC 0%, #F3EDDE 30%, #F9F5EC 100%);
  color: var(--espresso);
  min-height: 100vh;
  width: 100%;
  font-family: var(--font-body);
  padding-bottom: 80px;
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; margin: 0; padding: 0; }

/* ══════════════════════════════════════════
   通用区块
   ══════════════════════════════════════════ */
.section-block {
  margin-bottom: 56px;
  max-width: 1280px;
  margin-left: auto; margin-right: auto;
  padding: 0 48px;
}
.section-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 32px; padding-bottom: 20px;
  border-bottom: 1px solid rgba(196, 162, 78, 0.2);
}
.sh-left { display: flex; flex-direction: column; gap: 6px; }
.sh-eyebrow {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 4px;
  color: var(--gold-foil); font-weight: 500; text-transform: uppercase;
}
.sh-title {
  font-family: var(--font-display); font-size: 28px; font-weight: 600;
  color: var(--espresso); letter-spacing: -0.5px; line-height: 1;
}
.sh-right { display: flex; align-items: center; gap: 12px; }
.sh-count {
  font-size: 13px; color: var(--gold-deep); font-weight: 500;
  background: var(--gold-mist); padding: 6px 16px; border-radius: 100px;
  border: 1px solid rgba(196, 162, 78, 0.2);
}

/* ── 空状态 ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 64px 0; grid-column: 1 / -1;
}
.empty-illustration { color: var(--stone-light); }
.empty-text { font-size: 14px; color: var(--stone); font-weight: 300; }

/* ══════════════════════════════════════════
   兑换区
   ══════════════════════════════════════════ */
.redeem-hero {
  position: relative; overflow: hidden;
  margin-bottom: 56px; width: 100%;
}
.rh-texture {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 50%, rgba(196,162,78,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 40% 70% at 85% 30%, rgba(196,162,78,0.05) 0%, transparent 50%),
    linear-gradient(180deg, #FFFDF8 0%, #F9F5EC 40%, #F3EDDE 100%);
}
.rh-texture::before {
  content: '';
  position: absolute; inset: 0;
  background-image:
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(196,162,78,0.03) 2px, rgba(196,162,78,0.03) 4px);
  mask-image: linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%);
}
.rh-inner {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: space-between; gap: 64px;
  padding: 64px 48px;
  max-width: 1280px; margin: 0 auto;
}
.rh-left { flex-shrink: 0; }
.rh-eyebrow {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 5px;
  color: var(--gold-foil); font-weight: 500;
}
.rh-title {
  font-family: var(--font-display); font-size: 42px; font-weight: 600;
  color: var(--espresso); letter-spacing: -1px;
  margin: 12px 0 12px; line-height: 1.15;
}
.rh-title-em { color: var(--gold-foil); font-style: italic; }
.rh-desc { font-size: 15px; color: var(--stone); font-weight: 300; }

.rh-form { flex-shrink: 0; width: 420px; }
.rh-input-wrap {
  display: flex; align-items: center; gap: 0;
  background: var(--white-soft);
  border: 1.5px solid rgba(196, 162, 78, 0.25);
  border-radius: 60px; overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.3s cubic-bezier(.22,1,.36,1);
}
.rh-input-wrap:focus-within {
  border-color: var(--gold-foil);
  box-shadow: 0 0 0 4px rgba(196, 162, 78, 0.08), var(--shadow-lift);
}
.rh-input-icon { color: var(--stone); flex-shrink: 0; margin-left: 20px; }
.rh-input {
  flex: 1; border: none; outline: none; font-family: var(--font-body);
  font-size: 15px; color: var(--espresso); background: transparent;
  padding: 16px 12px;
}
.rh-input::placeholder { color: var(--stone-light); }
.rh-input-divider {
  width: 1px; height: 24px; background: rgba(196, 162, 78, 0.2); flex-shrink: 0;
}
.rh-btn {
  padding: 16px 28px; border: none;
  background: linear-gradient(135deg, var(--espresso) 0%, var(--espresso-soft) 100%);
  color: var(--cream); font-family: var(--font-body); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.3s cubic-bezier(.22,1,.36,1);
  display: flex; align-items: center; gap: 8px; letter-spacing: 0.5px;
}
.rh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--espresso-soft) 0%, var(--espresso) 100%);
  padding-right: 36px;
}
.rh-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.rh-btn-loading svg { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════
   领券中心 — 卡片
   ══════════════════════════════════════════ */
.coupon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.claim-card {
  position: relative; isolation: isolate;
  background: var(--white-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(196, 162, 78, 0.15);
  box-shadow: var(--shadow-card);
  transition: all 0.4s cubic-bezier(.22,1,.36,1);
  cursor: default;
}
.claim-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lift);
  border-color: rgba(196, 162, 78, 0.35);
}
.claim-card.is-claimed { opacity: 0.5; pointer-events: none; }
.claim-card.is-claimed:hover { transform: none; }

.claim-card-bg {
  position: absolute; inset: 0; z-index: 0;
  background:
    radial-gradient(ellipse 120% 60% at 50% 0%, rgba(196,162,78,0.06) 0%, transparent 50%),
    linear-gradient(180deg, var(--white-soft) 0%, var(--cream) 100%);
}
.claim-card-shimmer {
  position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.7s ease;
}
.claim-card:hover .claim-card-shimmer { left: 120%; }

.claim-card-top {
  position: relative; z-index: 1;
  padding: 28px 24px 20px;
  display: flex; flex-direction: column; align-items: center;
}
.claim-amount { display: flex; align-items: baseline; gap: 2px; }
.claim-currency {
  font-family: var(--font-display); font-size: 20px; font-weight: 600;
  color: var(--rose); margin-bottom: -4px;
}
.claim-value {
  font-family: var(--font-display); font-size: 56px; font-weight: 600;
  color: var(--rose); line-height: 0.85; letter-spacing: -2px;
}

.claim-card-cutout {
  position: relative; z-index: 1;
  display: flex; justify-content: space-between;
  padding: 0 20px;
}
.claim-card-cutout::before {
  content: '';
  position: absolute; left: 20px; right: 20px; top: 50%;
  height: 1px;
  background: repeating-linear-gradient(90deg, rgba(196,162,78,0.2) 0px, rgba(196,162,78,0.2) 4px, transparent 4px, transparent 6px);
}
.claim-cut {
  width: 16px; height: 16px; border-radius: 50%;
  background: linear-gradient(180deg, #F9F5EC 0%, #F0E8D5 100%);
  border: 1px solid rgba(196, 162, 78, 0.15);
  position: relative; z-index: 2;
}

.claim-card-bottom {
  position: relative; z-index: 1;
  padding: 18px 24px 24px;
  display: flex; flex-direction: column; gap: 8px;
}
.claim-name {
  font-size: 15px; font-weight: 500; color: var(--espresso);
  line-height: 1.3;
}
.claim-desc {
  font-size: 12px; color: var(--stone); font-weight: 300;
}
.claim-meta {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 4px;
}
.claim-condition {
  font-size: 11px; color: var(--gold-deep);
  background: var(--gold-mist); padding: 3px 10px; border-radius: 100px;
  font-weight: 400;
}
.claim-condition.no-limit { color: #3A7D5A; background: rgba(58,125,90,0.08); }
.claim-expire {
  font-family: var(--font-mono); font-size: 10px; color: var(--stone);
}

.claim-btn {
  margin-top: 12px;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 0; width: 100%;
  border-radius: 60px; border: none;
  background: linear-gradient(135deg, var(--espresso) 0%, var(--espresso-soft) 100%);
  color: var(--cream); font-family: var(--font-body); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.3s cubic-bezier(.22,1,.36,1);
  box-shadow: var(--shadow-btn); letter-spacing: 0.5px;
}
.claim-btn:hover {
  background: linear-gradient(135deg, var(--espresso-soft) 0%, var(--espresso) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(139, 105, 20, 0.35);
}
.claim-btn:active { transform: scale(0.98); }

.claim-done {
  margin-top: 12px;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 13px; color: var(--stone); font-weight: 500;
  padding: 10px 0;
}
.claim-done svg { color: #4A8C6A; }

/* ══════════════════════════════════════════
   我的优惠券 — 列表
   ══════════════════════════════════════════ */
.my-tabs { display: flex; gap: 4px; background: rgba(0,0,0,0.03); padding: 4px; border-radius: 100px; }
.my-tab {
  padding: 7px 16px; border-radius: 100px;
  font-family: var(--font-body); font-size: 12px; font-weight: 400;
  background: transparent; border: none; color: var(--stone);
  cursor: pointer; transition: all 0.25s cubic-bezier(.22,1,.36,1);
}
.my-tab.active {
  background: var(--white-soft); color: var(--espresso); font-weight: 500;
  box-shadow: var(--shadow-card);
}
.my-tab:hover:not(.active) { color: var(--espresso-soft); }

.my-list { display: flex; flex-direction: column; gap: 14px; }

.my-card {
  position: relative; isolation: isolate;
  display: flex; align-items: stretch;
  background: var(--white-soft);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid rgba(196, 162, 78, 0.12);
  box-shadow: var(--shadow-card);
  transition: all 0.35s cubic-bezier(.22,1,.36,1);
}
.my-card:hover {
  border-color: rgba(196, 162, 78, 0.3);
  box-shadow: var(--shadow-lift);
}
.my-card.is-used, .my-card.is-expired { opacity: 0.55; pointer-events: none; }
.my-card-overlay {
  position: absolute; inset: 0; z-index: 2;
  background: rgba(249, 245, 236, 0.35);
  backdrop-filter: grayscale(0.3);
}

.my-card-left {
  width: 140px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 28px 20px; gap: 8px;
  background:
    linear-gradient(180deg, rgba(196,162,78,0.05) 0%, transparent 60%),
    linear-gradient(180deg, var(--white-soft) 0%, var(--cream) 100%);
  border-right: 1px solid rgba(196, 162, 78, 0.12);
  position: relative;
}
.my-card-left::after {
  content: '';
  position: absolute; right: -7px; top: 30px;
  width: 14px; height: 14px; border-radius: 50%;
  background: linear-gradient(180deg, #F9F5EC, #F0E8D5);
  border: 1px solid rgba(196, 162, 78, 0.12);
  z-index: 1;
}
.my-card-left::before {
  content: '';
  position: absolute; right: -7px; bottom: 30px;
  width: 14px; height: 14px; border-radius: 50%;
  background: linear-gradient(180deg, #F9F5EC, #F0E8D5);
  border: 1px solid rgba(196, 162, 78, 0.12);
  z-index: 1;
}

.my-card-amount { display: flex; align-items: baseline; gap: 2px; }
.my-card-currency {
  font-family: var(--font-display); font-size: 18px; font-weight: 600;
  color: var(--rose);
}
.my-card-value {
  font-family: var(--font-display); font-size: 44px; font-weight: 600;
  color: var(--rose); line-height: 0.85; letter-spacing: -1px;
}
.is-used .my-card-currency, .is-expired .my-card-currency,
.is-used .my-card-value, .is-expired .my-card-value {
  color: var(--stone);
}
.my-card-condition {
  font-size: 11px; color: var(--stone); font-weight: 300;
}

.my-card-body {
  flex: 1; position: relative;
  padding: 22px 28px;
  display: flex; align-items: center;
}
.my-card-stripe {
  position: absolute; left: 0; top: 20px; bottom: 20px;
  width: 1px;
  background: repeating-linear-gradient(180deg, rgba(196,162,78,0.15) 0px, rgba(196,162,78,0.15) 3px, transparent 3px, transparent 6px);
}
.my-card-info {
  flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 20px;
}
.my-card-text { display: flex; flex-direction: column; gap: 6px; }
.my-card-name {
  font-size: 16px; font-weight: 500; color: var(--espresso);
  line-height: 1.3;
}
.my-card-desc {
  font-size: 13px; color: var(--stone); font-weight: 300;
}
.my-card-expire {
  font-family: var(--font-mono); font-size: 11px; color: var(--stone);
}

.my-card-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 14px;
  flex-shrink: 0;
}
.my-badge {
  font-size: 11px; font-weight: 500; padding: 4px 12px; border-radius: 100px;
}
.my-badge.active {
  color: #3A7D5A; background: rgba(58,125,90,0.08);
  border: 1px solid rgba(58,125,90,0.15);
}
.my-badge.used {
  color: var(--stone); background: rgba(160,152,136,0.06);
  border: 1px solid rgba(160,152,136,0.12);
}
.my-badge.expired {
  color: var(--rose); background: rgba(184,68,74,0.06);
  border: 1px solid rgba(184,68,74,0.12);
}

.my-use-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px; border-radius: 60px; border: none;
  background: linear-gradient(135deg, var(--espresso) 0%, var(--espresso-soft) 100%);
  color: var(--cream); font-family: var(--font-body); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.3s cubic-bezier(.22,1,.36,1);
  box-shadow: var(--shadow-btn);
}
.my-use-btn:hover {
  background: linear-gradient(135deg, var(--espresso-soft) 0%, var(--espresso) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(139, 105, 20, 0.3);
}
.my-use-btn:active { transform: scale(0.97); }

/* ══════════════════════════════════════════
   响应式
   ══════════════════════════════════════════ */
@media (max-width: 1200px) {
  .coupon-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 960px) {
  .section-block { padding: 0 24px; }
  .rh-inner { flex-direction: column; align-items: flex-start; padding: 48px 24px; gap: 32px; }
  .rh-form { width: 100%; }
  .rh-title { font-size: 34px; }
  .coupon-grid { grid-template-columns: 1fr 1fr; }
  .my-card { flex-direction: column; }
  .my-card-left { width: 100%; flex-direction: row; padding: 18px 20px; border-right: none; border-bottom: 1px solid rgba(196,162,78,0.1); }
  .my-card-left::after, .my-card-left::before { display: none; }
  .my-card-body { padding: 18px 20px; }
  .my-card-info { flex-direction: column; align-items: flex-start; }
  .my-card-right { flex-direction: row; align-items: center; width: 100%; }
}
@media (max-width: 640px) {
  .section-block { padding: 0 16px; }
  .rh-inner { padding: 36px 16px; }
  .rh-title { font-size: 28px; }
  .coupon-grid { grid-template-columns: 1fr; }
  .claim-value { font-size: 44px; }
  .section-head { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>
