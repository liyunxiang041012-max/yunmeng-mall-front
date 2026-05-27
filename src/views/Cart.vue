<template>
  <div class="cart-page">
    <div class="cart-inner">

      <!-- ══ 页头 ══ -->
      <div class="cart-header">
        <div class="ch-left">
          <h1 class="ch-title">购物车</h1>
          <span class="ch-count">{{ totalCount }} 件商品</span>
        </div>
        <button class="ch-clear" @click="clearAll" v-if="cartItems.length">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
          清空
        </button>
      </div>

      <!-- ══ 空购物车 ══ -->
      <div v-if="cartItems.length === 0" class="cart-empty">
        <div class="empty-icon-wrap">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <p class="empty-title">购物车空空如也</p>
        <p class="empty-sub">去挑选你心仪的商品吧</p>
        <button class="go-shop-btn" @click="$router.push('/home')">去逛逛 →</button>
      </div>

      <!-- ══ 主体 ══ -->
      <div v-else class="cart-body">

        <!-- 左侧商品列表 -->
        <div class="cart-left">

          <!-- 全选栏 -->
          <div class="select-bar">
            <div class="cb-wrap" @click="toggleSelectAll">
              <div :class="['cb', { checked: isAllSelected, partial: isPartialSelected }]">
                <svg v-if="isAllSelected" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div v-else-if="isPartialSelected" class="cb-partial"></div>
              </div>
              <span>全选</span>
            </div>
            <span class="sb-hint">已选 <em>{{ selectedCount }}</em> 件</span>
            <button class="sb-del" v-if="selectedCount > 0" @click="deleteSelected">删除所选</button>
          </div>

          <!-- 店铺分组 -->
          <div v-for="shop in groupedItems" :key="shop.name" class="shop-group">
        <!-- ✅ 修改后的正确代码（读取 shop 对象上的属性） -->
<div class="shop-head">
  <div class="cb-wrap" @click="toggleShop(shop.name)">
    <div :class="['cb', { checked: shop.isAllSelected, partial: shop.isPartialSelected }]">
      <svg v-if="shop.isAllSelected" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
      <div v-else-if="shop.isPartialSelected" class="cb-partial"></div>
    </div>
  </div>

              <span class="sh-icon">🏪</span>
              <span class="sh-name">{{ shop.name }}</span>
              <span class="sh-free" v-if="shop.freeShip">免运费</span>
            </div>

            <!-- 商品卡片 -->
            <div class="item-cards">
              <div v-for="item in shop.items" :key="item.id"
                :class="['item-card', { selected: item.selected }]">
                <div class="cb-wrap ic-cb" @click="toggleItem(item.id)">
                  <div :class="['cb', { checked: item.selected }]">
                    <svg v-if="item.selected" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>

                <!-- 大图 -->
                <div class="ic-img-wrap">
                  <img :src="item.image" :alt="item.name" class="ic-img" @error="handleImageError" />
                  <span v-if="item.tag" class="ic-tag" :style="{ background: item.tagColor }">{{ item.tag }}</span>
                </div>

                <!-- 信息区 -->
                <div class="ic-info">
                  <div class="ic-top">
                    <p class="ic-name">{{ item.name }}</p>
                    <p class="ic-sku">{{ item.sku }}</p>
                    <div class="ic-badges">
                      <span v-for="b in item.badges" :key="b" class="ic-badge">{{ b }}</span>
                      <!-- 价格变动提示 -->
                      <span v-if="item.priceChanged" class="ic-badge price-changed">
                        价格已变动
                      </span>
                    </div>
                  </div>
                  <div class="ic-bottom">
                    <div class="ic-price-wrap">
                      <span class="ic-price" :class="{ 'price-up': item.priceChanged && item.newPrice > item.snapshotPrice, 'price-down': item.priceChanged && item.newPrice < item.snapshotPrice }">¥{{ item.price }}</span>
                      <span class="ic-orig" v-if="item.originalPrice">¥{{ item.originalPrice }}</span>
                    </div>
                    <div class="ic-actions">
                      <button class="ic-fav" @click="moveToFav(item.id)" title="收藏">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                      <button class="ic-del" @click="removeItem(item.id)" title="删除">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <div class="qty-ctrl">
                      <button class="qty-btn" @click="changeQty(item.id, -1)" :disabled="item.qty <= 1">−</button>
                      <span class="qty-num">{{ item.qty }}</span>
                      <button class="qty-btn" @click="changeQty(item.id, 1)">+</button>
                    </div>
                    <span class="ic-subtotal">¥{{ (item.price * item.qty).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 凑单提示 -->
            <div class="shop-tip" v-if="shop.tipAmount > 0">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              再买 <strong>¥{{ shop.tipAmount }}</strong> 可享免运费
              <button class="tip-btn">去凑单</button>
            </div>
          </div>

          <!-- 猜你喜欢 -->
          <div class="rec-zone">
            <div class="rec-head">
              <span class="rec-title">猜你还喜欢</span>
              <button class="rec-more">换一批 ↺</button>
            </div>
            <div class="rec-grid">
              <div v-for="item in recommendItems" :key="item.id" class="rec-card" @click="addToCart(item)">
                <div class="rc-img-wrap">
                  <img :src="item.image" :alt="item.name" class="rc-img" @error="handleImageError" />
                  <div class="rc-add-mask">
                    <span>+ 加入购物车</span>
                  </div>
                </div>
                <div class="rc-body">
                  <p class="rc-name">{{ item.name }}</p>
                  <span class="rc-price">¥{{ item.price }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧结算 -->
        <div class="cart-right">

          <!-- 优惠券 -->
          <div class="settle-card">
            <div class="coupon-row" @click="showCoupon = !showCoupon">
              <div class="cr-l">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                <span>优惠券</span>
              </div>
              <div class="cr-r">
                <span class="cr-val" v-if="appliedCoupon">已减 ¥{{ appliedCoupon.discount }}</span>
                <span class="cr-hint" v-else>{{ availableCoupons.length }} 张可用</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ transform: showCoupon ? 'rotate(90deg)' : '', transition: '.2s' }"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </div>
            <transition name="slide-down">
              <div v-if="showCoupon" class="coupon-panel">
                <div v-for="cp in availableCoupons" :key="cp.id"
                  :class="['cp-item', { active: appliedCoupon?.id === cp.id }]"
                  @click="applyCoupon(cp)">
                  <div class="cp-left">
                    <span class="cp-sym">¥</span><span class="cp-num">{{ cp.discount }}</span>
                  </div>
                  <div class="cp-right">
                    <p class="cp-name">{{ cp.name }}</p>
                    <p class="cp-cond">满 {{ cp.minOrder }} 元可用</p>
                  </div>
                  <span class="cp-ck" v-if="appliedCoupon?.id === cp.id">✓</span>
                </div>
              </div>
            </transition>

            <!-- 价格明细 -->
            <div class="price-rows">
              <div class="pr-row">
                <span>商品合计</span>
                <span>¥{{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="pr-row" v-if="appliedCoupon">
                <span class="pr-red">优惠券抵扣</span>
                <span class="pr-red">−¥{{ appliedCoupon.discount }}</span>
              </div>
              <div class="pr-row">
                <span>运费</span>
                <span :class="{ 'pr-green': shippingFee === 0 }">{{ shippingFee === 0 ? '免运费' : '¥' + shippingFee }}</span>
              </div>
              <div class="pr-row pr-saved" v-if="savedAmount > 0">
                <span>已省</span>
                <span>¥{{ savedAmount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- 合计 -->
            <div class="price-total">
              <span class="pt-label">实付款</span>
              <div class="pt-num-wrap">
                <span class="pt-sym">¥</span>
                <span class="pt-num">{{ finalPrice}}</span>
              </div>
            </div>

            <button class="checkout-btn" @click="checkout" :disabled="selectedCount === 0">
              <span v-if="selectedCount > 0">结算 {{ selectedCount }} 件商品</span>
              <span v-else>请先选择商品</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <p class="checkout-hint">支持微信 / 支付宝 / 银行卡</p>
          </div>

          <!-- 安全保障 -->
          <div class="guarantee-card">
            <div v-for="g in guarantees" :key="g.label" class="guar-item">
              <span class="guar-icon">{{ g.icon }}</span>
              <span class="guar-label">{{ g.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus' 
import { getCartList, deleteCartItems, addToCart as addCartItemApi, updateCartItem } from '@/api/cart'
import { createOrder } from '@/api/order'
import nofoundImage from '@/assets/images/nofound.png'

const router = useRouter()

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.src = nofoundImage
}

// ================= 状态管理 =================
const cartItems = ref([])
const showCoupon = ref(false)
const appliedCoupon = ref(null)
const availableCoupons = ref([
  { id: 1, discount: 50, minOrder: 299, name: '全品类通用券' },
  { id: 2, discount: 30, minOrder: 199, name: '数码专区专用' },
])
const recommendItems = ref([
  { id: 101, name: '智能温控随行杯保温', price: 168, image: 'https://picsum.photos/280/280?random=10' },
  { id: 102, name: '手工研磨挂耳咖啡礼盒', price: 89, image: 'https://picsum.photos/280/280?random=11' },
  { id: 103, name: '北欧风无线充电台灯', price: 219, image: 'https://picsum.photos/280/280?random=12' },
  { id: 104, name: '真皮手工笔记本 A5', price: 78, image: 'https://picsum.photos/280/280?random=13' },
])
const guarantees = [
  { icon: '🔒', label: '安全支付' }, { icon: '🚚', label: '极速发货' },
  { icon: '↩️', label: '7天退换' }, { icon: '💬', label: '在线客服' },
]
  
// ================= 数据加载 =================
const loadCartData = async () => {
  try {
    const res = await getCartList()
    console.log('购物车接口返回的原始 res:', res)
    
    // 兼容不同的 Axios 拦截器返回格式
    const rawData = res.data || res 
    const items = Array.isArray(rawData) ? rawData : []
    
    items.forEach(item => {
      item.qty = item.quantity || 1
      item.name = item.skuName || '未知商品'
      item.shop = item.shopName || `商家${item.shopId}`
      item.selected = item.selected || false // 使用后端返回的选中状态
      
      // 直接使用后端返回的 priceChanged 标记
      item.priceChanged = item.priceChanged || false
      
      // 价格单位转换（分 → 元）
      // 1. 先保存快照价格（用于比较和显示差异）
      if (item.snapshotPrice && typeof item.snapshotPrice === 'number') {
        item.snapshotPrice = parseFloat((item.snapshotPrice / 100).toFixed(2))
      } else {
        item.snapshotPrice = 0
      }
      
      // 2. 转换实时价格（用于显示和计算）
      if (item.price && typeof item.price === 'number') {
        item.price = parseFloat((item.price / 100).toFixed(2))
      }
      
      // 3. 如果价格有变动，保存新价格（用于提交订单时显示差异）
      if (item.priceChanged) {
        item.newPrice = item.price // 当前实时价格
      }
      
      // 补充前端展示需要的默认字段
      item.freeShip = true 
      item.originalPrice = null 
      item.tag = ''
      item.tagColor = ''
      item.badges = []
      item.sku = '默认规格' 
    })
    
    cartItems.value = items
  } catch (err) {
    console.error('加载购物车失败:', err)
    ElMessage.error('加载购物车失败')
  }
}


onMounted(() => loadCartData())

// ================= 计算属性 =================
const groupedItems = computed(() => {
  const map = {}
  cartItems.value.forEach(item => {
    if (!map[item.shop]) {
      map[item.shop] = { 
        name: item.shop, items: [], freeShip: item.freeShip, tipAmount: 0,
        isAllSelected: false, isPartialSelected: false
      }
    }
    map[item.shop].items.push(item)
  })
  
  return Object.values(map).map(shop => {
    const selectedCount = shop.items.filter(i => i.selected).length
    shop.isAllSelected = selectedCount === shop.items.length && shop.items.length > 0
    shop.isPartialSelected = selectedCount > 0 && selectedCount < shop.items.length
    
    if (!shop.freeShip) {
      const total = shop.items.reduce((s, i) => s + i.price * i.qty, 0)
      shop.tipAmount = total < 199 ? +(199 - total).toFixed(0) : 0
    }
    return shop
  })
})

const totalCount = computed(() => cartItems.value.reduce((s, i) => s + i.qty, 0))
const selectedItems = computed(() => cartItems.value.filter(i => i.selected))
const selectedCount = computed(() => selectedItems.value.reduce((s, i) => s + i.qty, 0))
const subtotal = computed(() => selectedItems.value.reduce((s, i) => s + i.price * i.qty, 0))
const shippingFee = computed(() => subtotal.value >= 199 || subtotal.value === 0 ? 0 : 12)
const couponDiscount = computed(() => !appliedCoupon.value ? 0 : subtotal.value >= appliedCoupon.value.minOrder ? appliedCoupon.value.discount : 0)
const finalPrice = computed(() => Math.max(0, subtotal.value - couponDiscount.value + shippingFee.value))
const savedAmount = computed(() => {
  const orig = selectedItems.value.reduce((s, i) => s + (i.originalPrice || i.price) * i.qty, 0)
  return orig - subtotal.value + couponDiscount.value
})

const isAllSelected = computed(() => cartItems.value.length > 0 && cartItems.value.every(i => i.selected))
const isPartialSelected = computed(() => !isAllSelected.value && cartItems.value.some(i => i.selected))

// ================= 操作方法 =================
const toggleItem = (id) => {
  const i = cartItems.value.find(i => i.id === id)
  if (i) i.selected = !i.selected
}

const toggleSelectAll = () => {
  const targetState = !isAllSelected.value
  cartItems.value.forEach(i => i.selected = targetState)
}

const toggleShop = (shopName) => {
  const shop = groupedItems.value.find(s => s.name === shopName)
  if (!shop) return
  const targetState = !shop.isAllSelected 
  shop.items.forEach(i => i.selected = targetState)
}

// 👇 3. 修改更新数量：调用后端 updateCart 接口
const changeQty = async (id, d) => {
  const i = cartItems.value.find(i => i.id === id)
  if (i) {
    const newQty = Math.max(1, i.qty + d)
    i.qty = newQty
    try {
      // 后端 CartDTO 需要 skuId 和 quantity
      await updateCartItem({ skuId: i.skuId, quantity: newQty })
    } catch (e) {
      ElMessage.error('更新数量失败')
    }
  }
}

const removeItem = async (id) => {
  try {
    await deleteCartItems([id])
    cartItems.value = cartItems.value.filter(i => i.id !== id)
    ElMessage.success('删除成功')
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

const moveToFav = (id) => {
  removeItem(id)
  ElMessage.success('已移至收藏夹')
}

const deleteSelected = () => {
  const ids = cartItems.value.filter(i => i.selected).map(i => i.id)
  if (ids.length === 0) return
  
  ElMessageBox.confirm(`确认删除选中的 ${ids.length} 件商品吗？`, '提示', {
    confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      await deleteCartItems(ids)
      cartItems.value = cartItems.value.filter(i => !i.selected)
      ElMessage.success('删除成功')
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const clearAll = () => {
  if (cartItems.value.length === 0) return
  ElMessageBox.confirm('确认清空购物车？', '提示', {
    confirmButtonText: '清空', cancelButtonText: '取消', type: 'warning'
  }).then(async () => {
    try {
      const ids = cartItems.value.map(i => i.id)
      await deleteCartItems(ids)
      cartItems.value = []
      ElMessage.success('购物车已清空')
    } catch (e) {
      ElMessage.error('清空失败')
    }
  }).catch(() => {})
}

const applyCoupon = (cp) => {
  appliedCoupon.value = appliedCoupon.value?.id === cp.id ? null : cp
  showCoupon.value = false
}

const checkout = async () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择商品')
    return
  }

  try {
    // 先检测选中商品的价格是否有变动
    const changedItems = selectedItems.value.filter(item => item.priceChanged)
    
    if (changedItems.length > 0) {
      // 有价格变动,弹窗让用户确认
      let message = '<div style="text-align: left;">'
      message += '<p style="margin-bottom: 12px; color: #E74C3C; font-weight: 500;">以下商品价格已更新:</p>'
      message += '<div style="background: #F8F9FA; padding: 12px; border-radius: 8px; margin-bottom: 12px;">'
      
      changedItems.forEach(item => {
        const diff = item.newPrice - item.snapshotPrice
        const changeText = diff > 0 ? `+￥${diff.toFixed(2)}` : `-￥${Math.abs(diff).toFixed(2)}`
        const changeColor = diff > 0 ? '#E74C3C' : '#27AE60'
        
        message += `<div style="margin: 8px 0; padding: 8px; background: #FFF; border-radius: 6px;">`
        message += `<p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 500;">• ${item.name}</p>`
        message += `<p style="margin: 0; font-size: 12px; color: #8A8070;">`
        message += `原价:￥${item.snapshotPrice.toFixed(2)} → 新价:￥${item.newPrice.toFixed(2)} `
        message += `<span style="color: ${changeColor}; font-weight: 500;">(${changeText})</span>`
        message += `</p>`
        message += `</div>`
      })
      
      message += '</div>'
      message += '<p style="color: #8A8070; font-size: 12px;">请确认后继续提交订单</p>'
      message += '</div>'
      
      await ElMessageBox.confirm(
        message,
        '价格变动提示',
        {
          confirmButtonText: '确认提交',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          type: 'warning'
        }
      )
      
      // 用户确认后,清除价格变动标记
      changedItems.forEach(item => {
        item.priceChanged = false
      })
    }
    
    // 构造创建订单的参数 - 严格按照后端 OrderDTO 格式
    const orderDTO = {
      items: selectedItems.value.map(item => ({
        skuId: item.skuId,
        quantity: item.qty
      }))
    }

    console.log('创建订单参数:', orderDTO)

    // 调用后端创建订单接口
    const res = await createOrder(orderDTO)
    
    // 后端返回 Result<String>,经过拦截器后 res 就是订单ID字符串
    const orderId = res.data || res
    
    if (!orderId) {
      ElMessage.error('订单创建失败,请重试')
      return
    }

    console.log('订单创建成功,订单ID:', orderId)

    // 跳转到支付页面,只传订单ID
    router.push({
      path: '/pay',
      query: { orderId }
    })

  } catch (err) {
    // 用户取消或请求失败
    if (err === 'cancel' || err === 'close') {
      return // 用户取消,不显示错误
    }
    console.error('创建订单失败:', err)
    const errorMsg = err.response?.data?.message || err.response?.data?.msg || err.message || '订单创建失败,请重试'
    ElMessage.error(errorMsg)
  }
}

// 👇 4. 修改推荐区加购：传递 skuId 和 quantity
const addToCart = async (item) => {
  try {
    // 后端 CartDTO 需要 skuId 和 quantity
    await addCartItemApi({ skuId: item.id, quantity: 1 }) 
    ElMessage.success('加入购物车成功')
    await loadCartData() 
  } catch (e) {
    ElMessage.error('加入购物车失败')
  }
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.cart-page {
  background: #F5F2EC;
  color: #1A1A18;
  min-height: 100vh;
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  padding: 36px 0 80px;
}
.cart-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 40px;
}

/* ══ 页头 ══ */
.cart-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px;
}
.ch-left { display: flex; align-items: baseline; gap: 12px; }
.ch-title { font-size: 24px; font-weight: 500; color: #1A1A18; letter-spacing: -0.3px; }
.ch-count { font-size: 13px; color: #8A8070; }
.ch-clear {
  display: flex; align-items: center; gap: 6px; background: #FFF;
  border: 1px solid #E0D8C8; color: #8A8070;
  font-family: inherit; font-size: 12px; padding: 7px 14px;
  border-radius: 100px; cursor: pointer; transition: .2s;
}
.ch-clear:hover { border-color: #C0392B; color: #C0392B; background: rgba(192,57,43,0.04); }

/* ══ 空状态 ══ */
.cart-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 100px 0; gap: 14px;
}
.empty-icon-wrap {
  width: 100px; height: 100px; border-radius: 50%;
  background: #FFF; border: 1px solid #E0D8C8;
  display: flex; align-items: center; justify-content: center;
  color: #C9A84C; margin-bottom: 8px;
  box-shadow: 0 4px 20px rgba(201,168,76,0.1);
}
.empty-title { font-size: 18px; font-weight: 500; color: #1A1A18; }
.empty-sub   { font-size: 13px; color: #8A8070; }
.go-shop-btn {
  margin-top: 8px; padding: 11px 32px;
  background: linear-gradient(135deg, #A07830, #C9A84C);
  border: none; border-radius: 100px; color: #FFF;
  font-family: inherit; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: .2s;
  box-shadow: 0 4px 16px rgba(160,120,48,0.3);
}
.go-shop-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(160,120,48,0.4); }

/* ══ 主体 ══ */
.cart-body {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  align-items: flex-start;
}
.cart-left { display: flex; flex-direction: column; gap: 16px; }

/* ── Checkbox ── */
.cb-wrap {
  display: flex; align-items: center; gap: 9px;
  cursor: pointer; user-select: none;
  font-size: 13px; color: #4A4438;
}
.cb {
  width: 17px; height: 17px; border-radius: 5px; flex-shrink: 0;
  border: 1.5px solid #C9A84C;
  display: flex; align-items: center; justify-content: center;
  background: #FFF; transition: .15s;
}
.cb.checked { background: #C9A84C; border-color: #C9A84C; }
.cb.partial { border-color: #C9A84C; }
.cb-partial { width: 7px; height: 2px; background: #C9A84C; border-radius: 1px; }

/* ── 全选栏 ── */
.select-bar {
  display: flex; align-items: center; gap: 14px;
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 12px; padding: 12px 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.sb-hint { font-size: 12px; color: #8A8070; }
.sb-hint em { font-style: normal; color: #A07830; font-weight: 500; }
.sb-del {
  margin-left: auto; background: none; border: 1px solid rgba(192,57,43,0.2);
  color: #C0392B; font-family: inherit; font-size: 12px;
  padding: 5px 12px; border-radius: 100px; cursor: pointer; transition: .2s;
}
.sb-del:hover { border-color: #C0392B; background: rgba(192,57,43,0.04); }

/* ── 店铺分组 ── */
.shop-group {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.shop-head {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 18px; border-bottom: 1px solid #F0EAE0;
  background: #FAF8F4;
}
.sh-icon { font-size: 14px; }
.sh-name { font-size: 13px; font-weight: 500; color: #1A1A18; flex: 1; }
.sh-free {
  font-size: 10px; color: #27AE60; font-weight: 500;
  background: rgba(39,174,96,0.08); border: 1px solid rgba(39,174,96,0.2);
  padding: 2px 8px; border-radius: 100px;
}

/* ── 商品卡片 ── */
.item-cards { display: flex; flex-direction: column; }
.item-card {
  display: flex; align-items: stretch; gap: 0;
  border-bottom: 1px solid #F5F0E8;
  transition: background .2s;
  position: relative;
}
.item-card:last-child { border-bottom: none; }
.item-card:hover { background: #FFFDF8; }
.item-card.selected { background: rgba(201,168,76,0.03); }

.ic-cb {
  padding: 0 0 0 18px;
  display: flex; align-items: center;
  flex-shrink: 0;
}

/* 大图 */
.ic-img-wrap {
  position: relative; flex-shrink: 0;
  width: 120px; height: 120px;
  margin: 14px 16px;
  border-radius: 10px; overflow: hidden;
  border: 1px solid #EDE8DC;
}
.ic-img {
  width: 100%; height: 100%; object-fit: cover;
  display: block; transition: transform .4s;
}
.item-card:hover .ic-img { transform: scale(1.05); }
.ic-tag {
  position: absolute; top: 5px; left: 5px;
  font-size: 9px; font-weight: 600; color: #FFF;
  padding: 2px 7px; border-radius: 4px;
}

/* 信息区 */
.ic-info {
  flex: 1; padding: 16px 18px 16px 0;
  display: flex; flex-direction: column; justify-content: space-between;
  min-width: 0;
}
.ic-name {
  font-size: 14px; font-weight: 500; color: #1A1A18;
  margin-bottom: 5px; line-height: 1.5;
}
.ic-sku  { font-size: 11px; color: #8A8070; margin-bottom: 6px; }
.ic-badges { display: flex; gap: 5px; flex-wrap: wrap; }
.ic-badge {
  font-size: 10px; color: #8A8070;
  border: 1px solid #E0D8C8; padding: 2px 7px; border-radius: 4px;
  background: #FAFAF8;
}
.ic-badge.price-changed {
  color: #E74C3C;
  border-color: rgba(231, 76, 60, 0.3);
  background: rgba(231, 76, 60, 0.08);
  font-weight: 500;
}

.ic-bottom {
  display: flex; align-items: center; gap: 16px; margin-top: 10px;
}
.ic-price-wrap { display: flex; align-items: baseline; gap: 6px; }
.ic-price { font-size: 17px; font-weight: 700; color: #A07830; font-family: 'Space Mono', monospace; }
.ic-price.price-up { color: #E74C3C; }
.ic-price.price-down { color: #27AE60; }
.ic-orig  { font-size: 11px; color: #B0A898; text-decoration: line-through; font-family: 'Space Mono', monospace; }

.ic-actions { display: flex; gap: 6px; margin-left: auto; }
.ic-fav, .ic-del {
  width: 28px; height: 28px; border-radius: 8px;
  border: 1px solid #E0D8C8; background: #FFF;
  color: #8A8070; cursor: pointer; transition: .2s;
  display: flex; align-items: center; justify-content: center;
}
.ic-fav:hover { border-color: #C0392B; color: #C0392B; background: rgba(192,57,43,0.05); }
.ic-del:hover { border-color: #C9A84C; color: #A07830; background: rgba(201,168,76,0.06); }

.qty-ctrl {
  display: flex; align-items: center;
  border: 1px solid #E0D8C8; border-radius: 9px; overflow: hidden;
  background: #FAFAF8;
}
.qty-btn {
  width: 30px; height: 30px; background: transparent; border: none;
  color: #4A4438; font-size: 16px; cursor: pointer; transition: .15s;
  display: flex; align-items: center; justify-content: center;
}
.qty-btn:hover:not(:disabled) { background: rgba(201,168,76,0.1); color: #A07830; }
.qty-btn:disabled { color: #C9C0B0; cursor: not-allowed; }
.qty-num {
  min-width: 32px; text-align: center; font-size: 13px;
  font-family: 'Space Mono', monospace; color: #1A1A18; font-weight: 700;
  border-left: 1px solid #E0D8C8; border-right: 1px solid #E0D8C8;
  line-height: 30px;
}

.ic-subtotal {
  font-size: 16px; font-weight: 700; color: #1A1A18;
  font-family: 'Space Mono', monospace; min-width: 80px; text-align: right;
}

/* ── 凑单提示 ── */
.shop-tip {
  display: flex; align-items: center; gap: 7px; padding: 10px 18px;
  font-size: 12px; color: #8A8070;
  background: #FFFBF2; border-top: 1px solid #F0EAE0;
}
.shop-tip strong { color: #A07830; }
.tip-btn {
  margin-left: auto; background: none; border: 1px solid rgba(201,168,76,0.4);
  color: #A07830; font-family: inherit; font-size: 11px;
  padding: 4px 12px; border-radius: 100px; cursor: pointer; transition: .2s;
}
.tip-btn:hover { background: rgba(201,168,76,0.08); }

/* ── 猜你喜欢 ── */
.rec-zone {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 16px; padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.rec-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
}
.rec-title { font-size: 14px; font-weight: 500; color: #1A1A18; }
.rec-more  {
  background: none; border: none; color: #A07830;
  font-family: inherit; font-size: 12px; cursor: pointer;
  padding: 4px 10px; border-radius: 100px; transition: .2s;
}
.rec-more:hover { background: rgba(201,168,76,0.08); }
.rec-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
.rec-card  {
  border: 1px solid #E0D8C8; border-radius: 12px;
  overflow: hidden; cursor: pointer; transition: .25s;
  background: #FAFAF8;
}
.rec-card:hover { border-color: #C9A84C; transform: translateY(-3px); box-shadow: 0 6px 18px rgba(201,168,76,0.15); }
.rc-img-wrap { position: relative; overflow: hidden; }
.rc-img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; transition: transform .4s; }
.rec-card:hover .rc-img { transform: scale(1.06); }
.rc-add-mask {
  position: absolute; inset: 0;
  background: rgba(201,168,76,0.85);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .25s;
  font-size: 12px; font-weight: 500; color: #FFF;
}
.rec-card:hover .rc-add-mask { opacity: 1; }
.rc-body  { padding: 10px 11px; }
.rc-name  {
  font-size: 11px; color: #4A4438; line-height: 1.4; margin-bottom: 6px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.rc-price { font-size: 13px; font-weight: 700; color: #A07830; font-family: 'Space Mono', monospace; }

/* ══ 右侧结算 ══ */
.cart-right { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 90px; }

.settle-card {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 4px 20px rgba(201,168,76,0.1);
}

.coupon-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid #F0EAE0;
  cursor: pointer; transition: .15s;
}
.coupon-row:hover { background: #FFFBF2; }
.cr-l { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #4A4438; }
.cr-r { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.cr-val  { color: #C0392B; font-weight: 600; }
.cr-hint { color: #A07830; }

.coupon-panel {
  padding: 10px 12px; border-bottom: 1px solid #F0EAE0;
  display: flex; flex-direction: column; gap: 8px; background: #FAFAF8;
}
.cp-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  border: 1px solid #E0D8C8; cursor: pointer; transition: .2s;
  background: #FFF;
}
.cp-item:hover, .cp-item.active { border-color: #C9A84C; background: rgba(201,168,76,0.05); }
.cp-left { text-align: center; min-width: 44px; }
.cp-sym  { font-size: 11px; color: #C0392B; }
.cp-num  { font-size: 20px; font-weight: 700; color: #C0392B; font-family: 'Space Mono', monospace; }
.cp-right { flex: 1; }
.cp-name { font-size: 12px; color: #1A1A18; margin-bottom: 2px; font-weight: 500; }
.cp-cond { font-size: 10px; color: #8A8070; }
.cp-ck   { color: #A07830; font-size: 14px; font-weight: 700; }

.price-rows {
  padding: 14px 18px; display: flex; flex-direction: column; gap: 10px;
  border-bottom: 1px solid #F0EAE0;
}
.pr-row { display: flex; justify-content: space-between; font-size: 13px; color: #8A8070; }
.pr-red   { color: #C0392B; }
.pr-green { color: #27AE60; }
.pr-saved { color: #A07830; font-weight: 500; }

.price-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid #F0EAE0;
}
.pt-label  { font-size: 14px; font-weight: 500; color: #4A4438; }
.pt-num-wrap { display: flex; align-items: baseline; gap: 2px; }
.pt-sym    { font-size: 14px; color: #1A1A18; }
.pt-num    { font-size: 26px; font-weight: 700; color: #1A1A18; font-family: 'Space Mono', monospace; line-height: 1; }

.checkout-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: calc(100% - 32px); margin: 14px 16px;
  padding: 13px;
  background: linear-gradient(135deg, #A07830, #C9A84C);
  border: none; border-radius: 12px;
  color: #FFF; font-family: inherit; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: .25s;
  box-shadow: 0 4px 16px rgba(160,120,48,0.3);
}
.checkout-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(160,120,48,0.45); }
.checkout-btn:disabled { background: #E0D8C8; color: #B0A898; box-shadow: none; cursor: not-allowed; }
.checkout-hint { text-align: center; font-size: 11px; color: #B0A898; padding: 0 16px 14px; }

.guarantee-card {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 14px; padding: 14px 18px;
  display: grid; grid-template-columns: repeat(2,1fr); gap: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.guar-item  { display: flex; align-items: center; gap: 7px; }
.guar-icon  { font-size: 14px; }
.guar-label { font-size: 11px; color: #8A8070; }

/* 动画 */
.slide-down-enter-active, .slide-down-leave-active { transition: all .25s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { opacity: 1; max-height: 300px; }

/* ── 响应式 ── */
@media (max-width:1100px) {
  .cart-body { grid-template-columns: 1fr; }
  .cart-right { position: static; }
  .rec-grid { grid-template-columns: repeat(4,1fr); }
}
@media (max-width:768px) {
  .cart-inner { padding: 0 20px; }
  .ic-img-wrap { width: 90px; height: 90px; }
  .rec-grid { grid-template-columns: repeat(2,1fr); }
  .ic-subtotal { display: none; }
}
@media (max-width:480px) {
  .cart-inner { padding: 0 14px; }
  .ic-img-wrap { width: 72px; height: 72px; margin: 12px; }
  .ic-bottom { flex-wrap: wrap; gap: 10px; }
  .rec-grid { grid-template-columns: repeat(2,1fr); }
}
</style>