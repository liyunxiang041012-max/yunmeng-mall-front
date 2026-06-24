<template>
  <div class="sr-root">

    <!-- ══ 背景装饰 ══ -->
    <div class="bg-ambient">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
      <div class="bg-grid"></div>
    </div>

    <div class="sr-container">

      <!-- ━━━ 顶栏 ━━━ -->
      <header class="sr-header">
        <div class="sr-brand">
          <div class="brand-mark">
            <Cloud :size="18" stroke-width="2" />
          </div>
          <div class="brand-text">
            <span class="brand-name">云梦</span>
            <span class="brand-divider">·</span>
            <span class="brand-sub">商家入驻</span>
          </div>
        </div>
        <div class="header-actions">
          <span class="ha-hint">已有账号？</span>
          <button class="ha-link" @click.prevent="mode = 'login'">
            登录
            <ArrowRight :size="13" stroke-width="2.5" />
          </button>
        </div>
      </header>

      <!-- ━━━ 主体：双栏 ━━━ -->
      <div class="sr-main">

        <!-- 左侧：品牌故事 -->
        <aside class="sr-hero">
          <div class="hero-content">
            <p class="hero-overline">YUNMENG MERCHANT</p>
            <h1 class="hero-title">
              让每一件好物<br />
              <span class="hero-accent">被世界看见</span>
            </h1>
            <p class="hero-desc">
              加入云梦商家体系，触达千万品质消费者。<br />
              从入驻到经营，我们全程护航。
            </p>

            <div class="hero-features">
              <div class="hf-item" v-for="f in features" :key="f.label">
                <component :is="f.icon" :size="20" stroke-width="1.5" class="hf-icon" />
                <div>
                  <p class="hf-label">{{ f.label }}</p>
                  <p class="hf-desc">{{ f.desc }}</p>
                </div>
              </div>
            </div>

            <div class="hero-stats">
              <div class="hs-item" v-for="s in stats" :key="s.label">
                <span class="hs-num">{{ s.num }}</span>
                <span class="hs-label">{{ s.label }}</span>
              </div>
            </div>
          </div>

          <div class="hero-quote">
            <Quote :size="16" stroke-width="1.5" class="quote-mark" />
            <p>云梦让我的手工皮具店从零到月销百万，只用了三个月。</p>
            <span class="quote-author">— 拾光手作 创始人</span>
          </div>
        </aside>

        <!-- 右侧：注册卡片 -->
        <div class="sr-card-wrap">
          <div class="sr-card">

            <!-- 登录/注册切换 -->
            <div class="card-tabs">
              <button
                :class="['tab-btn', { active: mode === 'login' }]"
                @click="mode = 'login'"
              >登录</button>
              <button
                :class="['tab-btn', { active: mode === 'register' }]"
                @click="mode = 'register'"
              >商家注册</button>
            </div>

            <!-- ══ 注册 Step 1：账号信息 ══ -->
            <form v-if="mode === 'register'" @submit.prevent="submitRegister" class="card-form">
              <div class="form-field">
                <label class="ff-label">手机号</label>
                <div class="ff-input-group">
                  <Phone :size="15" stroke-width="1.5" class="ff-icon" />
                  <input type="text" v-model="form.phone" placeholder="输入手机号" required />
                </div>
              </div>

              <div class="form-field">
                <label class="ff-label">验证码</label>
                <div class="ff-row">
                  <div class="ff-input-group" style="flex:1">
                    <Shield :size="15" stroke-width="1.5" class="ff-icon" />
                    <input type="text" v-model="form.code" placeholder="输入验证码" required />
                  </div>
                  <button type="button" class="btn-code" :disabled="counting > 0" @click="sendCode">
                    {{ counting > 0 ? `${counting}s` : '获取验证码' }}
                  </button>
                </div>
              </div>

              <div class="form-field">
                <label class="ff-label">设置密码</label>
                <div class="ff-input-group">
                  <Lock :size="15" stroke-width="1.5" class="ff-icon" />
                  <input
                    :type="showPwd ? 'text' : 'password'"
                    v-model="form.password"
                    placeholder="6-20位字母、数字或符号"
                    required
                  />
                  <button type="button" class="ff-eye" @click="showPwd = !showPwd">
                    <Eye v-if="!showPwd" :size="15" stroke-width="1.5" />
                    <EyeOff v-else :size="15" stroke-width="1.5" />
                  </button>
                </div>
              </div>

              <div class="form-field">
                <label class="ff-label">确认密码</label>
                <div class="ff-input-group">
                  <Lock :size="15" stroke-width="1.5" class="ff-icon" />
                  <input
                    :type="showPwd2 ? 'text' : 'password'"
                    v-model="form.password2"
                    placeholder="再次输入密码"
                    required
                  />
                  <button type="button" class="ff-eye" @click="showPwd2 = !showPwd2">
                    <Eye v-if="!showPwd2" :size="15" stroke-width="1.5" />
                    <EyeOff v-else :size="15" stroke-width="1.5" />
                  </button>
                </div>
              </div>

                            <div class="form-field">
                <label class="ff-label">昵称</label>
                <div class="ff-input-group">
                  <UserCircle :size="15" stroke-width="1.5" class="ff-icon" />
                  <input type="text" v-model="form.nickname" placeholder="您的昵称" required />
                </div>
              </div>

              <p class="form-error" v-if="pwdMismatch">两次输入的密码不一致</p>
              <p class="form-error" v-if="submitError">{{ submitError }}</p>

              <label class="form-check">
                <input type="checkbox" v-model="form.agree" required />
                <span class="check-box"></span>
                <span class="check-text">同意 <a href="#">《云梦商家入驻协议》</a> 及 <a href="#">《隐私政策》</a></span>
              </label>

              <button class="btn-submit" type="submit" :disabled="!form.agree">
                提交注册
                <ArrowRight :size="16" stroke-width="2.5" />
              </button>
            </form>

                        <!-- ══ 登录表单 ══ -->
            <form v-else @submit.prevent="handleShopLogin" class="card-form">
              <div class="form-field">
                <label class="ff-label">手机号</label>
                <div class="ff-input-group">
                  <Phone :size="15" stroke-width="1.5" class="ff-icon" />
                  <input type="text" v-model="loginForm.account" placeholder="输入手机号或邮箱" required />
                </div>
              </div>
              <div class="form-field">
                <label class="ff-label">密码</label>
                <div class="ff-input-group">
                  <Lock :size="15" stroke-width="1.5" class="ff-icon" />
                  <input
                    :type="showLoginPwd ? 'text' : 'password'"
                    v-model="loginForm.password"
                    placeholder="输入密码"
                    required
                  />
                  <button type="button" class="ff-eye" @click="showLoginPwd = !showLoginPwd">
                    <Eye v-if="!showLoginPwd" :size="15" stroke-width="1.5" />
                    <EyeOff v-else :size="15" stroke-width="1.5" />
                  </button>
                </div>
              </div>
              <p class="form-error" v-if="loginError">{{ loginError }}</p>
              <button class="btn-submit" type="submit" :disabled="loginSubmitting">
                {{ loginSubmitting ? '登录中...' : '登录' }}
                <ArrowRight :size="16" stroke-width="2.5" />
              </button>
            </form>

          </div>
        </div>

      </div>

      <!-- ━━━ 入驻流程 ━━━ -->
      <section class="process-section">
        <div class="ps-header">
          <span class="ps-overline">PROCESS</span>
          <h2 class="ps-title">入驻流程</h2>
        </div>
        <div class="ps-track">
          <template v-for="(step, idx) in processSteps" :key="step.name">
            <div class="ps-step">
              <div class="pss-num">{{ String(idx + 1).padStart(2, '0') }}</div>
              <component :is="step.icon" :size="22" stroke-width="1.5" class="pss-icon" />
              <p class="pss-name">{{ step.name }}</p>
              <p class="pss-desc" v-html="step.desc"></p>
            </div>
            <div class="ps-connector" v-if="idx < processSteps.length - 1">
              <ArrowRight :size="16" stroke-width="2" />
            </div>
          </template>
        </div>
      </section>

      <!-- ━━━ 帮助区 ━━━ -->
      <section class="help-section">
        <div class="help-grid">
          <a href="#" class="help-card" v-for="item in helpItems" :key="item.title">
            <component :is="item.icon" :size="20" stroke-width="1.5" class="hc-icon" />
            <div>
              <p class="hc-title">{{ item.title }}</p>
              <p class="hc-detail" v-if="item.link">{{ item.link }}</p>
              <p class="hc-detail highlight" v-else-if="item.phone">{{ item.phone }}</p>
              <p class="hc-time" v-if="item.time">{{ item.time }}</p>
            </div>
          </a>
        </div>
      </section>

      <!-- ━━━ 页脚 ━━━ -->
      <footer class="sr-footer">
        <div class="sf-links">
          <a href="#">关于云梦</a>
          <span class="sf-sep"></span>
          <a href="#">招商合作</a>
          <span class="sf-sep"></span>
          <a href="#">隐私政策</a>
          <span class="sf-sep"></span>
          <a href="#">用户协议</a>
        </div>
        <p class="sf-copy">© 2026 云梦 YUNMENG · 京ICP备12345678号-1</p>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Cloud, ArrowRight, ArrowLeft, Phone, Shield, Lock,
  Eye, EyeOff, Check, Upload, Store, Package,
  Building2, UserCircle, Quote, FileText, HelpCircle,
  MessageCircle, ShoppingBag, CreditCard, ClipboardList
} from 'lucide-vue-next'
import { createShop, getShopStatus } from '../api/shop'
import { sendSmsCode, shopLogin } from '../api/user'

const emit = defineEmits(['go-login', 'submit-login', 'submit-register'])
const router = useRouter()

// ═════════════ 静态数据 ═════════════
const features = [
  { icon: Shield,      label: '品质认证',   desc: '严选审核，品质背书' },
  { icon: ShoppingBag, label: '全域流量',   desc: '触达千万活跃买家' },
  { icon: CreditCard,  label: '多维扶持',   desc: '运营·培训·资金全覆盖' },
]

const stats = [
  { num: '12,000+', label: '入驻商家' },
  { num: '800万+',  label: '优质商品' },
  { num: '98.6%',   label: '用户好评率' },
]

const processSteps = [
  { icon: FileText,       name: '提交入驻资料', desc: '填写企业信息<br />提交相关资质文件' },
  { icon: Shield,         name: '平台审核',     desc: '1-3 个工作日内<br />完成资料审核' },
  { icon: ClipboardList,  name: '签署协议',     desc: '审核通过后在线<br />签署入驻协议' },
  { icon: Store,          name: '店铺开通',     desc: '缴纳保证金后<br />开通店铺权限' },
  { icon: ShoppingBag,    name: '开始经营',     desc: '店铺正式上线<br />开启云梦之旅' },
]

const helpItems = [
  { icon: FileText,      title: '入驻帮助',   link: '查看完整入驻指南 →' },
  { icon: Shield,        title: '资质要求',   link: '了解所需资质标准 →' },
  { icon: HelpCircle,    title: '常见问题',   link: '查看 FAQ 文档 →' },
  { icon: MessageCircle, title: '联系客服',   phone: '400-888-8888', time: '周一至周日 9:00-18:00' },
]

// ═════════════ 交互状态 ═════════════
const mode         = ref('register')
const showPwd      = ref(false)
const showPwd2     = ref(false)
const showLoginPwd = ref(false)
const counting     = ref(0)
const submitting   = ref(false)
const submitError  = ref('')
const loginSubmitting = ref(false)
const loginError = ref('')

const form = reactive({
  phone: '',
  code: '',
  password: '',
  password2: '',
  nickname: '',
  agree: false,
})

const loginForm = reactive({
  account: '',
  password: '',
})

const pwdMismatch = computed(() =>
  form.password2.length > 0 && form.password !== form.password2
)

// ═════════════ 方法 ═════════════
let smsTimer = null
async function sendCode() {
  if (!form.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  try {
    await sendSmsCode({ phone: form.phone })
    ElMessage.success('验证码已发送')
  } catch (err) {
    // 硬编码：验证码发送失败最常见原因就是已有账户
    ElMessage.error('验证码发送失败，该手机号可能已注册')
    return
  }
  counting.value = 60
  smsTimer = setInterval(() => {
    counting.value--
    if (counting.value <= 0) {
      clearInterval(smsTimer)
      smsTimer = null
    }
  }, 1000)
}

async function submitRegister() {
  submitError.value = ''
  if (pwdMismatch.value) {
    submitError.value = '两次输入的密码不一致'
    return
  }
  if (!form.phone) {
    submitError.value = '请输入手机号'
    return
  }
  if (!form.code) {
    submitError.value = '请输入验证码'
    return
  }
  if (!form.password) {
    submitError.value = '请输入密码'
    return
  }
  if (form.password.length < 6) {
    submitError.value = '密码至少6位'
    return
  }
  submitting.value = true
  try {
    await createShop({
      phone: form.phone,
      code: form.code,
      password: form.password,
      nickname: form.nickname,
    })
    ElMessage.success('注册成功！请登录')
    mode.value = 'login'
  } catch (e) {
    // 硬编码：注册失败最常见原因就是已有账户
    submitError.value = '注册失败，该手机号可能已注册为商家，请直接登录'
  } finally {
    submitting.value = false
  }
}

async function handleShopLogin() {
  loginError.value = ''
  if (!loginForm.account) {
    loginError.value = '请输入手机号'
    return
  }
  if (!loginForm.password) {
    loginError.value = '请输入密码'
    return
  }
  loginSubmitting.value = true
  try {
    const res = await shopLogin({
      account: loginForm.account,
      password: loginForm.password,
    })
    localStorage.setItem('token', res.token)

    try {
      const status = await getShopStatus()
      if (status.hasShop) {
        router.push('/shop/dashboard')
      } else {
        router.push('/shop/setup')
      }
    } catch {
      router.push('/shop/setup')
    }
  } catch (e) {
    loginError.value = '登录失败，请检查账号密码是否正确'
  } finally {
    loginSubmitting.value = false
  }
}

onUnmounted(() => {
  if (smsTimer) clearInterval(smsTimer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Noto+Sans+SC:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

/* ═══════════ 根变量 ═══════════ */
.sr-root {
  --bg-page:    #F7F4ED;
  --bg-card:    #FFFFFF;
  --bg-elevated:#FAF8F4;
  --bg-input:   #F5F1E8;
  --gold:       #B8860A;
  --gold-dim:   #8C6308;
  --gold-light:  #D9A53C;
  --gold-glow:  rgba(184, 134, 10, 0.12);
  --gold-soft:  rgba(184, 134, 10, 0.05);
  --text-primary:   #1A1712;
  --text-secondary: #5C5546;
  --text-tertiary:  #9B9484;
  --border:     #E0D8C4;
  --border-light:#EDE7D6;
  --error:      #C0392B;
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  18px;
  --radius-xl:  24px;

  min-height: 100vh;
  background: var(--bg-page);
  font-family: 'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  position: relative;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

/* ═══════════ 背景氛围 ═══════════ */
.bg-ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.bg-orb {
  position: absolute; border-radius: 50%;
  filter: blur(120px); opacity: 0.12;
}
.orb-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, var(--gold) 0%, transparent 70%);
  top: -200px; right: -150px;
}
.orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(201,160,84,0.5) 0%, transparent 70%);
  bottom: 10%; left: -100px;
  opacity: 0.06;
}
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 64px 64px;
}

.sr-container {
  position: relative; z-index: 1;
  max-width: 1280px; margin: 0 auto;
  padding: 0 32px;
}

/* ═══════════ 顶栏 ═══════════ */
.sr-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 28px 0 20px;
}
.sr-brand { display: flex; align-items: center; gap: 12px; }
.brand-mark {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, var(--gold-dim), var(--gold));
  display: flex; align-items: center; justify-content: center;
  color: #FFFFFF;
}
.brand-text { display: flex; align-items: baseline; gap: 6px; }
.brand-name { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; letter-spacing: 0.02em; }
.brand-divider { color: var(--gold); font-weight: 300; }
.brand-sub { font-size: 13px; color: var(--text-secondary); font-weight: 300; letter-spacing: 0.05em; }

.header-actions { display: flex; align-items: center; gap: 10px; }
.ha-hint { font-size: 13px; color: var(--text-tertiary); }
.ha-link {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid var(--border-light);
  color: var(--gold); font-family: inherit; font-size: 13px; font-weight: 500;
  padding: 7px 16px; border-radius: 100px; cursor: pointer;
  transition: all .2s;
}
.ha-link:hover { background: var(--gold-soft); border-color: var(--gold-dim); }

/* ═══════════ 主体双栏 ═══════════ */
.sr-main {
  display: grid; grid-template-columns: 1fr 440px;
  gap: 48px; align-items: flex-start;
  margin-top: 16px;
}

/* ── 左侧 Hero ── */
.sr-hero {
  padding-top: 32px;
  display: flex; flex-direction: column;
  min-height: 620px; justify-content: space-between;
}
.hero-overline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.2em;
  color: var(--gold-dim); margin-bottom: 20px;
}
.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 48px; font-weight: 600; line-height: 1.2;
  letter-spacing: -0.01em; margin-bottom: 20px;
}
.hero-accent { color: var(--gold); font-style: italic; }
.hero-desc {
  font-size: 15px; color: var(--text-secondary); line-height: 1.8;
  margin-bottom: 40px; font-weight: 300;
}

.hero-features { display: flex; flex-direction: column; gap: 20px; margin-bottom: 48px; }
.hf-item { display: flex; align-items: flex-start; gap: 14px; }
.hf-icon { color: var(--gold); flex-shrink: 0; margin-top: 2px; }
.hf-label { font-size: 14px; font-weight: 500; margin-bottom: 2px; }
.hf-desc { font-size: 12.5px; color: var(--text-tertiary); }

.hero-stats {
  display: flex; gap: 48px;
  padding-top: 28px; border-top: 1px solid var(--border);
}
.hs-item { display: flex; flex-direction: column; gap: 4px; }
.hs-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 26px; font-weight: 500; color: var(--gold);
  letter-spacing: -0.02em;
}
.hs-label { font-size: 12px; color: var(--text-tertiary); }

.hero-quote {
  margin-top: 20px;
  padding: 18px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: 10px;
}
.quote-mark { color: var(--gold-dim); flex-shrink: 0; margin-top: 1px; }
.hero-quote p { font-size: 13px; color: var(--text-secondary); line-height: 1.7; font-style: italic; flex: 1; }
.quote-author { font-size: 11.5px; color: var(--text-tertiary); width: 100%; padding-left: 26px; }

/* ── 右侧卡片 ── */
.sr-card-wrap { position: sticky; top: 28px; }
.sr-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 32px 30px 30px;
  box-shadow: 0 20px 60px -20px rgba(140,99,8,0.08), 0 0 0 1px var(--border);
}

.card-tabs {
  display: flex; gap: 4px;
  background: var(--bg-input);  border-radius: var(--radius-md); padding: 4px;
  margin-bottom: 28px;
}
.tab-btn {
  flex: 1; padding: 10px 0; border: none; border-radius: 10px;
  background: transparent; color: var(--text-tertiary);
  font-family: inherit; font-size: 13.5px; font-weight: 500;
  cursor: pointer; transition: all .2s;
}
.tab-btn.active {
  background: var(--bg-elevated);
  color: var(--gold);
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

/* ── 步骤指示器 ── */
.step-indicator {
  display: flex; align-items: center;
  margin-bottom: 28px; padding: 0 4px;
}
.si-step { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.si-dot {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-input); color: var(--text-tertiary);
  border: 1px solid var(--border);
  transition: all .25s;
}
.si-step.active .si-dot {
  background: var(--gold); color: #FFFFFF; border-color: var(--gold);
  box-shadow: 0 0 20px var(--gold-glow);
}
.si-step.done .si-dot {
  background: var(--gold-dim); color: #FFFFFF; border-color: var(--gold-dim);
}
.si-label {
  font-size: 11px; color: var(--text-tertiary); white-space: nowrap;
  transition: color .25s;
}
.si-step.active .si-label { color: var(--gold); font-weight: 600; }
.si-step.done .si-label { color: var(--gold-dim); }
.si-line { flex: 1; height: 1px; background: var(--border); margin: 0 6px 24px; }

/* ── 表单 ── */
.card-form { display: flex; flex-direction: column; gap: 18px; }

.form-field { display: flex; flex-direction: column; gap: 7px; }
.ff-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.03em; text-transform: uppercase; }

.ff-input-group {
  position: relative; display: flex; align-items: center;
}
.ff-icon {
  position: absolute; left: 14px; color: var(--text-tertiary);
  pointer-events: none;
}
.ff-input-group input,
.ff-input-group select {
  width: 100%; padding: 12px 14px 12px 40px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary); font-family: inherit;
  font-size: 13.5px; outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.ff-input-group input::placeholder { color: var(--text-tertiary); }
.ff-input-group input:focus,
.ff-input-group select:focus {
  border-color: var(--gold-dim);
  box-shadow: 0 0 0 3px var(--gold-soft);
}
.ff-input-group select {
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B8878' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 14px center;
}

.ff-row { display: flex; gap: 10px; }
.ff-eye {
  position: absolute; right: 12px;
  background: none; border: none; color: var(--text-tertiary);
  cursor: pointer; display: flex; align-items: center; padding: 2px;
}
.ff-eye:hover { color: var(--text-primary); }

.btn-code {
  flex-shrink: 0; padding: 0 16px;
  border: 1px solid var(--gold-dim); border-radius: var(--radius-sm);
  background: var(--gold-soft); color: var(--gold);
  font-family: inherit; font-size: 12.5px; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: all .2s;
}
.btn-code:hover:not(:disabled) { background: rgba(184,134,10,0.1); }
.btn-code:disabled { border-color: var(--border); color: var(--text-tertiary); background: transparent; cursor: default; }

.form-error { font-size: 12px; color: var(--error); margin-top: -8px; }

.form-check {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 12px; color: var(--text-tertiary); line-height: 1.6;
  cursor: pointer; user-select: none;
}
.form-check input { display: none; }
.check-box {
  width: 16px; height: 16px; flex-shrink: 0;
  border: 1.5px solid var(--border-light); border-radius: 4px;
  margin-top: 1px; transition: all .2s;
  display: flex; align-items: center; justify-content: center;
}
.form-check input:checked + .check-box {
  background: var(--gold); border-color: var(--gold);
}
.form-check input:checked + .check-box::after {
  content: ''; width: 5px; height: 9px;
  border: 2px solid #FFFFFF;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translateY(-1px);
}
.check-text a { color: var(--gold); text-decoration: none; }
.check-text a:hover { text-decoration: underline; }

.btn-submit {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 13px;
  border: none; border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--gold-dim), var(--gold));
  color: #FFFFFF; font-family: inherit; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all .2s;
}
.btn-submit:hover:not(:disabled) {
  box-shadow: 0 8px 30px var(--gold-glow);
  transform: translateY(-1px);
}
.btn-submit:disabled { opacity: 0.4; cursor: default; filter: grayscale(0.5); }

.form-nav { display: flex; gap: 12px; }
.btn-back {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 13px; border: 1px solid var(--border-light); border-radius: var(--radius-sm);
  background: var(--bg-card); color: var(--text-secondary);
  font-family: inherit; font-size: 13.5px; font-weight: 500;
  cursor: pointer; transition: all .2s;
}.btn-back:hover { border-color: var(--text-tertiary); color: var(--text-primary); }

/* ── 商家类型选择 ── */
.type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.type-card {  position: relative; padding: 20px 16px;  border: 1.5px solid var(--border); border-radius: var(--radius-md);  cursor: pointer; transition: all .25s; text-align: center;  background: var(--bg-input);}
.type-card:hover { border-color: var(--border-light); background: var(--bg-elevated); }
.type-card.selected {
  border-color: var(--gold-dim);
  background: var(--gold-soft);
}
.tc-icon { color: var(--text-tertiary); margin-bottom: 10px; transition: color .25s; }
.type-card.selected .tc-icon { color: var(--gold); }
.tc-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.tc-desc { font-size: 11.5px; color: var(--text-tertiary); }
.tc-check {
  position: absolute; top: 12px; right: 12px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--gold); color: #FFFFFF;
  display: flex; align-items: center; justify-content: center;
}

/* ── 上传区 ── */
.upload-zone {  border: 1.5px dashed var(--border); border-radius: var(--radius-md);  padding: 28px 16px; text-align: center;  background: var(--bg-input);  cursor: pointer; transition: all .2s;}
.upload-zone:hover { border-color: var(--gold-dim); background: var(--gold-soft); }
.uz-icon { color: var(--text-tertiary); margin-bottom: 10px; }
.uz-main { font-size: 13px; font-weight: 500; margin-bottom: 4px; }
.uz-sub { font-size: 11.5px; color: var(--text-tertiary); }

/* ═══════════ 入驻流程 ═══════════ */
.process-section { margin-top: 80px; padding: 48px 0 32px; }
.ps-header { text-align: center; margin-bottom: 44px; }
.ps-overline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.25em;
  color: var(--gold-dim); display: block; margin-bottom: 12px;
}
.ps-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px; font-weight: 600; letter-spacing: -0.01em;
}

.ps-track { display: flex; align-items: flex-start; justify-content: center; gap: 0; }
.ps-step { flex: 0 0 160px; text-align: center; }
.pss-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px; font-weight: 500; color: var(--gold-dim);
  margin-bottom: 12px; letter-spacing: 0.03em;
}
.pss-icon { color: var(--text-tertiary); margin-bottom: 14px; }
.pss-name { font-size: 14.5px; font-weight: 600; margin-bottom: 6px; }
.pss-desc {
  font-size: 12px; color: var(--text-tertiary); line-height: 1.7;
}

.ps-connector {
  flex: 0 0 48px; display: flex; align-items: center; justify-content: center;
  color: var(--border-light); margin-top: 18px;
}

/* ═══════════ 帮助区 ═══════════ */
.help-section { margin-top: 48px; padding-bottom: 40px; }
.help-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 2px;
}
.help-card {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 22px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  text-decoration: none; color: inherit;
  transition: all .2s;
}
.help-card:first-child { border-radius: var(--radius-md) 0 0 var(--radius-md); }
.help-card:last-child { border-radius: 0 var(--radius-md) var(--radius-md) 0; }
.help-card:hover { background: var(--bg-elevated); border-color: var(--border-light); }
.hc-icon { color: var(--gold-dim); flex-shrink: 0; margin-top: 1px; }
.hc-title { font-size: 13.5px; font-weight: 600; margin-bottom: 4px; }
.hc-detail { font-size: 12px; color: var(--text-tertiary); }
.hc-detail.highlight {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px; color: var(--gold); font-weight: 500;
}
.hc-time { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }

/* ═══════════ 页脚 ═══════════ */
.sr-footer {
  text-align: center; padding: 28px 0 36px;
  border-top: 1px solid var(--border);
}
.sf-links {
  display: flex; align-items: center; justify-content: center; gap: 0;
  margin-bottom: 12px;
}
.sf-links a {
  font-size: 12.5px; color: var(--text-tertiary);
  text-decoration: none; padding: 0 16px; transition: color .2s;
}
.sf-links a:hover { color: var(--gold); }
.sf-sep { width: 1px; height: 12px; background: var(--border); }
.sf-copy { font-size: 11px; color: var(--text-tertiary); }

/* ═══════════ 响应式 ═══════════ */
@media (max-width: 1024px) {
  .sr-main { grid-template-columns: 1fr; }
  .sr-hero { min-height: auto; padding-bottom: 40px; }
  .hero-title { font-size: 36px; }
  .sr-card-wrap { position: static; }
  .help-grid { grid-template-columns: repeat(2, 1fr); }
  .help-card:first-child,
  .help-card:last-child { border-radius: 0; }
  .ps-track { flex-wrap: wrap; gap: 24px; justify-content: flex-start; }
  .ps-step { flex: 0 0 calc(33.33% - 16px); }
  .ps-connector { display: none; }
}

@media (max-width: 640px) {
  .sr-container { padding: 0 16px; }
  .sr-main { gap: 24px; }
  .hero-title { font-size: 28px; }
  .hero-stats { gap: 24px; flex-wrap: wrap; }
  .help-grid { grid-template-columns: 1fr; }
  .ps-step { flex: 0 0 calc(50% - 12px); }
  .type-grid { grid-template-columns: 1fr; }
}
</style>
