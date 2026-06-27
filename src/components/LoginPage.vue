<template>
  <div class="login-page">

    <!-- 左侧品牌区 -->
    <div class="login-left">
      <div class="ll-top">
        <div class="brand-logo">
          <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
            <rect width="40" height="40" rx="10" fill="#A07830"/>
            <path d="M10 26 Q20 12 30 26" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>
            <circle cx="20" cy="18" r="3" fill="#FFF"/>
          </svg>
          <div class="brand-text">
            <span class="brand-zh">云梦商城</span>
            <span class="brand-en">YUNMENG MALL</span>
          </div>
        </div>
      </div>

      <div class="ll-mid">
        <div class="headline-wrap">
          <h1 class="headline">
            <span class="hl-1">探索全球</span>
            <span class="hl-2">好物世界</span>
          </h1>
          <p class="headline-sub">数百万件正品好物，AI 智能推荐<br/>专属优惠券等你来领</p>
        </div>
        <div class="priv-list">
          <div class="priv-item" v-for="p in privileges" :key="p.title">
            <div class="priv-icon">{{ p.icon }}</div>
            <div class="priv-info">
              <strong>{{ p.title }}</strong>
              <span>{{ p.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ll-bot">
        <div class="stats-row">
          <div class="stat-item" v-for="s in stats" :key="s.label">
            <span class="stat-num">{{ s.num }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
        <p class="copy">© 2026 云梦商城 · 版权所有</p>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="login-right">
      <div class="form-card">

        <!-- 登录/注册切换 -->
        <div class="lr-switch">
          <button :class="['lrs-btn', { active: mode==='login' }]" @click="mode='login'">登录</button>
          <button :class="['lrs-btn', { active: mode==='register' }]" @click="mode='register'">注册</button>
        </div>

        <!-- ══ 登录 ══ -->
        <div v-if="mode==='login'" class="panel">
          <div class="mode-tabs">
            <button :class="['mode-tab', { active: loginMode==='password' }]" @click="loginMode='password'">账号密码</button>
            <button :class="['mode-tab', { active: loginMode==='sms' }]" @click="loginMode='sms'">短信验证</button>
            <button :class="['mode-tab', { active: loginMode==='qr' }]" @click="loginMode='qr'">扫码登录</button>
          </div>

          <!-- 账号密码 -->
          <form v-if="loginMode==='password'" @submit.prevent="handleLogin" class="form">
            <div class="field">
              <label>手机号 / 邮箱</label>
              <div class="input-wrap" :class="{ focused: focus.account, error: errors.account }">
                <svg class="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input v-model="loginForm.account" type="text" placeholder="请输入手机号或邮箱"
                  @focus="focus.account=true; errors.account=''" @blur="focus.account=false; validateAccount()" />
              </div>
              <p class="err-msg" v-if="errors.account">{{ errors.account }}</p>
            </div>
            <div class="field">
              <label>密码</label>
              <div class="input-wrap" :class="{ focused: focus.password }">
                <svg class="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input v-model="loginForm.password" :type="showPwd ? 'text' : 'password'" placeholder="请输入密码"
                  @focus="focus.password=true" @blur="focus.password=false" />
                <button type="button" class="eye-btn" @click="showPwd=!showPwd">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15">
                    <template v-if="showPwd"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></template>
                    <template v-else><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></template>
                  </svg>
                </button>
              </div>
            </div>
            <div class="form-row">
              <label class="check-label">
                <input v-model="loginForm.remember" type="checkbox" class="check-real" />
                <span class="check-box"></span>
                <span>记住我</span>
              </label>
              <a href="#" class="link-muted">忘记密码？</a>
            </div>
            <button type="submit" class="submit-btn" :disabled="submitting">
              <span v-if="!submitting">立即登录</span>
              <span v-else class="loading-dots"><i></i><i></i><i></i></span>
              <svg v-if="!submitting" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <div class="divider"><span>其他方式登录</span></div>
            <div class="quick-btns">
              <button type="button" class="quick-btn" @click="loginMode='qr'; qrPlatform='wechat'">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#07C160"><path d="M8.69 11.51c-.47 0-.85-.37-.85-.84s.38-.84.85-.84.85.37.85.84-.38.84-.85.84zm4.77 0c-.47 0-.85-.37-.85-.84s.38-.84.85-.84.85.37.85.84-.38.84-.85.84zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
                微信扫码
              </button>
              <button type="button" class="quick-btn" @click="loginMode='qr'; qrPlatform='alipay'">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#1677FF"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="9" fill="white" font-weight="bold">支</text></svg>
                支付宝扫码
              </button>
            </div>
          </form>

          <!-- 短信验证 -->
          <form v-if="loginMode==='sms'" @submit.prevent="handleLogin" class="form">
            <div class="field">
              <label>手机号</label>
              <div class="input-wrap" :class="{ focused: focus.phone }">
                <svg class="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.7a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <input v-model="smsForm.phone" type="tel" placeholder="请输入手机号"
                  @focus="focus.phone=true" @blur="focus.phone=false" />
              </div>
            </div>
            <div class="field">
              <label>验证码</label>
              <div class="input-wrap sms-wrap" :class="{ focused: focus.smsCode }">
                <svg class="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <input v-model="smsForm.code" type="text" placeholder="6位验证码" maxlength="6"
                  @focus="focus.smsCode=true" @blur="focus.smsCode=false" />
                <button type="button" class="sms-btn" :disabled="smsCD>0" @click="sendSms">
                  {{ smsCD>0 ? `${smsCD}s 重发` : '获取验证码' }}
                </button>
              </div>
            </div>
            <button type="submit" class="submit-btn">
              <span>登录</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>

          <!-- 扫码 -->
          <div v-if="loginMode==='qr'" class="qr-panel">
            <div class="qr-platform-tabs">
              <button :class="['qp-tab', { active: qrPlatform==='wechat' }]" @click="qrPlatform='wechat'">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="#07C160"><path d="M8.69 11.51c-.47 0-.85-.37-.85-.84s.38-.84.85-.84.85.37.85.84-.38.84-.85.84zm4.77 0c-.47 0-.85-.37-.85-.84s.38-.84.85-.84.85.37.85.84-.38.84-.85.84zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>
                微信
              </button>
              <button :class="['qp-tab', { active: qrPlatform==='alipay' }]" @click="qrPlatform='alipay'">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="#1677FF"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="9" fill="white" font-weight="bold">支</text></svg>
                支付宝
              </button>
            </div>
            <div class="qr-box" :class="{ expired: qrExpired }">
              <svg class="qr-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="white" rx="8"/>
                <rect x="10" y="10" width="56" height="56" fill="none" stroke="#1A1A18" stroke-width="6" rx="4"/>
                <rect x="22" y="22" width="32" height="32" fill="#1A1A18" rx="2"/>
                <rect x="134" y="10" width="56" height="56" fill="none" stroke="#1A1A18" stroke-width="6" rx="4"/>
                <rect x="146" y="22" width="32" height="32" fill="#1A1A18" rx="2"/>
                <rect x="10" y="134" width="56" height="56" fill="none" stroke="#1A1A18" stroke-width="6" rx="4"/>
                <rect x="22" y="146" width="32" height="32" fill="#1A1A18" rx="2"/>
                <g fill="#1A1A18">
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
                <rect x="90" y="90" width="20" height="20" rx="3" :fill="qrPlatform==='wechat' ? '#07C160' : '#1677FF'"/>
                <text x="100" y="104" text-anchor="middle" font-size="10" fill="white" font-weight="bold">{{ qrPlatform==='wechat' ? '微' : '支' }}</text>
              </svg>
              <div v-if="qrExpired" class="qr-expired-mask">
                <p>二维码已失效</p>
                <button @click="refreshQr">点击刷新</button>
              </div>
            </div>
            <p class="qr-hint">{{ qrPlatform==='wechat' ? '请使用微信 App 扫描' : '请使用支付宝 App 扫描' }}</p>
            <p class="qr-timer">有效期 <em>{{ qrTimer }}s</em></p>
          </div>
        </div>

        <!-- ══ 注册 ══ -->
        <div v-if="mode==='register'" class="panel">
          <div class="new-perk-banner">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A07830" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            注册即送 <strong>50元</strong> 新人券 + <strong>30天</strong> 会员体验
          </div>
          <form @submit.prevent="handleRegister" class="form">
            <div class="field">
              <label>手机号</label>
              <div class="input-wrap" :class="{ focused: focus.regPhone, error: errors.regPhone }">
                <svg class="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.7a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <input v-model="regForm.phone" type="tel" placeholder="+86 手机号"
                  @focus="focus.regPhone=true; errors.regPhone=''" @blur="focus.regPhone=false; validateRegPhone()" />
              </div>
              <p class="err-msg" v-if="errors.regPhone">{{ errors.regPhone }}</p>
            </div>
            <div class="field">
              <label>验证码</label>
              <div class="input-wrap sms-wrap" :class="{ focused: focus.regCode }">
                <svg class="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <input v-model="regForm.code" type="text" placeholder="6位短信验证码" maxlength="6"
                  @focus="focus.regCode=true" @blur="focus.regCode=false" />
                <button type="button" class="sms-btn" :disabled="regCD>0" @click="sendRegSms">
                  {{ regCD>0 ? `${regCD}s 重发` : '发送验证码' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>设置密码</label>
              <div class="input-wrap" :class="{ focused: focus.regPwd }">
                <svg class="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input 
  v-model="regForm.password" 
  :type="showRegPwd ? 'text' : 'password'" 
  placeholder="8位以上，含字母和数字"
  @focus="focus.regPwd = true" 
  @blur="() => { focus.regPwd = false; handleRegPasswordBlur(); }" 
/>
                <button type="button" class="eye-btn" @click="showRegPwd=!showRegPwd">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15">
                    <template v-if="showRegPwd"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></template>
                    <template v-else><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></template>
                  </svg>
                </button>
              </div>
              <div class="pwd-strength" v-if="regForm.password">
                <div class="str-bars">
                  <span :class="['str-bar', { on: pwdStr>=1, hi: pwdStr>=3 }]"></span>
                  <span :class="['str-bar', { on: pwdStr>=2, hi: pwdStr>=3 }]"></span>
                  <span :class="['str-bar', { on: pwdStr>=3 }]"></span>
                </div>
                <span class="str-label">{{ ['','弱','中','强'][pwdStr] }}</span>
              </div>
            </div>
            <div class="field">
              <label>昵称 <span class="required">必填</span></label>
              <div class="input-wrap" :class="{ focused: focus.nickname }">
                <svg class="fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input v-model="regForm.nickname" type="text" placeholder="你的云梦昵称"
                  @focus="focus.nickname=true" @blur="focus.nickname=false" />
              </div>
            </div>
            <label class="check-label agree">
              <input v-model="regForm.agree" type="checkbox" class="check-real" />
              <span class="check-box"></span>
              <span>我已阅读并同意 <a href="#" class="link-gold">《用户协议》</a> 和 <a href="#" class="link-gold">《隐私政策》</a></span>
            </label>
            <button type="submit" class="submit-btn" :disabled="!regForm.agree || regSubmitting">
              <span v-if="!regSubmitting">立即注册</span>
              <span v-else class="loading-dots"><i></i><i></i><i></i></span>
              <svg v-if="!regSubmitting" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </form>
        </div>

        <div class="card-footer">
          <a href="#" class="footer-link">隐私政策</a>
          <span class="dot">·</span>
          <a href="#" class="footer-link">用户协议</a>
          <span class="dot">·</span>
          <a href="#" class="footer-link">帮助中心</a>
        </div>

        <!-- 商家入驻引导 -->
        <div v-if="mode==='login'" class="merchant-hint">
          <router-link to="/shop/register" class="hint-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>想开店？点击此处入驻</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, register, sendSmsCode, getProfileStatus } from '../api/user'

const route = useRoute()
const router = useRouter()

const mode        = ref('login')
const loginMode   = ref('password')
const qrPlatform  = ref('wechat')
const showPwd     = ref(false)
const showRegPwd  = ref(false)
const submitting  = ref(false)
const regSubmitting = ref(false)

const focus = reactive({
  account: false, password: false, phone: false, smsCode: false,
  regPhone: false, regCode: false, regPwd: false, nickname: false
})
const errors = reactive({ account: '', regPhone: '' })

const loginForm = reactive({ account: '', password: '', remember: false })
const smsForm   = reactive({ phone: '', code: '' })
const regForm   = reactive({ phone: '', code: '', password: '', nickname: '', agree: false })

// ── 账号 & 手机号验证 ──
const validateAccount = () => {
  if (!loginForm.account) errors.account = '请输入手机号或邮箱'
  else errors.account = ''
}

const validateRegPhone = () => {
  if (!regForm.phone) errors.regPhone = '请输入手机号'
  else if (!/^1[3-9]\d{9}$/.test(regForm.phone)) errors.regPhone = '请输入正确的手机号格式'
  else errors.regPhone = ''
}

// ── 注册密码验证（核心新增）──
const validateRegPassword = (showMsg = true) => {
  const p = regForm.password
  if (!p) {
    if (showMsg) ElMessage.error('请输入密码')
    return false
  }
  if (p.length < 8) {
    if (showMsg) ElMessage.error('密码长度至少8位')
    return false
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(p)) {
    if (showMsg) ElMessage.error('密码必须包含字母和数字')
    return false
  }
  return true
}

// blur 时轻量提示（不阻断，只提醒）
const handleRegPasswordBlur = () => {
  const p = regForm.password
  if (p && !validateRegPassword(false)) {
    // 只提示一次，避免频繁打扰
    ElMessage.warning('密码需至少8位，且包含字母和数字')
  }
}

// ══ 登录 ══
const handleLogin = async () => {
  validateAccount()
  if (errors.account) return
  submitting.value = true
  try {
    // 清除旧 token，防止之前登录过商家端导致身份串号
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')

    const res = await login({
      account: loginForm.account,
      password: loginForm.password
    })
    saveLoginState(res.nickname || res.username || loginForm.account)
    localStorage.setItem('token', res.token)
    localStorage.setItem('userRole', res.role ?? 0)

    // ── 普通用户(role=0)：检查个人信息是否完善 ──
    try {
      const ok = await getProfileStatus()
      if (!ok) {
        router.push('/profile/setup')
        return
      }
    } catch (e) {
      // 接口失败也引导完善（兜底）
      router.push('/profile/setup')
      return
    }

    const redirect = route.query.redirect || '/home'
    router.push(redirect)
  } catch (err) {
    // 优先展示后端返回的错误信息（如 "该账号为商家角色，不可登录商城"）
    const msg = err?.message || err?.msg || ''
    errors.account = msg || '登录失败，请检查账号密码是否正确'
  } finally {
    submitting.value = false
  }
}

// ══ 注册 ══
const handleRegister = async () => {
  if (!regForm.agree) {
    ElMessage.warning('请先同意用户协议')
    return
  }

  validateRegPhone()
  if (errors.regPhone) return

  if (!regForm.code) {
    ElMessage.error('请输入验证码')
    return
  }

  // 👇 关键：校验密码强度
  if (!validateRegPassword()) return

  if (!regForm.nickname.trim()) {
    ElMessage.error('请输入昵称')
    return
  }

  regSubmitting.value = true
  try {
    // 👇 清掉旧 token，防止注册请求带上已登录商家的身份
    localStorage.removeItem('token')
    await register({
      phone: regForm.phone,
      code: regForm.code,
      password: regForm.password,
      nickname: regForm.nickname.trim()
    })
    // 后端注册接口返回 data: null，需调 login 获取 token
    const loginRes = await login({ account: regForm.phone, password: regForm.password })
    saveLoginState(loginRes.nickname || loginRes.phone || regForm.phone)
    localStorage.setItem('token', loginRes.token)
    ElMessage.success('注册成功！')
    router.push('/profile/setup')
  } catch (err) {
    ElMessage.error('注册失败，该手机号可能已注册')
  } finally {
    regSubmitting.value = false
  }
}

// ══ 发送验证码 ══
const smsCD = ref(0); let smsT = null
const regCD = ref(0); let regT = null

const sendSms = async () => {
  if (!smsForm.phone) return
  try {
    const res = await sendSmsCode({ phone: smsForm.phone })
    // 成功才走到这里，code !== 200 已被拦截器 reject
    ElMessage.success('验证码已发送')
  } catch (err) {
    ElMessage.error('验证码发送失败，请稍后重试')
    return
  }
  smsCD.value = 60
  smsT = setInterval(() => {
    smsCD.value--
    if (smsCD.value <= 0) clearInterval(smsT)
  }, 1000)
}

const sendRegSms = async () => {
  validateRegPhone()
  if (errors.regPhone) return

  try {
    const res = await sendSmsCode({ phone: regForm.phone })
    // 成功才走到这里
    ElMessage.success('验证码已发送')
    regCD.value = 60
    regT = setInterval(() => {
      regCD.value--
      if (regCD.value <= 0) clearInterval(regT)
    }, 1000)
  } catch (err) {
    ElMessage.error('验证码发送失败，请稍后重试')
  }
}

// ══ 密码强度计算（用于 UI 展示）══
const pwdStr = computed(() => {
  const p = regForm.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Za-z]/.test(p) && /\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

// ══ 二维码相关 ══
const qrTimer = ref(120)
const qrExpired = ref(false)
let qrI = setInterval(() => {
  qrTimer.value--
  if (qrTimer.value <= 0) {
    qrExpired.value = true
    clearInterval(qrI)
  }
}, 1000)

const refreshQr = () => {
  qrTimer.value = 120
  qrExpired.value = false
  clearInterval(qrI)
  qrI = setInterval(() => {
    qrTimer.value--
    if (qrTimer.value <= 0) {
      qrExpired.value = true
      clearInterval(qrI)
    }
  }, 1000)
}

// ══ 页面数据 ══
const privileges = [
  { icon: '🛡️', title: '正品保障', desc: '官方授权，假一赔十' },
  { icon: '✈️', title: '全球直邮', desc: '1000+ 海外品牌直达' },
  { icon: '🎁', title: '会员特权', desc: '专属券、积分、生日礼遇' },
]
const stats = [
  { num: '1200万+', label: '注册用户' },
  { num: '800万+', label: '优质商品' },
  { num: '98.6%', label: '好评率' },
]

// ══ 工具函数 ══
const saveLoginState = (name) => {
  localStorage.setItem('isLogin', 'true')
  localStorage.setItem('userName', name)
  localStorage.setItem('justLoggedIn', 'true')
}

// ══ 清理定时器 ══
onUnmounted(() => {
  clearInterval(smsT)
  clearInterval(regT)
  clearInterval(qrI)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@200;300;400;500&family=Space+Mono:wght@400;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
.login-page { position: fixed; inset: 0; display: flex; font-family: 'Noto Sans SC','PingFang SC',sans-serif; -webkit-font-smoothing: antialiased; background: #F5F2EC; }

/* ══ 左侧 ══ */
.login-left { width: 48%; height: 100%; padding: 48px 52px; display: flex; flex-direction: column; justify-content: space-between; background: linear-gradient(160deg, #FFF 0%, #FAF6EE 40%, #F5F0E6 100%); border-right: 1px solid #E0D8C8; overflow: hidden; position: relative; }
.login-left::before { content: ''; position: absolute; right: -120px; top: -120px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%); pointer-events: none; }
.login-left::after  { content: ''; position: absolute; left: -80px; bottom: -80px; width: 320px; height: 320px; border-radius: 50%; background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%); pointer-events: none; }
.brand-logo { display: flex; align-items: center; gap: 11px; }
.brand-text  { display: flex; flex-direction: column; }
.brand-zh { font-size: 16px; font-weight: 500; color: #1A1A18; letter-spacing: 2px; }
.brand-en { font-size: 9px; font-weight: 300; letter-spacing: 4px; color: #8A8070; margin-top: 2px; }
.ll-mid { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 48px; }
.headline { display: flex; flex-direction: column; margin-bottom: 16px; }
.hl-1 { font-size: clamp(36px,4vw,54px); font-weight: 200; color: #1A1A18; letter-spacing: -1px; line-height: 1.1; }
.hl-2 { font-size: clamp(36px,4vw,54px); font-weight: 200; color: #A07830; letter-spacing: -1px; line-height: 1.1; }
.headline-sub { font-size: 14px; color: #8A8070; line-height: 1.8; font-weight: 300; }
.priv-list { display: flex; flex-direction: column; gap: 20px; }
.priv-item { display: flex; align-items: center; gap: 14px; }
.priv-icon { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; background: #FFF; border: 1px solid #E0D8C8; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.priv-info strong { display: block; font-size: 13px; font-weight: 500; color: #1A1A18; margin-bottom: 2px; }
.priv-info span   { font-size: 12px; color: #8A8070; font-weight: 300; }
.stats-row { display: flex; padding-top: 24px; border-top: 1px solid #E0D8C8; margin-bottom: 16px; }
.stat-item { flex: 1; display: flex; flex-direction: column; gap: 3px; padding-left: 20px; border-right: 1px solid #E0D8C8; }
.stat-item:first-child { padding-left: 0; } .stat-item:last-child { border-right: none; }
.stat-num   { font-size: 20px; font-weight: 500; color: #A07830; font-family: 'Space Mono',monospace; }
.stat-label { font-size: 11px; color: #8A8070; font-weight: 300; }
.copy { font-size: 11px; color: #B0A898; }

/* ══ 右侧 ══ */
.login-right { width: 52%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 40px; background: #F5F2EC; overflow-y: auto; }
.form-card { width: 100%; max-width: 420px; background: #FFF; border: 1px solid #E0D8C8; border-radius: 20px; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }

/* ── 登录/注册切换 ── */
.lr-switch { display: flex; gap: 6px; margin-bottom: 24px; background: #F5F2EC; border: 1px solid #E0D8C8; border-radius: 11px; padding: 4px; }
.lrs-btn { flex: 1; padding: 10px; border: none; background: none; font-family: inherit; font-size: 15px; color: #8A8070; font-weight: 300; cursor: pointer; border-radius: 8px; transition: .2s; }
.lrs-btn.active { color: #1A1A18; font-weight: 500; background: #FFF; border: 1px solid #E0D8C8; box-shadow: 0 2px 6px rgba(0,0,0,0.07); }

/* ── 登录模式 ── */
.mode-tabs { display: flex; gap: 6px; margin-bottom: 22px; }
.mode-tab { flex: 1; padding: 8px 4px; border: 1px solid #E0D8C8; background: #FAFAF8; color: #8A8070; font-family: inherit; font-size: 12px; font-weight: 300; border-radius: 8px; cursor: pointer; transition: .2s; white-space: nowrap; }
.mode-tab:hover { border-color: #C9A84C; color: #4A4438; }
.mode-tab.active { background: #FFF; border-color: #C9A84C; color: #1A1A18; font-weight: 500; box-shadow: 0 2px 8px rgba(201,168,76,0.12); }

/* ── 表单 ── */
.panel { display: flex; flex-direction: column; }
.form  { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 7px; }
.field label { font-size: 13px; font-weight: 500; color: #4A4438; display: flex; align-items: center; gap: 6px; }
.optional { font-size: 10px; color: #8A8070; font-weight: 300; background: #F5F2EC; padding: 1px 6px; border-radius: 4px; border: 1px solid #E0D8C8; }
.input-wrap { display: flex; align-items: center; gap: 10px; background: #F5F2EC; border: 1.5px solid #E0D8C8; border-radius: 10px; padding: 0 13px; transition: .2s; }
.input-wrap.focused { border-color: #C9A84C; background: #FFFDF8; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
.input-wrap.error   { border-color: #C0392B; background: #FFF8F8; }
.fi { width: 15px; height: 15px; color: #8A8070; flex-shrink: 0; }
.input-wrap input { flex: 1; background: none; border: none; outline: none; color: #1A1A18; font-family: inherit; font-size: 14px; padding: 12px 0; }
.input-wrap input::placeholder { color: #B0A898; font-weight: 300; }
.eye-btn { background: none; border: none; color: #8A8070; cursor: pointer; padding: 4px; display: flex; align-items: center; transition: .2s; }
.eye-btn:hover { color: #4A4438; }
.err-msg { font-size: 11px; color: #C0392B; padding-left: 2px; }
.sms-wrap { padding-right: 6px; }
.sms-btn { flex-shrink: 0; padding: 7px 11px; border-radius: 7px; background: #FFF; border: 1px solid #E0D8C8; color: #4A4438; font-family: inherit; font-size: 12px; cursor: pointer; white-space: nowrap; transition: .2s; }
.sms-btn:hover:not(:disabled) { border-color: #C9A84C; color: #A07830; }
.sms-btn:disabled { opacity: .45; cursor: default; }
.form-row { display: flex; justify-content: space-between; align-items: center; }
.check-label { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; font-size: 13px; color: #4A4438; font-weight: 300; }
.check-label.agree { margin-top: 2px; }
.check-real { display: none; }
.check-box { width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; border-radius: 4px; border: 1.5px solid #C9A84C; background: transparent; transition: .2s; position: relative; }
.check-real:checked + .check-box { background: #C9A84C; }
.check-real:checked + .check-box::after { content: '✓'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #FFF; font-weight: 700; }
.link-muted { font-size: 12px; color: #8A8070; text-decoration: none; transition: .2s; }
.link-muted:hover { color: #1A1A18; }
.link-gold { color: #A07830; text-decoration: underline; text-underline-offset: 2px; }

/* ── 提交按钮 ── */
.submit-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 13px; background: linear-gradient(135deg,#A07830,#C9A84C); border: none; border-radius: 11px; color: #FFF; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; transition: .25s; box-shadow: 0 4px 16px rgba(160,120,48,0.3); margin-top: 4px; }
.submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(160,120,48,0.45); }
.submit-btn:disabled { background: #E0D8C8; color: #B0A898; box-shadow: none; cursor: not-allowed; transform: none; }
.loading-dots { display: flex; gap: 4px; align-items: center; }
.loading-dots i { width: 6px; height: 6px; border-radius: 50%; background: #FFF; display: block; animation: dot-pulse 1.2s ease-in-out infinite; }
.loading-dots i:nth-child(2) { animation-delay: .2s; }
.loading-dots i:nth-child(3) { animation-delay: .4s; }
@keyframes dot-pulse { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }

/* ── 分割线/快捷登录 ── */
.divider { display: flex; align-items: center; gap: 12px; color: #B0A898; font-size: 12px; margin: 18px 0 14px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #E0D8C8; }
.quick-btns { display: flex; gap: 10px; }
.quick-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 11px; border-radius: 9px; background: #FAFAF8; border: 1px solid #E0D8C8; font-family: inherit; font-size: 13px; font-weight: 300; color: #4A4438; cursor: pointer; transition: .2s; }
.quick-btn:hover { border-color: #C9A84C; background: #FFFDF8; }

/* ── 扫码 ── */
.qr-panel { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 8px 0; }
.qr-platform-tabs { display: flex; gap: 8px; width: 100%; }
.qp-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 9px; border-radius: 9px; background: #F5F2EC; border: 1px solid #E0D8C8; font-family: inherit; font-size: 12px; font-weight: 300; color: #8A8070; cursor: pointer; transition: .2s; }
.qp-tab.active { background: #FFF; border-color: #C9A84C; color: #4A4438; font-weight: 500; }
.qr-box { position: relative; width: 190px; height: 190px; border-radius: 14px; overflow: hidden; border: 1px solid #E0D8C8; transition: filter .3s; }
.qr-box.expired { filter: blur(4px); }
.qr-svg { width: 100%; height: 100%; display: block; }
.qr-expired-mask { position: absolute; inset: 0; background: rgba(250,246,238,0.93); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
.qr-expired-mask p { font-size: 13px; color: #4A4438; }
.qr-expired-mask button { padding: 7px 18px; border-radius: 100px; background: linear-gradient(135deg,#A07830,#C9A84C); border: none; color: #FFF; font-family: inherit; font-size: 12px; cursor: pointer; }
.qr-hint { font-size: 13px; color: #4A4438; }
.qr-timer { font-size: 12px; color: #8A8070; }
.qr-timer em { font-style: normal; color: #A07830; font-weight: 600; }

/* ── 密码强度 ── */
.pwd-strength { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.str-bars { display: flex; gap: 5px; }
.str-bar { width: 36px; height: 3px; border-radius: 2px; background: #E0D8C8; transition: .3s; }
.str-bar.on { background: #C9A84C; }
.str-bar.hi { background: #27AE60; }
.str-label { font-size: 11px; color: #8A8070; }

/* ── 注册福利 ─ */
.new-perk-banner { display: flex; align-items: center; gap: 8px; background: #FFFDF5; border: 1px solid rgba(201,168,76,0.3); border-left: 3px solid #C9A84C; border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #4A4438; font-weight: 300; margin-bottom: 20px; }
.new-perk-banner strong { color: #A07830; font-weight: 600; }

/* ── 商家入驻引导 ── */
.merchant-hint {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E0D8C8;
}
.hint-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #A07830;
  font-size: 13px;
  text-decoration: none;
  transition: all 0.2s;
}
.hint-link:hover {
  color: #C9A84C;
  transform: translateY(-1px);
}

/* ── 底部 ── */
.card-footer { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 22px; padding-top: 18px; border-top: 1px solid #F0EAE0; font-size: 11px; color: #B0A898; }
.footer-link { color: #B0A898; text-decoration: none; font-size: 11px; transition: .2s; }
.footer-link:hover { color: #4A4438; }
.dot { color: #D8D0C4; }

/* ── 响应式 ── */
@media (max-width:960px) { .login-left { width: 44%; padding: 36px 32px; } .login-right { width: 56%; } .stats-row { display: none; } }
@media (max-width:720px) { .login-page { flex-direction: column; overflow-y: auto; } .login-left { width: 100%; height: auto; padding: 28px 24px; } .ll-mid { gap: 28px; } .priv-list, .ll-bot { display: none; } .login-right { width: 100%; height: auto; padding: 20px; } .form-card { border-radius: 16px; padding: 24px 20px; } }
</style>