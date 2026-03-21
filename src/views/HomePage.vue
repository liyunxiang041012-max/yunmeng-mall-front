<template>
  <div class="app-root">

    <!-- ══ SPLASH ══ -->
    <Transition name="splash-exit">
      <div v-if="showSplash" class="splash">
        <div class="splash-bg"></div>
        <div class="splash-center" :class="{ visible: splashPhase >= 1 }">
          <div class="splash-logo">
            <svg viewBox="0 0 80 80" width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="20" fill="#1D1D1F"/>
              <path d="M20 52 Q40 24 60 52" stroke="#C9B89A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <circle cx="40" cy="36" r="6" fill="#C9B89A"/>
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
    <div class="yunmeng" :class="{ ready: !showSplash }">

      <!-- ══ NAV ══ -->
      <header class="site-nav">
        <div class="nav-inner">
          <div class="nav-brand">
            <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
              <rect width="40" height="40" rx="10" fill="#1D1D1F"/>
              <path d="M10 26 Q20 12 30 26" stroke="#C9B89A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
              <circle cx="20" cy="18" r="3" fill="#C9B89A"/>
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
            <button class="nav-icon-btn" @click="goToLogin" :title="isLogin ? '我的' : '登录'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <button class="nav-icon-btn cart-btn" @click="cart()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <em v-if="cartCount > 0" class="cart-dot">{{ cartCount }}</em>
            </button>
            <button class="nav-my-btn" @click="my()">我的</button>
          </div>
        </div>

        <!-- 热搜 -->
        <div class="hot-strip">
          <span class="hot-label">热搜</span>
          <span v-for="tag in hotTags" :key="tag" class="hot-tag">{{ tag }}</span>
        </div>
      </header>

      <main class="site-main">

        <!-- ══ HERO ══ -->
        <section class="hero">
          <div class="hero-inner">
            <transition name="hero-fade" mode="out-in">
              <div :key="currentBanner" class="hero-slide">
                <img :src="banners[currentBanner].image" :alt="banners[currentBanner].title" class="hero-img" />
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

          <!-- 侧边快捷 -->
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
        <section class="service-bar">
          <div v-for="s in services" :key="s.id" class="service-item">
            <span class="service-icon">{{ s.icon }}</span>
            <div>
              <strong>{{ s.name }}</strong>
              <span>{{ s.desc }}</span>
            </div>
          </div>
        </section>

        <!-- ══ 功能导航 ══ -->
        <section class="fn-zone">
          <div v-for="item in functionItems" :key="item.id" class="fn-tile" :style="{'--tc': item.color}">
            <div class="fn-icon">{{ item.icon }}</div>
            <span>{{ item.name }}</span>
          </div>
        </section>

        <!-- ══ 会员横幅 ══ -->
        <section class="member-banner">
          <div class="mb-left">
            <span class="mb-tag">会员专享</span>
            <h2>加入云梦会员，尊享首单 15% 礼遇。</h2>
            <button class="mb-btn">立即加入</button>
          </div>
          <div class="mb-right">
            <img src="https://picsum.photos/400/240?random=88" alt="member" />
          </div>
        </section>

        <!-- ══ 优惠券 ══ -->
        <section class="section-block">
          <div class="section-head">
            <div>
              <p class="eyebrow">COUPONS</p>
              <h2 class="section-title">专属优惠券</h2>
            </div>
            <button class="ghost-btn">查看全部 →</button>
          </div>
          <div class="coupon-list">
            <div v-for="cp in coupons" :key="cp.id" class="coupon-card" :class="{ claimed: cp.claimed }">
              <div class="cp-left" :style="{'--cc': cp.color}">
                <div class="cp-amount">
                  <span class="cp-unit">¥</span>
                  <span class="cp-num">{{ cp.amount }}</span>
                </div>
                <p class="cp-min">满{{ cp.minOrder }}元</p>
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
            <button class="ghost-btn">查看全部 →</button>
          </div>
          <div class="flash-grid">
            <div v-for="item in seckillGoods" :key="item.id" class="flash-card">
              <div class="flash-img-wrap">
                <img :src="item.image" :alt="item.name" />
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
                  <span class="flash-pct">{{ item.progress }}% 已抢</span>
                </div>
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
            <div class="boutique-main">
              <img src="https://picsum.photos/900/600?random=50" alt="boutique" />
              <div class="boutique-mask">
                <span class="bt-tag">✦ 2026春季大赏</span>
                <h3>春日限定<br>美学精选</h3>
                <button>探索系列 →</button>
              </div>
            </div>
            <div class="boutique-subs">
              <div class="boutique-sub" v-for="f in featureSubs" :key="f.id">
                <img :src="f.image" alt="" />
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
          <div class="rec-grid">
            <div v-for="item in recommendGoods" :key="item.id" class="rec-card">
              <div class="rec-img-wrap">
                <img :src="item.image" :alt="item.name" />
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
      <div class="ai-orb" @click="toggleAiPanel">
        <div class="orb-ring r1"></div>
        <div class="orb-ring r2"></div>
        <div class="orb-core">✦</div>
        <span class="orb-label">AI助手</span>
      </div>

      <transition name="panel-up">
        <div v-if="aiPanelOpen" class="ai-panel">
          <div class="ai-head">
            <div class="ai-title"><span class="ai-dot"></span>云梦 AI 助手</div>
            <button @click.stop="aiPanelOpen=false">✕</button>
          </div>
          <div class="ai-body">
            <div class="ai-row">
              <div class="ai-av">✦</div>
              <div class="ai-bubble">你好！我是云梦 AI，可以帮你选品、比价、搭配穿搭，告诉我你的需求吧 ～</div>
            </div>
            <div class="ai-chips">
              <button v-for="q in aiQuickQuestions" :key="q" class="ai-chip">{{ q }}</button>
            </div>
          </div>
          <div class="ai-input">
            <input type="text" placeholder="输入你想要的…" />
            <button class="ai-send">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>
            </button>
          </div>
        </div>
      </transition>

      <!-- Footer -->
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <div class="footer-logo">云梦商城</div>
            <p>致力于为品味不凡的人士打造纯粹、高品质的全球消费体验</p>
          </div>
          <div class="footer-cols">
            <div class="footer-col">
              <h5>发现</h5>
              <a href="#">品牌资讯</a>
              <a href="#">礼品指南</a>
              <a href="#">精品店址</a>
            </div>
            <div class="footer-col">
              <h5>账户</h5>
              <a href="#">个人中心</a>
              <a href="#">我的订单</a>
              <a href="#">云梦会员卡</a>
            </div>
            <div class="footer-col">
              <h5>服务</h5>
              <a href="#">私人管家</a>
              <a href="#">售后养护</a>
              <a href="#">高端定制</a>
            </div>
            <div class="footer-col">
              <h5>关注</h5>
              <a href="#">微信公众号</a>
              <a href="#">小红书</a>
              <a href="#">官方微博</a>
            </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import router from '@/router'

// ── Splash ──
const showSplash    = ref(true)
const splashPhase   = ref(0)
const splashProgress = ref(0)
let splashTimer = null

const runSplash = () => {
  splashPhase.value = 1
  setTimeout(() => { splashPhase.value = 2 }, 400)
  const start = Date.now()
  splashTimer = setInterval(() => {
    const el = Date.now() - start
    splashProgress.value = Math.min(100, (el / 2200) * 100)
    if (splashProgress.value >= 100) { clearInterval(splashTimer); setTimeout(() => { showSplash.value = false }, 300) }
  }, 16)
}
const skipSplash = () => { clearInterval(splashTimer); splashProgress.value = 100; setTimeout(() => { showSplash.value = false }, 200) }

// ── 路由 ──
const my   = () => router.push('/my')
const cart = () => router.push('/cart')

// ── 状态 ──
const isLogin       = ref(false)
const searchKeyword = ref('')
const searchFocused = ref(false)
const cartCount     = ref(5)
const currentBanner = ref(0)
const aiPanelOpen   = ref(false)
const hours   = ref('02')
const minutes = ref('45')
const seconds = ref('12')

const hotTags = ref(['春季新款', 'AI选品', '耳机推荐', '平价好物', '居家神器', '限定礼盒'])

const banners = ref([
  { id:1, tag:'2026 秋冬系列', title:'静谧致远\n云梦之境', sub:'秉持极简美学，为您甄选全球顶级生活方式精品', image:'https://picsum.photos/1400/700?random=10' },
  { id:2, tag:'智能家居专场', title:'未来感\n生活方式', sub:'AI 帮你打造理想中的家', image:'https://picsum.photos/1400/700?random=11' },
  { id:3, tag:'数码新品首发', title:'科技与\n美感并行', sub:'2026 最值得入手的数码好物', image:'https://picsum.photos/1400/700?random=12' }
])

const sideCards = ref([
  { id:1, icon:'🔥', name:'今日必抢', desc:'限时特惠 10 件', color:'#C9784A' },
  { id:2, icon:'✈️', name:'全球直邮', desc:'1000+ 海外品牌', color:'#7FA99B' },
  { id:3, icon:'🌱', name:'绿色优选', desc:'可持续好物',     color:'#7A9E7E' }
])

const services = ref([
  { id:1, icon:'◎', name:'正品溯源', desc:'每件商品数字化认证' },
  { id:2, icon:'◈', name:'尊享配送', desc:'全程管家式物流' },
  { id:3, icon:'♛', name:'云梦会所', desc:'线下沙龙私人体验' },
  { id:4, icon:'∞', name:'私人顾问', desc:'400小时在线服务' }
])

const functionItems = ref([
  { id:1, icon:'⚡', name:'秒杀', color:'#C9784A' }, { id:2, icon:'🎁', name:'领券', color:'#8E86A0' },
  { id:3, icon:'♛', name:'会员', color:'#C9B89A' }, { id:4, icon:'📱', name:'数码', color:'#7FA99B' },
  { id:5, icon:'✿', name:'美妆', color:'#D4A5A5' }, { id:6, icon:'🍃', name:'生鲜', color:'#7A9E7E' },
  { id:7, icon:'◈', name:'家居', color:'#8E86A0' }, { id:8, icon:'∞', name:'更多',  color:'#86868B' }
])

const coupons = ref([
  { id:1, amount:50,  minOrder:299, name:'全品类通用券', expire:'有效期至 2026-03-31', color:'#8E86A0', claimed:false },
  { id:2, amount:30,  minOrder:199, name:'数码专区专用', expire:'有效期至 2026-03-25', color:'#7FA99B', claimed:false },
  { id:3, amount:20,  minOrder:99,  name:'美妆个护专区', expire:'有效期至 2026-04-01', color:'#D4A5A5', claimed:false },
  { id:4, amount:100, minOrder:599, name:'家电大额专享', expire:'有效期至 2026-03-20', color:'#C9B89A', claimed:false }
])
const claimCoupon = (cp) => { cp.claimed = true }

const seckillGoods = ref([
  { id:1, name:'极简无线降噪耳机', currentPrice:89,  originalPrice:199, progress:80, image:'https://picsum.photos/300/300?random=1' },
  { id:2, name:'轻量碳纤维背包',   currentPrice:129, originalPrice:299, progress:45, image:'https://picsum.photos/300/300?random=2' },
  { id:3, name:'香氛扩香石套装',   currentPrice:59,  originalPrice:159, progress:92, image:'https://picsum.photos/300/300?random=3' },
  { id:4, name:'智能温控水杯',     currentPrice:199, originalPrice:499, progress:30, image:'https://picsum.photos/300/300?random=4' },
  { id:5, name:'丝滑真丝睡衣',     currentPrice:77,  originalPrice:140, progress:66, image:'https://picsum.photos/300/300?random=5' },
  { id:6, name:'手冲咖啡套装',     currentPrice:228, originalPrice:399, progress:55, image:'https://picsum.photos/300/300?random=6' }
])

const featureSubs = ref([
  { id:1, tag:'数码专区', title:'智能穿戴新品首发', image:'https://picsum.photos/600/280?random=30' },
  { id:2, tag:'家居生活', title:'北欧风格全屋美学', image:'https://picsum.photos/600/280?random=31' },
  { id:3, tag:'美妆护肤', title:'焕颜精华季节限定', image:'https://picsum.photos/600/280?random=32' }
])

const recommendGoods = ref([
  { id:1, name:'极简风阔腿裤春秋新款',     price:128,  sales:'1.2k', image:'https://picsum.photos/400/500?random=20' },
  { id:2, name:'AI智能降噪蓝牙耳机旗舰版', price:599,  sales:'800+', image:'https://picsum.photos/400/400?random=21' },
  { id:3, name:'手工研磨挂耳咖啡礼盒20入', price:89,   sales:'3k+',  image:'https://picsum.photos/400/440?random=22' },
  { id:4, name:'复古黑胶唱片机家用音响',   price:1299, sales:'150',  image:'https://picsum.photos/400/400?random=23' },
  { id:5, name:'纯棉透气重磅T恤多色可选',  price:69,   sales:'5k+',  image:'https://picsum.photos/400/460?random=24' },
  { id:6, name:'多功能空气炸锅无油烹饪',   price:349,  sales:'2.1k', image:'https://picsum.photos/400/400?random=25' },
  { id:7, name:'北欧风实木床头柜简约现代', price:219,  sales:'400',  image:'https://picsum.photos/400/420?random=26' },
  { id:8, name:'轻便碳纤维折叠雨伞',       price:45,   sales:'1k+',  image:'https://picsum.photos/400/400?random=27' }
])

const aiQuickQuestions = ref(['帮我找平价耳机', '最近流行什么', '推荐家居好物', '查看我的订单'])

const handleSearch    = () => { if (searchKeyword.value) alert(`搜索: ${searchKeyword.value}`) }
const goToLogin       = () => { isLogin.value = !isLogin.value }
const toggleAiPanel   = () => { aiPanelOpen.value = !aiPanelOpen.value }
const refreshRecommend = () => { recommendGoods.value = [...recommendGoods.value].sort(() => Math.random() - 0.5) }

let countdown = null, bannerTimer = null
const startCountdown = () => {
  let total = 2*3600+45*60+12
  countdown = setInterval(() => {
    if (total <= 0) { clearInterval(countdown); return }
    total--
    hours.value   = String(Math.floor(total/3600)).padStart(2,'0')
    minutes.value = String(Math.floor((total%3600)/60)).padStart(2,'0')
    seconds.value = String(total%60).padStart(2,'0')
  }, 1000)
}

onMounted(() => {
  runSplash()
  startCountdown()
  bannerTimer = setInterval(() => { currentBanner.value = (currentBanner.value+1) % banners.value.length }, 5000)
})
onUnmounted(() => { clearInterval(countdown); clearInterval(bannerTimer); clearInterval(splashTimer) })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@200;300;400;500&family=DM+Serif+Display:ital@0;1&display=swap');

/* ══ 变量 ══ */
:root {
  --bg:      #FFFFFF;
  --bg-soft: #F5F5F7;
  --bg-warm: #F9F6F1;
  --border:  #E5E5E7;
  --text:    #1D1D1F;
  --text2:   #494949;
  --text3:   #86868B;
  --accent:  #C9B89A;
  --accent2: #7FA99B;
  --warm:    #C9784A;
  --radius:  16px;
  --shadow:  0 4px 24px rgba(0,0,0,0.06);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.app-root { font-family: 'Noto Sans SC', sans-serif; -webkit-font-smoothing: antialiased; }

/* ══ SPLASH ══ */
.splash {
  position: fixed; inset: 0; z-index: 9999;
  background: #F9F6F1;
  display: flex; align-items: center; justify-content: center;
}
.splash-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(201,184,154,0.15) 0%, transparent 70%);
}
.splash-center {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center; gap: 32px;
  opacity: 0; transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.splash-center.visible { opacity: 1; transform: translateY(0); }
.splash-logo { margin-bottom: 8px; }
.splash-title { text-align: center; opacity: 0; transition: opacity 0.5s 0.3s; }
.splash-title.visible { opacity: 1; }
.splash-title h1 { font-size: 32px; font-weight: 200; letter-spacing: 8px; color: #1D1D1F; margin-bottom: 8px; }
.splash-title p  { font-size: 11px; letter-spacing: 4px; color: #86868B; font-weight: 300; }
.splash-progress { display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0; transition: opacity 0.5s 0.2s; width: 260px; }
.splash-progress.visible { opacity: 1; }
.sp-track { width: 100%; height: 1px; background: #E5E5E7; }
.sp-fill  { height: 100%; background: var(--accent); transition: width 0.1s linear; }
.splash-progress span { font-size: 11px; color: #86868B; letter-spacing: 2px; }
.sp-skip {
  position: absolute; bottom: 32px; right: 32px;
  background: none; border: 1px solid #E5E5E7;
  color: #86868B; font-family: inherit; font-size: 12px; letter-spacing: 2px;
  padding: 8px 18px; border-radius: 100px; cursor: pointer;
  opacity: 0; transition: all 0.3s;
}
.sp-skip.show { animation: fadeIn 0.5s 0.8s forwards; }
@keyframes fadeIn { to { opacity: 1; } }
.sp-skip:hover { border-color: var(--text); color: var(--text); }

/* Splash 退场 */
.splash-exit-leave-active { animation: splashOut 0.7s ease forwards; }
@keyframes splashOut { 0%{opacity:1} 100%{opacity:0;transform:scale(1.04)} }

/* ══ MAIN ══ */
.yunmeng {
  background: var(--bg); color: var(--text);
  min-height: 100vh; overflow-x: hidden;
  opacity: 0; transition: opacity 0.6s ease;
}
.yunmeng.ready { opacity: 1; }

/* ══ NAV ══ */
.site-nav {
  position: sticky; top: 0; z-index: 999;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.nav-inner {
  max-width: 1400px; margin: 0 auto; padding: 0 40px;
  height: 64px; display: flex; align-items: center; gap: 40px;
}
.nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; flex-shrink: 0; }
.brand-text { display: flex; flex-direction: column; line-height: 1.1; }
.brand-zh { font-size: 15px; font-weight: 400; letter-spacing: 2px; color: var(--text); }
.brand-en { font-size: 9px;  font-weight: 300; letter-spacing: 4px; color: var(--text3); }
.nav-links { display: flex; gap: 32px; }
.nav-links a {
  font-size: 13px; font-weight: 300; color: var(--text2);
  text-decoration: none; letter-spacing: 0.5px; transition: color 0.2s;
}
.nav-links a:hover { color: var(--text); }
.nav-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 14px;
  background: var(--bg-soft); border: 1px solid transparent;
  border-radius: 100px; transition: 0.2s;
}
.search-wrap.focused { border-color: var(--accent); background: #fff; }
.search-wrap input {
  background: none; border: none; outline: none;
  font-family: inherit; font-size: 13px; color: var(--text);
  width: 160px;
}
.search-wrap input::placeholder { color: var(--text3); }
.search-wrap svg { color: var(--text3); flex-shrink: 0; }
.nav-icon-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: none; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--text2); cursor: pointer; transition: 0.2s; position: relative;
}
.nav-icon-btn:hover { border-color: var(--text); color: var(--text); }
.cart-dot {
  position: absolute; top: -4px; right: -4px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--warm); color: #fff; font-size: 9px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff; font-style: normal;
}
.nav-my-btn {
  height: 36px; padding: 0 18px; border-radius: 100px;
  background: var(--text); border: none; color: #fff;
  font-family: inherit; font-size: 13px; font-weight: 300;
  letter-spacing: 1px; cursor: pointer; transition: 0.2s;
}
.nav-my-btn:hover { background: #333; }

/* 热搜 */
.hot-strip {
  max-width: 1400px; margin: 0 auto; padding: 6px 40px 8px;
  display: flex; align-items: center; gap: 10px;
  border-top: 1px solid var(--border); overflow-x: auto;
}
.hot-strip::-webkit-scrollbar { display: none; }
.hot-label { font-size: 10px; color: var(--warm); font-weight: 500; letter-spacing: 1px; flex-shrink: 0; }
.hot-tag {
  font-size: 12px; color: var(--text3); padding: 3px 12px;
  border: 1px solid var(--border); border-radius: 100px;
  cursor: pointer; transition: 0.2s; white-space: nowrap; flex-shrink: 0;
}
.hot-tag:hover { color: var(--text); border-color: var(--text3); }

/* ══ MAIN ══ */
.site-main { max-width: 1400px; margin: 0 auto; padding: 32px 40px 80px; }

/* ══ HERO ══ */
.hero { display: grid; grid-template-columns: 1fr 240px; gap: 16px; margin-bottom: 32px; }
.hero-inner { position: relative; height: 480px; border-radius: 20px; overflow: hidden; }
.hero-slide { position: absolute; inset: 0; }
.hero-img { width: 100%; height: 100%; object-fit: cover; }
.hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, rgba(29,29,31,0.82) 0%, rgba(29,29,31,0.3) 55%, rgba(29,29,31,0.05) 100%);
}
.hero-copy {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; justify-content: center;
  padding: 52px 56px; height: 100%;
}
.hero-tag {
  font-size: 10px; letter-spacing: 4px; color: var(--accent);
  font-weight: 400; margin-bottom: 16px; text-transform: uppercase;
  display: flex; align-items: center; gap: 10px;
}
.hero-tag::before { content: ''; width: 24px; height: 1px; background: var(--accent); }
.hero-title { font-size: 52px; font-weight: 200; line-height: 1.15; color: #fff; margin-bottom: 14px; letter-spacing: -0.5px; }
.hero-sub   { font-size: 14px; color: rgba(255,255,255,0.65); margin-bottom: 32px; font-weight: 300; line-height: 1.7; }
.hero-cta {
  align-self: flex-start; padding: 12px 28px;
  background: #fff; border: none; border-radius: 100px;
  color: var(--text); font-family: inherit; font-size: 13px; font-weight: 400;
  letter-spacing: 1px; cursor: pointer; transition: 0.25s;
}
.hero-cta:hover { background: var(--accent); color: #fff; }
.hero-dots { position: absolute; bottom: 20px; left: 52px; display: flex; gap: 6px; z-index: 10; }
.hdot { width: 22px; height: 2px; border-radius: 10px; background: rgba(255,255,255,0.3); border: none; cursor: pointer; transition: 0.3s; }
.hdot.active { background: #fff; width: 40px; }

.hero-side { display: flex; flex-direction: column; gap: 12px; }
.side-card {
  flex: 1; background: var(--bg-warm);
  border: 1px solid var(--border); border-left: 3px solid var(--c, var(--accent));
  border-radius: var(--radius); padding: 16px;
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; transition: 0.25s;
}
.side-card:hover { background: #fff; transform: translateX(3px); box-shadow: var(--shadow); }
.side-icon { font-size: 22px; flex-shrink: 0; }
.side-card > div { flex: 1; }
.side-card strong { display: block; font-size: 13px; color: var(--text); margin-bottom: 2px; font-weight: 500; }
.side-card span   { font-size: 11px; color: var(--text3); }
.side-card svg    { color: var(--text3); flex-shrink: 0; }

/* ══ 服务条 ══ */
.service-bar {
  display: grid; grid-template-columns: repeat(4,1fr);
  gap: 1px; background: var(--border);
  border: 1px solid var(--border); border-radius: var(--radius);
  overflow: hidden; margin-bottom: 32px;
}
.service-item {
  display: flex; align-items: center; gap: 14px;
  padding: 22px 24px; background: var(--bg);
  transition: 0.2s;
}
.service-item:hover { background: var(--bg-warm); }
.service-icon { font-size: 22px; color: var(--accent); flex-shrink: 0; }
.service-item strong { display: block; font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
.service-item span   { font-size: 11px; color: var(--text3); font-weight: 300; }

/* ══ 功能导航 ══ */
.fn-zone {
  display: grid; grid-template-columns: repeat(8,1fr);
  gap: 4px; background: var(--bg-warm);
  border: 1px solid var(--border); border-radius: 20px;
  padding: 20px 16px; margin-bottom: 40px;
}
.fn-tile {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 14px 6px; border-radius: 12px;
  cursor: pointer; transition: 0.25s; position: relative;
}
.fn-tile:hover { background: #fff; box-shadow: var(--shadow); }
.fn-tile:hover .fn-icon { transform: scale(1.12) translateY(-2px); }
.fn-icon { font-size: 26px; transition: 0.25s; }
.fn-tile span { font-size: 12px; color: var(--text2); font-weight: 300; }

/* ══ 会员横幅 ══ */
.member-banner {
  display: grid; grid-template-columns: 1fr 320px;
  gap: 0; background: var(--bg-warm);
  border: 1px solid var(--border); border-radius: 20px;
  overflow: hidden; margin-bottom: 40px;
}
.mb-left {
  padding: 48px 52px;
  display: flex; flex-direction: column; justify-content: center; gap: 20px;
}
.mb-tag { font-size: 10px; letter-spacing: 3px; color: var(--accent2); text-transform: uppercase; font-weight: 400; }
.mb-left h2 { font-size: 26px; font-weight: 200; color: var(--text); line-height: 1.4; letter-spacing: -0.3px; }
.mb-btn {
  align-self: flex-start; padding: 11px 26px;
  background: var(--text); border: none; border-radius: 100px;
  color: #fff; font-family: inherit; font-size: 13px; font-weight: 300;
  letter-spacing: 1px; cursor: pointer; transition: 0.2s;
}
.mb-btn:hover { background: #333; }
.mb-right { overflow: hidden; }
.mb-right img { width: 100%; height: 100%; object-fit: cover; }

/* ══ 通用区块 ══ */
.section-block { margin-bottom: 56px; }
.section-head  { display: flex; align-items: flex-end; gap: 16px; margin-bottom: 24px; }
.section-head > div:first-child { flex: 1; }
.eyebrow { font-size: 9px; letter-spacing: 4px; color: var(--accent); text-transform: uppercase; font-weight: 400; margin-bottom: 6px; }
.section-title { font-size: 24px; font-weight: 200; color: var(--text); letter-spacing: -0.3px; }
.ghost-btn {
  background: none; border: 1px solid var(--border);
  color: var(--text3); font-family: inherit; font-size: 12px;
  padding: 7px 16px; border-radius: 100px; cursor: pointer; transition: 0.2s;
  white-space: nowrap; letter-spacing: 0.5px; flex-shrink: 0;
}
.ghost-btn:hover { border-color: var(--text); color: var(--text); }

/* ══ 优惠券 ══ */
.coupon-list { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.coupon-card {
  display: flex; background: var(--bg-warm);
  border: 1px solid var(--border); border-radius: 14px;
  overflow: hidden; transition: 0.25s; cursor: pointer;
}
.coupon-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: var(--shadow); }
.coupon-card.claimed { opacity: 0.4; pointer-events: none; }
.cp-left {
  width: 90px; flex-shrink: 0;
  background: linear-gradient(160deg, var(--cc), color-mix(in srgb, var(--cc) 50%, #F9F6F1));
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; padding: 14px 6px;
}
.cp-divider { width: 1px; flex-shrink: 0; position: relative; border-left: 1px dashed var(--border); }
.cp-divider::before, .cp-divider::after {
  content: ''; position: absolute; left: -6px; width: 11px; height: 11px;
  border-radius: 50%; background: var(--bg);
}
.cp-divider::before { top: -6px; } .cp-divider::after { bottom: -6px; }
.cp-amount { display: flex; align-items: baseline; gap: 1px; }
.cp-unit { font-size: 12px; color: #fff; font-weight: 500; }
.cp-num  { font-size: 30px; font-weight: 600; color: #fff; line-height: 1; }
.cp-min  { font-size: 9px; color: rgba(255,255,255,0.7); white-space: nowrap; }
.cp-right { flex: 1; padding: 14px 14px 14px 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 5px; }
.cp-name   { font-size: 13px; font-weight: 400; color: var(--text); }
.cp-expire { font-size: 10px; color: var(--text3); }
.cp-btn {
  align-self: flex-start; padding: 5px 12px; border-radius: 100px;
  background: var(--text); border: none; color: #fff;
  font-family: inherit; font-size: 11px; font-weight: 400; cursor: pointer; transition: 0.2s;
}
.cp-btn:hover { background: #333; }
.cp-btn.claimed { background: var(--bg-soft); color: var(--text3); cursor: default; }

/* ══ 秒杀 ══ */
.flash-section { background: var(--bg-warm); border: 1px solid var(--border); border-radius: 20px; padding: 32px; }
.timer { display: flex; align-items: center; gap: 5px; }
.t-unit { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.tnum  { font-size: 18px; font-weight: 500; color: var(--warm); background: rgba(201,120,74,0.1); padding: 4px 9px; border-radius: 6px; min-width: 40px; text-align: center; line-height: 1; }
.tlabel { font-size: 9px; color: var(--text3); }
.tsep   { font-size: 16px; color: var(--warm); font-weight: 500; margin-bottom: 10px; }
.flash-grid { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 4px; margin-top: 20px; }
.flash-grid::-webkit-scrollbar { height: 2px; }
.flash-grid::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
.flash-card {
  width: 178px; flex-shrink: 0;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden; transition: 0.25s; cursor: pointer;
}
.flash-card:hover { border-color: var(--accent); transform: translateY(-5px); box-shadow: var(--shadow); }
.flash-img-wrap { position: relative; height: 160px; overflow: hidden; }
.flash-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
.flash-card:hover .flash-img-wrap img { transform: scale(1.05); }
.flash-badge {
  position: absolute; top: 9px; right: 9px;
  background: var(--warm); color: #fff;
  font-size: 10px; font-weight: 500; padding: 3px 7px; border-radius: 5px;
}
.flash-body { padding: 11px; }
.flash-name { font-size: 12px; color: var(--text2); margin-bottom: 7px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.flash-prices { display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; }
.flash-cur  { font-size: 16px; font-weight: 500; color: var(--warm); }
.flash-orig { font-size: 11px; color: var(--text3); text-decoration: line-through; }
.flash-bar-wrap { height: 4px; background: var(--bg-soft); border-radius: 10px; overflow: hidden; position: relative; }
.flash-bar { height: 100%; background: linear-gradient(90deg, var(--warm), #E8A07A); border-radius: 10px; transition: width 1s; }
.flash-pct { display: block; font-size: 9px; color: var(--text3); margin-top: 5px; }

/* ══ 品牌工坊 ══ */
.boutique-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px; }
.boutique-main { position: relative; height: 440px; border-radius: 20px; overflow: hidden; cursor: pointer; }
.boutique-main img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: 0.6s; }
.boutique-main:hover img { transform: scale(1.03); }
.boutique-mask {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(29,29,31,0.85) 0%, rgba(29,29,31,0.15) 60%, transparent 100%);
  display: flex; flex-direction: column; justify-content: flex-end; padding: 28px 30px;
}
.bt-tag { font-size: 9px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; margin-bottom: 10px; }
.boutique-mask h3 { font-size: 26px; font-weight: 200; color: #fff; margin-bottom: 18px; line-height: 1.35; }
.boutique-mask button {
  align-self: flex-start; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25);
  color: #fff; font-family: inherit; font-size: 12px; padding: 9px 18px; border-radius: 100px; cursor: pointer; transition: 0.2s; letter-spacing: 1px;
}
.boutique-mask button:hover { background: rgba(255,255,255,0.22); }
.boutique-subs { display: flex; flex-direction: column; gap: 14px; height: 440px; }
.boutique-sub { position: relative; flex: 1; border-radius: 16px; overflow: hidden; cursor: pointer; }
.boutique-sub img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
.boutique-sub:hover img { transform: scale(1.05); }
.bs-mask {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(29,29,31,0.80), transparent 60%);
  display: flex; flex-direction: column; justify-content: flex-end; padding: 14px 18px;
}
.bs-mask span { font-size: 9px; letter-spacing: 2px; color: var(--accent2); margin-bottom: 4px; font-weight: 400; }
.bs-mask h4 { font-size: 14px; font-weight: 300; color: #fff; }

/* ══ 推荐 ══ */
.rec-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.rec-card {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden; transition: 0.3s; cursor: pointer;
}
.rec-card:hover { border-color: var(--accent); transform: translateY(-6px); box-shadow: var(--shadow); }
.rec-img-wrap { position: relative; overflow: hidden; }
.rec-img-wrap img { width: 100%; display: block; aspect-ratio: 3/4; object-fit: cover; transition: 0.5s; }
.rec-card:hover .rec-img-wrap img { transform: scale(1.04); }
.rec-wish {
  position: absolute; top: 10px; right: 10px;
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(255,255,255,0.85); border: 1px solid var(--border);
  color: var(--text3); font-size: 14px; cursor: pointer; transition: 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.rec-wish:hover { color: #E05A6A; border-color: #E05A6A; }
.rec-hover {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 12px;
  background: linear-gradient(to top, rgba(29,29,31,0.85), transparent);
  transform: translateY(100%); transition: 0.3s;
}
.rec-card:hover .rec-hover { transform: translateY(0); }
.rec-add {
  width: 100%; padding: 9px; background: #fff; border: none;
  border-radius: 8px; color: var(--text); font-family: inherit; font-size: 12px; font-weight: 400; cursor: pointer; letter-spacing: 1px;
}
.rec-info { padding: 12px 14px; }
.rec-name { font-size: 13px; color: var(--text2); line-height: 1.5; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 300; }
.rec-foot { display: flex; justify-content: space-between; align-items: baseline; }
.rec-price { font-size: 15px; font-weight: 500; color: var(--text); }
.rec-sold  { font-size: 11px; color: var(--text3); }

/* ══ AI 球 ══ */
.ai-orb {
  position: fixed; bottom: 40px; right: 40px; z-index: 9999;
  display: flex; flex-direction: column; align-items: center; cursor: pointer;
}
.orb-ring {
  position: absolute; border-radius: 50%;
  border: 1px solid rgba(201,184,154,0.4); animation: oPulse 3s ease-out infinite;
}
.r1 { width: 52px; height: 52px; } .r2 { width: 52px; height: 52px; animation-delay: 1.5s; }
@keyframes oPulse { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
.orb-core {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--text); color: var(--accent); font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: 0.3s; position: relative; z-index: 2;
}
.ai-orb:hover .orb-core { transform: scale(1.08); }
.orb-label { margin-top: 6px; font-size: 10px; color: var(--text3); letter-spacing: 1px; }

/* ══ AI 面板 ══ */
.ai-panel {
  position: fixed; bottom: 115px; right: 40px; width: 330px; z-index: 9999;
  background: #fff; border: 1px solid var(--border);
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 20px 48px rgba(0,0,0,0.12);
}
.ai-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid var(--border);
  font-size: 13px; font-weight: 500; color: var(--text);
}
.ai-title { display: flex; align-items: center; gap: 8px; }
.ai-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; animation: blink 2s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
.ai-head button { background: none; border: none; color: var(--text3); cursor: pointer; font-size: 14px; transition: 0.2s; }
.ai-head button:hover { color: var(--text); }
.ai-body { padding: 16px 18px 12px; }
.ai-row { display: flex; gap: 10px; margin-bottom: 12px; }
.ai-av {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: var(--text); color: var(--accent); font-size: 12px;
  display: flex; align-items: center; justify-content: center;
}
.ai-bubble {
  background: var(--bg-soft); border-radius: 10px 10px 10px 3px;
  padding: 10px 12px; font-size: 12px; line-height: 1.6; color: var(--text2); font-weight: 300;
}
.ai-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ai-chip {
  background: var(--bg-warm); border: 1px solid var(--border);
  color: var(--text2); font-family: inherit; font-size: 11px;
  padding: 5px 11px; border-radius: 100px; cursor: pointer; transition: 0.2s;
}
.ai-chip:hover { border-color: var(--accent); color: var(--text); }
.ai-input { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--border); }
.ai-input input {
  flex: 1; background: var(--bg-soft); border: 1px solid var(--border);
  border-radius: 100px; padding: 8px 12px;
  color: var(--text); font-family: inherit; font-size: 12px; outline: none; transition: 0.2s;
}
.ai-input input:focus { border-color: var(--accent); }
.ai-input input::placeholder { color: var(--text3); }
.ai-send {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--text); border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: 0.2s;
}
.ai-send:hover { background: #333; }

/* ══ FOOTER ══ */
.site-footer { border-top: 1px solid var(--border); padding: 56px 40px 32px; background: #fff; }
.footer-inner { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 2fr; gap: 80px; margin-bottom: 40px; }
.footer-logo { font-size: 18px; font-weight: 200; letter-spacing: 4px; color: var(--text); margin-bottom: 10px; }
.footer-brand p { font-size: 13px; color: var(--text3); font-weight: 300; line-height: 1.7; max-width: 280px; }
.footer-cols { display: grid; grid-template-columns: repeat(4,1fr); gap: 32px; }
.footer-col h5 { font-size: 10px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: var(--text); margin-bottom: 20px; }
.footer-col a { display: block; font-size: 13px; color: var(--text3); text-decoration: none; margin-bottom: 12px; font-weight: 300; transition: 0.2s; }
.footer-col a:hover { color: var(--text); }
.footer-bottom {
  max-width: 1400px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 24px; border-top: 1px solid var(--border);
  font-size: 10px; color: var(--text3); letter-spacing: 1px;
}
.footer-bottom div { display: flex; gap: 24px; }
.footer-bottom a { color: var(--text3); text-decoration: none; font-size: 10px; letter-spacing: 1px; transition: 0.2s; }
.footer-bottom a:hover { color: var(--text); }

/* ══ 动画 ══ */
.hero-fade-enter-active { animation: hIn 0.5s ease forwards; }
.hero-fade-leave-active { animation: hOut 0.25s ease forwards; }
@keyframes hIn  { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
@keyframes hOut { from{opacity:1} to{opacity:0;transform:translateX(-10px)} }
.panel-up-enter-active, .panel-up-leave-active { transition: all 0.3s cubic-bezier(.175,.885,.32,1.275); }
.panel-up-enter-from, .panel-up-leave-to { opacity: 0; transform: translateY(12px) scale(0.97); }

/* ══ 响应式 ══ */
@media (max-width:1200px) { .rec-grid{grid-template-columns:repeat(3,1fr)} .coupon-list{grid-template-columns:repeat(2,1fr)} }
@media (max-width:960px)  {
  .hero{grid-template-columns:1fr} .hero-side{flex-direction:row}
  .boutique-grid{grid-template-columns:1fr} .boutique-subs{height:auto;flex-direction:row}
  .service-bar{grid-template-columns:repeat(2,1fr)}
  .fn-zone{grid-template-columns:repeat(4,1fr)}
  .member-banner{grid-template-columns:1fr} .mb-right{display:none}
  .rec-grid{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:640px)  {
  .nav-inner{padding:0 18px;flex-wrap:wrap;height:auto;padding-top:10px}
  .nav-links{display:none}
  .hot-strip{padding:6px 18px 8px}
  .site-main{padding:20px 18px 48px}
  .coupon-list{grid-template-columns:1fr}
  .rec-grid{grid-template-columns:repeat(2,1fr)}
  .footer-inner{grid-template-columns:1fr;gap:32px}
  .footer-cols{grid-template-columns:repeat(2,1fr)}
}
</style>