<template>
  <div class="ss-root">
    <!-- ── 店铺信息卡片 ── -->
    <div class="ss-card">
      <div class="ssc-head">
        <h3>店铺信息</h3>
        <p>管理你的店铺基本信息和展示内容</p>
      </div>

      <form @submit.prevent="handleSave" class="ssc-form">
        <!-- Logo -->
        <div class="sscf-field">
          <label>店铺 Logo</label>
          <input ref="logoInput" type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden @change="handleLogoUpload" />
          <div class="sscf-logo-zone" @click="logoInput?.click()">
            <template v-if="form.logo">
              <img :src="form.logo" class="sscf-logo-preview" />
              <span class="sscf-logo-retry">点击更换</span>
            </template>
            <template v-else>
              <div class="sscf-logo-empty">
                <Upload :size="20" stroke-width="1.5" />
                <span>上传 Logo</span>
              </div>
            </template>
          </div>
        </div>

        <!-- 店铺名称 -->
        <div class="sscf-field">
          <label>店铺名称 <span class="required">*</span></label>
          <input v-model="form.shopName" type="text" placeholder="店铺名称" required maxlength="30" />
          <span class="sscf-hint">{{ (form.shopName || '').length }}/30</span>
        </div>

        <!-- 店铺描述 -->
        <div class="sscf-field">
          <label>店铺描述</label>
          <textarea v-model="form.description" placeholder="简单介绍你的店铺特色" rows="3" maxlength="512"></textarea>
          <span class="sscf-hint">{{ (form.description || '').length }}/512</span>
        </div>

        <!-- 联系方式 -->
        <div class="sscf-row">
          <div class="sscf-field">
            <label>联系电话</label>
            <input v-model="form.phone" type="text" placeholder="客服电话" maxlength="20" />
          </div>
          <div class="sscf-field">
            <label>联系邮箱</label>
            <input v-model="form.email" type="email" placeholder="客服邮箱" maxlength="100" />
          </div>
        </div>

        <p class="sscf-error" v-if="errorMsg">{{ errorMsg }}</p>
        <p class="sscf-success" v-if="successMsg">{{ successMsg }}</p>

        <div class="sscf-actions">
          <button type="submit" class="btn-save" :disabled="saving">
            {{ saving ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>

    <!-- ── 店铺数据卡片 ── -->
    <div class="ss-stats">
      <div class="sss-item">
        <span class="sssi-label">店铺 ID</span>
        <span class="sssi-val">{{ shopInfo.shopId || '-' }}</span>
      </div>
      <div class="sss-item">
        <span class="sssi-label">粉丝数</span>
        <span class="sssi-val">{{ shopInfo.fansCount ?? '...' }}</span>
      </div>
      <div class="sss-item">
        <span class="sssi-label">在售商品</span>
        <span class="sssi-val">{{ shopInfo.productCount ?? '...' }}</span>
      </div>
      <div class="sss-item">
        <span class="sssi-label">入驻时间</span>
        <span class="sssi-val">{{ shopInfo.createTime || '-' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Upload } from 'lucide-vue-next'
import { getShopStatus, setupShop, uploadShopAvatar, getShopDetail, getFansCount, getShopStats } from '../api/shop'

const logoInput = ref(null)

const form = reactive({
  shopName: '',
  description: '',
  logo: '',
  phone: '',
  email: '',
})

const shopInfo = reactive({
  shopId: '',
  fansCount: null,
  productCount: null,
  createTime: '',
})

const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// ─── 加载店铺信息 ───
async function loadShopInfo() {
  try {
    const statusRes = await getShopStatus()
    // statusRes = { code:200, data:{ hasShop, shopId, shopName } }
    const statusData = statusRes
    if (statusData.shopId) {
      shopInfo.shopId = statusData.shopId

      // 获取店铺详情
      const detailRes = await getShopDetail(statusData.shopId)
      // detailRes = { code:200, data:{ shopName, logo, description, ... } }
      const detail = detailRes
      Object.assign(form, {
        shopName: detail.shopName || '',
        description: detail.description || '',
        logo: detail.logo || '',
        phone: detail.phone || '',
        email: detail.email || '',
      })

      // 获取统计数据
      try {
        const fansRes = await getFansCount(statusData.shopId)
        shopInfo.fansCount = fansRes
      } catch {}
      try {
        const statsRes = await getShopStats()
        const stats = statsRes
        shopInfo.productCount = stats.productCount ?? stats.totalProducts ?? null
      } catch {}
      if (detail.createTime) {
        const dt = new Date(detail.createTime)
        if (!isNaN(dt.getTime())) {
          shopInfo.createTime = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
        }
      }
    }
  } catch (e) {
    console.error('加载店铺信息失败:', e)
  }
}

// ─── 上传 Logo ───
async function handleLogoUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { errorMsg.value = '图片大小不能超过 5MB'; return }
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowed.includes(file.type)) { errorMsg.value = '只支持 jpg/png/gif/webp 格式'; return }
  errorMsg.value = ''
  try {
    const res = await uploadShopAvatar(file)
    // res = { code:200, data:"https://oss.xxx/xxx.jpg" }
    form.logo = res
  } catch (err) {
    errorMsg.value = err.message || '头像上传失败'
  } finally {
    e.target.value = ''
  }
}

// ─── 保存 ───
async function handleSave() {
  if (!form.shopName.trim()) { errorMsg.value = '请输入店铺名称'; return }
  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await setupShop({
      shopName: form.shopName.trim(),
      logo: form.logo || undefined,
      description: form.description || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
    })
    successMsg.value = '保存成功'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (err) {
    errorMsg.value = err.message || '保存失败'
  } finally {
    saving.value = false
  }
}

onMounted(() => { loadShopInfo() })
</script>

<style scoped>
.ss-root {
  --bg-card:    #FFFFFF;
  --bg-input:   #F5F1E8;
  --gold:       #A07830;
  --gold-dim:   #8C6308;
  --gold-light: #C9A84C;
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

  font-family: 'Noto Sans SC', 'PingFang SC', -apple-system, sans-serif;
  color: var(--text-primary);
  display: flex; flex-direction: column; gap: 20px;
}

/* ═══════ 卡片 ═══════ */
.ss-card {
  background: var(--bg-card); border-radius: var(--radius-md);
  padding: 28px; border: 1px solid var(--border-light);
}
.ssc-head { margin-bottom: 24px; }
.ssc-head h3 {
  font-family: 'Playfair Display', serif;
  font-size: 18px; font-weight: 600; color: var(--text-primary);
}
.ssc-head p { margin-top: 4px; font-size: 13px; color: var(--text-tertiary); }

.ssc-form { display: flex; flex-direction: column; gap: 18px; max-width: 600px; }

.sscf-field { display: flex; flex-direction: column; gap: 6px; }
.sscf-field label {
  font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.02em;
}
.required { color: var(--error); }

.sscf-field input, .sscf-field textarea {
  padding: 10px 12px; border: 1.5px solid var(--border-light);
  border-radius: var(--radius-sm); font-size: 13px;
  color: var(--text-primary); outline: none; font-family: inherit;
  background: #FFF; transition: border-color 0.2s;
}
.sscf-field input:focus, .sscf-field textarea:focus { border-color: var(--gold-light); }
.sscf-field textarea { resize: vertical; }
.sscf-hint { font-size: 11px; color: var(--text-tertiary); text-align: right; }

.sscf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.sscf-logo-zone {
  width: 100px; height: 100px; border-radius: 50%;
  border: 1.5px dashed var(--border); cursor: pointer;
  overflow: hidden; transition: border-color 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.sscf-logo-zone:hover { border-color: var(--gold-light); }
.sscf-logo-preview { width: 100%; height: 100%; object-fit: cover; }
.sscf-logo-retry {
  position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
  font-size: 11px; color: var(--gold); white-space: nowrap;
}
.sscf-logo-empty {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  color: var(--text-tertiary); font-size: 10px;
}

.sscf-error { font-size: 12px; color: var(--error); }
.sscf-success { font-size: 12px; color: var(--green); }
.sscf-actions { display: flex; justify-content: flex-end; }

.btn-save {
  padding: 10px 32px; border: none; border-radius: var(--radius-sm);
  background: var(--gold); color: #FFF; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.25s; font-family: inherit;
}
.btn-save:hover:not(:disabled) { background: var(--gold-dim); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

/* ═══════ 统计数据 ═══════ */
.ss-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
}
.sss-item {
  background: var(--bg-card); border-radius: var(--radius-sm);
  padding: 18px; border: 1px solid var(--border-light);
  display: flex; flex-direction: column; gap: 4px;
}
.sssi-label { font-size: 11px; color: var(--text-tertiary); font-weight: 500; }
.sssi-val { font-size: 16px; font-weight: 700; color: var(--text-primary); }

@media (max-width: 640px) {
  .ss-stats { grid-template-columns: repeat(2, 1fr); }
  .sscf-row { grid-template-columns: 1fr; }
  .ss-card { padding: 20px; }
}
</style>
