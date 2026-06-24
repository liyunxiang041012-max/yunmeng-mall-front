<template>
  <div class="my-page">

    <!-- ══ 用户英雄区 ══ -->
    <section class="user-hero">
      <div class="uh-bg">
        <div class="uh-orb o1"></div>
        <div class="uh-orb o2"></div>
        <div class="uh-orb o3"></div>
        <div class="uh-grid"></div>
      </div>
      <div class="uh-inner">
        <div class="avatar-wrap" @click="triggerAvatarUpload">
          <div class="av-ring r1"></div>
          <div class="av-ring r2"></div>
          <div class="av-core">
  <img :src="userInfo.avatar || defaultUserImage" alt="头像" class="av-img" @error="handleAvatarError" />
</div>
          <div class="av-edit"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
          <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="handleAvatarUpload" />
        </div>
        <div class="uh-meta">
          <h2 class="uh-name">{{ userInfo.nickname || '云梦探索者' }}</h2>
          <p class="uh-uid"><span class="uid-label">UID</span>{{ userInfo.id || 'YM--' }}</p>
          <div class="uh-tags">
            <span class="utag gold">{{ currentLevel.icon }}{{ currentLevel.name }}</span>

          </div>
        </div>
        <div class="uh-stats">
          <div v-for="s in userStats" :key="s.label" class="ustat" :class="{ clickable: s.label === '关注' || s.label === '收藏' }" @click="handleStatClick(s.label)">
            <span class="ustat-num">{{ s.value }}</span>
            <span class="ustat-label">{{ s.label }}</span>
          </div>
        </div>
        <button class="uh-setting-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          设置
        </button>
      </div>
    </section>

    <!-- ══ 我的订单 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">ORDERS</span>
        <h2 class="section-title">我的订单</h2>
        <button class="ghost-btn" @click="orderTab='全部'">全部订单 →</button>
      </div>
      <div class="order-status-bar">
        <div v-for="s in orderStatuses" :key="s.label" :class="['ostatus', { active: orderTab === s.label }]" @click="orderTab = s.label">
          <div class="ostatus-icon">{{ s.icon }}</div>
          <span class="ostatus-label">{{ s.label }}</span>
          <em v-if="s.count > 0" class="ostatus-badge">{{ s.count }}</em>
        </div>
      </div>
      <div class="order-list" v-loading="orderLoading">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-shop-row">
              <span class="order-shop">🏪 {{ order.shop }}</span>
              <span class="order-no">{{ order.no }}</span>
            </div>
            <span :class="['order-stag', order.statusClass]">{{ order.status }}</span>
          </div>
          <div class="order-goods">
            <div v-for="g in order.goods" :key="g.id" class="order-good">
              <img :src="g.image" :alt="g.name" @error="handleImageError" />
              <div class="og-info"><p class="og-name">{{ g.name }}</p><p class="og-sku">{{ g.sku }}</p></div>
              <div class="og-right"><span class="og-price">¥{{ g.price }}</span><span class="og-qty">×{{ g.qty }}</span></div>
            </div>
          </div>
          <div class="order-footer">
            <span class="order-total">共{{ order.totalQty }}件 · 实付 <strong>¥{{ order.total }}</strong></span>
            <span v-if="order.status==='待付款' && orderCountdowns[order.id]"
              :class="['order-countdown', { 'od-expired': orderExpiredMap[order.id] }]">
              ⏱ {{ orderCountdowns[order.id] }}
            </span>
            <div class="order-actions">
              <button v-if="order.status==='待付款'" class="oa-primary" @click="$router.push(`/pay?orderId=${order.id}`)">立即付款</button>
              <button v-if="order.status==='待收货'" class="oa-default">确认收货</button>
              <button v-if="order.status==='已完成'" class="oa-primary">再次购买</button>
              <button v-if="order.status==='已完成'" class="oa-default">写评价</button>
              <button class="oa-default" @click="toggleLogistics(order.id)">{{ expandedOrder === order.id ? '收起' : '查看详情' }}</button>
            </div>
          </div>
          <transition name="expand">
            <div v-if="expandedOrder === order.id" class="order-logistics">
              <template v-if="order.logistics && order.logistics.length">
                <p class="logistics-title">📦 物流跟踪</p>
                <div v-for="(step, i) in order.logistics" :key="i" :class="['ltrack', { active: i===0 }]">
                  <div class="ltrack-dot"></div>
                  <div class="ltrack-line" v-if="i < order.logistics.length-1"></div>
                  <div class="ltrack-text"><p class="ltrack-desc">{{ step.desc }}</p><p class="ltrack-time">{{ step.time }}</p></div>
                </div>
              </template>
              <template v-else>
                <p class="logistics-title">📋 订单详情</p>
                <div class="order-detail-expand">
                  <div class="ode-row"><span class="ode-label">订单编号</span><span class="ode-val">{{ order.no }}</span></div>
                  <div class="ode-row"><span class="ode-label">订单状态</span><span class="ode-val">{{ order.status }}</span></div>
                  <div class="ode-row"><span class="ode-label">商品数量</span><span class="ode-val">{{ order.totalQty }} 件</span></div>
                  <div class="ode-row"><span class="ode-label">实付金额</span><span class="ode-val ode-price">¥{{ order.total }}</span></div>
                  <div class="ode-row" v-if="order.goods.length"><span class="ode-label">商品清单</span>
                    <span class="ode-val" v-for="g in order.goods" :key="g.id">{{ g.name }} ×{{ g.qty }}</span>
                  </div>
                </div>
              </template>
            </div>
          </transition>
        </div>
        <div v-if="filteredOrders.length === 0" class="empty-state"><span class="empty-icon">📦</span><p>暂无{{ orderTab === '全部' ? '' : orderTab }}订单</p></div>
      </div>
    </section>

    <!-- ══ 我的优惠券 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">COUPONS</span>
        <h2 class="section-title">我的优惠券</h2>
        <button class="ghost-btn" @click="$router.push('/coupon')">全部优惠券 →</button>
      </div>

      <div class="coupon-inline-list" v-loading="myCouponLoading">
        <div v-for="c in myCouponPreview" :key="c.id" :class="['cip-card', { 'cip-used': c.status === 'used', 'cip-expired': c.status === 'expired' }]">
          <div class="cip-left">
            <div class="cip-amount">
              <span v-if="c.discountType !== 'RATE_DISCOUNT'" class="cip-unit">¥</span>
              <span class="cip-value">{{ c.discountAmount }}</span>
            </div>
            <span class="cip-condition" v-if="c.minAmount > 0">满 ¥{{ c.minAmount }} 可用</span>
            <span class="cip-condition free" v-else>无门槛</span>
          </div>
          <div class="cip-body">
            <p class="cip-name">{{ c.name }}</p>
            <p class="cip-desc">{{ c.description }}</p>
            <p class="cip-expire">{{ getCouponExpireLabel(c) }}</p>
            <span :class="['cip-badge', c.status]">{{ c.status === 'unused' ? '可使用' : c.status === 'used' ? '已使用' : '已过期' }}</span>
          </div>
        </div>

        <div v-if="!myCouponLoading && myCouponPreview.length === 0" class="empty-state">
          <span class="empty-icon">🎫</span>
          <p>暂无优惠券，去领券中心看看吧</p>
        </div>
      </div>
    </section>

    <!-- ══ 收货地址 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">ADDRESS</span>
        <h2 class="section-title">收货地址</h2>
        <button class="ghost-btn" @click="openAddDialog">+ 新增地址</button>
      </div>

      <div class="address-list" v-loading="addrLoading">
        <div v-for="addr in addresses" :key="addr.id" :class="['addr-card', { 'is-default': addr.isDefault }]">
          <span v-if="addr.isDefault" class="addr-default-tag">默认</span>
          <div class="addr-main">
            <div class="addr-info-row">
  <span class="addr-name">{{ addr.name }}</span>
  <span class="addr-sep">|</span>
  <span class="addr-phone">{{ addr.phone }}</span>
</div>
            <p class="addr-full">📍 {{ addr.address }}</p>
          </div>
          <div class="addr-actions">
            <button class="addr-btn" @click="openEditDialog(addr)">编辑</button>
            <button class="addr-btn del" @click="handleDeleteAddr(addr.id)">删除</button>
            <button v-if="!addr.isDefault" class="addr-btn" @click="handleSetDefault(addr.id)">设为默认</button>
          </div>
        </div>
        <div v-if="!addrLoading && addresses.length === 0" class="empty-state">
          <span class="empty-icon">📍</span>
          <p>暂无收货地址，请先添加</p>
        </div>
      </div>
    </section>

    <!-- ══ 历史浏览 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">HISTORY</span>
        <h2 class="section-title">历史浏览</h2>
        <div class="history-bar-right">
          <div class="hdate-tabs">
            <button v-for="d in ['今天','昨天','更早']" :key="d" :class="['hdate', { active: historyDate === d }]" @click="historyDate = d">{{ d }}</button>
          </div>
          <button class="ghost-btn red-ghost" @click="clearHistory">清空</button>
        </div>
      </div>
      <div v-if="historyItems.length > 0" class="history-grid">
        <div v-for="item in historyItems" :key="item.id" class="hcard">
          <div class="hcard-media">
            <img :src="item.image" :alt="item.name" @error="handleImageError" />
            <button class="hcard-del" @click.stop="removeHistory(item.id)">✕</button>
            <span class="hcard-time">{{ item.viewTime }}</span>
          </div>
          <div class="hcard-body">
            <p class="hcard-name">{{ item.name }}</p>
            <div class="hcard-foot"><span class="hcard-price">¥{{ item.price }}</span><button class="hcard-cart">加购</button></div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state"><span class="empty-icon">👀</span><p>暂无浏览记录</p></div>
    </section>

    <!-- ══ 我的收藏 ══ -->
    <section class="section-block" id="favorites-section">
      <div class="section-head">
        <span class="eyebrow">FAVORITES</span>
        <h2 class="section-title">我的收藏</h2>
        <button class="ghost-btn">全部收藏 →</button>
      </div>
      <div class="fav-grid" v-loading="favLoading">
        <div v-for="item in favItems" :key="item.id" class="fav-card">
          <div class="fav-media"><img :src="item.image" :alt="item.name" @error="handleImageError" /><button class="fav-heart" @click="removeFav(item.id)">♥</button></div>
          <div class="fav-body"><p class="fav-name">{{ item.name }}</p><div class="fav-foot"><span class="fav-price">¥{{ item.price }}</span><button class="fav-buy">购买</button></div></div>
        </div>
      </div>
      <div v-if="!favLoading && favItems.length === 0" class="empty-state"><span class="empty-icon">💔</span><p>暂无收藏商品</p></div>
    </section>

    <!-- ══ 我的关注 ══ -->
    <section class="section-block" id="follows-section">
      <div class="section-head">
        <span class="eyebrow">FOLLOWING</span>
        <h2 class="section-title">我的关注</h2>
      </div>
      <div class="follow-shop-list" v-loading="followLoading">
        <div v-for="shop in followedShops" :key="shop.id" class="follow-shop-card" @click="$router.push(`/shop/${shop.id}`)">
          <div class="fsc-avatar">{{ (shop.shopName || '店')[0] }}</div>
          <div class="fsc-body">
            <p class="fsc-name">{{ shop.shopName }}</p>
            <div class="fsc-stats">
              <span class="fsc-stat">好评率 {{ shop.goodRate || '--' }}</span>
              <span class="fsc-stat">销量 {{ formatShopCount(shop.totalSales) }}</span>
            </div>
          </div>
          <button class="fsc-unfollow" @click.stop="handleUnfollow(shop.id)">已关注</button>
        </div>
      </div>
      <div v-if="!followLoading && followedShops.length === 0" class="empty-state"><span class="empty-icon">🏪</span><p>暂无关注的店铺</p></div>
    </section>

    <!-- ══ 更多服务 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">SERVICES</span>
        <h2 class="section-title">更多服务</h2>
      </div>
      <div class="tools-grid">
        <div v-for="tool in toolItems" :key="tool.id" class="tool-card" :style="{'--tc': tool.color}" @click="handleToolClick(tool)">
          <div class="tool-icon">{{ tool.icon }}</div>
          <div class="tool-info"><span class="tool-name">{{ tool.name }}</span><span class="tool-desc">{{ tool.desc }}</span></div>
          <svg class="tool-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <em v-if="tool.badge" class="tool-badge">{{ tool.badge }}</em>
        </div>
      </div>
    </section>
    <!-- ══ 账号安全 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">SECURITY</span>
        <h2 class="section-title">账号安全</h2>
      </div>
      <div class="security-list">
        <div v-for="item in securityItems" :key="item.id" class="sec-item">
          <div class="sec-icon" :style="{ color: item.color }">{{ item.icon }}</div>
          <div class="sec-info"><p class="sec-name">{{ item.name }}</p><p class="sec-desc">{{ item.desc }}</p></div>
          <div class="sec-right"><span :class="['sec-status', item.ok ? 'ok' : 'warn']">{{ item.ok ? '已设置' : '未设置' }}</span><button class="sec-btn">{{ item.action }}</button></div>
        </div>
      </div>
    </section>

    <!-- ══ 新增 / 编辑地址弹窗 ══ -->
    <transition name="dialog-fade">
      <div v-if="showAddrDialog" class="addr-dialog-mask" @click.self="closeAddrDialog">
        <div class="addr-dialog">
          <div class="addr-dialog-head">
            <h3>{{ isEditMode ? '编辑收货地址' : '新增收货地址' }}</h3>
            <button class="dialog-close" @click="closeAddrDialog">✕</button>
          </div>
          <div class="addr-form">
            <div class="form-item">
              <label>收货人姓名</label>
              <input v-model.trim="addrForm.name" placeholder="请输入姓名" />
            </div>
            <div class="form-item">
              <label>手机号码</label>
              <input v-model="addrForm.phone" type="tel" placeholder="11位手机号" />
            </div>
            <div class="form-item">
              <label>详细地址</label>
              <div class="form-item">
  <label>所在地区</label>
  <div class="region-selects">
    <select v-model="addrForm.provinceCode" @change="handleRegionChange('province')">
      <option value="" disabled>省/直辖市</option>
      <option v-for="p in provinceOptions" :key="p.code" :value="p.code">{{ p.name }}</option>
    </select>
    <select v-model="addrForm.cityCode" @change="handleRegionChange('city')" :disabled="!addrForm.provinceCode">
      <option value="" disabled>市/区</option>
      <option v-for="c in cityOptions" :key="c.code" :value="c.code">{{ c.name }}</option>
    </select>
    <select v-model="addrForm.districtCode" :disabled="!addrForm.cityCode">
      <option value="" disabled>区/县</option>
      <option v-for="d in districtOptions" :key="d.code" :value="d.code">{{ d.name }}</option>
    </select>
  </div>
</div>
<div class="form-item">
  <label>详细地址</label>
  <textarea v-model.trim="addrForm.detail" placeholder="街道、小区、楼栋、门牌号等" rows="2"></textarea>
</div>

            </div>
            <label class="form-check">
              <input type="checkbox" v-model="addrForm.isDefault" />
              <span>设为默认地址</span>
            </label>
            <div class="form-footer">
              <button type="button" class="btn-ghost" @click="closeAddrDialog">取消</button>
              <button type="button" class="btn-primary" :disabled="!isFormValid || addrSubmitting" @click="submitAddrForm">
                {{ addrSubmitting ? '提交中...' : (isEditMode ? '保存修改' : '确认添加') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserDetail, getMyAddresses, addAddress, setDefaultAddress, updateAddress, deleteAddress, uploadAvatar, getUnreadNoticeCount } from '../api/user'
import { getUserOrders, getOrderItems } from '../api/order'
import { getMyFavorites, toggleFavorite, getBrowseHistory, deleteBrowseHistory, clearBrowseHistory } from '../api/item'
import { getMyCoupons } from '../api/coupon'
import { getMyFollows, toggleFollowShop } from '../api/shop'
import regionData from '@/assets/region.json' // 👈 替换为你存放JSON的实际路径
import nofoundImage from '@/assets/images/nofound.png'
import defaultUserImage from '@/assets/images/defaultuser.png'

const router = useRouter()

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.src = nofoundImage
}

// 头像加载失败处理
const handleAvatarError = (e) => {
  console.warn('[头像] 图片加载失败, 当前 src:', e.target.src)
  e.target.src = defaultUserImage
}

// 头像上传
const avatarInput = ref(null)
const avatarUploading = ref(false)

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 5MB')
    return
  }
  try {
    avatarUploading.value = true
    const avatarUrl = await uploadAvatar(file)
    console.log('[头像上传] 后端返回 URL:', avatarUrl)
    
    if (avatarUrl && typeof avatarUrl === 'string') {
        const fullUrl = resolveImageUrl(avatarUrl)
        // 立即更新前端显示
      userInfo.value.avatar = fullUrl
      console.log('[头像上传] 最终设置 src:', fullUrl)
      ElMessage.success('头像上传成功')
    } else {
      console.warn('[头像上传] data 不是字符串:', typeof avatarUrl, avatarUrl)
      ElMessage.error('上传成功但未获取到头像地址')
    }
  } catch (err) {
    console.error('[头像上传] 请求异常:', err)
    ElMessage.error(err.message || '头像上传失败')
  } finally {
    avatarUploading.value = false
    if (avatarInput.value) avatarInput.value.value = ''
  }
}

// 地址联动数据
const allRegions = ref(regionData.data?.children || [])
const provinceOptions = computed(() => allRegions.value)
const cityOptions = ref([])
const districtOptions = ref([])

// 表单结构更新：拆分省市区+详情
const addrForm = ref({
  name: '', phone: '',
  provinceCode: '', provinceName: '',
  cityCode: '', cityName: '',
  districtCode: '', districtName: '',
  detail: '', isDefault: false
})

// 表单验证
const isFormValid = computed(() => {
  const f = addrForm.value
  return f.name.trim().length > 0 &&
         /^1[3-9]\d{9}$/.test(f.phone) &&
         f.provinceCode && f.cityCode &&
         f.detail.trim().length > 0
})

// 联动处理（自动兼容直辖市：省->区，省->市->区）
const handleRegionChange = (level) => {
  const f = addrForm.value
  if (level === 'province') {
    const prov = allRegions.value.find(p => p.code === f.provinceCode)
    f.provinceName = prov?.name || ''
    // 清空下级
    f.cityCode = ''; f.cityName = ''; f.districtCode = ''; f.districtName = ''
    districtOptions.value = []
    // 直辖市children直接是区(level:3)，普通省份是市(level:2)，统一塞入cityOptions
    cityOptions.value = prov?.children || []
  } 
  else if (level === 'city') {
    const city = cityOptions.value.find(c => c.code === f.cityCode)
    f.cityName = city?.name || ''
    // 清空区县
    f.districtCode = ''; f.districtName = ''
    districtOptions.value = city?.children || []
  }
}

// 打开新增
const openAddDialog = () => {
  isEditMode.value = false
  editingAddrId.value = null
  addrForm.value = { name: '', phone: '', provinceCode: '', provinceName: '', cityCode: '', cityName: '', districtCode: '', districtName: '', detail: '', isDefault: false }
  cityOptions.value = []
  districtOptions.value = []
  showAddrDialog.value = true
}

// 打开编辑（智能反解析后端返回的单字符串地址）
const openEditDialog = (addr) => {
  isEditMode.value = true
  editingAddrId.value = addr.id
  addrForm.value = { ...addrForm.value, name: addr.name, phone: addr.phone, isDefault: addr.isDefault, detail: addr.address }
  
  // 尝试将完整地址反解析回省市区（兼容格式：北京市东城区某某路1号 或 河北省石家庄市裕华区某某路1号）
  parseAddressString(addr.address)
  showAddrDialog.value = true
}

// 反解析辅助函数
// 🔧 替换原有的 parseAddressString
const parseAddressString = (fullAddr) => {
  const f = addrForm.value
  let rest = fullAddr.trim()

  // 1. 清空旧状态，防止编辑时残留
  f.provinceCode = ''; f.provinceName = ''
  f.cityCode = ''; f.cityName = ''
  f.districtCode = ''; f.districtName = ''
  f.detail = ''
  cityOptions.value = []
  districtOptions.value = []

  // 2. 匹配省
  const prov = allRegions.value.find(p => rest.startsWith(p.name))
  if (!prov) {
    f.detail = fullAddr // 无法识别省级，全部放入详细地址
    return
  }
  f.provinceCode = prov.code
  f.provinceName = prov.name
  rest = rest.slice(prov.name.length)
  cityOptions.value = prov.children || [] // 直辖市这里直接是区列表

  // 3. 匹配下一级（可能是地级市 level:2，也可能是直辖市的区 level:3）
  const nextNode = prov.children?.find(c => rest.startsWith(c.name))
  if (!nextNode) {
    f.detail = rest.trim()
    return
  }

  // 🎯 核心分支：根据 JSON 中的 level 字段区分层级
  if (nextNode.level === 2) {
    // ✅ 普通省份：匹配到的是地级市
    f.cityCode = nextNode.code
    f.cityName = nextNode.name
    rest = rest.slice(nextNode.name.length)
    districtOptions.value = nextNode.children || []

    // 继续匹配区县
    const district = nextNode.children?.find(d => rest.startsWith(d.name))
    if (district) {
      f.districtCode = district.code
      f.districtName = district.name
      rest = rest.slice(district.name.length)
    }
  } else if (nextNode.level === 3) {
    // ✅ 直辖市：匹配到的直接就是区
    // 为了与模板第二个 <select v-model="addrForm.cityCode"> 对齐，直接赋值给 cityCode
    f.cityCode = nextNode.code
    f.cityName = nextNode.name
    districtOptions.value = [] // 第三个下拉框保持禁用
    rest = rest.slice(nextNode.name.length)
  }

  // 4. 剩余部分即为详细门牌
  f.detail = rest.trim()
}


const closeAddrDialog = () => {
  showAddrDialog.value = false
}

// 提交表单（核心：拼接成单字符串）
const submitAddrForm = async () => {
  if (!isFormValid.value) return
  addrSubmitting.value = true
  try {
    const f = addrForm.value
    // 👇 拼接成后端需要的单字符串
    const fullAddress = `${f.provinceName}${f.cityName}${f.districtName}${f.detail.trim()}`
    
    const payload = {
      receiver:  f.name,
      phone:     f.phone,
      address:   fullAddress,
      isDefault: f.isDefault ? 1 : 0,
    }
    if (isEditMode.value) {
      payload.id = editingAddrId.value
      await updateAddress(editingAddrId.value, payload)
      ElMessage.success('地址已更新')
    } else {
      await addAddress(payload)
      ElMessage.success('添加成功')
    }
    await loadAddr()
    closeAddrDialog()
  } catch (err) {
    ElMessage.error(err.message || (isEditMode.value ? '修改失败' : '添加失败'))
  } finally {
    addrSubmitting.value = false
  }
}
// 其他地址方法 (handleDeleteAddr, handleSetDefault, loadAddr) 保持你原有的不变

// ─── 用户信息 ─────────────────────────────────────────────────
// 解析后端图片路径：相对路径自动拼接后端基地址
const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return ''
  if (url.startsWith('http')) return url
  const baseUrl = 'http://localhost:8080'
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

const userInfo = ref({
  id: '',
  nickname: '',
  avatar: '',
  experience: 0,
})

const loadUserInfo = async () => {
  try {
    const res = await getUserDetail()
    const data = res.data || {}
    const rawAvatar = data.avatar
    userInfo.value = {
      id:         data.id || '',
      nickname:   data.nickname || data.username || '云梦探索者',
      avatar:     resolveImageUrl(rawAvatar) || `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.id || Math.random()}`,
      experience: data.experience || 0,
    }
    // 根据 experience 动态更新会员等级
    updateMemberLevels(userInfo.value.experience)
  } catch {
    // 静默失败，保留默认值
  }
}

const userStats = computed(() => [
  { label: '关注', value: shopFollowCount.value },
  { label: '收藏', value: favItems.value.length },
  { label: '足迹', value: footprintTotal.value },
])

// 店铺关注数
const followedShops = ref([])
const followLoading = ref(false)
const shopFollowCount = computed(() => followedShops.value.length)

// ─── 订单 ─────────────────────────────────────────────────────
const orderTab      = ref('全部')
const expandedOrder = ref(null)
const orderLoading  = ref(false)

// 后端状态枚举 → 前端显示（兼容整数和字符串枚举名）
const statusMap = {
  0: { label: '待付款',   statusClass: 'st-pending'  },
  1: { label: '待发货',   statusClass: 'st-paid'     },
  2: { label: '待收货',   statusClass: 'st-shipping' },
  3: { label: '已完成',   statusClass: 'st-done'     },
  4: { label: '已取消',   statusClass: 'st-cancel'   },
  5: { label: '退款售后', statusClass: 'st-refund'   },
  // 兼容后端返回字符串枚举名
  'PENDING_PAYMENT': { label: '待付款',   statusClass: 'st-pending'  },
  'PAID':            { label: '待发货',   statusClass: 'st-paid'     },
  'SHIPPED':         { label: '待收货',   statusClass: 'st-shipping' },
  'COMPLETED':       { label: '已完成',   statusClass: 'st-done'     },
  'CANCELLED':       { label: '已取消',   statusClass: 'st-cancel'   },
  'REFUNDED':        { label: '退款售后', statusClass: 'st-refund'   },
}

const orders = ref([])

const orderStatuses = computed(() => {
  const counts = { '待付款': 0, '待发货': 0, '待收货': 0, '已完成': 0, '已取消': 0, '退款售后': 0 }
  orders.value.forEach(o => {
    if (counts[o.status] !== undefined) counts[o.status]++
  })
  return [
    { label: '全部',     icon: '📋', count: orders.value.length },
    { label: '待付款',   icon: '⏳', count: counts['待付款']   },
    { label: '待发货',   icon: '📦', count: counts['待发货']   },
    { label: '待收货',   icon: '🚚', count: counts['待收货']   },
    { label: '已完成',   icon: '✓',  count: counts['已完成']   },
    { label: '已取消',   icon: '✕',  count: counts['已取消']   },
    { label: '退款售后', icon: '↩️', count: counts['退款售后'] },
  ]
})

const loadOrders = async () => {
  orderLoading.value = true
  try {
    const res = await getUserOrders()
    const list = res.data || []
    console.log('[订单列表] 后端返回:', JSON.stringify(list.map(o => ({ id: o.id, status: o.status, statusType: typeof o.status, expireTime: o.expireTime }))))
    // 并行获取每个订单的商品明细
    const ordersWithItems = await Promise.all(
      list.map(async (order) => {
        const sm = statusMap[order.status] || { label: '未知', statusClass: '' }
        let goods = []
        try {
          const itemsRes = await getOrderItems(order.id)
          const itemsData = itemsRes.data || []
          goods = itemsData.map(item => ({
            id: item.id,
            image: item.image || item.imageUrl || '',
            name: item.name || item.itemName || '',
            sku: item.sku || item.skuName || '',
            price: item.price ? (item.price / 100).toFixed(2) : '0.00',
            qty: item.quantity || 0,
          }))
        } catch { /* 明细获取失败不影响订单展示 */ }

        const totalQty = goods.reduce((s, g) => s + g.qty, 0)
        const totalAmount = order.totalAmount ? (order.totalAmount / 100).toFixed(2) : '0.00'

        return {
          id: order.id,
          shop: order.shopName || '云梦商城',
          no: order.orderNo || order.id,
          rawStatus: order.status,           // 保留原始状态码用于倒计时判断
          status: sm.label,
          statusClass: sm.statusClass,
          expireTime: order.expireTime || '', // 订单过期时间
          total: totalAmount,
          totalQty,
          goods,
          logistics: [],  // 物流信息后端暂未提供
        }
      })
    )
    orders.value = ordersWithItems
    // 启动待付款订单的倒计时
    startOrderCountdowns()
  } catch (err) {
    console.error('加载订单失败:', err)
  } finally {
    orderLoading.value = false
  }
}

const filteredOrders = computed(() => orderTab.value === '全部' ? orders.value : orders.value.filter(o => o.status === orderTab.value))
const toggleLogistics = (id) => { expandedOrder.value = expandedOrder.value === id ? null : id }

// ─── 订单倒计时 ─────────────────────────────────────────────────
const orderCountdowns = ref({})    // { orderId: 'MM:SS' }
const orderExpiredMap = ref({})    // { orderId: true }
let orderCountdownTimers = {}

const getRemainingSeconds = (expireTime) => {
  if (!expireTime) return -1
  // 兼容两种格式: "2026-06-18 16:09:56" 和 "2026-06-18T16:09:57"
  const dt = new Date(expireTime.replace(/-/g, '/').replace('T', ' '))
  if (isNaN(dt.getTime())) return -1
  return Math.max(0, Math.floor((dt.getTime() - Date.now()) / 1000))
}

const formatCountdown = (seconds) => {
  if (seconds < 0) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const startOrderCountdowns = () => {
  // 先清除旧定时器
  stopOrderCountdowns()
  orders.value.forEach(order => {
    // 只有待付款（rawStatus=0 或 'PENDING_PAYMENT'）且有过期时间的订单才倒计时
    const isPending = order.rawStatus === 0 || order.rawStatus === 'PENDING_PAYMENT'
    if (!isPending || !order.expireTime) return
    console.log('[订单倒计时] 启动:', order.id, 'expireTime:', order.expireTime)
    const tick = () => {
      const remaining = getRemainingSeconds(order.expireTime)
      if (remaining <= 0) {
        orderCountdowns.value[order.id] = '已超时'
        orderExpiredMap.value[order.id] = true
        clearInterval(orderCountdownTimers[order.id])
        delete orderCountdownTimers[order.id]
        return
      }
      orderCountdowns.value[order.id] = formatCountdown(remaining) + ' 后取消'
    }
    tick()
    orderCountdownTimers[order.id] = setInterval(tick, 1000)
  })
}

const stopOrderCountdowns = () => {
  Object.values(orderCountdownTimers).forEach(clearInterval)
  orderCountdownTimers = {}
}

// ─── 地址 ─────────────────────────────────────────────────────
const addresses      = ref([])
const addrLoading    = ref(false)
const showAddrDialog = ref(false)
const isEditMode     = ref(false)
const addrSubmitting = ref(false)
const editingAddrId  = ref(null)

const handleDeleteAddr = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该地址？', '提示', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    await deleteAddress(id)
    addresses.value = addresses.value.filter(a => a.id !== id)
    ElMessage.success('删除成功')
  } catch {
    // 取消删除，不做任何事
  }
}

const handleSetDefault = async (id) => {
  try {
    await setDefaultAddress(id)
    addresses.value.forEach(a => { a.isDefault = (a.id === id) })
    ElMessage.success('已设为默认地址')
  } catch {
    ElMessage.error('设置失败')
  }
}

const loadAddr = async () => {
  addrLoading.value = true
  try {
    const res = await getMyAddresses()
    addresses.value = (res.data || []).map(item => ({
      id:        item.id,
      name:      item.receiver,
      phone:     item.phone,
      address:   item.address,
      isDefault: item.isDefault === 1,
      createTime: item.createTime,
    }))
  } catch (err) {
    ElMessage.error(err.message || '地址加载失败')
  } finally {
    addrLoading.value = false
  }
}

// ─── 历史浏览 ─────────────────────────────────────────────────
const historyDate  = ref('今天')
const historyItems = ref([])
const historyLoading = ref(false)
const footprintTotal = ref(0)

const formatViewTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (hours < 48) return '昨天'
    return `${Math.floor(hours / 24)}天前`
  } catch {
    return timeStr
  }
}

const loadHistory = async () => {
  historyLoading.value = true
  try {
    const res = await getBrowseHistory({ page: 1, size: 20 })
    // 后端返回 PageDTO 分页结构，数据在 data.list 中
    const pageData = res?.data ?? res
    const list = Array.isArray(pageData?.list) ? pageData.list : []
    footprintTotal.value = pageData?.total ?? list.length
    historyItems.value = list.map(h => ({
      id: h.id,
      image: resolveImageUrl(h.mainImage || h.image || ''),
      name: h.name || h.itemName || '',
      price: formatPrice(h.price),
      viewTime: formatViewTime(h.createTime || h.viewTime),
    }))
  } catch (err) {
    console.error('[历史浏览] 加载失败:', err)
    console.error('[历史浏览] 响应详情:', err.response?.data)
  } finally {
    historyLoading.value = false
  }
}

const removeHistory = async (id) => {
  try {
    await deleteBrowseHistory(id)
    historyItems.value = historyItems.value.filter(i => i.id !== id)
    ElMessage.success('已移除')
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  }
}

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm('确认清空所有浏览记录？', '提示', {
      confirmButtonText: '清空', cancelButtonText: '取消', type: 'warning'
    })
    await clearBrowseHistory()
    historyItems.value = []
    ElMessage.success('已清空')
  } catch {
    // 取消
  }
}

// ─── 收藏 ─────────────────────────────────────────────────────
const favItems = ref([])
const favLoading = ref(false)

const formatPrice = (price) => {
  if (!price && price !== 0) return '--'
  return (price / 100).toFixed(2)
}

const loadFavorites = async () => {
  favLoading.value = true
  try {
    const res = await getMyFavorites({ page: 1, size: 20 })
    // 后端返回 PageDTO 分页结构，数据在 data.list 中
    const pageData = res?.data ?? res
    const list = Array.isArray(pageData?.list) ? pageData.list : []
    favItems.value = list.map(item => ({
      id: item.id ?? item.itemId,
      itemId: item.itemId ?? item.id,
      image: resolveImageUrl(item.mainImage || item.image || ''),
      name: item.name || item.itemName || '',
      price: formatPrice(item.price),
    }))
  } catch (err) {
    console.error('[收藏] 加载失败:', err)
    console.error('[收藏] 响应详情:', err.response?.data)
  } finally {
    favLoading.value = false
  }
}

// ─── 我的优惠券（内嵌预览） ───
const myCouponPreview = ref([])
const myCouponLoading = ref(false)

const formatCouponAmount = (val, discountType) => {
  if (!val && val !== 0) return '--'
  const n = Number(val)
  if (discountType === 'RATE_DISCOUNT') {
    return `${(n / 10).toFixed(1)}折`.replace('.0折', '折')
  }
  return n > 100 ? (n / 100).toFixed(0) : String(n)
}

const formatCouponDiscountType = (type) => {
  const map = {
    'PRICE_DISCOUNT': '满减券',
    'PER_PRICE_DISCOUNT': '每满减券',
    'RATE_DISCOUNT': '折扣券',
    'NO_THRESHOLD': '无门槛券',
  }
  return map[type] || type || '全场通用'
}

const normalizeCouponStatus = (s) => {
  if (!s && s !== 0) return 'unused'
  if (s === 1 || s === '1') return 'unused'
  if (s === 2 || s === '2') return 'used'
  if (s === 3 || s === '3') return 'expired'
  return 'unused'
}

const getCouponExpireLabel = (c) => {
  if (c.status === 'used') return '已使用'
  if (c.status === 'expired') return '已过期'
  if (!c.expireTime) return ''
  // 格式化时间戳
  const t = c.expireTime
  if (typeof t === 'string' && t.includes('T')) return `有效期至 ${t.split('T')[0]}`
  return `有效期至 ${t}`
}

const loadMyCouponsPreview = async () => {
  myCouponLoading.value = true
  try {
    const res = await getMyCoupons({ pageNo: 1, pageSize: 6 })
    const list = res?.list ?? []
    myCouponPreview.value = list.map(c => ({
      id: c.id,
      name: c.name,
      discountType: c.discountType,
      description: formatCouponDiscountType(c.discountType),
      discountAmount: formatCouponAmount(c.discountValue, c.discountType),
      minAmount: c.thresholdAmount > 100 ? (c.thresholdAmount / 100).toFixed(0) : String(c.thresholdAmount),
      expireTime: c.termEndTime || '',
      status: normalizeCouponStatus(c.status),
    }))
  } catch (err) {
    console.error('[我的优惠券预览] 加载失败:', err)
  } finally {
    myCouponLoading.value = false
  }
}

const removeFav = async (id) => {
  try {
    const item = favItems.value.find(i => i.id === id)
    const itemId = item?.itemId || id
    await toggleFavorite(itemId)
    favItems.value = favItems.value.filter(i => i.id !== id)
    ElMessage.success('已取消收藏')
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  }
}

// ─── 工具 ─────────────────────────────────────────────────────
const toolItems = ref([
  { id: 1, icon: '⭐', name: '商品评价',   desc: '待评价 3 件',  color: '#f0cc7a', badge: '3'   },
  { id: 2, icon: '🔔', name: '消息通知',   desc: '暂无通知',    color: '#a78bfa', badge: null,  path: '/notice' },
  { id: 3, icon: '🎫', name: '我的优惠券', desc: '8张可用',      color: '#f472b6', badge: '8',   path: '/coupon' },
  { id: 4, icon: '🎁', name: '礼品卡',     desc: '2张未使用',    color: '#22c55e', badge: null  },
  { id: 5, icon: '🤝', name: '邀请有礼',   desc: '邀好友得红包', color: '#ff6b35', badge: 'NEW' },
  { id: 6, icon: '📊', name: '消费统计',   desc: '查看消费报告', color: '#38bdf8', badge: null  },
  { id: 7, icon: '📍', name: '收货地址',   desc: '管理收货地址', color: '#818cf8', badge: null  },
  { id: 8, icon: '🛡️', name: '账号安全',   desc: '保护账号安全', color: '#94a3b8', badge: null  },
])

const handleToolClick = (tool) => {
  if (tool.path) router.push(tool.path)
}

// ─── 未读通知数 ───────────────────────────────────────────────
const unreadNoticeCount = ref(0)

const loadUnreadNoticeCount = async () => {
  try {
    const count = await getUnreadNoticeCount()
    const n = typeof count === 'number' ? count : (count?.data ?? 0)
    unreadNoticeCount.value = n
    const noticeTool = toolItems.value.find(t => t.id === 2)
    if (noticeTool) {
      noticeTool.badge = n > 0 ? String(n) : null
      noticeTool.desc = n > 0 ? `${n}条未读` : '暂无通知'
    }
  } catch {
    // 静默
  }
}

// 是否已达最高等级
const isMaxLevel = computed(() => {
  return currentLevel.value?.name === '钻石会员' // 或根据你的最高等级名调整
})

// 下一等级信息
const nextLevel = computed(() => {
  const idx = memberLevels.value.findIndex(l => l.current)
  if (idx === -1 || idx >= memberLevels.value.length - 1) return null
  return memberLevels.value[idx + 1]
})

// 距下一等级还差多少 EXP
const nextLevelExpGap = computed(() => {
  if (!nextLevel.value) return 0
  return nextLevel.value.minExp - userInfo.value.experience
})
// ─── 会员（仅英雄区使用） ─────────────────────────────────────
const levelThresholds = [0, 500, 2000, 4000, 10000]

const memberLevels = ref([
  { name: '普通会员', icon: '○', req: '0 EXP',     minExp: 0     },
  { name: '白银会员', icon: '◇', req: '500 EXP',   minExp: 500   },
  { name: '黄金会员', icon: '◆', req: '2000 EXP',  minExp: 2000  },
  { name: '铂金会员', icon: '✦', req: '4000 EXP',  minExp: 4000  },
  { name: '钻石会员', icon: '♛', req: '10000 EXP', minExp: 10000 },
])

// 根据 experience 动态计算当前等级
const updateMemberLevels = (exp) => {
  memberLevels.value = memberLevels.value.map((level, index) => {
    const nextExp = levelThresholds[index + 1] ?? Infinity
    return {
      ...level,
      passed:  exp >= nextExp,
      current: exp >= level.minExp && exp < nextExp,
    }
  })
}

// 当前等级信息
const currentLevel = computed(() => memberLevels.value.find(l => l.current) || memberLevels.value[0])

// 当前等级进度百分比
const levelProgress = computed(() => {
  const exp = userInfo.value.experience
  const idx = memberLevels.value.findIndex(l => l.current)
  if (idx === -1 || idx === memberLevels.value.length - 1) return 100
  const cur = levelThresholds[idx]
  const next = levelThresholds[idx + 1]
  return Math.min(100, Math.round(((exp - cur) / (next - cur)) * 100))
})

// ─── 安全 ─────────────────────────────────────────────────────
const securityItems = ref([
  { id: 1, icon: '🔑', name: '登录密码', desc: '建议定期修改密码',  color: '#a78bfa', ok: true,  action: '修改'    },
  { id: 2, icon: '📱', name: '手机绑定', desc: '138****8888',       color: '#22c55e', ok: true,  action: '更换'    },
  { id: 3, icon: '📧', name: '邮箱绑定', desc: '未绑定邮箱',        color: '#ff5c75', ok: false, action: '立即绑定' },
  { id: 4, icon: '👆', name: '生物识别', desc: '指纹/面容快捷登录', color: '#38bdf8', ok: false, action: '去开启'  },
  { id: 5, icon: '🛡️', name: '实名认证', desc: '已完成实名认证',    color: '#f0cc7a', ok: true,  action: '查看'    },
])


// ─── 关注 ─────────────────────────────────────────────────────
const loadFollows = async () => {
  followLoading.value = true
  try {
    const res = await getMyFollows({ page: 1, size: 50 })
    const pageData = res?.data ?? res
    const list = Array.isArray(pageData?.list) ? pageData.list : (Array.isArray(pageData) ? pageData : [])
    followedShops.value = list.map(s => ({
      id: s.id ?? s.shopId,
      shopName: s.shopName || s.name || '',
      goodRate: s.goodRate || '',
      totalSales: s.totalSales || 0,
    }))
  } catch (err) {
    console.error('[关注] 加载失败:', err)
  } finally {
    followLoading.value = false
  }
}

const handleUnfollow = async (shopId) => {
  try {
    await toggleFollowShop(shopId)
    followedShops.value = followedShops.value.filter(s => s.id !== shopId)
    ElMessage.success('已取消关注')
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  }
}

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const handleStatClick = (label) => {
  if (label === '关注') scrollToSection('follows-section')
  else if (label === '收藏') scrollToSection('favorites-section')
}

const formatShopCount = (n) => {
  if (!n && n !== 0) return '--'
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// ─── 初始化 ───────────────────────────────────────────────────
onMounted(() => {
  loadUserInfo()
  loadAddr()
  loadOrders()
  loadFavorites()
  loadFollows()
  loadHistory()
  loadMyCouponsPreview()
  loadUnreadNoticeCount()
})

onUnmounted(() => {
  stopOrderCountdowns()
})
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@200;300;400;500&family=Space+Mono:wght@400;700&display=swap');

:root {
  --bg:       #FAFAF8;
  --bg2:      #F5F2EC;
  --bg3:      #EDE8DC;
  --bg4:      #E5DDD0;
  --border:   #E0D8C8;
  --border2:  #C9A84C;
  --text:     #1A1A18;
  --text2:    #4A4438;
  --text3:    #8A8070;
  --gold:     #A07830;
  --gold-hi:  #C9A84C;
  --gold-bg:  rgba(201,168,76,0.08);
  --red:      #C0392B;
  --green:    #27AE60;
  --blue:     #2980B9;
  --radius:   14px;
  --shadow:   0 2px 12px rgba(0,0,0,0.06);
  --shadow2:  0 4px 24px rgba(0,0,0,0.1);
}
* { box-sizing: border-box; margin: 0; padding: 0; }

/* ══ 页面根 ══ */
.my-page {
  background: var(--bg2);
  color: var(--text);
  min-height: 100vh;
  width: 100%;
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  padding: 0 0 80px;
}

/* ══ 通用区块 ══ */
.section-block {
  margin-bottom: 40px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 40px;
}
.section-head { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
.eyebrow {
  font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 3px;
  color: var(--gold); font-weight: 700;
}
.section-title { font-size: 20px; font-weight: 500; color: var(--text); }
.ghost-btn {
  margin-left: auto; background: var(--bg); border: 1px solid var(--border);
  color: var(--text3); font-family: inherit; font-size: 12px;
  padding: 6px 14px; border-radius: 100px; cursor: pointer; transition: .2s; white-space: nowrap;
}
.ghost-btn:hover { border-color: var(--gold-hi); color: var(--gold); }
.red-ghost { border-color: rgba(192,57,43,0.25); color: #C0392B; margin-left: 10px; }
.red-ghost:hover { border-color: var(--red); color: var(--red); background: rgba(192,57,43,0.04); }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 50px 0; color: var(--text3); }
.empty-icon { font-size: 36px; opacity: .4; }
.empty-state p { font-size: 14px; }

/* ══ 用户英雄区 ══ */
.user-hero { position: relative; overflow: hidden; margin-bottom: 32px; width: 100%; }
.uh-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #FFFFFF 0%, #FAF6EE 50%, #F5F0E8 100%);
  border-bottom: 1px solid var(--border);
}
.uh-orb { position: absolute; border-radius: 50%; pointer-events: none; }
.o1 { width: 400px; height: 400px; top: -160px; left: -80px;  background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 65%); }
.o2 { width: 300px; height: 300px; top: -100px; right: 5%;   background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%); }
.o3 { width: 200px; height: 200px; bottom: -60px; right: 25%; background: radial-gradient(circle, rgba(160,120,48,0.06) 0%, transparent 65%); }
.uh-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(201,168,76,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201,168,76,0.06) 1px, transparent 1px);
  background-size: 48px 48px;
}
.uh-inner {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 36px;
  padding: 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 头像 */
.avatar-wrap { position: relative; flex-shrink: 0; }
.av-ring {
  position: absolute; border-radius: 50%;
  border: 1px solid rgba(201,168,76,0.2);
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  animation: avPulse 3s ease-in-out infinite;
}
.r1 { width: 100px; height: 100px; }
.r2 { width: 128px; height: 128px; animation-delay: .6s; border-color: rgba(201,168,76,0.1); }
@keyframes avPulse {
  0%,100% { opacity: .8; transform: translate(-50%,-50%) scale(1); }
  50%     { opacity: .2; transform: translate(-50%,-50%) scale(1.04); }
}
.av-core {
  width: 72px;
  height: 72px;
  border-radius: 20px; /* ≈ 28% 圆角，比方块柔，比圆克制 */
  background: #f5f0e6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0d9c9;
}

.av-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.av-initial {
  font-size: 28px; /* 字号随尺寸微调 */
  font-weight: 500;
  color: #7a6b55;
  text-align: center;
  line-height: 1;
}
.av-edit {
  position: absolute; bottom: -4px; right: -4px; z-index: 2;
  width: 26px; height: 26px; border-radius: 50%;
  background: #FFF; border: 1.5px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  color: var(--gold); cursor: pointer; transition: .2s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.av-edit:hover { background: var(--gold-bg); }

.uh-meta { flex: 1; }
.uh-name { font-size: 26px; font-weight: 500; color: var(--text); letter-spacing: 1px; margin-bottom: 7px; }
.uh-uid { font-family: 'Space Mono', monospace; font-size: 11px; color: var(--text3); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.uid-label { background: var(--gold-bg); color: var(--gold); padding: 2px 6px; border-radius: 4px; font-size: 9px; letter-spacing: 1px; border: 1px solid rgba(201,168,76,0.2); }
.uh-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.utag { font-size: 11px; padding: 4px 12px; border-radius: 100px; border: 1px solid; font-weight: 400; }
.utag.gold   { color: var(--gold); border-color: rgba(160,120,48,0.35); background: rgba(201,168,76,0.07); }
.utag.blue   { color: #2471A3;     border-color: rgba(36,113,163,0.3);  background: rgba(36,113,163,0.05); }
.utag.purple { color: #7D6608;     border-color: rgba(125,102,8,0.3);   background: rgba(125,102,8,0.05); }

.uh-stats {
  display: flex; flex-shrink: 0;
  background: #FFF; border: 1px solid var(--border); border-radius: 14px; overflow: hidden;
  box-shadow: var(--shadow);
}
.ustat { display: flex; flex-direction: column; align-items: center; padding: 18px 28px; cursor: pointer; transition: .2s; border-right: 1px solid var(--border); }
.ustat:last-child { border-right: none; }
.ustat:hover { background: var(--gold-bg); }
.ustat.clickable { cursor: pointer; }
.ustat.clickable:hover .ustat-num { color: var(--gold); }
.ustat-num   { font-family: 'Space Mono', monospace; font-size: 22px; font-weight: 700; color: var(--text); line-height: 1; margin-bottom: 5px; }
.ustat-label { font-size: 11px; color: var(--text3); }

.uh-setting-btn {
  flex-shrink: 0; display: flex; align-items: center; gap: 7px; padding: 9px 18px;
  border-radius: 100px; background: #FFF; border: 1px solid var(--border);
  color: var(--text2); font-family: inherit; font-size: 13px; cursor: pointer; transition: .2s;
  box-shadow: var(--shadow);
}
.uh-setting-btn:hover { border-color: var(--gold-hi); color: var(--gold); }

/* ══ 订单状态栏 ══ */
.order-status-bar {
  display: flex; background: #FFF; border: 1px solid var(--border);
  border-radius: 14px; overflow: hidden; margin-bottom: 16px;
  box-shadow: var(--shadow);
}
.ostatus { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px; padding: 18px 8px; cursor: pointer; transition: .2s; position: relative; border-right: 1px solid var(--border); }
.ostatus:last-child { border-right: none; }
.ostatus:hover { background: var(--bg2); }
.ostatus.active { background: var(--gold-bg); border-bottom: 2px solid var(--gold-hi); }
.ostatus.active .ostatus-label { color: var(--gold); font-weight: 500; }
.ostatus-icon  { font-size: 22px; }
.ostatus-label { font-size: 12px; color: var(--text2); white-space: nowrap; }
.ostatus-badge { position: absolute; top: 10px; right: calc(50% - 22px); background: #E74C3C; color: #FFF; font-size: 9px; font-weight: 700; font-style: normal; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 3px; }

.order-list { display: flex; flex-direction: column; gap: 12px; }
.order-card {
  background: #FFF; border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden; transition: .25s;
  box-shadow: var(--shadow);
}
.order-card:hover { border-color: var(--gold-hi); box-shadow: var(--shadow2); }
.order-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border); background: var(--bg2); }
.order-shop-row { display: flex; align-items: center; gap: 14px; }
.order-shop { font-size: 13px; font-weight: 500; color: var(--text); }
.order-no   { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--text3); }
.order-stag { font-size: 11px; font-weight: 500; padding: 4px 12px; border-radius: 100px; }
.st-pending  { color: #8A6010; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.35); }
.st-paid     { color: #2C5F8A; background: rgba(44,95,138,0.1);  border: 1px solid rgba(44,95,138,0.3); }
.st-shipping { color: #1A5C8A; background: rgba(41,128,185,0.1);  border: 1px solid rgba(41,128,185,0.3); }
.st-done     { color: #1A6A3A; background: rgba(39,174,96,0.1);   border: 1px solid rgba(39,174,96,0.3); }
.st-cancel   { color: #8A8070; background: rgba(138,128,112,0.1); border: 1px solid rgba(138,128,112,0.3); }
.st-refund   { color: #C0392B; background: rgba(192,57,43,0.08);  border: 1px solid rgba(192,57,43,0.25); }

.order-goods { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.order-good  { display: flex; align-items: center; gap: 14px; }
.order-good img { width: 68px; height: 68px; border-radius: 10px; object-fit: cover; flex-shrink: 0; border: 1px solid var(--border); }
.og-info { flex: 1; }
.og-name { font-size: 13px; color: var(--text); margin-bottom: 4px; font-weight: 400; }
.og-sku  { font-size: 11px; color: var(--text3); }
.og-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.og-price { font-size: 15px; font-weight: 600; color: var(--gold); font-family: 'Space Mono', monospace; }
.og-qty   { font-size: 11px; color: var(--text3); }

.order-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 18px; border-top: 1px solid var(--border); background: var(--bg2); flex-wrap: wrap; gap: 8px; }
.order-total { font-size: 12px; color: var(--text3); }
.order-total strong { color: var(--text); font-family: 'Space Mono', monospace; }

.order-countdown {
  font-size: 12px; color: #B8444A; font-weight: 500;
  font-family: 'Space Mono', monospace;
  padding: 3px 10px; border-radius: 6px;
  background: rgba(184,68,74,0.07);
  border: 1px solid rgba(184,68,74,0.15);
}
.order-countdown.od-expired {
  color: #8A8070;
  background: rgba(138,128,112,0.08);
  border-color: rgba(138,128,112,0.2);
}
.order-actions { display: flex; gap: 8px; }
.oa-primary {
  padding: 7px 16px;
  background: linear-gradient(135deg, #A07830, #C9A84C);
  border: none; border-radius: 100px; color: #FFF;
  font-family: inherit; font-size: 12px; font-weight: 500; cursor: pointer; transition: .2s;
  box-shadow: 0 2px 8px rgba(160,120,48,0.3);
}
.oa-primary:hover { background: linear-gradient(135deg, #C9A84C, #EDD97A); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(160,120,48,0.4); }
.oa-default { padding: 7px 16px; background: #FFF; border: 1px solid var(--border); border-radius: 100px; color: var(--text2); font-family: inherit; font-size: 12px; cursor: pointer; transition: .2s; }
.oa-default:hover { border-color: var(--gold-hi); color: var(--gold); }

.order-logistics { padding: 16px 18px 18px; border-top: 1px solid var(--border); background: #FFFDF8; }
.logistics-title { font-size: 12px; color: var(--gold); margin-bottom: 14px; font-weight: 500; }
.ltrack { display: flex; gap: 14px; position: relative; padding-bottom: 16px; }
.ltrack:last-child { padding-bottom: 0; }
.ltrack-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; background: var(--border); border: 2px solid var(--bg3); }
.ltrack.active .ltrack-dot { background: var(--gold-hi); border-color: var(--gold); box-shadow: 0 0 6px rgba(201,168,76,0.5); }
.ltrack-line { position: absolute; left: 4px; top: 14px; bottom: 0; width: 1px; background: var(--border); }
.ltrack-desc { font-size: 12px; color: var(--text2); line-height: 1.5; }
.ltrack-time { font-size: 10px; color: var(--text3); margin-top: 2px; font-family: 'Space Mono', monospace; }

/* 订单详情展开 */
.order-detail-expand { display: flex; flex-direction: column; gap: 8px; }
.ode-row { display: flex; align-items: baseline; gap: 12px; font-size: 12px; }
.ode-label { color: var(--text3); flex-shrink: 0; min-width: 60px; }
.ode-val { color: var(--text); }
.ode-price { color: var(--gold); font-weight: 600; font-family: 'Space Mono', monospace; }

.expand-enter-active,.expand-leave-active { transition: all .3s ease; overflow: hidden; }
.expand-enter-from,.expand-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.expand-enter-to,.expand-leave-from { opacity: 1; max-height: 400px; }

/* ══ 钱包 ══ */
.wallet-card {
  position: relative; border-radius: 18px; overflow: hidden;
  border: 1px solid rgba(201,168,76,0.3);
  background: linear-gradient(135deg, #FFFDF5 0%, #FFF8E8 50%, #FFFDF5 100%);
  padding: 32px 36px; display: flex; gap: 40px; align-items: center; margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(201,168,76,0.12);
}
.wc-glow { position: absolute; width: 300px; height: 300px; border-radius: 50%; top: -100px; left: -60px; background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 65%); pointer-events: none; }
.wc-left { flex-shrink: 0; position: relative; z-index: 1; }
.wc-bal-label { font-size: 11px; color: var(--text3); letter-spacing: 2px; margin-bottom: 8px; font-family: 'Space Mono', monospace; }
.wc-bal  { display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px; }
.wc-unit { font-size: 20px; color: var(--gold); font-weight: 400; }
.wc-num  { font-family: 'Space Mono', monospace; font-size: 48px; font-weight: 700; color: var(--text); line-height: 1; }
.wc-sub  { font-size: 11px; color: var(--text3); margin-bottom: 20px; }
.wc-btns { display: flex; gap: 10px; }
.wc-btn  { padding: 9px 22px; border-radius: 100px; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: .2s; background: #FFF; border: 1px solid var(--border); color: var(--text2); box-shadow: var(--shadow); }
.wc-btn.primary { background: linear-gradient(135deg, #A07830, #C9A84C); border-color: transparent; color: #FFF; box-shadow: 0 3px 12px rgba(160,120,48,0.3); }
.wc-btn.primary:hover { background: linear-gradient(135deg, #C9A84C, #EDD97A); box-shadow: 0 4px 18px rgba(160,120,48,0.4); transform: translateY(-1px); }
.wc-btn:not(.primary):hover { border-color: var(--gold-hi); color: var(--gold); }
.wc-assets { flex: 1; display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; position: relative; z-index: 1; }
.wasset { background: #FFF; border: 1px solid var(--border); border-radius: 12px; padding: 16px 14px; display: flex; flex-direction: column; gap: 4px; transition: .2s; cursor: pointer; box-shadow: var(--shadow); }
.wasset:hover { border-color: var(--gold-hi); box-shadow: 0 4px 14px rgba(201,168,76,0.15); transform: translateY(-2px); }
.wasset-val   { font-family: 'Space Mono', monospace; font-size: 18px; font-weight: 700; color: var(--text); }
.wasset-label { font-size: 11px; color: var(--text3); }
.wasset-use   { margin-top: 8px; align-self: flex-start; padding: 4px 10px; border-radius: 100px; font-size: 10px; background: var(--gold-bg); border: 1px solid rgba(201,168,76,0.25); color: var(--gold); cursor: pointer; font-family: inherit; transition: .2s; }
.wasset-use:hover { background: rgba(201,168,76,0.15); border-color: var(--gold-hi); }

.txn-wrap { background: #FFF; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
.txn-topbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--border); background: var(--bg2); }
.txn-title { font-size: 14px; font-weight: 500; color: var(--text); }
.txn-filters { display: flex; gap: 4px; }
.txn-f { padding: 5px 13px; border-radius: 100px; font-family: inherit; font-size: 11px; background: #FFF; border: 1px solid var(--border); color: var(--text3); cursor: pointer; transition: .2s; }
.txn-f.active { background: var(--gold-bg); border-color: var(--gold-hi); color: var(--gold); font-weight: 500; }
.txn-f:hover:not(.active) { border-color: var(--gold-hi); color: var(--text2); }
.txn-list { display: flex; flex-direction: column; }
.txn-item { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid var(--border); transition: .2s; }
.txn-item:last-child { border-bottom: none; }
.txn-item:hover { background: var(--bg2); }
.txn-icon { width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.txn-icon.income  { background: rgba(39,174,96,0.1); }
.txn-icon.expense { background: rgba(192,57,43,0.08); }
.txn-info { flex: 1; }
.txn-name { font-size: 13px; color: var(--text); margin-bottom: 3px; }
.txn-time { font-size: 10px; color: var(--text3); font-family: 'Space Mono', monospace; }
.txn-amt  { font-family: 'Space Mono', monospace; font-size: 15px; font-weight: 700; }
.txn-amt.income  { color: #1A8A4A; }
.txn-amt.expense { color: #C0392B; }

/* ══ 历史浏览 ══ */
.history-bar-right { display: flex; align-items: center; margin-left: auto; }
.hdate-tabs { display: flex; gap: 4px; }
.hdate { padding: 5px 12px; border-radius: 100px; font-family: inherit; font-size: 11px; background: #FFF; border: 1px solid var(--border); color: var(--text3); cursor: pointer; transition: .2s; }
.hdate.active { background: var(--gold-bg); border-color: var(--gold-hi); color: var(--gold); font-weight: 500; }
.hdate:hover:not(.active) { border-color: var(--gold-hi); color: var(--text2); }

.history-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 14px; }
.hcard { background: #FFF; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; transition: .25s; cursor: pointer; box-shadow: var(--shadow); }
.hcard:hover { border-color: var(--gold-hi); transform: translateY(-4px); box-shadow: var(--shadow2); }
.hcard-media { position: relative; overflow: hidden; }
.hcard-media img { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block; transition: .4s; }
.hcard:hover .hcard-media img { transform: scale(1.04); }
.hcard-del { position: absolute; top: 7px; right: 7px; width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.9); border: 1px solid var(--border); color: var(--text3); font-size: 9px; cursor: pointer; transition: .2s; display: flex; align-items: center; justify-content: center; opacity: 0; }
.hcard:hover .hcard-del { opacity: 1; }
.hcard-del:hover { background: rgba(192,57,43,0.1); border-color: var(--red); color: var(--red); }
.hcard-time { position: absolute; bottom: 7px; left: 7px; background: rgba(255,255,255,0.9); color: var(--text3); font-size: 9px; padding: 2px 7px; border-radius: 100px; font-family: 'Space Mono', monospace; border: 1px solid var(--border); }
.hcard-body { padding: 10px 11px; }
.hcard-name { font-size: 11px; color: var(--text2); line-height: 1.4; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.hcard-foot  { display: flex; justify-content: space-between; align-items: center; }
.hcard-price { font-size: 13px; font-weight: 700; color: var(--gold); font-family: 'Space Mono', monospace; }
.hcard-cart  { padding: 4px 10px; background: linear-gradient(135deg, #A07830, #C9A84C); border: none; border-radius: 100px; color: #FFF; font-family: inherit; font-size: 10px; font-weight: 500; cursor: pointer; transition: .2s; }
.hcard-cart:hover { background: linear-gradient(135deg, #C9A84C, #EDD97A); }

/* ══ 收藏 ══ */
.fav-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.fav-card { background: #FFF; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; transition: .25s; cursor: pointer; box-shadow: var(--shadow); }
.fav-card:hover { border-color: var(--gold-hi); transform: translateY(-5px); box-shadow: var(--shadow2); }
.fav-media { position: relative; overflow: hidden; }
.fav-media img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; transition: .4s; }
.fav-card:hover .fav-media img { transform: scale(1.04); }
.fav-heart { position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,0.9); border: 1px solid rgba(192,57,43,0.3); color: #E74C3C; font-size: 14px; cursor: pointer; transition: .2s; display: flex; align-items: center; justify-content: center; }
.fav-heart:hover { background: rgba(192,57,43,0.08); border-color: var(--red); }
.fav-body  { padding: 12px 14px; }
.fav-name  { font-size: 13px; color: var(--text2); line-height: 1.45; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.fav-foot  { display: flex; justify-content: space-between; align-items: center; }
.fav-price { font-size: 16px; font-weight: 700; color: var(--gold); font-family: 'Space Mono', monospace; }
.fav-buy   { padding: 6px 14px; background: linear-gradient(135deg, #A07830, #C9A84C); border: none; border-radius: 100px; color: #FFF; font-family: inherit; font-size: 11px; font-weight: 500; cursor: pointer; transition: .2s; }
.fav-buy:hover { background: linear-gradient(135deg, #C9A84C, #EDD97A); }

/* ══ 关注店铺 ══ */
.follow-shop-list { display: flex; flex-direction: column; gap: 10px; }
.follow-shop-card {
  display: flex; align-items: center; gap: 16px;
  background: #FFF; border: 1px solid var(--border);
  border-radius: 14px; padding: 18px 22px; transition: .25s;
  cursor: pointer; box-shadow: var(--shadow);
}
.follow-shop-card:hover { border-color: var(--gold-hi); box-shadow: var(--shadow2); transform: translateY(-2px); }
.fsc-avatar {
  width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
  background: linear-gradient(135deg, #A07830, #C9A84C);
  color: #FFF; font-size: 18px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
}
.fsc-body { flex: 1; }
.fsc-name { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 6px; }
.fsc-stats { display: flex; gap: 16px; }
.fsc-stat { font-size: 11px; color: var(--text3); }
.fsc-unfollow {
  padding: 7px 16px; border-radius: 100px;
  border: 1px solid rgba(201,168,76,0.4);
  background: var(--gold-bg); color: var(--gold);
  font-family: inherit; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: .2s; white-space: nowrap;
}
.fsc-unfollow:hover { background: rgba(192,57,43,0.08); border-color: rgba(192,57,43,0.4); color: #C0392B; }

/* ══ 工具 ══ */
.tools-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
.tool-card { display: flex; align-items: center; gap: 14px; background: #FFF; border: 1px solid var(--border); border-radius: 14px; padding: 18px 16px; cursor: pointer; transition: .25s; position: relative; overflow: hidden; box-shadow: var(--shadow); }
.tool-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 0% 50%, var(--tc), transparent 65%); opacity: 0; transition: .3s; }
.tool-card:hover { border-color: var(--gold-hi); transform: translateY(-2px); box-shadow: var(--shadow2); }
.tool-card:hover::before { opacity: .05; }
.tool-icon  { font-size: 24px; flex-shrink: 0; position: relative; z-index: 1; }
.tool-info  { flex: 1; display: flex; flex-direction: column; gap: 2px; position: relative; z-index: 1; }
.tool-name  { font-size: 13px; font-weight: 500; color: var(--text); }
.tool-desc  { font-size: 11px; color: var(--text3); }
.tool-arrow { color: var(--text3); flex-shrink: 0; position: relative; z-index: 1; transition: .2s; }
.tool-card:hover .tool-arrow { color: var(--gold); transform: translateX(3px); }
.tool-badge { position: absolute; top: 10px; right: 10px; z-index: 2; background: linear-gradient(135deg, #A07830, #C9A84C); color: #FFF; font-size: 9px; font-weight: 700; font-style: normal; padding: 2px 7px; border-radius: 100px; }

/* ══ 我的优惠券内嵌 ══ */
.coupon-inline-list { display: flex; flex-direction: column; gap: 10px; }
.cip-card {
  display: flex; align-items: stretch;
  background: #FFF; border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden; transition: .25s;
  box-shadow: var(--shadow);
}
.cip-card:hover { border-color: var(--gold-hi); box-shadow: var(--shadow2); }
.cip-card.cip-used, .cip-card.cip-expired { opacity: .5; pointer-events: none; }

.cip-left {
  width: 110px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 16px 12px; gap: 6px;
  background: linear-gradient(180deg, rgba(201,168,76,0.06) 0%, transparent 60%),
              linear-gradient(180deg, #FFF 0%, var(--bg2) 100%);
  border-right: 1px dashed rgba(201,168,76,0.2);
}
.cip-amount { display: flex; align-items: baseline; gap: 2px; }
.cip-unit { font-size: 13px; font-weight: 600; color: #B8444A; }
.cip-value { font-size: 32px; font-weight: 600; color: #B8444A; line-height: .9; font-family: 'Space Mono', monospace; }
.cip-condition { font-size: 10px; color: var(--text3); }
.cip-condition.free { color: #3A7D5A; }

.cip-body { flex: 1; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; }
.cip-name { font-size: 14px; font-weight: 500; color: var(--text); }
.cip-desc { font-size: 11px; color: var(--text3); }
.cip-expire { font-family: 'Space Mono', monospace; font-size: 10px; color: var(--text3); }
.cip-badge {
  align-self: flex-start; font-size: 10px; font-weight: 500;
  padding: 2px 10px; border-radius: 100px;
}
.cip-badge.unused  { color: #3A7D5A; background: rgba(58,125,90,0.08); border: 1px solid rgba(58,125,90,0.15); }
.cip-badge.used    { color: var(--text3); background: rgba(160,152,136,0.06); border: 1px solid rgba(160,152,136,0.12); }
.cip-badge.expired { color: #B8444A; background: rgba(184,68,74,0.06); border: 1px solid rgba(184,68,74,0.12); }

/* ══ 支付方式 ══ */
.pay-methods { display: flex; gap: 12px; padding: 16px 20px; }
.pay-method {
  flex: 1; display: flex; align-items: center; gap: 12px;
  padding: 16px 18px; border-radius: 10px;
  background: var(--bg2); border: 1px solid var(--border);
  transition: .2s; cursor: default;
}
.pay-method:hover { border-color: var(--gold-hi); }
.pm-icon { font-size: 22px; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.pm-icon.green-bg { background: rgba(7,193,96,0.1); }
.pm-icon.blue-bg  { background: rgba(22,119,255,0.1); }
.pm-name { font-size: 13px; font-weight: 500; color: var(--text); flex: 1; }
.pm-tag {
  font-size: 10px; color: #3A7D5A; font-weight: 500;
  padding: 2px 8px; border-radius: 100px;
  background: rgba(58,125,90,0.08); border: 1px solid rgba(58,125,90,0.15);
}

/* ══ 会员（保留英雄区等级标签） ══ */
.member-card {
  position: relative; border-radius: 18px; overflow: hidden;
  border: 1px solid rgba(201,168,76,0.3);
  background: linear-gradient(135deg, #FFFDF5 0%, #FFF8E8 50%, #FFFBF0 100%);
  padding: 32px 36px; display: flex; gap: 48px;
  box-shadow: 0 4px 20px rgba(201,168,76,0.12);
}
.mc-glow { position: absolute; width: 280px; height: 280px; border-radius: 50%; top: -80px; left: -60px; background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 65%); pointer-events: none; }
.mc-left { flex: 1; position: relative; z-index: 1; }
.mc-badge-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.mc-badge-icon { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #A07830, #C9A84C, #EDD97A); display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 16px rgba(160,120,48,0.35); }
.mc-level   { font-size: 18px; font-weight: 500; color: var(--gold); margin-bottom: 4px; }
.mc-exp-txt { font-family: 'Space Mono', monospace; font-size: 12px; color: var(--text3); }
.mc-progress-wrap { margin-bottom: 20px; }
.mc-bar { height: 6px; background: var(--bg3); border-radius: 10px; overflow: hidden; margin-bottom: 8px; border: 1px solid var(--border); }
.mc-fill { height: 100%; position: relative; background: linear-gradient(90deg, #A07830, #C9A84C, #EDD97A); border-radius: 10px; }
.mc-fill-dot { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; border-radius: 50%; background: var(--gold-hi); box-shadow: 0 0 8px rgba(201,168,76,0.7); border: 2px solid #FFF; }
.mc-bar-labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--text3); font-family: 'Space Mono', monospace; }
.mc-perks { display: flex; gap: 8px; flex-wrap: wrap; }
.mc-perk  { font-size: 11px; color: var(--gold); padding: 4px 12px; border-radius: 100px; border: 1px solid rgba(201,168,76,0.3); background: var(--gold-bg); }
.mc-right { flex-shrink: 0; width: 240px; display: flex; flex-direction: column; gap: 8px; position: relative; z-index: 1; }
.mc-lvl { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border); background: #FFF; transition: .2s; box-shadow: var(--shadow); }
.mc-lvl.passed  { opacity: .5; }
.mc-lvl.current { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.06); }
.mc-lvl-icon { font-size: 16px; flex-shrink: 0; width: 22px; text-align: center; }
.mc-lvl-info { flex: 1; display: flex; justify-content: space-between; }
.mc-lvl-name { font-size: 12px; color: var(--text); font-weight: 400; }
.mc-lvl-req  { font-size: 10px; color: var(--text3); font-family: 'Space Mono', monospace; }
.mc-check    { color: #27AE60; font-size: 12px; font-weight: 700; }
.mc-cur-tag  { font-size: 9px; color: var(--gold); font-weight: 600; padding: 2px 7px; border-radius: 100px; background: var(--gold-bg); border: 1px solid rgba(201,168,76,0.3); }
/* 会员升级引导按钮 */
.mc-upgrade-btn {
  background: linear-gradient(135deg, #c9a84c, #b08f3a); /* 金色渐变，柔和不刺眼 */
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 24px; /* 圆润但不夸张 */
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(196, 168, 76, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
}

.mc-upgrade-btn:hover {
  background: linear-gradient(135deg, #d1b55f, #b89a4a);
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(196, 168, 76, 0.3);
}

.mc-upgrade-btn:active {
  transform: translateY(0);
}

/* 小屏适配（可选） */
@media (max-width: 768px) {
  .mc-upgrade-btn {
    width: 100%;
    justify-content: center;
  }
}
/* ══ 地址 ══ */
.address-list { display: flex; flex-direction: column; gap: 10px; }
.addr-card { display: flex; align-items: center; gap: 24px; background: #FFF; border: 1px solid var(--border); border-radius: 14px; padding: 18px 22px; position: relative; transition: .2s; box-shadow: var(--shadow); }
.addr-card.is-default { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.03); }
.addr-card:hover { border-color: var(--gold-hi); box-shadow: var(--shadow2); }
.addr-default-tag { position: absolute; top: 14px; right: 18px; font-size: 10px; color: var(--gold); font-weight: 500; padding: 3px 9px; border-radius: 100px; background: var(--gold-bg); border: 1px solid rgba(201,168,76,0.3); }
.addr-main { flex: 1; }
.addr-name-row { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
.addr-name  { font-size: 15px; font-weight: 500; color: var(--text); }
.addr-phone { font-size: 13px; color: var(--text3); font-family: 'Space Mono', monospace; }
.addr-full  { font-size: 13px; color: var(--text2); line-height: 1.5; }
.addr-actions { display: flex; gap: 8px; flex-shrink: 0; }
.addr-btn { padding: 6px 14px; border-radius: 100px; font-family: inherit; font-size: 12px; background: #FFF; border: 1px solid var(--border); color: var(--text2); cursor: pointer; transition: .2s; }
.addr-btn:hover { border-color: var(--gold-hi); color: var(--gold); }
.addr-btn.del { border-color: rgba(192,57,43,0.2); color: #C0392B; }
.addr-btn.del:hover { border-color: var(--red); background: rgba(192,57,43,0.05); }
.addr-sep {
  color: #ddd;
  font-weight: 300;
  margin: 0 6px;
}
/* ══ 安全 ══ */
.security-list { display: flex; flex-direction: column; gap: 8px; }
.sec-item { display: flex; align-items: center; gap: 16px; padding: 18px 22px; border-radius: 12px; background: #FFF; border: 1px solid var(--border); transition: .2s; box-shadow: var(--shadow); }
.sec-item:hover { border-color: var(--gold-hi); box-shadow: var(--shadow2); }
.sec-icon  { font-size: 22px; flex-shrink: 0; width: 28px; text-align: center; }
.sec-info  { flex: 1; }
.sec-name  { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
.sec-desc  { font-size: 11px; color: var(--text3); }
.sec-right { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
.sec-status { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 100px; }
.sec-status.ok   { color: #1A7A3A; background: rgba(39,174,96,0.1);  border: 1px solid rgba(39,174,96,0.25); }
.sec-status.warn { color: #B03020; background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.2); }
.sec-btn { padding: 7px 16px; border-radius: 100px; font-family: inherit; font-size: 12px; background: #FFF; border: 1px solid var(--border); color: var(--text2); cursor: pointer; transition: .2s; white-space: nowrap; box-shadow: var(--shadow); }
.sec-btn:hover { border-color: var(--gold-hi); color: var(--gold); }

/* ── 响应式 ── */
@media (max-width:1200px) {
  .history-grid { grid-template-columns: repeat(4,1fr); }
  .tools-grid   { grid-template-columns: repeat(3,1fr); }
  .wc-assets    { grid-template-columns: repeat(2,1fr); }
}
@media (max-width:960px) {
  .section-block { padding: 0 24px; }
  .uh-inner      { padding: 28px 24px; flex-wrap: wrap; }
  .uh-stats      { width: 100%; }
  .history-grid  { grid-template-columns: repeat(3,1fr); }
  .fav-grid      { grid-template-columns: repeat(3,1fr); }
  .tools-grid    { grid-template-columns: repeat(2,1fr); }
  .wallet-card   { flex-direction: column; padding: 24px; }
  .wc-assets     { grid-template-columns: repeat(4,1fr); }
  .member-card   { flex-direction: column; padding: 24px; gap: 24px; }
  .mc-right      { width: 100%; }
}
@media (max-width:640px) {
  .section-block { padding: 0 16px; }
  .uh-inner      { padding: 20px 16px; }
  .history-grid  { grid-template-columns: repeat(2,1fr); }
  .fav-grid      { grid-template-columns: repeat(2,1fr); }
  .tools-grid    { grid-template-columns: repeat(2,1fr); }
  .wc-assets     { grid-template-columns: repeat(2,1fr); }
  .ustat         { flex: 1; min-width: calc(50% - 1px); }
  .order-status-bar { flex-wrap: wrap; }
  .ostatus       { min-width: calc(33% - 1px); }
}
</style>
<style>
/* My页面全局变量 */
:root {
  --bg:       #FAFAF8;
  --bg2:      #F5F2EC;
  --bg3:      #EDE8DC;
  --bg4:      #E5DDD0;
  --border:   #E0D8C8;
  --border2:  #C9A84C;
  --text:     #1A1A18;
  --text2:    #4A4438;
  --text3:    #8A8070;
  --gold:     #A07830;
  --gold-hi:  #C9A84C;
  --gold-bg:  rgba(201,168,76,0.08);
  --red:      #C0392B;
  --green:    #27AE60;
  --blue:     #2980B9;
  --radius:   14px;
  --shadow:   0 2px 12px rgba(0,0,0,0.06);
  --shadow2:  0 4px 24px rgba(0,0,0,0.1);
}

body, #app {
  background: #F5F2EC !important;
  color: #1A1A18;
}
/* ══ 地址弹窗 ══ */
.addr-dialog-mask {
  position: fixed; inset: 0; background: rgba(26,26,24,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  backdrop-filter: blur(4px);
}
.addr-dialog {
  background: #FFF; border-radius: var(--radius); padding: 28px;
  width: 90%; max-width: 420px; box-shadow: var(--shadow2); border: 1px solid var(--border);
}
.addr-dialog-head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.addr-dialog-head h3 { font-size: 18px; font-weight: 500; color: var(--text); }
.dialog-close {
  background: none; border: none; font-size: 18px; color: var(--text3); cursor: pointer; padding: 4px;
}
.dialog-close:hover { color: var(--red); }

.addr-form .form-item { margin-bottom: 16px; }
.addr-form label { display: block; font-size: 12px; color: var(--text2); margin-bottom: 6px; font-weight: 500; }
.addr-form input, .addr-form textarea {
  width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px;
  font-family: inherit; font-size: 14px; color: var(--text); background: var(--bg);
  transition: .2s; outline: none;
}
.addr-form input:focus, .addr-form textarea:focus { border-color: var(--gold-hi); box-shadow: 0 0 0 3px var(--gold-bg); }
.addr-form textarea { resize: vertical; }

.form-check {
  display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text2);
  cursor: pointer; margin-bottom: 20px;
}
.form-check input { accent-color: var(--gold); width: 14px; height: 14px; }

.form-footer { display: flex; gap: 12px; margin-top: 24px; }
.btn-ghost, .btn-primary {
  flex: 1; padding: 10px; border-radius: 100px; font-family: inherit; font-size: 13px;
  cursor: pointer; transition: .2s; border: none; font-weight: 500;
}
.btn-ghost { background: var(--bg); border: 1px solid var(--border); color: var(--text3); }
.btn-ghost:hover { border-color: var(--gold-hi); color: var(--gold); }
.btn-primary { background: linear-gradient(135deg, var(--gold-hi), var(--gold)); color: #FFF; }
.btn-primary:hover { filter: brightness(1.05); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; filter: none; }

/* 弹窗动画 */
.dialog-fade-enter-active, .dialog-fade-leave-active { transition: opacity .2s ease; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }
/* 📍 省市区联动选择器专属样式（追加到 <style scoped> 底部） */
/* 📍 省市区联动选择器（已完全对齐你的 Design Tokens） */
.addr-form .region-selects {
  display: flex;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

.addr-form .region-selects select {
  flex: 1;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--text);
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
  /* 移除浏览器默认样式 */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  /* 自定义下拉箭头（柔和中性色，不干扰主题） */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23b0b0b0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
  padding-right: 32px;
}

.addr-form .region-selects select:hover {
  border-color: var(--gold-hi);
}

.addr-form .region-selects select:focus {
  border-color: var(--gold-hi);
  box-shadow: 0 0 0 3px var(--gold-bg);
}

/* 禁用态（未选上级时） */
.addr-form .region-selects select:disabled {
  background-color: var(--bg);
  color: var(--text3);
  cursor: not-allowed;
  border-color: var(--border);
  opacity: 0.6;
  background-image: none;
}

/* 移动端适配 */
@media (max-width: 400px) {
  .addr-form .region-selects {
    flex-direction: column;
    gap: 8px;
  }
}

</style>