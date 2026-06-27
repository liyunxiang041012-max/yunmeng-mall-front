<template>
  <div class="app-root">

    <!-- ══ SPLASH（只有登录后才显示）══ -->
    <Transition name="splash-exit">
      <div v-if="showSplash" class="splash">
        <div class="splash-center" :class="{ visible: splashPhase >= 1 }">
          <div class="splash-logo">
            <svg viewBox="0 0 80 80" width="64" height="64" fill="none">
              <rect width="80" height="80" rx="20" fill="#A07830"/>
              <path d="M20 52 Q40 24 60 52" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <circle cx="40" cy="36" r="6" fill="#FFF"/>
            </svg>
          </div>
          <div class="splash-title" :class="{ visible: splashPhase >= 2 }">
            <h1>云梦商城</h1>
            <p>YUNMENG MALL · 2026</p>
          </div>
          <div class="splash-progress" :class="{ visible: splashPhase >= 1 }">
            <div class="sp-track"><div class="sp-fill" :style="{ width: splashProgress + '%' }"></div></div>
            <span>{{ Math.round(splashProgress) }}%</span>
          </div>
        </div>
        <button class="sp-skip" :class="{ show: splashPhase >= 1 }" @click="skipSplash">跳过</button>
      </div>
    </Transition>

    <!-- ══ MAIN ══ -->
    <div class="yunmeng" :class="{ ready: !showSplash || !justLoggedIn }" ref="mainRef">

      <!-- ══ NAV ══ -->
      <header class="site-nav" ref="navRef">
        <div class="nav-inner">
          <div class="nav-brand" @click="$router.push('/home')">
            <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
              <rect width="40" height="40" rx="10" fill="#A07830"/>
              <path d="M10 26 Q20 12 30 26" stroke="#FFF" stroke-width="1.8" fill="none" stroke-linecap="round"/>
              <circle cx="20" cy="18" r="3" fill="#FFF"/>
            </svg>
            <div class="brand-text">
              <span class="brand-zh">云梦商城</span>
              <span class="brand-en">YUNMENG</span>
            </div>
          </div>

          <nav class="nav-links">
            <a href="#">新品上市</a>
            <a href="#">精选系列</a>
            <a href="#">限时秒杀</a>
            <a href="#">品牌专区</a>
          </nav>

          <div class="nav-actions">
            <div class="search-wrap" :class="{ focused: searchFocused }">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input v-model="searchKeyword" placeholder="搜索商品…"
                @focus="searchFocused=true" @blur="searchFocused=false"
                @keyup.enter="handleSearch" />
            </div>

            <!-- ── 已登录 ── -->
            <template v-if="isLogin">
              <button class="nav-icon-btn msg-btn" @click="$router.push('/message')" title="消息">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <em v-if="msgCount > 0" class="cart-dot msg-dot">{{ msgCount }}</em>
              </button>
              <button class="nav-icon-btn cart-btn" @click="cart()" title="购物车">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <em v-if="cartCount > 0" class="cart-dot">{{ cartCount }}</em>
              </button>
    
              <button class="nav-my-btn" @click="my()">我的</button>
              <button class="nav-logout-btn" @click="logout()" title="退出登录">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </template>

            <!-- ── 未登录：只有一个按钮 ── -->
            <template v-if="!isLogin">
              <button class="nav-my-btn" @click="$router.push('/login')">登录 / 注册</button>
            </template>
          </div>
        </div>

        <div class="hot-strip">
          <span class="hot-label">热搜</span>
          <span v-for="tag in hotTags" :key="tag" class="hot-tag">{{ tag }}</span>
        </div>
      </header>

      <main class="site-main">

        <!-- ══ HERO ══ -->
        <section class="hero" ref="heroRef">
          <div class="hero-inner">
            <transition name="hero-fade" mode="out-in">
              <div :key="currentBanner" class="hero-slide">
                <img :src="banners[currentBanner].image" :alt="banners[currentBanner].title" class="hero-img" @error="handleImageError" />
                <div class="hero-overlay"></div>
                <div class="hero-copy">
                  <span class="hero-tag">{{ banners[currentBanner].tag }}</span>
                  <h1 class="hero-title" v-html="banners[currentBanner].title.replace('\n','<br/>')"></h1>
                  <p class="hero-sub">{{ banners[currentBanner].sub }}</p>
                  <button class="hero-cta">立即探索</button>
                </div>
              </div>
            </transition>
            <div class="hero-dots">
              <button v-for="(b,i) in banners" :key="i" :class="['hdot', { active: currentBanner===i }]" @click="currentBanner=i"></button>
            </div>
          </div>
          <div class="hero-side">
            <div v-for="card in sideCards" :key="card.id" class="side-card" :style="{'--c': card.color}">
              <span class="side-icon">{{ card.icon }}</span>
              <div>
                <strong>{{ card.name }}</strong>
                <span>{{ card.desc }}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </section>

        <!-- ══ 服务承诺 ══ -->
        <section class="service-bar" ref="serviceBarRef">
          <div v-for="s in services" :key="s.id" class="service-item gsap-service-item">
            <span class="service-icon">{{ s.icon }}</span>
            <div>
              <strong>{{ s.name }}</strong>
              <span>{{ s.desc }}</span>
            </div>
          </div>
        </section>




        <!-- ══ 优惠券 ══ -->
        <section class="section-block">
          <div class="section-head">
            <div>
              <p class="eyebrow">COUPONS</p>
              <h2 class="section-title">专属优惠券</h2>
            </div>
            <button class="ghost-btn" @click="$router.push('/coupon')">查看全部 →</button>
          </div>
          <div class="coupon-list" ref="couponListRef">
            <div v-for="cp in coupons" :key="cp.id" class="coupon-card gsap-coupon-card" :class="{ claimed: cp.claimed }">
              <div class="cp-left" :style="{'--cc': cp.color}">
                <div class="cp-amount">
                  <span class="cp-unit" v-if="cp.discountType !== 2">¥</span>
                  <span class="cp-num">{{ cp.amount }}</span>
                </div>
                <p class="cp-min">{{ cp.minOrder > 0 ? '满'+cp.minOrder+'元' : '无门槛' }}</p>
              </div>
              <div class="cp-divider"></div>
              <div class="cp-right">
                <p class="cp-name">{{ cp.name }}</p>
                <p class="cp-expire">{{ cp.expire }}</p>
                <button class="cp-btn" :class="{ claimed: cp.claimed }" @click="claimCoupon(cp)">
                  {{ cp.claimed ? '已领取 ✓' : '立即领取' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ══ 限时秒杀 ══ -->
        <section class="section-block flash-section">
          <div class="section-head">
            <div>
              <p class="eyebrow">FLASH SALE</p>
              <h2 class="section-title">限量臻品</h2>
            </div>
            <div class="timer">
              <div class="t-unit"><span class="tnum">{{ hours }}</span><span class="tlabel">时</span></div>
              <span class="tsep">:</span>
              <div class="t-unit"><span class="tnum">{{ minutes }}</span><span class="tlabel">分</span></div>
              <span class="tsep">:</span>
              <div class="t-unit"><span class="tnum">{{ seconds }}</span><span class="tlabel">秒</span></div>
            </div>
            <button class="ghost-btn" @click="$router.push('/seckill')">查看全部 →</button>
          </div>
          <div class="flash-grid" ref="flashGridRef">
            <div v-for="item in seckillGoods" :key="item.id" class="flash-card gsap-flash-card">
              <div class="flash-img-wrap">
                <img :src="item.image" :alt="item.name" @error="handleImageError" />
                <span class="flash-badge">-{{ Math.round((1 - item.currentPrice / item.originalPrice)*100) }}%</span>
              </div>
              <div class="flash-body">
                <p class="flash-name">{{ item.name }}</p>
                <div class="flash-prices">
                  <span class="flash-cur">¥{{ item.currentPrice }}</span>
                  <span class="flash-orig">¥{{ item.originalPrice }}</span>
                </div>
                <div class="flash-bar-wrap">
                  <div class="flash-bar" :style="{ width: item.progress+'%' }"></div>
                </div>
                <span class="flash-pct">{{ item.progress }}% 已抢</span>
              </div>
            </div>
          </div>
        </section>

        <!-- ══ 品牌工坊 ══ -->
        <section class="section-block">
          <div class="section-head">
            <div>
              <p class="eyebrow">FEATURED</p>
              <h2 class="section-title">品牌工坊空间</h2>
            </div>
          </div>
          <div class="boutique-grid">
            <div class="boutique-main gsap-boutique-main" ref="boutiqueMainRef">
              <img src="https://picsum.photos/900/600?random=50" alt="boutique" />
              <div class="boutique-mask">
                <span class="bt-tag">✦ 2026春季大赏</span>
                <h3>春日限定<br>美学精选</h3>
                <button>探索系列 →</button>
              </div>
            </div>
            <div class="boutique-subs">
              <div class="boutique-sub gsap-boutique-sub" v-for="f in featureSubs" :key="f.id">
                <img :src="f.image" alt="" @error="handleImageError" />
                <div class="bs-mask">
                  <span>{{ f.tag }}</span>
                  <h4>{{ f.title }}</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ══ 猜你喜欢 ══ -->
        <section class="section-block">
          <div class="section-head">
            <div>
              <p class="eyebrow">FOR YOU</p>
              <h2 class="section-title">为您推荐</h2>
            </div>
            <button class="ghost-btn" @click="refreshRecommend">↺ 换一批</button>
          </div>
          <div class="rec-grid" ref="recGridRef">
            <div v-for="item in recommendGoods" :key="item.id" class="rec-card gsap-rec-card">
              <div class="rec-img-wrap">
                <img :src="item.image" :alt="item.name" @error="handleImageError" />
                <button class="rec-wish">♡</button>
                <div class="rec-hover">
                  <button class="rec-add">加入购物车</button>
                </div>
              </div>
              <div class="rec-info">
                <p class="rec-name">{{ item.name }}</p>
                <div class="rec-foot">
                  <span class="rec-price">¥{{ item.price }}</span>
                  <span class="rec-sold">{{ item.sales }}人已购</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <!-- AI 悬浮球 -->
      <div class="ai-orb" @click="$router.push('/ai')">
        <div class="orb-ring r1"></div>
        <div class="orb-ring r2"></div>
        <div class="orb-core">✦</div>
        <span class="orb-label">AI助手</span>
      </div>

      <footer class="site-footer" ref="footerRef">
        <div class="footer-inner">
          <div class="footer-brand">
            <div class="footer-logo">云梦商城</div>
            <p>致力于为品味不凡的人士打造纯粹、高品质的全球消费体验</p>
          </div>
          <div class="footer-cols">
            <div class="footer-col"><h5>发现</h5><a href="#">品牌资讯</a><a href="#">礼品指南</a><a href="#">精品店址</a></div>
            <div class="footer-col"><h5>账户</h5><a href="#">个人中心</a><a href="#">我的订单</a><a href="#">云梦会员卡</a></div>
            <div class="footer-col"><h5>服务</h5><a href="#">私人管家</a><a href="#">售后养护</a><a href="#">高端定制</a></div>
            <div class="footer-col"><h5>关注</h5><a href="#">微信公众号</a><a href="#">小红书</a><a href="#">官方微博</a></div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 YUNMENG MALL. ALL RIGHTS RESERVED.</span>
          <div><a href="#">隐私政策</a><a href="#">服务条款</a></div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import router from '@/router'
import { userLogout } from '@/api/user'
import { getAvailableCoupons, claimCoupon as claimCouponApi } from '@/api/coupon'
import nofoundImage from '@/assets/images/nofound.png'
import lunbo1 from '@/assets/board/lunbo1.png'
import lunbo2 from '@/assets/board/lunbo2.png'
import lunbo3 from '@/assets/board/lunbo3.png'

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.src = nofoundImage
}
// ══ Splash 控制 ══
const justLoggedIn   = localStorage.getItem('justLoggedIn') === 'true'
const showSplash     = ref(justLoggedIn)
const splashPhase    = ref(0)
const splashProgress = ref(0)
let splashTimer = null

const runSplash = () => {
  splashPhase.value = 1
  const duration = 2200
  const start = Date.now()
  const timer = setInterval(() => {
    const elapsed = Date.now() - start
    splashProgress.value = Math.min(100, (elapsed / duration) * 100)
    if (elapsed >= duration) {
      clearInterval(timer)
      showSplash.value = false
      localStorage.removeItem('justLoggedIn')
    }
  }, 30)
}
const skipSplash = () => {
  splashProgress.value = 100
  showSplash.value = false
  localStorage.removeItem('justLoggedIn')
}

// ══ 登录状态 ══
const isLogin  = ref(localStorage.getItem('isLogin') === 'true')
const userName = ref(localStorage.getItem('userName') || '')
const msgCount = ref(3)

const mainRef = ref(null)

// 头像显示字符：昵称取第一个字，手机号取后4位，都没有显示"我"
const avatarChar = computed(() => {
  const n = userName.value
  if (!n) return '我'
  if (/^\d+$/.test(n)) return n.slice(-4)
  return n[0]
})

// 退出登录
const logout = async () => {
  localStorage.removeItem('isLogin')
  localStorage.removeItem('userName')
  localStorage.removeItem('justLoggedIn')
  await userLogout() // 调用后端接口
  isLogin.value = false
  router.push('/login')
  ElementPlus.Message({
    message: '已退出登录',
    type: 'success',
    duration: 1000
  })
}

// ── 路由跳转 ──
const my   = () => router.push('/my')
const cart = () => router.push('/cart')

// ── 其他状态 ──
const searchKeyword = ref('')
const searchFocused = ref(false)
const cartCount     = ref(5)
const currentBanner = ref(0)
const hours         = ref('02')
const minutes       = ref('45')
const seconds       = ref('12')

const hotTags = ref(['春季新款', 'AI选品', '耳机推荐', '平价好物', '居家神器', '限定礼盒'])

const banners = ref([
  { id:1, tag:'2026 春季系列', title:'探索全球\n好物世界', sub:'甄选全球顶级生活方式精品，专为品味不凡的你', image:lunbo1 },
  { id:2, tag:'智能家居专场', title:'未来感\n生活方式', sub:'AI 帮你打造理想中的家', image:lunbo2 },
  { id:3, tag:'数码新品首发', title:'科技与\n美感并行', sub:'2026 最值得入手的数码好物', image:lunbo3 },
])

const sideCards = ref([
  { id:1, icon:'🔥', name:'今日必抢', desc:'限时特惠 10 件', color:'#C9A84C' },
  { id:2, icon:'✈️', name:'全球直邮', desc:'1000+ 海外品牌', color:'#A07830' },
  { id:3, icon:'🌱', name:'绿色优选', desc:'可持续好物',     color:'#7A9E7E' },
])

const services = ref([
  { id:1, icon:'◎', name:'正品溯源', desc:'每件商品数字化认证' },
  { id:2, icon:'◈', name:'尊享配送', desc:'全程管家式物流' },
  { id:3, icon:'♛', name:'顶级品质', desc:'商品5a级体验' },
  { id:4, icon:'ai', name:'智能助手', desc:'24小时在线服务' },
])



const goldColors = ['#A07830', '#C9A84C', '#8A6820', '#B89040']

// ── 优惠券（初始硬编码兜底，onMounted 后从接口拉取真实数据替换）──
const coupons = ref([
  { id:'fallback1', amount:50,  minOrder:299, name:'全品类通用券', expire:'有效期至 2026-03-31', color:'#A07830', claimed:false, discountType:1 },
  { id:'fallback2', amount:30,  minOrder:199, name:'数码专区专用', expire:'有效期至 2026-03-25', color:'#C9A84C', claimed:false, discountType:1 },
  { id:'fallback3', amount:20,  minOrder:99,  name:'美妆个护专区', expire:'有效期至 2026-04-01', color:'#8A6820', claimed:false, discountType:1 },
  { id:'fallback4', amount:100, minOrder:599, name:'家电大额专享', expire:'有效期至 2026-03-20', color:'#B89040', claimed:false, discountType:1 },
])

const formatCouponAmount = (discountValue, discountType) => {
  if (!discountValue && discountValue !== 0) return '--'
  const n = Number(discountValue)
  // 折扣券：discountValue=85 → 8.5折
  if (discountType === 2 || discountType === 'RATE_DISCOUNT') {
    return `${(n / 10).toFixed(1).replace('.0', '')}折`
  }
  // 满减类：分 → 元
  return (n / 100).toFixed(n % 100 === 0 ? 0 : 2)
}

const formatMinOrder = (thresholdAmount) => {
  if (!thresholdAmount && thresholdAmount !== 0) return 0
  return Math.round(Number(thresholdAmount) / 100)
}

const formatExpire = (termEndTime, termDays) => {
  if (termDays) return `${termDays}天内有效`
  if (!termEndTime) return ''
  const s = String(termEndTime)
  if (s.includes('T')) return s.split('T')[0]
  if (s.includes(' ')) return s.split(' ')[0]
  return s
}

const fetchCoupons = async () => {
  try {
    const res = await getAvailableCoupons()
    const list = Array.isArray(res) ? res : (res?.records ?? res?.list ?? res?.data ?? [])
    if (!list.length) return
    const now = Date.now()

    const mapped = list
      .filter(c => c.available !== false && !c.received)
      .filter(c => {
        const begin = c.issueBeginTime ? new Date(String(c.issueBeginTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
        return !begin || now >= begin
      })
      .filter(c => {
        if (c.totalNum && (c.receivedCount || 0) >= c.totalNum) return false
        return true
      })
      .filter(c => {
        const end = c.issueEndTime ? new Date(String(c.issueEndTime).replace(/-/g, '/').replace('T', ' ')).getTime() : Infinity
        return now <= end
      })
      .filter(c => {
        const end = c.termEndTime ? new Date(String(c.termEndTime).replace(/-/g, '/').replace('T', ' ')).getTime() : Infinity
        return now <= end
      })
      .sort((a, b) => {
        const timeA = a.termEndTime ? new Date(String(a.termEndTime).replace(/-/g, '/').replace('T', ' ')).getTime() : Infinity
        const timeB = b.termEndTime ? new Date(String(b.termEndTime).replace(/-/g, '/').replace('T', ' ')).getTime() : Infinity
        return timeA - timeB
      })
      .slice(0, 4)
      .map((c, i) => ({
        id: c.id,
        name: c.name,
        discountType: c.discountType,
        amount: formatCouponAmount(c.discountValue, c.discountType),
        minOrder: formatMinOrder(c.thresholdAmount),
        expire: formatExpire(c.termEndTime, c.termDays),
        color: goldColors[i % 4],
        claimed: false,
      }))

    if (mapped.length > 0) coupons.value = mapped
  } catch (e) {
    console.error('[首页优惠券] 加载失败:', e)
  }
}

const claimCoupon = async (cp) => {
  if (cp.claimed) return
  if (!isLogin.value) {
    ElementPlus.Message({ message: '请先登录后再领取优惠券', type: 'warning', duration: 1500 })
    router.push('/login')
    return
  }
  try {
    await claimCouponApi(cp.id)
    cp.claimed = true
    ElementPlus.Message({ message: '领取成功！', type: 'success', duration: 1500 })
  } catch (err) {
    ElementPlus.Message({ message: err.message || '领取失败，请重试', type: 'error', duration: 2000 })
  }
}

const seckillGoods = ref([
  { id:1, name:'极简无线降噪耳机', currentPrice:89,  originalPrice:199, progress:80, image:'https://picsum.photos/300/300?random=1' },
  { id:2, name:'轻量碳纤维背包',   currentPrice:129, originalPrice:299, progress:45, image:'https://picsum.photos/300/300?random=2' },
  { id:3, name:'香氛扩香石套装',   currentPrice:59,  originalPrice:159, progress:92, image:'https://picsum.photos/300/300?random=3' },
  { id:4, name:'智能温控水杯',     currentPrice:199, originalPrice:499, progress:30, image:'https://picsum.photos/300/300?random=4' },
  { id:5, name:'丝滑真丝睡衣',     currentPrice:77,  originalPrice:140, progress:66, image:'https://picsum.photos/300/300?random=5' },
  { id:6, name:'手冲咖啡套装',     currentPrice:228, originalPrice:399, progress:55, image:'https://picsum.photos/300/300?random=6' },
])

const featureSubs = ref([
  { id:1, tag:'数码专区', title:'智能穿戴新品首发', image:'https://picsum.photos/600/280?random=30' },
  { id:2, tag:'家居生活', title:'北欧风格全屋美学', image:'https://picsum.photos/600/280?random=31' },
  { id:3, tag:'美妆护肤', title:'焕颜精华季节限定', image:'https://picsum.photos/600/280?random=32' },
])

const recommendGoods = ref([
  { id:1, name:'极简风阔腿裤春秋新款',     price:128,  sales:'1.2k', image:'https://picsum.photos/400/500?random=20' },
  { id:2, name:'AI智能降噪蓝牙耳机旗舰版', price:599,  sales:'800+', image:'https://picsum.photos/400/400?random=21' },
  { id:3, name:'手工研磨挂耳咖啡礼盒20入', price:89,   sales:'3k+',  image:'https://picsum.photos/400/440?random=22' },
  { id:4, name:'复古黑胶唱片机家用音响',   price:1299, sales:'150',  image:'https://picsum.photos/400/400?random=23' },
  { id:5, name:'纯棉透气重磅T恤多色可选',  price:69,   sales:'5k+',  image:'https://picsum.photos/400/460?random=24' },
  { id:6, name:'多功能空气炸锅无油烹饪',   price:349,  sales:'2.1k', image:'https://picsum.photos/400/400?random=25' },
  { id:7, name:'北欧风实木床头柜简约现代', price:219,  sales:'400',  image:'https://picsum.photos/400/420?random=26' },
  { id:8, name:'轻便碳纤维折叠雨伞',       price:45,   sales:'1k+',  image:'https://picsum.photos/400/400?random=27' },
])

const handleSearch     = () => { router.push('/search') }
const refreshRecommend = () => { recommendGoods.value = [...recommendGoods.value].sort(() => Math.random() - 0.5) }

let countdown = null, bannerTimer = null
const startCountdown = () => {
  let total = 2 * 3600 + 45 * 60 + 12
  countdown = setInterval(() => {
    if (total <= 0) { clearInterval(countdown); return }
    total--
    hours.value   = String(Math.floor(total / 3600)).padStart(2, '0')
    minutes.value = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
    seconds.value = String(total % 60).padStart(2, '0')
  }, 1000)
}

onMounted(() => {
  if (justLoggedIn) runSplash()
  startCountdown()
  bannerTimer = setInterval(() => {
    currentBanner.value = (currentBanner.value + 1) % banners.value.length
  }, 5000)
  window.addEventListener('storage', (e) => {
    if (e.key === 'isLogin') isLogin.value = e.newValue === 'true'
    if (e.key === 'userName') userName.value = e.newValue || ''
  })

  fetchCoupons()


})
onUnmounted(() => {
  clearInterval(countdown)
  clearInterval(bannerTimer)
  clearInterval(splashTimer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@200;300;400;500&display=swap');

/* ══ 白金变量 ══ */
.app-root {
  --bg:       #F5F2EC;
  --bg-soft:  #FAFAF8;
  --bg-warm:  #EDE8DC;
  --bg-card:  #FFF;
  --border:   #E0D8C8;
  --border-hi:#C9A84C;
  --text:     #1A1A18;
  --text2:    #4A4438;
  --text3:    #8A8070;
  --accent:   #C9A84C;
  --accent2:  #A07830;
  --gold-hi:  #A07830;
  --gold-lo:  #EDE8DC;
  --warm:     #C0392B;
  --radius:   16px;
  --shadow:   0 4px 20px rgba(0,0,0,0.08);
  --glow:     0 0 20px rgba(201,168,76,0.15);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.app-root { font-family: 'Noto Sans SC', 'PingFang SC', sans-serif; -webkit-font-smoothing: antialiased; }

/* ══ SPLASH ══ */
.splash { position: fixed; inset: 0; z-index: 9999; background: linear-gradient(160deg, #FFF 0%, #FAF6EE 40%, #F5F0E6 100%); display: flex; align-items: center; justify-content: center; }
.splash-center { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 32px; opacity: 0; transform: translateY(16px); transition: opacity 0.6s ease, transform 0.6s ease; }
.splash-center.visible { opacity: 1; transform: translateY(0); }
.splash-title { text-align: center; opacity: 0; transition: opacity 0.5s 0.3s; }
.splash-title.visible { opacity: 1; }
.splash-title h1 { font-size: 32px; font-weight: 300; letter-spacing: 10px; color: #1A1A18; margin-bottom: 8px; }
.splash-title p { font-size: 11px; letter-spacing: 5px; color: #8A8070; font-weight: 300; }
.splash-progress { display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0; transition: opacity 0.5s 0.2s; width: 260px; }
.splash-progress.visible { opacity: 1; }
.sp-track { width: 100%; height: 2px; background: #E0D8C8; border-radius: 2px; }
.sp-fill  { height: 100%; background: linear-gradient(90deg, #A07830, #C9A84C); transition: width 0.1s linear; border-radius: 2px; }
.splash-progress span { font-size: 11px; color: #8A8070; letter-spacing: 2px; }
.sp-skip { position: absolute; bottom: 32px; right: 32px; background: none; border: 1px solid #E0D8C8; color: #8A8070; font-family: inherit; font-size: 12px; letter-spacing: 2px; padding: 8px 18px; border-radius: 100px; cursor: pointer; opacity: 0; transition: all 0.3s; }
.sp-skip.show { animation: fadeIn 0.5s 0.8s forwards; }
.sp-skip:hover { border-color: #C9A84C; color: #A07830; }
@keyframes fadeIn { to { opacity: 1; } }
.splash-exit-leave-active { animation: splashOut 0.7s ease forwards; }
@keyframes splashOut { 0%{opacity:1} 100%{opacity:0;transform:scale(1.04)} }

/* ══ MAIN ══ */
.yunmeng { background: var(--bg); color: var(--text); min-height: 100vh; overflow-x: hidden; opacity: 0; transition: opacity 0.5s ease; }
.yunmeng.ready { opacity: 1; }

/* ══ NAV ══ */
.site-nav { position: sticky; top: 0; z-index: 999; background: rgba(250,250,248,0.97); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.nav-inner { max-width: 1400px; margin: 0 auto; padding: 0 40px; height: 64px; display: flex; align-items: center; gap: 40px; }
.nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; flex-shrink: 0; }
.brand-text { display: flex; flex-direction: column; line-height: 1.1; }
.brand-zh { font-size: 15px; font-weight: 500; letter-spacing: 2px; color: #1A1A18; }
.brand-en { font-size: 9px; font-weight: 300; letter-spacing: 4px; color: #8A8070; }
.nav-links { display: flex; gap: 32px; }
.nav-links a { font-size: 13px; font-weight: 400; color: #4A4438; text-decoration: none; letter-spacing: 0.5px; transition: color 0.2s; }
.nav-links a:hover { color: #A07830; }
.nav-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.search-wrap { display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; background: #F5F2EC; border: 1px solid #E0D8C8; border-radius: 100px; transition: 0.2s; }
.search-wrap.focused { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); background: #FFF; }
.search-wrap input { background: none; border: none; outline: none; font-family: inherit; font-size: 13px; color: #1A1A18; width: 160px; }
.search-wrap input::placeholder { color: #B0A898; }
.search-wrap svg { color: #8A8070; flex-shrink: 0; }
.nav-icon-btn { width: 36px; height: 36px; border-radius: 50%; background: #F5F2EC; border: 1px solid #E0D8C8; display: flex; align-items: center; justify-content: center; color: #4A4438; cursor: pointer; transition: 0.2s; position: relative; }
.nav-icon-btn:hover { border-color: #C9A84C; color: #A07830; }
.cart-dot { position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; border-radius: 50%; background: linear-gradient(135deg, #A07830, #C9A84C); color: #FFF; font-size: 9px; font-weight: 600; display: flex; align-items: center; justify-content: center; border: 2px solid #FAFAF8; font-style: normal; }
.msg-dot { background: #C0392B !important; }
.nav-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #A07830, #C9A84C); display: flex; align-items: center; justify-content: center; color: #FFF; font-size: 14px; font-weight: 500; cursor: pointer; transition: 0.2s; flex-shrink: 0; border: 2px solid rgba(201,168,76,0.3); }
.nav-avatar:hover { transform: scale(1.08); box-shadow: 0 2px 10px rgba(160,120,48,0.3); }
.nav-my-btn { height: 36px; padding: 0 18px; border-radius: 100px; background: linear-gradient(135deg, #A07830, #C9A84C); border: none; color: #FFF; font-family: inherit; font-size: 13px; font-weight: 500; letter-spacing: 0.5px; cursor: pointer; transition: 0.3s; box-shadow: 0 2px 10px rgba(160,120,48,0.25); }
.nav-my-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(160,120,48,0.35); }
.nav-logout-btn { width: 36px; height: 36px; border-radius: 50%; background: #F5F2EC; border: 1px solid #E0D8C8; display: flex; align-items: center; justify-content: center; color: #8A8070; cursor: pointer; transition: 0.2s; }
.nav-logout-btn:hover { border-color: #C0392B; color: #C0392B; background: rgba(192,57,43,0.05); }

.hot-strip { max-width: 1400px; margin: 0 auto; padding: 6px 40px 8px; display: flex; align-items: center; gap: 10px; border-top: 1px solid #F0EAE0; overflow-x: auto; }
.hot-strip::-webkit-scrollbar { display: none; }
.hot-label { font-size: 10px; color: #A07830; font-weight: 500; letter-spacing: 1px; flex-shrink: 0; }
.hot-tag { font-size: 12px; color: #8A8070; padding: 3px 12px; border: 1px solid #E0D8C8; border-radius: 100px; cursor: pointer; transition: 0.2s; white-space: nowrap; flex-shrink: 0; background: #FAFAF8; }
.hot-tag:hover { color: #A07830; border-color: #C9A84C; background: rgba(201,168,76,0.06); }

/* ══ MAIN 容器 ══ */
.site-main { max-width: 1400px; margin: 0 auto; padding: 32px 40px 80px; }

/* ══ HERO ══ */
.hero { display: grid; grid-template-columns: 1fr 240px; gap: 16px; margin-bottom: 32px; }
.hero-inner { position: relative; height: 480px; border-radius: 20px; overflow: hidden; border: 1px solid #E0D8C8; box-shadow: var(--shadow); }
.hero-slide { position: absolute; inset: 0; }
.hero-img { width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { display: none; }
.hero-copy { position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: center; padding: 52px 56px; height: 100%; }
.hero-tag { font-size: 10px; letter-spacing: 4px; color: #A07830; font-weight: 500; margin-bottom: 16px; text-transform: uppercase; display: flex; align-items: center; gap: 10px; }
.hero-tag::before { content: ''; width: 24px; height: 1px; background: linear-gradient(90deg, transparent, #C9A84C); }
.hero-title { font-size: 52px; font-weight: 200; line-height: 1.15; color: #1A1A18; margin-bottom: 14px; letter-spacing: -0.5px; }
.hero-sub   { font-size: 14px; color: #4A4438; margin-bottom: 32px; font-weight: 300; line-height: 1.7; }
.hero-cta { align-self: flex-start; padding: 13px 30px; background: linear-gradient(135deg, #A07830, #C9A84C); border: none; border-radius: 100px; color: #FFF; font-family: inherit; font-size: 13px; font-weight: 500; letter-spacing: 0.5px; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 16px rgba(160,120,48,0.3); }
.hero-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(160,120,48,0.45); }
.hero-dots { position: absolute; bottom: 20px; left: 52px; display: flex; gap: 6px; z-index: 10; }
.hdot { width: 22px; height: 2px; border-radius: 10px; background: rgba(160,120,48,0.25); border: none; cursor: pointer; transition: 0.3s; }
.hdot.active { background: linear-gradient(90deg, #A07830, #C9A84C); width: 40px; }
.hero-side { display: flex; flex-direction: column; gap: 12px; }
.side-card { flex: 1; background: #FFF; border: 1px solid #E0D8C8; border-left: 3px solid var(--c, #C9A84C); border-radius: var(--radius); padding: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.25s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.side-card:hover { transform: translateX(3px); border-color: #C9A84C; box-shadow: 0 4px 16px rgba(201,168,76,0.12); }
.side-icon { font-size: 22px; flex-shrink: 0; }
.side-card > div { flex: 1; }
.side-card strong { display: block; font-size: 13px; color: #1A1A18; margin-bottom: 2px; font-weight: 500; }
.side-card span   { font-size: 11px; color: #8A8070; }
.side-card svg    { color: #C9A84C; flex-shrink: 0; }

/* ══ 服务条 ══ */
.service-bar { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: #E0D8C8; border: 1px solid #E0D8C8; border-radius: var(--radius); overflow: hidden; margin-bottom: 32px; }
.service-item { display: flex; align-items: center; gap: 14px; padding: 22px 24px; background: #FFF; transition: 0.2s; }
.service-item:hover { background: #FAFAF8; }
.service-icon { font-size: 22px; color: #C9A84C; flex-shrink: 0; }
.service-item strong { display: block; font-size: 13px; font-weight: 500; color: #1A1A18; margin-bottom: 3px; }
.service-item span   { font-size: 11px; color: #8A8070; font-weight: 300; }

/* ══ 功能导航 ══ */
.fn-zone { display: grid; grid-template-columns: repeat(8,1fr); gap: 4px; background: #FFF; border: 1px solid #E0D8C8; border-radius: 20px; padding: 20px 16px; margin-bottom: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
.fn-tile { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 6px; border-radius: 12px; cursor: pointer; transition: 0.25s; }
.fn-tile:hover { background: rgba(201,168,76,0.08); }
.fn-tile:hover .fn-icon { transform: scale(1.12) translateY(-2px); }
.fn-icon { font-size: 26px; transition: 0.25s; }
.fn-tile span { font-size: 12px; color: #4A4438; font-weight: 400; }

/* ══ 会员横幅 ══ */
.member-banner { display: grid; grid-template-columns: 1fr 320px; background: linear-gradient(120deg, #FFF8F0 0%, #FFF5E6 40%, #FFF8F0 100%); border: 1px solid rgba(201,168,76,0.3); border-radius: 20px; overflow: hidden; margin-bottom: 40px; box-shadow: 0 4px 20px rgba(201,168,76,0.1); }
.mb-left { padding: 48px 52px; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
.mb-tag { font-size: 10px; letter-spacing: 3px; color: #A07830; text-transform: uppercase; font-weight: 500; }
.mb-left h2 { font-size: 26px; font-weight: 300; color: #1A1A18; line-height: 1.4; letter-spacing: -0.3px; }
.mb-btn { align-self: flex-start; padding: 11px 26px; background: linear-gradient(135deg, #A07830, #C9A84C); border: none; border-radius: 100px; color: #FFF; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: 0.3s; box-shadow: 0 3px 12px rgba(160,120,48,0.3); }
.mb-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(160,120,48,0.4); }
.mb-right { overflow: hidden; }
.mb-right img { width: 100%; height: 100%; object-fit: cover; }

/* ══ 通用区块 ══ */
.section-block { margin-bottom: 56px; }
.section-head  { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 24px; }
.section-head > div:first-child { flex: 1; }
.eyebrow { font-size: 9px; letter-spacing: 4px; color: #A07830; text-transform: uppercase; font-weight: 500; margin-bottom: 6px; }
.section-title { font-size: 24px; font-weight: 300; color: #1A1A18; letter-spacing: -0.3px; }
.ghost-btn { background: #FFF; border: 1px solid #E0D8C8; color: #4A4438; font-family: inherit; font-size: 12px; padding: 7px 16px; border-radius: 100px; cursor: pointer; transition: 0.2s; white-space: nowrap; flex-shrink: 0; }
.ghost-btn:hover { border-color: #C9A84C; color: #A07830; background: rgba(201,168,76,0.06); }

/* ══ 优惠券 ══ */
.coupon-list { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.coupon-card { display: flex; background: #FFF; border: 1px solid #E0D8C8; border-radius: 14px; overflow: hidden; transition: 0.25s; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.coupon-card:hover { border-color: #C9A84C; transform: translateY(-4px); box-shadow: 0 8px 24px rgba(201,168,76,0.15); }
.coupon-card.claimed { opacity: 0.45; pointer-events: none; }
.cp-left { width: 90px; flex-shrink: 0; background: linear-gradient(160deg, var(--cc, #A07830), color-mix(in srgb, var(--cc, #A07830) 70%, #FFF)); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 14px 6px; }
.cp-divider { width: 1px; flex-shrink: 0; border-left: 1px dashed #E0D8C8; position: relative; }
.cp-divider::before, .cp-divider::after { content: ''; position: absolute; left: -6px; width: 11px; height: 11px; border-radius: 50%; background: #F5F2EC; }
.cp-divider::before { top: -6px; } .cp-divider::after { bottom: -6px; }
.cp-amount { display: flex; align-items: baseline; gap: 1px; }
.cp-unit { font-size: 12px; color: #FFF; font-weight: 500; }
.cp-num  { font-size: 30px; font-weight: 700; color: #FFF; line-height: 1; }
.cp-min  { font-size: 9px; color: rgba(255,255,255,0.7); white-space: nowrap; }
.cp-right { flex: 1; padding: 14px 14px 14px 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 5px; }
.cp-name   { font-size: 13px; font-weight: 500; color: #1A1A18; }
.cp-expire { font-size: 10px; color: #8A8070; }
.cp-btn { align-self: flex-start; padding: 5px 12px; border-radius: 100px; background: linear-gradient(135deg, #A07830, #C9A84C); border: none; color: #FFF; font-family: inherit; font-size: 11px; font-weight: 500; cursor: pointer; transition: 0.2s; }
.cp-btn:hover { transform: scale(1.04); }
.cp-btn.claimed { background: #F5F2EC; color: #8A8070; cursor: default; transform: none; }

/* ══ 秒杀 ══ */
.flash-section { background: #FFF; border: 1px solid #E0D8C8; border-radius: 20px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
.timer { display: flex; align-items: center; gap: 5px; }
.t-unit { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.tnum  { font-size: 18px; font-weight: 600; color: #A07830; font-family: 'Space Mono', monospace; background: rgba(201,168,76,0.08); padding: 4px 9px; border-radius: 6px; min-width: 40px; text-align: center; line-height: 1; border: 1px solid rgba(201,168,76,0.2); }
.tlabel { font-size: 9px; color: #8A8070; }
.tsep   { font-size: 16px; color: #C9A84C; font-weight: 500; margin-bottom: 10px; }
.flash-grid { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 4px; margin-top: 20px; }
.flash-grid::-webkit-scrollbar { height: 3px; }
.flash-grid::-webkit-scrollbar-thumb { background: #C9A84C; border-radius: 10px; }
.flash-card { width: 178px; flex-shrink: 0; background: #FFF; border: 1px solid #E0D8C8; border-radius: var(--radius); overflow: hidden; transition: 0.25s; cursor: pointer; }
.flash-card:hover { border-color: #C9A84C; transform: translateY(-5px); box-shadow: 0 8px 24px rgba(201,168,76,0.15); }
.flash-img-wrap { position: relative; height: 160px; overflow: hidden; }
.flash-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
.flash-card:hover .flash-img-wrap img { transform: scale(1.05); }
.flash-badge { position: absolute; top: 9px; right: 9px; background: linear-gradient(135deg, #A07830, #C9A84C); color: #FFF; font-size: 10px; font-weight: 600; padding: 3px 7px; border-radius: 5px; }
.flash-body { padding: 11px; }
.flash-name { font-size: 12px; color: #4A4438; margin-bottom: 7px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.flash-prices { display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; }
.flash-cur  { font-size: 16px; font-weight: 600; color: #A07830; }
.flash-orig { font-size: 11px; color: #B0A898; text-decoration: line-through; }
.flash-bar-wrap { height: 4px; background: #EDE8DC; border-radius: 10px; overflow: hidden; }
.flash-bar { height: 100%; background: linear-gradient(90deg, #A07830, #C9A84C); border-radius: 10px; transition: width 1s; }
.flash-pct { display: block; font-size: 9px; color: #8A8070; margin-top: 5px; }

/* ══ 品牌工坊 ══ */
.boutique-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px; }
.boutique-main { position: relative; height: 440px; border-radius: 20px; overflow: hidden; cursor: pointer; border: 1px solid #E0D8C8; }
.boutique-main img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.85); transition: 0.6s; }
.boutique-main:hover img { transform: scale(1.03); filter: brightness(0.9); }
.boutique-mask { position: absolute; inset: 0; background: linear-gradient(to top, rgba(245,242,236,0.9) 0%, rgba(245,242,236,0.3) 55%, transparent 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 28px 30px; }
.bt-tag { font-size: 9px; letter-spacing: 3px; color: #A07830; text-transform: uppercase; margin-bottom: 10px; font-weight: 500; }
.boutique-mask h3 { font-size: 26px; font-weight: 200; color: #1A1A18; margin-bottom: 18px; line-height: 1.35; }
.boutique-mask button { align-self: flex-start; background: rgba(160,120,48,0.1); border: 1px solid rgba(160,120,48,0.4); color: #A07830; font-family: inherit; font-size: 12px; padding: 9px 18px; border-radius: 100px; cursor: pointer; transition: 0.2s; }
.boutique-mask button:hover { background: rgba(160,120,48,0.18); border-color: #A07830; }
.boutique-subs { display: flex; flex-direction: column; gap: 14px; height: 440px; }
.boutique-sub { position: relative; flex: 1; border-radius: 16px; overflow: hidden; cursor: pointer; border: 1px solid #E0D8C8; }
.boutique-sub img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.85); transition: 0.5s; }
.boutique-sub:hover img { transform: scale(1.05); filter: brightness(0.92); }
.bs-mask { position: absolute; inset: 0; background: linear-gradient(to top, rgba(245,242,236,0.88), transparent 60%); display: flex; flex-direction: column; justify-content: flex-end; padding: 14px 18px; }
.bs-mask span { font-size: 9px; letter-spacing: 2px; color: #A07830; margin-bottom: 4px; font-weight: 500; }
.bs-mask h4   { font-size: 14px; font-weight: 400; color: #1A1A18; }

/* ══ 推荐 ══ */
.rec-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.rec-card { background: #FFF; border: 1px solid #E0D8C8; border-radius: var(--radius); overflow: hidden; transition: 0.3s; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.rec-card:hover { border-color: #C9A84C; transform: translateY(-6px); box-shadow: 0 12px 32px rgba(201,168,76,0.15); }
.rec-img-wrap { position: relative; overflow: hidden; }
.rec-img-wrap img { width: 100%; display: block; aspect-ratio: 3/4; object-fit: cover; transition: 0.5s; }
.rec-card:hover .rec-img-wrap img { transform: scale(1.04); }
.rec-wish { position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.9); border: 1px solid #E0D8C8; color: #B0A898; font-size: 14px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
.rec-wish:hover { color: #C0392B; border-color: #C0392B; }
.rec-hover { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; background: linear-gradient(to top, rgba(245,242,236,0.95), transparent); transform: translateY(100%); transition: 0.3s; }
.rec-card:hover .rec-hover { transform: translateY(0); }
.rec-add { width: 100%; padding: 9px; background: linear-gradient(135deg, #A07830, #C9A84C); border: none; border-radius: 8px; color: #FFF; font-family: inherit; font-size: 12px; font-weight: 500; cursor: pointer; }
.rec-info { padding: 12px 14px; }
.rec-name { font-size: 13px; color: #4A4438; line-height: 1.5; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 300; }
.rec-foot { display: flex; justify-content: space-between; align-items: baseline; }
.rec-price { font-size: 15px; font-weight: 600; color: #A07830; }
.rec-sold  { font-size: 11px; color: #B0A898; }

/* ══ AI 球 ══ */
.ai-orb { position: fixed; bottom: 40px; right: 40px; z-index: 9999; display: flex; flex-direction: column; align-items: center; cursor: pointer; }
.orb-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(201,168,76,0.3); animation: oPulse 3s ease-out infinite; }
.r1 { width: 52px; height: 52px; } .r2 { width: 52px; height: 52px; animation-delay: 1.5s; }
@keyframes oPulse { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.2);opacity:0} }
.orb-core { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #A07830, #C9A84C); border: none; color: #FFF; font-size: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(160,120,48,0.35); transition: 0.3s; position: relative; z-index: 2; }
.ai-orb:hover .orb-core { transform: scale(1.08); box-shadow: 0 6px 28px rgba(160,120,48,0.5); }
.orb-label { margin-top: 6px; font-size: 10px; color: #8A8070; letter-spacing: 1px; }

/* ══ FOOTER ══ */
.site-footer { border-top: 1px solid #E0D8C8; padding: 56px 40px 32px; background: #FAFAF8; }
.footer-inner { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 2fr; gap: 80px; margin-bottom: 40px; }
.footer-logo { font-size: 18px; font-weight: 300; letter-spacing: 4px; margin-bottom: 10px; color: #A07830; }
.footer-brand p { font-size: 13px; color: #8A8070; font-weight: 300; line-height: 1.7; max-width: 280px; }
.footer-cols { display: grid; grid-template-columns: repeat(4,1fr); gap: 32px; }
.footer-col h5 { font-size: 10px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: #A07830; margin-bottom: 20px; }
.footer-col a { display: block; font-size: 13px; color: #8A8070; text-decoration: none; margin-bottom: 12px; font-weight: 300; transition: 0.2s; }
.footer-col a:hover { color: #A07830; }
.footer-bottom { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid #E0D8C8; font-size: 10px; color: #B0A898; letter-spacing: 1px; }
.footer-bottom div { display: flex; gap: 24px; }
.footer-bottom a { color: #B0A898; text-decoration: none; font-size: 10px; transition: 0.2s; }
.footer-bottom a:hover { color: #A07830; }

/* ══ 动画 ══ */
.hero-fade-enter-active { animation: hIn 0.6s cubic-bezier(.22,1,.36,1) forwards; }
.hero-fade-leave-active { animation: hOut 0.3s ease forwards; }
@keyframes hIn  { from{opacity:0;transform:translateX(20px) scale(1.01)} to{opacity:1;transform:translateX(0) scale(1)} }
@keyframes hOut { from{opacity:1} to{opacity:0;transform:translateX(-12px)} }

/* ══ GSAP 增强样式 ══ */

/* 金色按钮微光效果 */
.hero-cta::after, .nav-my-btn::after, .cp-btn::after {
  content: '';
  position: absolute;
  top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s ease;
}
.hero-cta, .nav-my-btn, .cp-btn { position: relative; overflow: hidden; }
.hero-cta:hover::after, .nav-my-btn:hover::after, .cp-btn:hover::after { left: 120%; }

/* 卡片悬停效果 */
.rec-card:hover { transition: transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease, border-color 0.3s; }

/* Hero 图片平滑 */
.hero-img { transition: filter 0.6s ease; }

/* 服务栏悬停增强 */
.service-item {
  position: relative;
  overflow: hidden;
}
.service-item::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #A07830, #C9A84C);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: left;
}
.service-item:hover::after { transform: scaleX(1); }

/* 品牌工坊图片增强 */
.boutique-main img, .boutique-sub img { transition: transform 0.5s ease; }

/* AI 球增强光晕 */
.orb-core {
  box-shadow: 0 4px 20px rgba(160,120,48,0.35),
              0 0 40px rgba(201,168,76,0.15),
              inset 0 1px 2px rgba(255,255,255,0.3);
}
.ai-orb:hover .orb-core {
  box-shadow: 0 6px 28px rgba(160,120,48,0.5),
              0 0 60px rgba(201,168,76,0.25),
              inset 0 1px 2px rgba(255,255,255,0.3);
}

/* 秒杀进度条动画 */
.flash-bar {
  background: linear-gradient(90deg, #A07830, #C9A84C, #A07830);
  background-size: 200% 100%;
  animation: shimmerBar 2s linear infinite;
}
@keyframes shimmerBar {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 导航栏滚动增强 */
.site-nav {
  transition: box-shadow 0.3s ease, background 0.3s ease;
}

/* 优惠券卡片悬停光效 */
.coupon-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(201,168,76,0.05) 0%, transparent 50%, rgba(201,168,76,0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  border-radius: inherit;
}
.coupon-card { position: relative; }
.coupon-card:hover::before { opacity: 1; }

/* 推荐卡片图片悬停缩放增强 */
.rec-card:hover .rec-img-wrap img {
  transform: scale(1.06);
  filter: brightness(1.05);
}

/* 区块标题装饰线 */
.section-title::after {
  content: '';
  display: block;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #A07830, #C9A84C);
  margin-top: 8px;
  border-radius: 2px;
  transform-origin: left;
  animation: titleLineIn 0.8s ease forwards;
}
@keyframes titleLineIn {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* ══ 响应式 ══ */
@media (max-width:1200px) { .rec-grid{grid-template-columns:repeat(3,1fr)} .coupon-list{grid-template-columns:repeat(2,1fr)} }
@media (max-width:960px) {
  .hero{grid-template-columns:1fr} .hero-side{flex-direction:row}
  .boutique-grid{grid-template-columns:1fr} .boutique-subs{height:auto;flex-direction:row}
  .service-bar{grid-template-columns:repeat(2,1fr)} .fn-zone{grid-template-columns:repeat(4,1fr)}
  .member-banner{grid-template-columns:1fr} .mb-right{display:none}
  .rec-grid{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:640px) {
  .nav-inner{padding:0 18px} .nav-links{display:none}
  .hot-strip{padding:6px 18px 8px}
  .site-main{padding:20px 18px 48px}
  .coupon-list{grid-template-columns:1fr}
  .rec-grid{grid-template-columns:repeat(2,1fr)}
  .footer-inner{grid-template-columns:1fr;gap:32px}
  .footer-cols{grid-template-columns:repeat(2,1fr)}
}
</style>

<style>
html, body, #app {
  background: #F5F2EC !important;
  color: #1A1A18;
  min-height: 100vh;
}
</style>