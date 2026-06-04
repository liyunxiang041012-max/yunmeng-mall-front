<template>
  <div class="shop-page">
    <div class="sp-inner">

      <!-- 面包屑 -->
      <div class="breadcrumb">
        <span @click="$router.push('/home')" class="bc-link">首页</span>
        <span class="bc-sep">›</span>
        <span class="bc-cur">{{ shopInfo?.shopName || '店铺' }}</span>
      </div>

      <!-- 店铺头部 -->
      <div class="shop-hero">
        <div class="sh-left">
          <div class="sh-avatar">{{ (shopInfo?.shopName || '店')[0] }}</div>
          <div class="sh-info">
            <h1 class="sh-name">{{ shopInfo?.shopName || '加载中...' }}</h1>
            <div class="sh-meta">
              <span class="sh-score">综合评分 <em>{{ shopInfo?.score ?? '--' }}</em></span>
              <span class="sh-sep">|</span>
              <span class="sh-rate">好评率 {{ shopInfo?.goodRate ?? '--' }}</span>
            </div>
            <p class="sh-desc" v-if="shopInfo?.description">{{ shopInfo.description }}</p>
          </div>
        </div>
        <div class="sh-right">
          <button
            :class="['sh-follow-btn', { following: isFollowed }]"
            :disabled="followLoading"
            @click="handleToggleFollow"
          >
            {{ followLoading ? '...' : (isFollowed ? '已关注' : '+ 关注') }}
          </button>

        </div>
      </div>

      <!-- 店铺数据 -->
      <div class="shop-stats-bar">
        <div class="ssb-item">
          <span class="ssb-num">{{ shopInfo?.itemCount ?? '--' }}</span>
          <span class="ssb-label">全部商品</span>
        </div>
        <div class="ssb-item">
          <span class="ssb-num">{{ formatShopCount(shopInfo?.totalSales) }}</span>
          <span class="ssb-label">总销量</span>
        </div>
        <div class="ssb-item">
          <span class="ssb-num">{{ shopInfo?.fansCount ?? '--' }}</span>
          <span class="ssb-label">粉丝数</span>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="shop-items-section">
        <div class="sis-head">
          <h2 class="sis-title">全部商品</h2>
          <div class="sis-sort">
            <button
              v-for="s in sorts" :key="s.key"
              :class="['sis-sort-btn', { active: activeSort === s.key }]"
              @click="activeSort = s.key"
            >{{ s.label }}</button>
          </div>
        </div>

        <div class="items-grid" v-loading="itemsLoading">
          <div
            v-for="item in shopItems" :key="item.id"
            class="item-card"
            @click="$router.push(`/product/${item.id}`)"
          >
            <div class="ic-media">
              <img :src="item.mainImage || item.image" :alt="item.name" @error="handleImageError" />
            </div>
            <div class="ic-body">
              <p class="ic-name">{{ item.name }}</p>
              <div class="ic-foot">
                <span class="ic-price">¥{{ formatPrice(item.price) }}</span>
                <span class="ic-sold" v-if="item.salesCount">已售 {{ item.salesCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!itemsLoading && shopItems.length === 0" class="empty-state">
          <span class="empty-icon">📦</span>
          <p>暂无商品</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getShopDetail, toggleFollowShop, checkFollowShop } from '@/api/shop'
import { getItemPage } from '@/api/item'
import nofoundImage from '@/assets/images/nofound.png'

const route = useRoute()
const router = useRouter()

// 图片错误处理
const handleImageError = (e) => {
  e.target.src = nofoundImage
}

// 价格格式化（分 → 元）
const formatPrice = (price) => {
  if (!price && price !== 0) return '--'
  return (price / 100).toFixed(2)
}

// 销量数字格式化
const formatShopCount = (val) => {
  if (val == null) return '--'
  if (val >= 10000) return (val / 10000).toFixed(1).replace(/\.0$/, '') + '万+'
  return String(val)
}

// ─── 店铺信息 ───
const shopInfo = ref(null)
const isFollowed = ref(false)
const followLoading = ref(false)

// ─── 商品列表 ───
const shopItems = ref([])
const itemsLoading = ref(false)
const activeSort = ref('default')
const sorts = [
  { key: 'default', label: '综合' },
  { key: 'sales',   label: '销量' },
  { key: 'price',   label: '价格' },
  { key: 'newest',  label: '最新' },
]

// 加载店铺详情
const loadShopDetail = async () => {
  const shopId = route.params.id
  if (!shopId) return

  try {
    const res = await getShopDetail(shopId)
    const data = res.data ?? res
    shopInfo.value = data
  } catch (err) {
    console.error('加载店铺详情失败:', err)
    ElMessage.error('店铺信息加载失败')
  }
}

// 加载店铺商品
const loadShopItems = async () => {
  const shopId = route.params.id
  if (!shopId) return

  itemsLoading.value = true
  try {
    const res = await getItemPage({ shopId, sort: activeSort.value })
    const data = res.data ?? res
    shopItems.value = Array.isArray(data) ? data : (data?.records ?? [])
  } catch (err) {
    console.error('加载店铺商品失败:', err)
  } finally {
    itemsLoading.value = false
  }
}

// 检查关注状态
const checkFollow = async () => {
  const shopId = route.params.id
  if (!shopId) return

  try {
    const res = await checkFollowShop(shopId)
    const data = res.data ?? res
    isFollowed.value = data?.followed ?? data ?? false
  } catch {
    // 静默失败
  }
}

// 关注/取消关注
const handleToggleFollow = async () => {
  if (followLoading.value) return
  const shopId = route.params.id
  if (!shopId) return

  followLoading.value = true
  try {
    await toggleFollowShop(shopId)
    isFollowed.value = !isFollowed.value
    ElMessage.success(isFollowed.value ? '已关注' : '已取消关注')
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  } finally {
    followLoading.value = false
  }
}

onMounted(() => {
  loadShopDetail()
  checkFollow()
  loadShopItems()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@200;300;400;500&family=Space+Mono:wght@400;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.shop-page {
  background: #F5F2EC;
  min-height: 100vh;
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  color: #1A1A18;
  padding: 24px 0 80px;
}
.sp-inner { max-width: 1320px; margin: 0 auto; padding: 0 40px; }

/* 面包屑 */
.breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
.bc-link { color: #8A8070; cursor: pointer; transition: .2s; }
.bc-link:hover { color: #A07830; }
.bc-sep { color: #C9C0B0; }
.bc-cur { color: #1A1A18; }

/* 店铺头部 */
.shop-hero {
  background: #FFF; border: 1px solid #E0D8C8; border-radius: 16px;
  padding: 28px 32px; display: flex; align-items: center; gap: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05); margin-bottom: 16px;
}
.sh-left { display: flex; align-items: center; gap: 20px; flex: 1; }
.sh-avatar {
  width: 72px; height: 72px; border-radius: 16px; flex-shrink: 0;
  background: linear-gradient(135deg, #A07830, #C9A84C);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 500; color: #FFF;
}
.sh-info { flex: 1; }
.sh-name { font-size: 22px; font-weight: 500; color: #1A1A18; margin-bottom: 8px; }
.sh-meta { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #8A8070; margin-bottom: 6px; }
.sh-meta em { font-style: normal; color: #A07830; font-weight: 600; }
.sh-sep { color: #D8D0C4; }
.sh-desc { font-size: 12px; color: #8A8070; line-height: 1.6; }
.sh-right { display: flex; gap: 10px; flex-shrink: 0; }
.sh-follow-btn {
  padding: 10px 24px; border-radius: 100px; font-family: inherit; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: .2s; border: none;
  background: linear-gradient(135deg, #A07830, #C9A84C); color: #FFF;
  box-shadow: 0 3px 12px rgba(160,120,48,0.3);
}
.sh-follow-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(160,120,48,0.4); }
.sh-follow-btn.following { background: #FFF; color: #A07830; border: 1.5px solid #C9A84C; box-shadow: none; }

/* 店铺数据条 */
.shop-stats-bar {
  background: #FFF; border: 1px solid #E0D8C8; border-radius: 14px;
  display: flex; padding: 20px 0; margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.ssb-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
  border-right: 1px solid #F0EAE0;
}
.ssb-item:last-child { border-right: none; }
.ssb-num { font-size: 24px; font-weight: 700; color: #A07830; font-family: 'Space Mono', monospace; }
.ssb-label { font-size: 12px; color: #8A8070; }

/* 商品区域 */
.sis-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.sis-title { font-size: 18px; font-weight: 500; color: #1A1A18; }
.sis-sort { display: flex; gap: 6px; }
.sis-sort-btn {
  padding: 6px 16px; border-radius: 100px; font-family: inherit; font-size: 12px;
  cursor: pointer; transition: .2s; background: #FFF; border: 1px solid #E0D8C8; color: #4A4438;
}
.sis-sort-btn:hover { border-color: #C9A84C; color: #A07830; }
.sis-sort-btn.active { border-color: #C9A84C; background: rgba(201,168,76,0.08); color: #A07830; font-weight: 500; }

.items-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.item-card {
  background: #FFF; border: 1px solid #E0D8C8; border-radius: 14px; overflow: hidden;
  cursor: pointer; transition: .25s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.item-card:hover { border-color: #C9A84C; transform: translateY(-4px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
.ic-media { overflow: hidden; }
.ic-media img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; transition: .4s; }
.item-card:hover .ic-media img { transform: scale(1.04); }
.ic-body { padding: 12px 14px; }
.ic-name {
  font-size: 13px; color: #1A1A18; line-height: 1.5; margin-bottom: 10px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.ic-foot { display: flex; align-items: center; justify-content: space-between; }
.ic-price { font-size: 16px; font-weight: 700; color: #A07830; font-family: 'Space Mono', monospace; }
.ic-sold { font-size: 11px; color: #B0A898; }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; color: #8A8070; }
.empty-icon { font-size: 40px; opacity: .4; }
.empty-state p { font-size: 14px; }

/* 响应式 */
@media (max-width: 1100px) { .items-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .sp-inner { padding: 0 16px; }
  .shop-hero { flex-direction: column; padding: 20px; }
  .sh-right { width: 100%; }
  .sh-right button { flex: 1; }
  .items-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) { .items-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
</style>
