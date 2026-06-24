<template>
  <div class="admin-login-root">
    <!-- ══ 左侧品牌区 ══ -->
    <div class="al-left">
      <div class="al-left-overlay"></div>
      <img src="@/assets/board/lunbo1.png" alt="bg" class="al-bg" />
      <div class="al-left-content">
        <div class="al-brand">
          <div class="al-logo">
            <svg viewBox="0 0 40 40" width="42" height="42" fill="none">
              <rect width="40" height="40" rx="10" fill="#A07830"/>
              <path d="M10 26 Q20 12 30 26" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>
              <circle cx="20" cy="18" r="3" fill="#FFF"/>
            </svg>
          </div>
          <div class="al-brand-text">
            <span class="al-brand-zh">云梦商城</span>
            <span class="al-brand-en">ADMIN PANEL</span>
          </div>
        </div>
        <div class="al-hero">
          <p class="al-overline">MANAGEMENT SYSTEM</p>
          <h1 class="al-title">
            商城管理<span class="al-title-accent">后台</span>
          </h1>
          <p class="al-desc">
            统一管理商品、订单、用户与数据，<br/>高效运营你的线上商城。
          </p>
        </div>
        <div class="al-stats">
          <div class="als-item">
            <span class="als-num">12,000+</span>
            <span class="als-label">入驻商家</span>
          </div>
          <div class="als-item">
            <span class="als-num">800万+</span>
            <span class="als-label">优质商品</span>
          </div>
          <div class="als-item">
            <span class="als-num">98.6%</span>
            <span class="als-label">用户好评率</span>
          </div>
        </div>
        <p class="al-copy">© 2026 云梦 YUNMENG · 版权所有</p>
      </div>
    </div>

    <!-- ══ 右侧登录表单 ══ -->
    <div class="al-right">
      <div class="al-form-card">
        <div class="al-form-header">
          <h2 class="al-form-title">管理员登录</h2>
          <p class="al-form-sub">请输入账号密码登录商城管理后台</p>
        </div>

        <form @submit.prevent="handleLogin" class="al-form">
          <div class="al-field">
            <label class="al-label">账号</label>
            <div class="al-input-wrap" :class="{ focused: focus.account, error: !!error }">
              <svg class="al-fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                v-model="form.account"
                type="text"
                placeholder="请输入管理员账号"
                @focus="focus.account = true"
                @blur="focus.account = false"
              />
            </div>
          </div>

          <div class="al-field">
            <label class="al-label">密码</label>
            <div class="al-input-wrap" :class="{ focused: focus.password }">
              <svg class="al-fi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="请输入密码"
                @focus="focus.password = true"
                @blur="focus.password = false"
              />
              <button type="button" class="al-eye" @click="showPwd = !showPwd">
                <svg v-if="!showPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="15" height="15">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="al-form-row">
            <label class="al-check">
              <input v-model="form.remember" type="checkbox" />
              <span class="al-check-box"></span>
              <span>记住我</span>
            </label>
          </div>

          <p class="al-error" v-if="error">{{ error }}</p>

          <button type="submit" class="al-submit" :disabled="submitting">
            <span v-if="!submitting">登 录</span>
            <span v-else class="al-loading">
              <i></i><i></i><i></i>
            </span>
          </button>
        </form>

        <div class="al-form-footer">
          <router-link to="/login" class="al-footer-link">返回用户登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminLogin } from '../api/admin'

const router = useRouter()

const showPwd = ref(false)
const submitting = ref(false)
const error = ref('')

const focus = reactive({
  account: false,
  password: false,
})

const form = reactive({
  account: '',
  password: '',
  remember: false,
})

const handleLogin = async () => {
  error.value = ''

  if (!form.account.trim()) {
    error.value = '请输入管理员账号'
    return
  }
  if (!form.password) {
    error.value = '请输入密码'
    return
  }

  submitting.value = true
  try {
    const res = await adminLogin({
      account: form.account,
      password: form.password,
    })
    localStorage.setItem('token', res.token)
    localStorage.setItem('isLogin', 'true')
    localStorage.setItem('userName', res.nickname || res.username || form.account)
    localStorage.setItem('userRole', res.role || 2)
    ElMessage.success('登录成功')
    router.push('/admin/dashboard')
  } catch (err) {
    // 提取后端返回的真实错误信息
    error.value = err.message || err?.response?.data?.message || '登录失败，请检查账号密码是否正确'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.admin-login-root {
  position: fixed;
  inset: 0;
  display: flex;
  font-family: 'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ═══════════ 左侧 ═══════════ */
.al-left {
  width: 55%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}
.al-left-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%);
  z-index: 1;
}
.al-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.85);
}
.al-left-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 48px 52px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.al-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.al-logo {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
}
.al-brand-text {
  display: flex;
  flex-direction: column;
}
.al-brand-zh {
  font-size: 18px;
  font-weight: 600;
  color: #FFF;
  letter-spacing: 2px;
}
.al-brand-en {
  font-size: 9px;
  font-weight: 400;
  color: rgba(255,255,255,0.55);
  letter-spacing: 4px;
  margin-top: 2px;
}

.al-hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.al-overline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.25em;
  color: rgba(255,255,255,0.5);
  margin-bottom: 16px;
}
.al-title {
  font-size: clamp(40px, 5vw, 56px);
  font-weight: 200;
  color: #FFF;
  line-height: 1.15;
  letter-spacing: -1px;
  margin-bottom: 20px;
}
.al-title-accent {
  color: #D9A53C;
  font-weight: 400;
}
.al-desc {
  font-size: 15px;
  color: rgba(255,255,255,0.6);
  line-height: 1.8;
  font-weight: 300;
}

.al-stats {
  display: flex;
  gap: 48px;
  padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,0.12);
}
.als-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.als-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 500;
  color: #D9A53C;
}
.als-label {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
}

.al-copy {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
}

/* ═══════════ 右侧 ═══════════ */
.al-right {
  width: 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #FAF8F4;
}

.al-form-card {
  width: 100%;
  max-width: 400px;
}

.al-form-header {
  text-align: center;
  margin-bottom: 36px;
}
.al-form-title {
  font-size: 26px;
  font-weight: 600;
  color: #1A1712;
  margin-bottom: 8px;
}
.al-form-sub {
  font-size: 13px;
  color: #8A8070;
  font-weight: 300;
}

.al-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.al-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.al-label {
  font-size: 12px;
  font-weight: 600;
  color: #5C5546;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.al-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFF;
  border: 1.5px solid #E0D8C8;
  border-radius: 10px;
  padding: 0 14px;
  transition: all 0.2s;
}
.al-input-wrap.focused {
  border-color: #B8860A;
  box-shadow: 0 0 0 3px rgba(184,134,10,0.08);
}
.al-input-wrap.error {
  border-color: #C0392B;
  background: #FFF8F8;
}
.al-fi {
  width: 15px;
  height: 15px;
  color: #9B9484;
  flex-shrink: 0;
}
.al-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  padding: 13px 0;
  font-family: inherit;
  font-size: 14px;
  color: #1A1712;
}
.al-input-wrap input::placeholder {
  color: #C0B8A8;
  font-weight: 300;
}
.al-eye {
  background: none;
  border: none;
  color: #9B9484;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.al-eye:hover { color: #5C5546; }

.al-form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.al-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #8A8070;
  font-weight: 300;
  user-select: none;
}
.al-check input { display: none; }
.al-check-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid #B8860A;
  background: transparent;
  transition: 0.2s;
  position: relative;
  flex-shrink: 0;
}
.al-check input:checked + .al-check-box {
  background: #B8860A;
}
.al-check input:checked + .al-check-box::after {
  content: '✓';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #FFF;
  font-weight: 700;
}

.al-error {
  font-size: 12px;
  color: #C0392B;
  text-align: center;
}

.al-submit {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #8C6308, #B8860A);
  color: #FFF;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}
.al-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(184,134,10,0.35);
}
.al-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.al-loading {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}
.al-loading i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #FFF;
  display: block;
  animation: dot-pulse 1.2s ease-in-out infinite;
}
.al-loading i:nth-child(2) { animation-delay: 0.2s; }
.al-loading i:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.al-form-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #E0D8C8;
}
.al-footer-link {
  font-size: 13px;
  color: #B8860A;
  text-decoration: none;
  transition: color 0.2s;
}
.al-footer-link:hover {
  color: #8C6308;
}

/* ═══════════ 响应式 ═══════════ */
@media (max-width: 860px) {
  .admin-login-root {
    flex-direction: column;
    overflow-y: auto;
  }
  .al-left {
    width: 100%;
    min-height: 240px;
  }
  .al-left-content {
    padding: 28px 24px;
    gap: 24px;
  }
  .al-stats, .al-copy { display: none; }
  .al-right {
    width: 100%;
    padding: 24px 20px;
  }
  .al-form-card {
    max-width: 100%;
  }
}
</style>
