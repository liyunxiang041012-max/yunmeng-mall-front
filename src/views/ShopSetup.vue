<template>
  <div class="ss-root">
    <div class="bg-ambient">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
    </div>

    <div class="ss-container">
      <!-- 顶部品牌 -->
      <div class="ss-header">
        <div class="brand-mark">
          <svg viewBox="0 0 48 48" width="36" height="36" fill="none">
            <rect width="48" height="48" rx="12" fill="var(--gold)" />
            <path d="M12 31 Q24 14 36 31" stroke="#FFF" stroke-width="2.5" fill="none" stroke-linecap="round" />
            <circle cx="24" cy="21" r="4" fill="#FFF" />
          </svg>
        </div>
        <h1 class="ss-title">设置你的店铺</h1>
        <p class="ss-sub">完成店铺信息后即可开始经营</p>
      </div>

      <!-- 表单 -->
      <div class="ss-card">
        <form @submit.prevent="handleSetup" class="ss-form">
          <div class="form-field">
            <label class="ff-label">店铺名称 <span class="required">*</span></label>
            <div class="ff-input-group">
              <Store :size="16" stroke-width="1.5" class="ff-icon" />
              <input
                v-model="form.shopName"
                type="text"
                placeholder="给你的店铺起个响亮的名字"
                required
                maxlength="30"
              />
            </div>
            <span class="ff-hint">{{ form.shopName.length }}/30</span>
          </div>

          <div class="form-field">
            <label class="ff-label">店铺 Logo（选填）</label>
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              hidden
              @change="handleLogoUpload"
            />
            <div
              class="upload-zone"
              :class="{ 'uz-has-preview': logoPreview }"
              @click="triggerUpload"
            >
              <template v-if="logoPreview">
                <img :src="logoPreview" class="uz-preview" alt="店铺Logo" />
                <p class="uz-retry">点击更换图片</p>
              </template>
              <template v-else>
                <Upload :size="24" stroke-width="1.5" class="uz-icon" />
                <p class="uz-main">上传店铺 Logo</p>
                <p class="uz-sub">JPG / PNG / GIF / WebP，≤ 5MB</p>
              </template>
            </div>
            <p class="ff-hint" v-if="uploadingLogo">上传中...</p>
          </div>

          <div class="form-field">
            <label class="ff-label">店铺描述（选填）</label>
            <div class="ff-input-group">
              <FileText :size="16" stroke-width="1.5" class="ff-icon" />
              <input
                v-model="form.description"
                type="text"
                placeholder="简单介绍你的店铺特色"
                maxlength="512"
              />
            </div>
            <span class="ff-hint">{{ form.description.length }}/512</span>
          </div>

          <p class="form-error" v-if="errorMsg">{{ errorMsg }}</p>

          <div class="form-actions">
            <button type="button" class="btn-skip" @click="handleSkip">
              暂时跳过
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? '保存中...' : '完成设置' }}
              <ArrowRight :size="16" stroke-width="2.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Store, Upload, FileText, ArrowRight } from 'lucide-vue-next'
import { setupShop, uploadShopAvatar } from '../api/shop'

const router = useRouter()

const fileInput = ref(null)
const uploadingLogo = ref(false)
const logoPreview = ref('')

const form = reactive({
  shopName: '',
  description: '',
  logo: '',
})

const submitting = ref(false)
const errorMsg = ref('')

function triggerUpload() {
  fileInput.value?.click()
}

async function handleLogoUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  // 大小校验
  if (file.size > 5 * 1024 * 1024) {
    errorMsg.value = '图片大小不能超过 5MB'
    return
  }
  // 格式校验
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowed.includes(file.type)) {
    errorMsg.value = '只支持 jpg/png/gif/webp 格式'
    return
  }
  errorMsg.value = ''
  uploadingLogo.value = true
  try {
    const res = await uploadShopAvatar(file)
    // 兼容多种响应格式：纯URL字符串 / { code, data } / { url } 等
    const url = typeof res === 'string' ? res : (res.data || res.url || res)
    form.logo = url
    logoPreview.value = url
  } catch (e) {
    errorMsg.value = e.message || '头像上传失败'
  } finally {
    uploadingLogo.value = false
    // 重置 input，允许重复选同一个文件
    e.target.value = ''
  }
}

async function handleSetup() {
  errorMsg.value = ''
  if (!form.shopName.trim()) {
    errorMsg.value = '请输入店铺名称'
    return
  }
  submitting.value = true
  try {
    const res = await setupShop({
      shopName: form.shopName.trim(),
      logo: form.logo || undefined,
      description: form.description || undefined,
    })
    // res = { code:200, data:{ shopId, shopName, isNew, ... } }
    // isNew 可用于提示：'入驻成功！' vs '信息已更新'
    router.push('/shop/dashboard')
  } catch (e) {
    errorMsg.value = e.message || '网络错误'
  } finally {
    submitting.value = false
  }
}

function handleSkip() {
  router.push('/shop/dashboard')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Noto+Sans+SC:wght@300;400;500;600&display=swap');

.ss-root {
  --bg-page:    #F7F4ED;
  --bg-card:    #FFFFFF;
  --bg-input:   #F5F1E8;
  --gold:       #B8860A;
  --gold-dim:   #8C6308;
  --gold-light: #D9A53C;
  --text-primary:   #1A1712;
  --text-secondary: #5C5546;
  --text-tertiary:  #9B9484;
  --border:     #E0D8C4;
  --error:      #C0392B;

  min-height: 100vh;
  background: var(--bg-page);
  font-family: 'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow-x: hidden;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

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

.ss-container {
  position: relative; z-index: 1;
  width: 100%; max-width: 500px;
  padding: 40px 24px;
}

.ss-header { text-align: center; margin-bottom: 32px; }
.brand-mark {
  display: inline-flex; margin-bottom: 16px;
}
.ss-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px; font-weight: 700;
  color: var(--text-primary);
}
.ss-sub {
  margin-top: 6px;
  font-size: 14px; color: var(--text-tertiary);
}

.ss-card {
  background: var(--bg-card);
  border-radius: 18px;
  padding: 32px 28px;
  box-shadow: 0 20px 60px -20px rgba(140,99,8,0.08), 0 0 0 1px var(--border);
}

.ss-form { display: flex; flex-direction: column; gap: 20px; }

.form-field { display: flex; flex-direction: column; gap: 6px; }
.ff-label {
  font-size: 13px; font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}
.required { color: var(--error); }

.ff-input-group {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg-input);
  border-radius: 10px; padding: 0 14px;
  border: 1.5px solid transparent;
  transition: border-color 0.2s;
}
.ff-input-group:focus-within {
  border-color: var(--gold-light);
  background: #FFFFFF;
}
.ff-input-group input {
  flex: 1; border: none; background: none;
  padding: 12px 0; font-size: 14px;
  color: var(--text-primary); outline: none;
  font-family: inherit;
}
.ff-input-group input::placeholder { color: var(--text-tertiary); }
.ff-icon { color: var(--text-tertiary); flex-shrink: 0; }

.ff-hint {
  font-size: 11px; color: var(--text-tertiary);
  text-align: right;
}

.upload-zone {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 24px;
  border: 1.5px dashed var(--border);
  border-radius: 10px;
  background: var(--bg-input);
  cursor: pointer; transition: border-color 0.2s;
}
.upload-zone:hover { border-color: var(--gold-light); }
.uz-icon { color: var(--text-tertiary); }
.uz-main { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
.uz-sub { font-size: 11px; color: var(--text-tertiary); }

.uz-has-preview {
  padding: 12px;
}
.uz-preview {
  width: 100px; height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid var(--border);
}
.uz-retry {
  font-size: 11px; color: var(--gold);
  margin-top: 4px;
}

.form-error {
  font-size: 12px; color: var(--error);
  text-align: center;
}

.form-actions {
  display: flex; gap: 12px; justify-content: flex-end;
  margin-top: 8px;
}

.btn-skip {
  padding: 12px 24px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
  font-family: inherit;
}
.btn-skip:hover {
  border-color: var(--text-tertiary);
  color: var(--text-primary);
}

.btn-submit {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 32px;
  border: none; border-radius: 10px;
  background: var(--gold);
  color: #FFFFFF; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.25s;
  font-family: inherit;
}
.btn-submit:hover:not(:disabled) {
  background: var(--gold-dim);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(184,134,10,0.3);
}
.btn-submit:disabled {
  opacity: 0.6; cursor: not-allowed;
}
</style>
