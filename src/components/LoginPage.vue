<template>
  <div class="login-fullscreen">

    <!-- 左侧品牌区 -->
    <div class="login-left">
      <div class="brand-logo">
        <svg viewBox="0 0 40 40" width="38" height="38" fill="none">
          <rect width="40" height="40" rx="10" fill="#1D1D1F"/>
          <path d="M10 26 Q20 12 30 26" stroke="#C9B89A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <circle cx="20" cy="18" r="3" fill="#C9B89A"/>
        </svg>
        <div class="brand-text">
          <span class="brand-zh">云梦商城</span>
          <span class="brand-en">YUNMENG MALL</span>
        </div>
      </div>

      <div class="brand-hero">
        <h1 class="brand-headline">
          <span class="line-1">探索全球</span>
          <span class="line-2">好物世界</span>
        </h1>
        <p class="brand-desc">数百万件正品好物，AI 智能推荐，专属优惠等你来领</p>
      </div>

      <div class="privilege-list">
        <div class="priv-item" v-for="p in privileges" :key="p.title">
          <div class="priv-icon">{{ p.icon }}</div>
          <div class="priv-info">
            <strong>{{ p.title }}</strong>
            <span>{{ p.desc }}</span>
          </div>
        </div>
      </div>

      <div class="brand-stats">
        <div class="stat" v-for="s in stats" :key="s.label">
          <span class="stat-num">{{ s.num }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>

      <div class="brand-copy">© 2026 云梦商城 · 版权所有</div>
    </div>

    <!-- 右侧表单区 -->
    <div class="login-right">
      <div class="form-card">

        <!-- Tab -->
        <div class="tab-bar">
          <button :class="['tab', { active: activeTab==='login' }]" @click="switchTab('login')">登录</button>
          <button :class="['tab', { active: activeTab==='register' }]" @click="switchTab('register')">注册</button>
          <div class="tab-indicator" :style="{ left: activeTab==='login' ? '0%' : '50%' }"></div>
        </div>

        <!-- ─── 登录面板 ─── -->
        <div v-if="activeTab==='login'" class="panel">
          <div class="login-modes">
            <button :class="['mode-btn', { active: loginMode==='password' }]" @click="loginMode='password'">账号密码</button>
            <button :class="['mode-btn', { active: loginMode==='sms' }]" @click="loginMode='sms'">短信验证</button>
            <button :class="['mode-btn', { active: loginMode==='qr' }]" @click="loginMode='qr'">扫码登录</button>
          </div>

          <!-- 账号密码 -->
          <form v-if="loginMode==='password'" @submit.prevent="handleLogin" class="login-form">
            <div class="field-group">
              <label>手机号 / 邮箱</label>
              <div class="input-box" :class="{ focused: focus.account }">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input v-model="loginForm.account" type="text" placeholder="请输入手机号或邮箱"
                  @focus="focus.account=true" @blur="focus.account=false" />
              </div>
            </div>
            <div class="field-group">
              <label>密码</label>
              <div class="input-box" :class="{ focused: focus.password }">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input v-model="loginForm.password" :type="showPwd ? 'text' : 'password'" placeholder="请输入密码"
                  @focus="focus.password=true" @blur="focus.password=false" />
                <button type="button" class="eye-btn" @click="showPwd=!showPwd">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
                    <path v-if="showPwd" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle v-if="showPwd" cx="12" cy="12" r="3"/>
                    <path v-if="!showPwd" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line v-if="!showPwd" x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-options">
              <label class="check-label">
                <input v-model="loginForm.remember" type="checkbox" class="check-input" />
                <span class="check-box"></span>
                <span>记住我</span>
              </label>
              <a href="#" class="forgot-link">忘记密码？</a>
            </div>
            <button type="submit" class="submit-btn">
              <span>立即登录</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <!-- 短信验证 -->
          <form v-if="loginMode==='sms'" @submit.prevent="handleLogin" class="login-form">
            <div class="field-group">
              <label>手机号</label>
              <div class="input-box" :class="{ focused: focus.phone }">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.7a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input v-model="smsForm.phone" type="tel" placeholder="请输入手机号"
                  @focus="focus.phone=true" @blur="focus.phone=false" />
              </div>
            </div>
            <div class="field-group">
              <label>验证码</label>
              <div class="input-box sms-box" :class="{ focused: focus.smsCode }">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <input v-model="smsForm.code" type="text" placeholder="6位验证码" maxlength="6"
                  @focus="focus.smsCode=true" @blur="focus.smsCode=false" />
                <button type="button" class="sms-send-btn" :disabled="smsCountdown>0" @click="sendSms">
                  {{ smsCountdown > 0 ? `${smsCountdown}s 后重发` : '获取验证码' }}
                </button>
              </div>
            </div>
            <button type="submit" class="submit-btn">
              <span>登录</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <!-- 扫码 -->
          <div v-if="loginMode==='qr'" class="qr-panel">
            <div class="qr-platform-tabs">
              <button :class="['qr-tab', { active: qrPlatform==='wechat' }]" @click="qrPlatform='wechat'">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#07c160"><path d="M8.69 11.51c-.47 0-.85-.37-.85-.84s.38-.84.85-.84.85.37.85.84-.38.84-.85.84zm4.77 0c-.47 0-.85-.37-.85-.84s.38-.84.85-.84.85.37.85.84-.38.84-.85.84zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
                微信登录
              </button>
              <button :class="['qr-tab', { active: qrPlatform==='alipay' }]" @click="qrPlatform='alipay'">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#1677ff"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="10" fill="white" font-weight="bold">支</text></svg>
                支付宝登录
              </button>
            </div>
            <div class="qr-box">
              <div class="qr-inner" :class="{ expired: qrExpired }">
                <svg class="qr-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <rect width="200" height="200" fill="white" rx="8"/>
                  <rect x="10" y="10" width="56" height="56" fill="none" stroke="#1D1D1F" stroke-width="6" rx="4"/>
                  <rect x="22" y="22" width="32" height="32" fill="#1D1D1F" rx="2"/>
                  <rect x="134" y="10" width="56" height="56" fill="none" stroke="#1D1D1F" stroke-width="6" rx="4"/>
                  <rect x="146" y="22" width="32" height="32" fill="#1D1D1F" rx="2"/>
                  <rect x="10" y="134" width="56" height="56" fill="none" stroke="#1D1D1F" stroke-width="6" rx="4"/>
                  <rect x="22" y="146" width="32" height="32" fill="#1D1D1F" rx="2"/>
                  <g fill="#1D1D1F">
                    <rect x="80" y="10" width="8" height="8" rx="1"/><rect x="96" y="10" width="8" height="8" rx="1"/>
                    <rect x="112" y="10" width="8" height="8" rx="1"/><rect x="80" y="26" width="8" height="8" rx="1"/>
                    <rect x="80" y="42" width="8" height="8" rx="1"/><rect x="96" y="42" width="8" height="8" rx="1"/>
                    <rect x="10" y="80" width="8" height="8" rx="1"/><rect x="26" y="80" width="8" height="8" rx="1"/>
                    <rect x="80" y="80" width="8" height="8" rx="1"/><rect x="96" y="80" width="8" height="8" rx="1"/>
                    <rect x="112" y="80" width="8" height="8" rx="1"/><rect x="152" y="80" width="8" height="8" rx="1"/>
                    <rect x="10" y="96" width="8" height="8" rx="1"/><rect x="80" y="96" width="8" height="8" rx="1"/>
                    <rect x="144" y="96" width="8" height="8" rx="1"/><rect x="96" y="112" width="8" height="8" rx="1"/>
                    <rect x="80" y="134" width="8" height="8" rx="1"/><rect x="112" y="134" width="8" height="8" rx="1"/>
                    <rect x="144" y="134" width="8" height="8" rx="1"/><rect x="176" y="134" width="8" height="8" rx="1"/>
                    <rect x="80" y="150" width="8" height="8" rx="1"/><rect x="80" y="166" width="8" height="8" rx="1"/>
                    <rect x="96" y="166" width="8" height="8" rx="1"/><rect x="128" y="166" width="8" height="8" rx="1"/>
                  </g>
                  <rect x="86" y="86" width="28" height="28" fill="white" rx="4"/>
                  <rect x="90" y="90" width="20" height="20" rx="3" :fill="qrPlatform==='wechat' ? '#07c160' : '#1677ff'"/>
                  <text x="100" y="104" text-anchor="middle" font-size="10" fill="white" font-weight="bold">{{ qrPlatform==='wechat' ? '微' : '支' }}</text>
                </svg>
                <div v-if="qrExpired" class="qr-mask">
                  <div class="qr-mask-inner">
                    <p>二维码已失效</p>
                    <button @click="refreshQr" class="qr-refresh">点击刷新</button>
                  </div>
                </div>
              </div>
              <div class="qr-bar" :class="qrPlatform">
                <span v-if="qrPlatform==='wechat'">请使用微信 App 扫描</span>
                <span v-else>请使用支付宝 App 扫描</span>
              </div>
            </div>
            <p class="qr-tip">二维码有效期 <span class="qr-count">{{ qrTimer }}s</span>，过期后请刷新</p>
          </div>

          <!-- 其他登录方式 -->
          <div v-if="loginMode!=='qr'" class="divider"><span>其他登录方式</span></div>
          <div v-if="loginMode!=='qr'" class="quick-login">
            <button class="quick-btn" @click="loginMode='qr'; qrPlatform='wechat'">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#07c160"><path d="M8.69 11.51c-.47 0-.85-.37-.85-.84s.38-.84.85-.84.85.37.85.84-.38.84-.85.84zm4.77 0c-.47 0-.85-.37-.85-.84s.38-.84.85-.84.85.37.85.84-.38.84-.85.84zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
              微信扫码
            </button>
            <button class="quick-btn" @click="loginMode='qr'; qrPlatform='alipay'">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#1677ff"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="9" fill="white" font-weight="bold">支</text></svg>
              支付宝扫码
            </button>
          </div>
        </div>

        <!-- ─── 注册面板 ─── -->
        <div v-if="activeTab==='register'" class="panel">
          <p class="panel-desc">使用手机号注册，立享新人专属优惠</p>
          <form @submit.prevent="handleRegister" class="login-form">
            <div class="field-group">
              <label>手机号</label>
              <div class="input-box" :class="{ focused: focus.regPhone }">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.7a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <input v-model="regForm.phone" type="tel" placeholder="+86 手机号"
                  @focus="focus.regPhone=true" @blur="focus.regPhone=false" />
              </div>
            </div>
            <div class="field-group">
              <label>验证码</label>
              <div class="input-box sms-box" :class="{ focused: focus.regCode }">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <input v-model="regForm.code" type="text" placeholder="6位短信验证码" maxlength="6"
                  @focus="focus.regCode=true" @blur="focus.regCode=false" />
                <button type="button" class="sms-send-btn" :disabled="regCountdown>0" @click="sendRegSms">
                  {{ regCountdown > 0 ? `${regCountdown}s 后重发` : '发送验证码' }}
                </button>
              </div>
            </div>
            <div class="field-group">
              <label>设置密码</label>
              <div class="input-box" :class="{ focused: focus.regPwd }">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input v-model="regForm.password" :type="showRegPwd ? 'text' : 'password'" placeholder="8位以上，含字母和数字"
                  @focus="focus.regPwd=true" @blur="focus.regPwd=false" />
                <button type="button" class="eye-btn" @click="showRegPwd=!showRegPwd">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16">
                    <path v-if="showRegPwd" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle v-if="showRegPwd" cx="12" cy="12" r="3"/>
                    <path v-if="!showRegPwd" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line v-if="!showRegPwd" x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <div class="pwd-strength" v-if="regForm.password">
                <div class="strength-bars">
                  <span :class="['bar', { active: pwdStrength>=1, strong: pwdStrength>=3 }]"></span>
                  <span :class="['bar', { active: pwdStrength>=2, strong: pwdStrength>=3 }]"></span>
                  <span :class="['bar', { active: pwdStrength>=3 }]"></span>
                </div>
                <span class="strength-label">{{ pwdStrengthLabel }}</span>
              </div>
            </div>
            <div class="field-group">
              <label>昵称 <span class="optional-tag">选填</span></label>
              <div class="input-box" :class="{ focused: focus.nickname }">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input v-model="regForm.nickname" type="text" placeholder="你的云梦昵称"
                  @focus="focus.nickname=true" @blur="focus.nickname=false" />
              </div>
            </div>
            <label class="agree-label">
              <input v-model="regForm.agree" type="checkbox" class="check-input" />
              <span class="check-box"></span>
              <span>我已阅读并同意 <a href="#" class="link">《用户协议》</a> 和 <a href="#" class="link">《隐私政策》</a></span>
            </label>
            <div class="new-perk">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9B89A" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              注册成功即送 <strong>50元</strong> 新人券 + <strong>30天</strong> 会员体验
            </div>
            <button type="submit" class="submit-btn" :disabled="!regForm.agree">
              <span>立即注册</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>
        </div>

        <div class="card-footer">
          <a href="#" class="footer-link">隐私政策</a>
          <span>·</span>
          <a href="#" class="footer-link">用户协议</a>
          <span>·</span>
          <a href="#" class="footer-link">帮助中心</a>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import router from '@/router'
import { ref, reactive, computed, onUnmounted } from 'vue'

const activeTab  = ref('login')
const switchTab  = (t) => { activeTab.value = t }
const loginMode  = ref('password')
const qrPlatform = ref('wechat')
const showPwd    = ref(false)
const showRegPwd = ref(false)

const focus = reactive({
  account:false, password:false, phone:false, smsCode:false,
  regPhone:false, regCode:false, regPwd:false, nickname:false
})
const loginForm = reactive({ account:'', password:'', remember:false })
const smsForm   = reactive({ phone:'', code:'' })
const regForm   = reactive({ phone:'', code:'', password:'', nickname:'', agree:false })

const smsCountdown = ref(0)
const regCountdown = ref(0)
let smsTimer=null, regTimer=null

const sendSms = () => {
  if (!smsForm.phone) return alert('请输入手机号')
  smsCountdown.value = 60
  smsTimer = setInterval(() => { smsCountdown.value--; if(smsCountdown.value<=0) clearInterval(smsTimer) }, 1000)
}
const sendRegSms = () => {
  if (!regForm.phone) return alert('请输入手机号')
  regCountdown.value = 60
  regTimer = setInterval(() => { regCountdown.value--; if(regCountdown.value<=0) clearInterval(regTimer) }, 1000)
}

const pwdStrength = computed(() => {
  const p = regForm.password; if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Za-z]/.test(p) && /\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})
const pwdStrengthLabel = computed(() => ['','弱','中','强'][pwdStrength.value])

const qrTimer   = ref(120)
const qrExpired = ref(false)
let qrInterval = setInterval(() => { qrTimer.value--; if(qrTimer.value<=0){qrExpired.value=true;clearInterval(qrInterval)} }, 1000)
const refreshQr = () => {
  qrTimer.value=120; qrExpired.value=false; clearInterval(qrInterval)
  qrInterval = setInterval(() => { qrTimer.value--; if(qrTimer.value<=0){qrExpired.value=true;clearInterval(qrInterval)} }, 1000)
}

const privileges = [
  { icon:'🛡️', title:'正品保障', desc:'官方授权，假一赔十' },
  { icon:'✈️', title:'全球直邮', desc:'1000+ 海外品牌直达' },
  { icon:'🎁', title:'会员特权', desc:'专属券、积分、生日礼遇' }
]
const stats = [
  { num:'1200万+', label:'注册用户' },
  { num:'800万+',  label:'优质商品' },
  { num:'98.6%',   label:'好评率' }
]

const handleLogin    = () => { router.push('/home') }
const handleRegister = () => { console.log('注册', regForm) }

onUnmounted(() => { clearInterval(smsTimer); clearInterval(regTimer); clearInterval(qrInterval) })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@200;300;400;500&display=swap');

/* ══ 变量 ══ */
:root {
  --bg:            #FFFFFF;
  --bg-soft:       #F0EDE8;   /* 输入框背景，比白色明显深一档 */
  --bg-warm:       #2A2420;   /* 左侧深色背景 */
  --border:        #C4BAB0;   /* 明显可见的边框色 */
  --border-strong: #9A8F85;
  --text:          #1D1D1F;
  --text2:         #3C3632;
  --text3:         #7A726C;
  --accent:        #C9B89A;
  --accent-dark:   #A8936E;   /* 左侧使用，深背景下更亮 */
  --accent2:       #6B9488;
  --warm:          #C9784A;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.login-fullscreen {
  position: fixed; inset: 0;
  display: flex;
  font-family: 'Noto Sans SC', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ══ 左侧：深色沉稳 ══ */
.login-left {
  width: 50%; height: 100%;
  padding: 52px 56px;
  display: flex; flex-direction: column; gap: 44px;
  background: var(--bg-warm);   /* 深色 */
  border-right: 1px solid #3D3530;
  overflow: hidden; position: relative;
}

.login-left::before {
  content: '';
  position: absolute; right: -100px; top: -100px;
  width: 380px; height: 380px; border-radius: 50%;
  background: radial-gradient(circle, rgba(201,184,154,0.12) 0%, transparent 65%);
  pointer-events: none;
}
.login-left::after {
  content: '';
  position: absolute; left: -60px; bottom: -60px;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(201,120,74,0.08) 0%, transparent 65%);
  pointer-events: none;
}

.brand-logo { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.brand-text  { display: flex; flex-direction: column; }
.brand-zh { font-size: 16px; font-weight: 400; letter-spacing: 2px; color: #F0EAE0; }
.brand-en { font-size: 9px;  font-weight: 300; letter-spacing: 4px; color: #7A6F65; margin-top: 3px; }

.brand-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.brand-headline {
  display: flex; flex-direction: column;
  font-size: clamp(36px, 4vw, 56px); font-weight: 200;
  line-height: 1.15; letter-spacing: -1px; margin-bottom: 18px;
}
.line-1 { color: #EDE5D8; }
.line-2 { color: var(--accent); }
.brand-desc { font-size: 14px; color: #9A9189; line-height: 1.75; font-weight: 300; max-width: 320px; }

.privilege-list { display: flex; flex-direction: column; gap: 18px; }
.priv-item { display: flex; align-items: center; gap: 14px; }
.priv-icon {
  width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.priv-info strong { display: block; font-size: 13px; color: #EDE5D8; font-weight: 500; margin-bottom: 2px; }
.priv-info span   { font-size: 12px; color: #7A6F65; font-weight: 300; }

.brand-stats {
  display: flex; gap: 0;
  border-top: 1px solid #3D3530; padding-top: 24px;
}
.stat {
  flex: 1; display: flex; flex-direction: column; gap: 4px;
  border-right: 1px solid #3D3530; padding-left: 16px;
}
.stat:first-child { padding-left: 0; }
.stat:last-child  { border-right: none; }
.stat-num   { font-size: 20px; font-weight: 500; color: var(--accent); letter-spacing: -0.5px; }
.stat-label { font-size: 11px; color: #7A6F65; font-weight: 300; }

.brand-copy { font-size: 11px; color: #4A4440; font-weight: 300; letter-spacing: 1px; }

/* ══ 右侧：白色干净 ══ */
.login-right {
  width: 50%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 40px; background: #FAFAF9;
  overflow-y: auto;
}

.form-card {
  width: 100%; max-width: 420px;
  background: #FFFFFF;
  border: 1.5px solid var(--border);
  border-radius: 20px; padding: 36px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05);
}

/* ══ Tab ══ */
.tab-bar {
  display: flex; position: relative;
  background: var(--bg-soft);
  border: 1.5px solid var(--border);
  border-radius: 10px; padding: 4px; margin-bottom: 26px;
}
.tab {
  flex: 1; padding: 9px; border: none; background: none;
  font-family: inherit; font-size: 14px; font-weight: 300;
  color: var(--text3); cursor: pointer; border-radius: 7px;
  transition: color 0.2s; position: relative; z-index: 1;
}
.tab.active { color: var(--text); font-weight: 500; }
.tab-indicator {
  position: absolute; top: 4px; bottom: 4px; width: 50%;
  background: #FFFFFF; border-radius: 7px;
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 6px rgba(0,0,0,0.07);
  transition: left 0.25s cubic-bezier(0.4,0,0.2,1);
}

/* ══ 登录模式 ══ */
.login-modes { display: flex; gap: 6px; margin-bottom: 22px; }
.mode-btn {
  flex: 1; padding: 8px 4px;
  background: none; border: 1.5px solid var(--border);
  color: var(--text3); font-family: inherit; font-size: 12px; font-weight: 300;
  border-radius: 8px; cursor: pointer; transition: 0.2s; white-space: nowrap;
}
.mode-btn:hover { border-color: var(--border-strong); color: var(--text2); }
.mode-btn.active {
  background: #FBF8F4; border-color: var(--accent-dark);
  color: var(--text); font-weight: 500;
}

.panel-desc { font-size: 13px; color: var(--text3); margin-bottom: 22px; line-height: 1.6; font-weight: 300; }

/* ══ 表单 ══ */
.login-form { display: flex; flex-direction: column; gap: 16px; }
.field-group { display: flex; flex-direction: column; gap: 7px; }
.field-group label {
  font-size: 13px; color: var(--text2); font-weight: 500;
  display: flex; align-items: center; gap: 6px; letter-spacing: 0.3px;
}
.optional-tag {
  font-size: 10px; color: var(--text3); font-weight: 300;
  background: var(--bg-soft); padding: 1px 6px; border-radius: 4px;
  border: 1px solid var(--border);
}

.input-box {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg-soft);
  border: 1.5px solid var(--border);
  border-radius: 10px; padding: 0 13px; transition: 0.2s;
}
.input-box.focused {
  border-color: var(--accent-dark);
  background: #FEFCF9;
  box-shadow: 0 0 0 3px rgba(168,147,110,0.15);
}
.field-icon { width: 15px; height: 15px; color: var(--text3); flex-shrink: 0; }
.input-box input {
  flex: 1; background: none; border: none; outline: none;
  color: var(--text); font-family: inherit; font-size: 14px; font-weight: 400;
  padding: 12px 0;
}
.input-box input::placeholder { color: var(--text3); font-weight: 300; }
.eye-btn {
  background: none; border: none; color: var(--text3);
  cursor: pointer; padding: 4px; display: flex; align-items: center; transition: 0.2s;
}
.eye-btn:hover { color: var(--text2); }

.sms-box { padding-right: 6px; }
.sms-send-btn {
  flex-shrink: 0; padding: 7px 12px; border-radius: 7px;
  background: #FBF8F4; border: 1.5px solid var(--border);
  color: var(--text2); font-family: inherit; font-size: 12px; font-weight: 400;
  cursor: pointer; white-space: nowrap; transition: 0.2s;
}
.sms-send-btn:hover:not(:disabled) { border-color: var(--accent-dark); color: var(--text); }
.sms-send-btn:disabled { opacity: 0.45; cursor: default; }

.form-options { display: flex; justify-content: space-between; align-items: center; }
.check-label, .agree-label {
  display: flex; align-items: flex-start; gap: 8px;
  cursor: pointer; font-size: 13px; color: var(--text2); font-weight: 300;
}
.check-input { display: none; }
.check-box {
  width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px;
  border-radius: 4px; border: 1.5px solid var(--border-strong);
  background: transparent; transition: 0.2s; position: relative;
}
.check-input:checked + .check-box { background: var(--text); border-color: var(--text); }
.check-input:checked + .check-box::after {
  content: '✓'; position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: #fff; font-weight: 700;
}
.forgot-link { font-size: 12px; color: var(--text3); text-decoration: none; transition: 0.2s; }
.forgot-link:hover { color: var(--text); }
.link { color: var(--text); text-decoration: underline; text-underline-offset: 2px; font-weight: 400; }

/* ══ 提交按钮：始终深色，不依赖状态 ══ */
.submit-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 13px;
  background: #1D1D1F;   /* 始终深色，不再淡出 */
  border: none; border-radius: 10px;
  color: #fff; font-family: inherit; font-size: 14px; font-weight: 400;
  letter-spacing: 1px; cursor: pointer; transition: 0.25s;
  margin-top: 4px;
}
.submit-btn:hover {
  background: #2A2420;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.20);
}
.submit-btn:disabled {
  background: #BFBAB5;   /* disabled 变灰，而不是透明 */
  cursor: not-allowed; transform: none; box-shadow: none;
}

/* 密码强度 */
.pwd-strength { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.strength-bars { display: flex; gap: 4px; }
.bar { width: 34px; height: 3px; border-radius: 2px; background: var(--border); transition: 0.3s; }
.bar.active { background: var(--accent-dark); }
.bar.strong  { background: var(--accent2); }
.strength-label { font-size: 11px; color: var(--text3); }

/* 新人福利 */
.new-perk {
  display: flex; align-items: center; gap: 8px;
  background: #FBF8F4;
  border: 1.5px solid var(--border);
  border-left: 3px solid var(--accent-dark);
  border-radius: 10px; padding: 10px 14px;
  font-size: 12px; color: var(--text2); font-weight: 300;
}
.new-perk strong { color: var(--text); font-weight: 600; }

/* 分割线 */
.divider {
  display: flex; align-items: center; gap: 12px;
  color: var(--text3); font-size: 12px; margin: 18px 0 14px;
}
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

/* 快捷登录 */
.quick-login { display: flex; gap: 10px; }
.quick-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px; border-radius: 9px;
  background: var(--bg-soft); border: 1.5px solid var(--border);
  font-family: inherit; font-size: 13px; font-weight: 300; color: var(--text2);
  cursor: pointer; transition: 0.2s;
}
.quick-btn:hover { border-color: var(--border-strong); background: #FBF8F4; color: var(--text); }

/* 扫码 */
.qr-panel { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.qr-platform-tabs { display: flex; gap: 8px; width: 100%; }
.qr-tab {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 9px; border-radius: 9px;
  background: var(--bg-soft); border: 1.5px solid var(--border);
  font-family: inherit; font-size: 12px; font-weight: 300; color: var(--text3);
  cursor: pointer; transition: 0.2s;
}
.qr-tab.active { background: #FBF8F4; border-color: var(--accent-dark); color: var(--text2); font-weight: 400; }
.qr-box { display: flex; flex-direction: column; align-items: center; }
.qr-inner {
  width: 196px; height: 196px; position: relative;
  border-radius: 14px; overflow: hidden;
  border: 1.5px solid var(--border);
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  transition: 0.3s;
}
.qr-inner.expired { filter: blur(3px); }
.qr-svg { width: 100%; height: 100%; display: block; }
.qr-mask {
  position: absolute; inset: 0;
  background: rgba(250,248,244,0.93);
  display: flex; align-items: center; justify-content: center;
}
.qr-mask-inner { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.qr-mask-inner p { font-size: 13px; color: var(--text2); font-weight: 400; }
.qr-refresh {
  padding: 7px 18px; border-radius: 100px;
  background: #1D1D1F; border: none;
  color: #fff; font-family: inherit; font-size: 12px; cursor: pointer; transition: 0.2s;
}
.qr-refresh:hover { background: #2A2420; }
.qr-bar {
  width: 196px; padding: 7px 0; text-align: center;
  font-size: 12px; font-weight: 400; border-radius: 0 0 12px 12px;
}
.qr-bar.wechat { background: rgba(7,193,96,0.08); color: #058a45; }
.qr-bar.alipay { background: rgba(22,119,255,0.08); color: #0d5fd1; }
.qr-tip { font-size: 12px; color: var(--text3); font-weight: 300; }
.qr-count { color: var(--warm); font-weight: 600; }

/* 底部 */
.card-footer {
  display: flex; justify-content: center; align-items: center; gap: 10px;
  margin-top: 22px; padding-top: 18px;
  border-top: 1.5px solid var(--border);
  font-size: 11px; color: var(--text3);
}
.footer-link { color: var(--text3); text-decoration: none; font-size: 11px; font-weight: 300; transition: 0.2s; }
.footer-link:hover { color: var(--text); }

/* ══ 响应式 ══ */
@media (max-width:960px) {
  .login-left { width: 42%; padding: 36px 32px; }
  .login-right { width: 58%; }
  .brand-stats { display: none; }
}
@media (max-width:720px) {
  .login-fullscreen { flex-direction: column; overflow-y: auto; }
  .login-left { width: 100%; height: auto; padding: 28px 24px; }
  .brand-hero, .privilege-list, .brand-copy { display: none; }
  .login-right { width: 100%; height: auto; padding: 24px; }
  .form-card { border-radius: 20px; padding: 28px 20px; }
}
</style>