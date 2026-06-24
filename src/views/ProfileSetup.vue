<template>
  <div class="ps-root">
    <!-- 装饰光晕 -->
    <div class="ps-orb o1"></div>
    <div class="ps-orb o2"></div>

    <div class="ps-card">
      <!-- 头部 -->
      <div class="ps-head">
        <div class="ps-step">STEP 2/2</div>
        <h1 class="ps-title">完善个人信息</h1>
        <p class="ps-sub">让云梦更懂你，为你推荐更适合的好物</p>
      </div>

      <!-- 表单 -->
      <form class="ps-form" @submit.prevent="handleSubmit">
        <!-- 生日 -->
        <div class="ps-field">
          <label class="ps-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            生日
            <span class="ps-optional">选填</span>
          </label>
          <div class="ps-date-row">
            <select v-model="form.year" class="ps-select">
              <option :value="null">年</option>
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
            </select>
            <select v-model="form.month" class="ps-select">
              <option :value="null">月</option>
              <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
            </select>
            <select v-model="form.day" class="ps-select">
              <option :value="null">日</option>
              <option v-for="d in dayOptions" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
        </div>

        <!-- 性别 -->
        <div class="ps-field">
          <label class="ps-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="5" r="3"/><path d="M12 10v8M9 14h6"/>
            </svg>
            性别
            <span class="ps-optional">选填</span>
          </label>
          <div class="ps-gender-row">
            <button
              type="button"
              :class="['ps-gender-btn', { active: form.gender === 'male' }]"
              @click="form.gender = form.gender === 'male' ? null : 'male'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="5" r="3"/><path d="M16 3l3-3M21 0v5h-5"/>
              </svg>
              <span>男</span>
            </button>
            <button
              type="button"
              :class="['ps-gender-btn', { active: form.gender === 'female' }]"
              @click="form.gender = form.gender === 'female' ? null : 'female'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="5" r="3"/><path d="M12 10v7M9 21h6"/>
              </svg>
              <span>女</span>
            </button>
          </div>
        </div>

        <!-- 省份 -->
        <div class="ps-field">
          <label class="ps-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            所在地区
            <span class="ps-optional">选填</span>
          </label>
          <select v-model="form.province" class="ps-select ps-select-full" @change="form.city = null">
            <option :value="null">请选择省份</option>
            <option v-for="p in provinces" :key="p.code" :value="p.name">{{ p.name }}</option>
          </select>
          <select v-model="form.city" class="ps-select ps-select-full" :disabled="!form.province">
            <option :value="null">请选择城市</option>
            <option v-for="c in cities" :key="c.code" :value="c.name">{{ c.name }}</option>
          </select>
        </div>

        <!-- 按钮区 -->
        <div class="ps-actions">
          <button type="submit" class="ps-submit" :disabled="submitting">
            <span v-if="!submitting">保存并进入</span>
            <span v-else class="ps-loading"><i></i><i></i><i></i></span>
            <svg v-if="!submitting" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button type="button" class="ps-skip" @click="handleSkip">
            跳过，稍后再说
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { updateProfile } from '../api/user'
import regionData from '@/assets/region.json'

const router = useRouter()
const submitting = ref(false)

const form = reactive({
  year: null,
  month: null,
  day: null,
  gender: null,
  province: null,
  city: null
})

// 省份列表（仅省级）
const provinces = computed(() => {
  const data = regionData.data || regionData
  return (data.children || []).filter(c => c.level === 1)
})

// 城市列表（根据所选省份联动）
const cities = computed(() => {
  if (!form.province) return []
  const province = provinces.value.find(p => p.name === form.province)
  return (province?.children || []).filter(c => c.level === 2)
})

// 年份：1930 ~ 当前
const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const arr = []
  for (let y = currentYear; y >= 1930; y--) arr.push(y)
  return arr
})

// 根据年月计算天数
const dayOptions = computed(() => {
  if (!form.year || !form.month) {
    const arr = []
    for (let d = 1; d <= 31; d++) arr.push(d)
    return arr
  }
  const maxDay = new Date(form.year, form.month, 0).getDate()
  const arr = []
  for (let d = 1; d <= maxDay; d++) arr.push(d)
  return arr
})

// 自动修正 day 超出范围
import { watch } from 'vue'
watch([() => form.year, () => form.month], () => {
  if (form.day) {
    const max = dayOptions.value.length
    if (form.day > max) form.day = null
  }
})

const goHome = () => {
  localStorage.setItem('justRegistered', 'true')
  router.push('/home')
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload = {}
    if (form.year && form.month && form.day) {
      payload.birthday = `${form.year}-${String(form.month).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`
    }
    if (form.gender) payload.gender = form.gender
    if (form.province) payload.province = form.province
    if (form.city) payload.city = form.city

    if (Object.keys(payload).length > 0) {
      await updateProfile(payload)
    }

    ElMessage.success('信息保存成功！')
    goHome()
  } catch (err) {
    // 错误已在拦截器提示，直接进入首页
    goHome()
  } finally {
    submitting.value = false
  }
}

const handleSkip = () => {
  goHome()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@200;300;400;500;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }

.ps-root {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Noto Sans SC','PingFang SC',sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #F5F2EC;
  overflow-y: auto;
  padding: 32px 20px;
}

/* 装饰光晕 */
.ps-orb {
  position: absolute; border-radius: 50%; pointer-events: none;
}
.ps-orb.o1 {
  right: -100px; top: -100px;
  width: 380px; height: 380px;
  background: radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%);
}
.ps-orb.o2 {
  left: -80px; bottom: -80px;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%);
}

/* 卡片 */
.ps-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 460px;
  background: #FFF;
  border: 1px solid #E0D8C8;
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
}

/* 头部 */
.ps-head { text-align: center; margin-bottom: 32px; }
.ps-step {
  display: inline-block;
  font-size: 10px; font-weight: 600; letter-spacing: 2px;
  color: #A07830; background: rgba(201,168,76,0.12);
  padding: 3px 12px; border-radius: 100px;
  margin-bottom: 14px;
}
.ps-title { font-size: 24px; font-weight: 500; color: #1A1A18; margin-bottom: 8px; }
.ps-sub  { font-size: 13px; color: #8A8070; font-weight: 300; }

/* 表单 */
.ps-form { display: flex; flex-direction: column; gap: 24px; }
.ps-field { display: flex; flex-direction: column; gap: 8px; }
.ps-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 500; color: #4A4438;
}
.ps-label svg { color: #8A8070; flex-shrink: 0; }
.ps-optional {
  font-size: 10px; color: #8A8070; font-weight: 300;
  background: #F5F2EC; padding: 1px 6px; border-radius: 4px;
  border: 1px solid #E0D8C8;
}

/* 生日选择器 */
.ps-date-row { display: flex; gap: 10px; }
.ps-date-row .ps-select { flex: 1; }

/* 统一选择框 */
.ps-select {
  height: 44px; padding: 0 32px 0 14px;
  border: 1.5px solid #E0D8C8;
  border-radius: 10px;
  background: #F5F2EC;
  font-family: inherit; font-size: 14px;
  color: #1A1A18;
  cursor: pointer;
  -webkit-appearance: none; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238A8070' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: all 0.2s;
}
.ps-select:focus {
  outline: none;
  border-color: #C9A84C;
  background: #FFFDF8;
  box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
}
.ps-select-full { width: 100%; }

/* 性别按钮 */
.ps-gender-row { display: flex; gap: 10px; }
.ps-gender-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  height: 50px;
  border: 1.5px solid #E0D8C8;
  border-radius: 10px;
  background: #F5F2EC;
  font-family: inherit; font-size: 14px; font-weight: 400;
  color: #8A8070; cursor: pointer;
  transition: all 0.2s;
}
.ps-gender-btn:hover { border-color: #C9A84C; color: #4A4438; }
.ps-gender-btn.active {
  background: #FFFDF8; border-color: #C9A84C;
  color: #A07830; font-weight: 500;
  box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
}
.ps-gender-btn svg { flex-shrink: 0; }

/* 按钮区 */
.ps-actions { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }

.ps-submit {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 14px;
  background: linear-gradient(135deg,#A07830,#C9A84C);
  border: none; border-radius: 11px;
  color: #FFF; font-family: inherit; font-size: 15px; font-weight: 500;
  cursor: pointer; transition: .25s;
  box-shadow: 0 4px 16px rgba(160,120,48,0.3);
}
.ps-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(160,120,48,0.45); }
.ps-submit:disabled { background: #E0D8C8; color: #B0A898; box-shadow: none; cursor: not-allowed; transform: none; }

.ps-loading { display: flex; gap: 4px; align-items: center; }
.ps-loading i { width: 6px; height: 6px; border-radius: 50%; background: #FFF; display: block; animation: ps-dot 1.2s ease-in-out infinite; }
.ps-loading i:nth-child(2) { animation-delay: .2s; }
.ps-loading i:nth-child(3) { animation-delay: .4s; }
@keyframes ps-dot { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }

.ps-skip {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 11px;
  background: none; border: 1px solid #E0D8C8;
  border-radius: 10px;
  font-family: inherit; font-size: 13px; font-weight: 300;
  color: #8A8070; cursor: pointer;
  transition: all 0.2s;
}
.ps-skip:hover { border-color: #C9A84C; color: #4A4438; background: #FAFAF8; }

@media (max-width: 520px) {
  .ps-card { padding: 28px 20px; border-radius: 16px; }
  .ps-title { font-size: 20px; }
}
</style>
