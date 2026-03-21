<template>
  <div class="cart-page">
<div class="cart-inner">
    <!-- ══ 页头 ══ -->
    <div class="cart-header">
      <div class="ch-left">
        <h1 class="ch-title">购物车</h1>
        <span class="ch-count">共 {{ totalCount }} 件商品</span>
      </div>
      <button class="ch-clear" @click="clearAll" v-if="cartItems.length">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
        清空购物车
      </button>
      </div>
    </div>

    <!-- ══ 空购物车 ══ -->
    <div v-if="cartItems.length === 0" class="cart-empty">
      <div class="empty-icon-wrap">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <p class="empty-title">购物车还是空的</p>
      <p class="empty-sub">快去挑选你喜欢的商品吧</p>
      <button class="go-shop-btn" @click="$router.push('/home')">去逛逛 →</button>
    </div>

    <!-- ══ 主体 ══ -->
    <div v-else class="cart-body">

      <!-- 左侧 -->
      <div class="cart-left">

        <!-- 全选栏 -->
        <div class="select-all-bar">
          <div class="checkbox-wrap" @click="toggleSelectAll">
            <div :class="['checkbox', { checked: isAllSelected, partial: isPartialSelected }]">
              <svg v-if="isAllSelected" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div v-else-if="isPartialSelected" class="partial-line"></div>
            </div>
            <span>全选</span>
          </div>
          <span class="sa-hint">已选 {{ selectedCount }} 件</span>
          <button class="sa-del" @click="deleteSelected" v-if="selectedCount > 0">删除所选</button>
        </div>

        <!-- 按店铺分组 -->
        <div v-for="shop in groupedItems" :key="shop.name" class="shop-group">
          <div class="shop-header">
            <div class="checkbox-wrap" @click="toggleShop(shop.name)">
              <div :class="['checkbox', { checked: isShopAllSelected(shop.name), partial: isShopPartialSelected(shop.name) }]">
                <svg v-if="isShopAllSelected(shop.name)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div v-else-if="isShopPartialSelected(shop.name)" class="partial-line"></div>
              </div>
            </div>
            <span class="shop-icon">🏪</span>
            <span class="shop-name">{{ shop.name }}</span>
            <span class="shop-tag" v-if="shop.freeShip">免运费</span>
          </div>

          <div class="item-list">
            <div v-for="item in shop.items" :key="item.id"
              :class="['cart-item', { selected: item.selected }]">
              <div class="checkbox-wrap" @click="toggleItem(item.id)">
                <div :class="['checkbox', { checked: item.selected }]">
                  <svg v-if="item.selected" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <div class="item-img-wrap">
                <img :src="item.image" :alt="item.name" />
                <span v-if="item.tag" class="item-tag" :style="{ background: item.tagColor }">{{ item.tag }}</span>
              </div>
              <div class="item-info">
                <p class="item-name">{{ item.name }}</p>
                <p class="item-sku">{{ item.sku }}</p>
                <div class="item-badges">
                  <span v-for="b in item.badges" :key="b" class="item-badge">{{ b }}</span>
                </div>
              </div>
              <div class="item-price-col">
                <span class="item-price">¥{{ item.price }}</span>
                <span class="item-orig" v-if="item.originalPrice">¥{{ item.originalPrice }}</span>
              </div>
              <div class="item-qty-col">
                <div class="qty-ctrl">
                  <button class="qty-btn" @click="changeQty(item.id, -1)" :disabled="item.qty <= 1">−</button>
                  <span class="qty-num">{{ item.qty }}</span>
                  <button class="qty-btn" @click="changeQty(item.id, 1)">+</button>
                </div>
              </div>
              <div class="item-subtotal-col">
                <span class="item-subtotal">¥{{ (item.price * item.qty).toFixed(2) }}</span>
              </div>
              <div class="item-acts">
                <button class="item-fav" @click="moveToFav(item.id)" title="移入收藏">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <button class="item-del" @click="removeItem(item.id)" title="删除">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 凑单提示 -->
          <div class="shop-tip" v-if="shop.tipAmount > 0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            再买 <strong>¥{{ shop.tipAmount }}</strong> 可享免运费
            <button class="tip-btn">去凑单</button>
          </div>
        </div>

        <!-- 猜你喜欢 -->
        <div class="rec-zone">
          <div class="rec-head">
            <span class="rec-title">猜你还喜欢</span>
            <button class="rec-more">查看更多 →</button>
          </div>
          <div class="rec-grid">
            <div v-for="item in recommendItems" :key="item.id" class="rec-card">
              <div class="rc-img"><img :src="item.image" :alt="item.name" /></div>
              <div class="rc-body">
                <p class="rc-name">{{ item.name }}</p>
                <div class="rc-foot">
                  <span class="rc-price">¥{{ item.price }}</span>
                  <button class="rc-add" @click="addToCart(item)">+ 加入</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧结算 -->
      <div class="cart-right">
        <div class="settle-card">

          <!-- 优惠券 -->
          <div class="coupon-row" @click="showCoupon = !showCoupon">
            <div class="cr-l">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 12V22H4V12"/>
                <path d="M22 7H2v5h20V7z"/>
                <path d="M12 22V7"/>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
              <span>优惠券</span>
            </div>
            <div class="cr-r">
              <span class="cr-val" v-if="appliedCoupon">已减 ¥{{ appliedCoupon.discount }}</span>
              <span class="cr-hint" v-else>{{ availableCoupons.length }} 张可用</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                :style="{ transform: showCoupon ? 'rotate(90deg)' : 'none', transition: '.2s' }">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>

          <transition name="slide-down">
            <div v-if="showCoupon" class="coupon-panel">
              <div v-for="cp in availableCoupons" :key="cp.id"
                :class="['cp-item', { active: appliedCoupon?.id === cp.id }]"
                @click="applyCoupon(cp)">
                <div class="cp-amt">
                  <span class="cp-sym">¥</span>
                  <span class="cp-num">{{ cp.discount }}</span>
                </div>
                <div class="cp-meta">
                  <p class="cp-name">{{ cp.name }}</p>
                  <p class="cp-cond">满{{ cp.minOrder }}元可用</p>
                </div>
                <span class="cp-check" v-if="appliedCoupon?.id === cp.id">✓</span>
              </div>
              <div class="cp-none" v-if="availableCoupons.length === 0">暂无可用优惠券</div>
            </div>
          </transition>

          <!-- 价格明细 -->
          <div class="price-detail">
            <div class="pd-row">
              <span>商品合计</span>
              <span>¥{{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="pd-row" v-if="appliedCoupon">
              <span class="pd-red">优惠券</span>
              <span class="pd-red">-¥{{ appliedCoupon.discount }}</span>
            </div>
            <div class="pd-row">
              <span>运费</span>
              <span :class="{ 'pd-green': shippingFee === 0 }">
                {{ shippingFee === 0 ? '免运费' : '¥' + shippingFee }}
              </span>
            </div>
            <div class="pd-row" v-if="savedAmount > 0">
              <span class="pd-gold">已省</span>
              <span class="pd-gold">¥{{ savedAmount.toFixed(2) }}</span>
            </div>
          </div>

          <div class="price-total">
            <span class="pt-label">实付款</span>
            <div class="pt-amount">
              <span class="pt-sym">¥</span>
              <span class="pt-num">{{ finalPrice.toFixed(2) }}</span>
            </div>
          </div>

          <button class="checkout-btn" @click="checkout" :disabled="selectedCount === 0">
            <span v-if="selectedCount > 0">结算 {{ selectedCount }} 件</span>
            <span v-else>请先选择商品</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const cartItems = ref([
  { id:1, shop:'云梦精选旗舰店', freeShip:true,  name:'极简无线降噪耳机 Pro',    sku:'黑色 / 标准版',   qty:1, price:89,  originalPrice:199, selected:true,  image:'https://picsum.photos/120/120?random=1', tag:'秒杀', tagColor:'#ff5c75', badges:['7天无理由','官方正品'] },
  { id:2, shop:'云梦精选旗舰店', freeShip:true,  name:'轻量碳纤维背包 20L',      sku:'深空灰 / 20L',    qty:2, price:129, originalPrice:299, selected:true,  image:'https://picsum.photos/120/120?random=2', tag:'',     tagColor:'',       badges:['7天无理由'] },
  { id:3, shop:'全球好物直邮',   freeShip:false, name:'AI智能降噪蓝牙耳机旗舰版', sku:'星空白 / 旗舰版', qty:1, price:599, originalPrice:null, selected:false, image:'https://picsum.photos/120/120?random=3', tag:'新品', tagColor:'#a78bfa', badges:['30天退换','海外直邮'] },
  { id:4, shop:'全球好物直邮',   freeShip:false, name:'香氛扩香石套装精品礼盒',   sku:'薰衣草 / 礼盒装', qty:1, price:59,  originalPrice:159, selected:false, image:'https://picsum.photos/120/120?random=4', tag:'',     tagColor:'',       badges:['精品礼盒'] },
])

const showCoupon    = ref(false)
const appliedCoupon = ref(null)
const availableCoupons = ref([
  { id:1, discount:50, minOrder:299, name:'全品类通用券' },
  { id:2, discount:30, minOrder:199, name:'数码专区专用' },
])
const recommendItems = ref([
  { id:101, name:'智能温控随行杯', price:168, image:'https://picsum.photos/120/120?random=10' },
  { id:102, name:'手工研磨咖啡礼盒', price:89, image:'https://picsum.photos/120/120?random=11' },
  { id:103, name:'北欧风台灯',      price:219, image:'https://picsum.photos/120/120?random=12' },
  { id:104, name:'真皮笔记本A5',    price:78,  image:'https://picsum.photos/120/120?random=13' },
])
const guarantees = [
  { icon:'🔒', label:'安全支付' }, { icon:'🚚', label:'极速发货' },
  { icon:'↩️', label:'7天退换' }, { icon:'💬', label:'在线客服' },
]

// 分组
const groupedItems = computed(() => {
  const map = {}
  cartItems.value.forEach(item => {
    if (!map[item.shop]) map[item.shop] = { name: item.shop, items: [], freeShip: item.freeShip, tipAmount: 0 }
    map[item.shop].items.push(item)
  })
  Object.values(map).forEach(shop => {
    if (!shop.freeShip) {
      const total = shop.items.reduce((s, i) => s + i.price * i.qty, 0)
      shop.tipAmount = total < 199 ? +(199 - total).toFixed(0) : 0
    }
  })
  return Object.values(map)
})

const totalCount     = computed(() => cartItems.value.reduce((s, i) => s + i.qty, 0))
const selectedItems  = computed(() => cartItems.value.filter(i => i.selected))
const selectedCount  = computed(() => selectedItems.value.reduce((s, i) => s + i.qty, 0))
const subtotal       = computed(() => selectedItems.value.reduce((s, i) => s + i.price * i.qty, 0))
const shippingFee    = computed(() => subtotal.value >= 199 || subtotal.value === 0 ? 0 : 12)
const couponDiscount = computed(() => !appliedCoupon.value ? 0 : subtotal.value >= appliedCoupon.value.minOrder ? appliedCoupon.value.discount : 0)
const finalPrice     = computed(() => Math.max(0, subtotal.value - couponDiscount.value + shippingFee.value))
const savedAmount    = computed(() => {
  const orig = selectedItems.value.reduce((s, i) => s + (i.originalPrice || i.price) * i.qty, 0)
  return orig - subtotal.value + couponDiscount.value
})
const isAllSelected     = computed(() => cartItems.value.length > 0 && cartItems.value.every(i => i.selected))
const isPartialSelected = computed(() => !isAllSelected.value && cartItems.value.some(i => i.selected))
const isShopAllSelected     = (shop) => groupedItems.value.find(s => s.name === shop)?.items.every(i => i.selected) ?? false
const isShopPartialSelected = (shop) => { const s = groupedItems.value.find(s => s.name === shop); return s && !s.items.every(i => i.selected) && s.items.some(i => i.selected) }

const toggleItem      = (id) => { const i = cartItems.value.find(i => i.id === id); if (i) i.selected = !i.selected }
const toggleSelectAll = () => { const v = !isAllSelected.value; cartItems.value.forEach(i => i.selected = v) }
const toggleShop      = (shop) => { const s = groupedItems.value.find(s => s.name === shop); const v = !isShopAllSelected(shop); s?.items.forEach(i => i.selected = v) }
const changeQty       = (id, d) => { const i = cartItems.value.find(i => i.id === id); if (i) i.qty = Math.max(1, i.qty + d) }
const removeItem      = (id) => { cartItems.value = cartItems.value.filter(i => i.id !== id) }
const moveToFav       = (id) => { removeItem(id) }
const deleteSelected  = () => { cartItems.value = cartItems.value.filter(i => !i.selected) }
const clearAll        = () => { cartItems.value = [] }
const applyCoupon     = (cp) => { appliedCoupon.value = appliedCoupon.value?.id === cp.id ? null : cp; showCoupon.value = false }
const addToCart       = (item) => {
  const exist = cartItems.value.find(i => i.id === item.id)
  if (exist) { exist.qty++; return }
  cartItems.value.push({ ...item, shop:'云梦精选旗舰店', sku:'默认规格', selected:true, freeShip:true, originalPrice:null, tag:'', tagColor:'', badges:[] })
}
const checkout = () => { if (selectedCount.value > 0) alert(`即将结算 ${selectedCount.value} 件，总价 ¥${finalPrice.value.toFixed(2)}`) }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&family=Space+Mono:wght@400;700&display=swap');

/* ══ 与 HomePage/My 完全一致的变量 ══ */
:root {
  --bg:     #07091a;
  --bg2:    #0d1128;
  --surf:   rgba(255,255,255,0.06);
  --border: rgba(255,255,255,0.11);
  --text:   #eef0fa;
  --text2:  #c4cde2;
  --text3:  #7e8ba3;
  --neon:   #a78bfa;
  --neon2:  #38bdf8;
  --gold:   #f0cc7a;
  --red:    #ff5c75;
  --green:  #22c55e;
  --radius: 16px;
  --glow:   0 0 28px rgba(167,139,250,0.15);
}
* { box-sizing: border-box; margin: 0; padding: 0; }

/* ══ 页面根：与 My.vue 完全一致 ══ */
.cart-page {
  background: #0c1020;
  color: #eef0fa;
  min-height: 100vh;
  width: 100%;                    /* 背景撑满 */
  font-family: 'Noto Serif SC','PingFang SC',serif;
  padding: 32px 0 80px;           /* 上下留白，左右不设 */
}

/* 加一个内容容器包住所有内容 */
.cart-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
}

/* ══ 页头 ══ */
.cart-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px;
}
.ch-title { font-size: 22px; font-weight: 600; color: #eef0fa; }
.ch-count { font-size: 13px; color: #7e8ba3; margin-left: 12px; }
.ch-clear {
  display: flex; align-items: center; gap: 6px; background: none;
  border: 1px solid rgba(255,92,117,.25); color: #ff8099;
  font-family: inherit; font-size: 12px; padding: 7px 14px;
  border-radius: 100px; cursor: pointer; transition: .2s;
}
.ch-clear:hover { border-color: #ff5c75; background: rgba(255,92,117,.08); color: #ff5c75; }

/* ══ 空状态 ══ */
.cart-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 0; gap: 14px;
}
.empty-icon-wrap {
  width: 96px; height: 96px; border-radius: 50%;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.11);
  display: flex; align-items: center; justify-content: center;
  color: #7e8ba3; margin-bottom: 8px;
}
.empty-title { font-size: 18px; font-weight: 600; color: #c4cde2; }
.empty-sub   { font-size: 13px; color: #7e8ba3; }
.go-shop-btn {
  margin-top: 8px; padding: 11px 28px; background: #a78bfa; border: none;
  border-radius: 100px; color: #fff; font-family: inherit; font-size: 14px;
  font-weight: 600; cursor: pointer; transition: .2s;
  box-shadow: 0 0 20px rgba(167,139,250,.4);
}
.go-shop-btn:hover { transform: translateX(4px); box-shadow: 0 0 32px rgba(167,139,250,.6); }

/* ══ 主体布局 ══ */
.cart-body { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: flex-start; }
.cart-left { display: flex; flex-direction: column; gap: 14px; }

/* ── 全选栏 ── */
.select-all-bar {
  display: flex; align-items: center; gap: 14px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
  border-radius: var(--radius); padding: 13px 18px;
}
.sa-hint { font-size: 12px; color: #7e8ba3; }
.sa-del {
  margin-left: auto; background: none; border: 1px solid rgba(255,92,117,.22);
  color: #ff8099; font-family: inherit; font-size: 12px;
  padding: 5px 12px; border-radius: 100px; cursor: pointer; transition: .2s;
}
.sa-del:hover { border-color: #ff5c75; color: #ff5c75; }

/* ── Checkbox ── */
.checkbox-wrap {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  user-select: none; font-size: 13px; color: #c4cde2;
}
.checkbox {
  width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0;
  border: 1.5px solid rgba(255,255,255,.25);
  display: flex; align-items: center; justify-content: center;
  transition: .2s;
}
.checkbox.checked { background: #a78bfa; border-color: #a78bfa; }
.checkbox.partial { border-color: #a78bfa; }
.partial-line { width: 8px; height: 2px; background: #a78bfa; border-radius: 1px; }

/* ── 店铺分组 ── */
.shop-group {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
  border-radius: var(--radius); overflow: hidden;
}
.shop-header {
  display: flex; align-items: center; gap: 10px; padding: 13px 18px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  background: rgba(255,255,255,.03);
}
.shop-icon { font-size: 15px; }
.shop-name { font-size: 13px; font-weight: 600; color: #eef0fa; flex: 1; }
.shop-tag  {
  font-size: 10px; color: #22c55e;
  background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.22);
  padding: 2px 8px; border-radius: 100px;
}

/* ── 商品行 ── */
.item-list { display: flex; flex-direction: column; }
.cart-item {
  display: flex; align-items: center; gap: 14px; padding: 16px 18px;
  border-bottom: 1px solid rgba(255,255,255,.05); transition: .2s;
}
.cart-item:last-child { border-bottom: none; }
.cart-item:hover   { background: rgba(255,255,255,.03); }
.cart-item.selected { background: rgba(167,139,250,.04); }

.item-img-wrap { position: relative; flex-shrink: 0; }
.item-img-wrap img { width: 76px; height: 76px; border-radius: 10px; object-fit: cover; display: block; }
.item-tag {
  position: absolute; top: -4px; left: -4px; font-size: 9px; font-weight: 700;
  color: #fff; padding: 2px 6px; border-radius: 4px;
}

.item-info { flex: 1; min-width: 0; }
.item-name  { font-size: 13px; color: #eef0fa; margin-bottom: 5px; line-height: 1.5; }
.item-sku   { font-size: 11px; color: #7e8ba3; margin-bottom: 6px; }
.item-badges { display: flex; gap: 5px; flex-wrap: wrap; }
.item-badge  {
  font-size: 9px; color: #7e8ba3;
  border: 1px solid rgba(255,255,255,.12); padding: 2px 7px; border-radius: 4px;
}

.item-price-col { text-align: right; flex-shrink: 0; min-width: 76px; }
.item-price { display: block; font-size: 15px; font-weight: 700; color: #a78bfa; font-family: 'Space Mono',monospace; }
.item-orig  { display: block; font-size: 11px; color: #7e8ba3; text-decoration: line-through; margin-top: 2px; font-family: 'Space Mono',monospace; }

.item-qty-col { flex-shrink: 0; }
.qty-ctrl {
  display: flex; align-items: center;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.11);
  border-radius: 8px; overflow: hidden;
}
.qty-btn {
  width: 30px; height: 30px; background: transparent; border: none;
  color: #c4cde2; font-size: 16px; cursor: pointer; transition: .15s;
  display: flex; align-items: center; justify-content: center;
}
.qty-btn:hover:not(:disabled) { background: rgba(167,139,250,.15); color: #a78bfa; }
.qty-btn:disabled { color: #7e8ba3; cursor: not-allowed; }
.qty-num {
  min-width: 30px; text-align: center; font-size: 13px;
  font-family: 'Space Mono',monospace; color: #eef0fa;
}

.item-subtotal-col { text-align: right; flex-shrink: 0; min-width: 76px; }
.item-subtotal { font-size: 15px; font-weight: 700; color: #eef0fa; font-family: 'Space Mono',monospace; }

.item-acts { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.item-fav, .item-del {
  width: 28px; height: 28px; border-radius: 7px; border: 1px solid rgba(255,255,255,.11);
  background: transparent; color: #7e8ba3; cursor: pointer; transition: .2s;
  display: flex; align-items: center; justify-content: center;
}
.item-fav:hover { border-color: #ff5c75; color: #ff5c75; background: rgba(255,92,117,.08); }
.item-del:hover { border-color: rgba(255,255,255,.25); color: #c4cde2; }

/* ── 凑单提示 ── */
.shop-tip {
  display: flex; align-items: center; gap: 8px; padding: 10px 18px;
  font-size: 12px; color: #7e8ba3;
  background: rgba(167,139,250,.04); border-top: 1px solid rgba(255,255,255,.07);
}
.shop-tip strong { color: #a78bfa; }
.tip-btn {
  margin-left: auto; background: none; border: 1px solid rgba(167,139,250,.3);
  color: #a78bfa; font-family: inherit; font-size: 11px;
  padding: 4px 12px; border-radius: 100px; cursor: pointer; transition: .2s;
}
.tip-btn:hover { background: rgba(167,139,250,.1); }

/* ── 猜你喜欢 ── */
.rec-zone {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
  border-radius: var(--radius); padding: 16px 18px;
}
.rec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.rec-title { font-size: 14px; font-weight: 600; color: #eef0fa; }
.rec-more  { background: none; border: none; color: #a78bfa; font-family: inherit; font-size: 12px; cursor: pointer; }
.rec-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
.rec-card  {
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
  border-radius: 12px; overflow: hidden; cursor: pointer; transition: .25s;
}
.rec-card:hover { border-color: rgba(255,255,255,.2); transform: translateY(-3px); }
.rc-img img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
.rc-body  { padding: 9px 10px; }
.rc-name  {
  font-size: 11px; color: #c4cde2; margin-bottom: 8px; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.rc-foot  { display: flex; justify-content: space-between; align-items: center; }
.rc-price { font-size: 13px; font-weight: 700; color: #a78bfa; font-family: 'Space Mono',monospace; }
.rc-add   {
  padding: 4px 9px; background: #a78bfa; border: none; border-radius: 6px;
  color: #fff; font-family: inherit; font-size: 10px; font-weight: 600; cursor: pointer; transition: .2s;
}
.rc-add:hover { box-shadow: 0 0 10px rgba(167,139,250,.5); }

/* ══ 右侧结算 ══ */
.cart-right { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 90px; }

.settle-card {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
  border-radius: var(--radius); overflow: hidden;
}

.coupon-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,.07);
  cursor: pointer; transition: .2s;
}
.coupon-row:hover { background: rgba(255,255,255,.03); }
.cr-l { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #c4cde2; }
.cr-r { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.cr-val  { color: #ff5c75; font-weight: 600; }
.cr-hint { color: #a78bfa; }

.coupon-panel {
  padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,.07);
  display: flex; flex-direction: column; gap: 8px;
}
.cp-item {
  display: flex; align-items: center; gap: 12px; padding: 11px;
  border-radius: 10px; border: 1px solid rgba(255,255,255,.1); cursor: pointer; transition: .2s;
}
.cp-item:hover, .cp-item.active { border-color: #a78bfa; background: rgba(167,139,250,.08); }
.cp-amt  { text-align: center; min-width: 48px; }
.cp-sym  { font-size: 12px; color: #ff5c75; }
.cp-num  { font-size: 22px; font-weight: 700; color: #ff5c75; font-family: 'Space Mono',monospace; }
.cp-meta { flex: 1; }
.cp-name { font-size: 12px; color: #eef0fa; margin-bottom: 2px; font-weight: 500; }
.cp-cond { font-size: 10px; color: #7e8ba3; }
.cp-check { color: #a78bfa; font-size: 15px; font-weight: 700; }
.cp-none  { text-align: center; font-size: 12px; color: #7e8ba3; padding: 10px 0; }

.price-detail {
  padding: 14px 18px; display: flex; flex-direction: column; gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.pd-row   { display: flex; justify-content: space-between; font-size: 13px; color: #7e8ba3; }
.pd-red   { color: #ff5c75; }
.pd-green { color: #22c55e; }
.pd-gold  { color: #f0cc7a; }

.price-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,.07);
}
.pt-label  { font-size: 13px; color: #c4cde2; font-weight: 500; }
.pt-amount { display: flex; align-items: baseline; gap: 2px; }
.pt-sym    { font-size: 15px; color: #eef0fa; }
.pt-num    { font-size: 26px; font-weight: 700; color: #eef0fa; font-family: 'Space Mono',monospace; line-height: 1; }

.checkout-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: calc(100% - 32px); margin: 14px 16px;
  padding: 13px; background: #a78bfa; border: none; border-radius: 12px;
  color: #fff; font-family: inherit; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: .3s; box-shadow: 0 0 22px rgba(167,139,250,.4);
}
.checkout-btn:hover:not(:disabled) { box-shadow: 0 0 38px rgba(167,139,250,.65); transform: translateY(-1px); }
.checkout-btn:disabled { background: rgba(255,255,255,.1); color: #7e8ba3; box-shadow: none; cursor: not-allowed; }

.checkout-hint { text-align: center; font-size: 11px; color: #7e8ba3; padding: 0 16px 14px; }

/* 安全保障 */
.guarantee-card {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
  border-radius: var(--radius); padding: 14px 18px;
  display: grid; grid-template-columns: repeat(2,1fr); gap: 10px;
}
.guar-item  { display: flex; align-items: center; gap: 7px; }
.guar-icon  { font-size: 15px; }
.guar-label { font-size: 11px; color: #7e8ba3; }

/* 动画 */
.slide-down-enter-active, .slide-down-leave-active { transition: all .28s ease; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
.slide-down-enter-to, .slide-down-leave-from { opacity: 1; max-height: 400px; }

/* ── 响应式 ── */
@media (max-width:1100px) { .cart-body { grid-template-columns: 1fr; } .cart-right { position: static; } }
@media (max-width:960px)  { .cart-page { padding: 24px 24px 60px; } .rec-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width:640px)  {
  .cart-page { padding: 16px 16px 60px; }
  .cart-item { flex-wrap: wrap; }
  .item-subtotal-col, .item-acts { display: none; }
  .rec-grid { grid-template-columns: repeat(2,1fr); }
}
</style>