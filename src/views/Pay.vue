<template>
  <div class="pay-page">
    <div class="pay-inner">

      <!-- ══ 页头 ══ -->
      <div class="pay-header">
        <div class="ph-left">
          <button class="ph-back" @click="$router.push('/cart')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 class="ph-title">确认支付</h1>
        </div>
        <span class="ph-order">订单号: {{ payData.orderNo }}</span>
      </div>

      <!-- ══ 加载中 ══ -->
      <div v-if="loading" class="pay-loading">
        <div class="loading-spinner"></div>
        <p>正在创建支付订单...</p>
      </div>

      <!-- ══ 支付主体 ══ -->
      <div v-else class="pay-body">

        <!-- 左侧订单信息 -->
        <div class="pay-left">

          <!-- 订单商品 -->
          <div class="order-card">
            <div class="oc-head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span>订单商品</span>
              <span class="oc-count">{{ payData.items?.length || 0 }} 件商品</span>
            </div>

            <div class="oc-items">
              <div v-for="item in payData.items" :key="item.id" class="oi-row">
                <img :src="item.image" :alt="item.name" class="oi-img" @error="handleImageError" />
                <div class="oi-info">
                  <p class="oi-name">{{ item.name }}</p>
                  <p class="oi-sku">{{ item.sku }}</p>
                </div>
                <div class="oi-right">
                  <span class="oi-price">¥{{ item.price }}</span>
                  <span class="oi-qty">×{{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 收货地址 -->
          <div class="address-card">
            <div class="ac-head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>收货地址</span>
            </div>
            <div class="ac-body">
              <div v-if="addressList.length === 0" class="ac-empty">
                <p>暂无收货地址</p>
                <button class="ac-add-btn" @click="showAddAddressDialog = true">+ 新增地址</button>
              </div>
              <template v-else>
                <div class="ac-selector" @click="showAddressPanel = !showAddressPanel">
                  <div class="ac-user">
                    <span class="ac-name">{{ selectedAddress?.receiverName }}</span>
                    <span class="ac-phone">{{ selectedAddress?.receiverPhone }}</span>
                    <span class="ac-default" v-if="selectedAddress?.isDefault">默认</span>
                  </div>
                  <p class="ac-address">{{ selectedAddress?.fullAddress }}</p>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ transform: showAddressPanel ? 'rotate(90deg)' : '', transition: '.2s' }">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
                
                <transition name="slide-down">
                  <div v-if="showAddressPanel" class="ac-panel">
                    <div 
                      v-for="addr in addressList" 
                      :key="addr.id"
                      :class="['ac-option', { active: selectedAddressId === addr.id }]"
                      @click="selectAddress(addr.id)"
                    >
                      <div class="ac-opt-user">
                        <span class="ac-opt-name">{{ addr.receiverName }}</span>
                        <span class="ac-opt-phone">{{ addr.receiverPhone }}</span>
                        <span class="ac-opt-default" v-if="addr.isDefault">默认</span>
                      </div>
                      <p class="ac-opt-address">{{ addr.fullAddress }}</p>
                      <span class="ac-opt-check" v-if="selectedAddressId === addr.id">✓</span>
                    </div>
                    <button class="ac-add-more" @click="showAddAddressDialog = true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      添加新地址
                    </button>
                  </div>
                </transition>
              </template>
            </div>
          </div>

          <!-- 配送方式 -->
          <div class="delivery-card">
            <div class="dc-head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <span>配送方式</span>
            </div>
            <div class="dc-body">
              <span class="dc-type">{{ payData.deliveryType || '标准快递' }}</span>
              <span class="dc-time">预计 2-3 天送达</span>
            </div>
          </div>

          <!-- 订单备注 -->
          <div class="note-card">
            <div class="nc-head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span>订单备注</span>
            </div>
            <textarea 
              v-model="orderNote" 
              class="nc-input" 
              placeholder="选填，可以告诉卖家您的特殊要求"
              maxlength="200"
            ></textarea>
            <span class="nc-count">{{ orderNote.length }}/200</span>
          </div>
        </div>

        <!-- 右侧支付 -->
        <div class="pay-right">

          <!-- 支付方式 -->
          <div class="pay-card">
            <div class="pc-head">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <span>选择支付方式</span>
            </div>

            <div class="pc-methods">
              <div 
                v-for="method in payMethods" 
                :key="method.value"
                :class="['pm-item', { active: selectedMethod === method.value }]"
                @click="selectedMethod = method.value"
              >
                <div class="pm-icon">{{ method.icon }}</div>
                <div class="pm-info">
                  <p class="pm-name">{{ method.name }}</p>
                  <p class="pm-desc">{{ method.desc }}</p>
                </div>
                <div :class="['pm-radio', { checked: selectedMethod === method.value }]">
                  <svg v-if="selectedMethod === method.value" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <circle cx="12" cy="12" r="10" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- 价格明细 -->
          <div class="summary-card">
            <div class="price-rows">
              <div class="pr-row">
                <span>商品合计</span>
                <span>¥{{ payData.subtotal?.toFixed(2) || '0.00' }}</span>
              </div>
              <div class="pr-row" v-if="payData.couponDiscount > 0">
                <span class="pr-red">优惠券抵扣</span>
                <span class="pr-red">−¥{{ payData.couponDiscount }}</span>
              </div>
              <div class="pr-row">
                <span>运费</span>
                <span :class="{ 'pr-green': payData.shippingFee === 0 }">
                  {{ payData.shippingFee === 0 ? '免运费' : '¥' + payData.shippingFee }}
                </span>
              </div>
            </div>

            <!-- 合计 -->
            <div class="price-total">
              <span class="pt-label">应付总额</span>
              <div class="pt-num-wrap">
                <span class="pt-sym">¥</span>
                <span class="pt-num">{{ payData.totalAmount?.toFixed(2) || '0.00' }}</span>
              </div>
            </div>

            <button class="pay-btn" @click="handlePay" :disabled="!selectedMethod || paying">
              <span v-if="paying">支付中...</span>
              <span v-else>确认支付 ¥{{ payData.totalAmount?.toFixed(2) || '0.00' }}</span>
            </button>
            
            <p class="pay-hint">支付即表示同意《支付服务协议》</p>
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

    <!-- ══ 新增地址弹窗 ══ -->
    <transition name="dialog-fade">
      <div v-if="showAddAddressDialog" class="addr-dialog-mask" @click.self="showAddAddressDialog = false">
        <div class="addr-dialog">
          <div class="addr-dialog-head">
            <h3>新增收货地址</h3>
            <button class="dialog-close" @click="showAddAddressDialog = false">✕</button>
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
              <textarea v-model.trim="addrForm.address" placeholder="省/市/区/街道、小区、楼栋、门牌号等" rows="3"></textarea>
            </div>
            <label class="form-check">
              <input type="checkbox" v-model="addrForm.isDefault" />
              <span>设为默认地址</span>
            </label>
            <div class="form-footer">
              <button type="button" class="btn-ghost" @click="showAddAddressDialog = false">取消</button>
              <button type="button" class="btn-primary" :disabled="addrSubmitting" @click="submitNewAddress">
                {{ addrSubmitting ? '提交中...' : '确认添加' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createPay } from '@/api/pay'
import { getMyAddresses, addAddress } from '@/api/user'
import { getOrderDetail } from '@/api/order'
import nofoundImage from '@/assets/images/nofound.png'

const router = useRouter()
const route = useRoute()

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.src = nofoundImage
}

// ================= 状态管理 =================
const loading = ref(true)
const paying = ref(false)
const orderNote = ref('')
const selectedMethod = ref('wechat')
const addressList = ref([])
const selectedAddressId = ref(null)
const showAddressPanel = ref(false)
const showAddAddressDialog = ref(false)
const addrSubmitting = ref(false)

const payData = ref({
  orderId: null,        // 订单ID
  orderNo: '',          // 订单号
  items: [],            // 订单商品列表
  subtotal: 0,          // 商品总价
  couponDiscount: 0,    // 优惠券抵扣
  shippingFee: 0,       // 运费
  totalAmount: 0,       // 应付总额
  deliveryType: '标准快递'
})

const payMethods = [
  { value: 'wechat', name: '微信支付', desc: '推荐使用，即时到账', icon: '💚' },
  { value: 'alipay', name: '支付宝', desc: '数亿用户都在用', icon: '💙' },
  { value: 'bank', name: '银行卡支付', desc: '支持所有主流银行', icon: '💳' },
]

const guarantees = [
  { icon: '🔒', label: '安全支付' },
  { icon: '🛡️', label: '资金保障' },
  { icon: '↩️', label: '退款保障' },
  { icon: '💬', label: '在线客服' },
]

// ================= 数据加载 =================
const loadPayData = async () => {
  try {
    loading.value = true
    
    // 从路由参数获取订单ID
    const orderId = route.query.orderId
    
    if (!orderId) {
      ElMessage.warning('订单ID缺失,请从购物车重新结算')
      router.push('/cart')
      return
    }

    // 从后端获取订单详情
    const res = await getOrderDetail(orderId)
    
    // 后端返回 Result<Order>,经过拦截器后 res 就是 Order 对象
    const orderData = res.data || res
    
    if (!orderData) {
      ElMessage.error('订单不存在')
      router.push('/cart')
      return
    }

    console.log('订单详情原始数据:', orderData)

    // 填充订单数据 - 根据后端 Order 对象结构映射
    // 注意: Order 对象不包含 items,需要从其他途径获取
    payData.value = {
      orderId: orderData.id,                    // 订单ID(订单号)
      orderNo: orderData.id,                    // 订单号
      items: orderData.items || [],             // 订单项列表(如果后端有联表查询)
      subtotal: orderData.totalAmount || 0,     // 订单总金额(分)
      couponDiscount: orderData.discountAmount || 0,  // 优惠金额(分)
      shippingFee: 0,                           // 运费(后端暂无此字段)
      totalAmount: orderData.payAmount || orderData.totalAmount || 0,  // 实付金额(分)
      deliveryType: '标准快递'                  // 配送方式(前端默认)
    }

    // 金额单位转换: 分 → 元
    // 后端所有金额字段单位都是分(Long),需要转换为元供前端显示
    if (payData.value.subtotal > 0) {
      payData.value.subtotal = payData.value.subtotal / 100
      payData.value.couponDiscount = payData.value.couponDiscount / 100
      payData.value.shippingFee = payData.value.shippingFee / 100
      payData.value.totalAmount = payData.value.totalAmount / 100
    }

    // 订单项价格转换: 分 → 元
    if (payData.value.items && payData.value.items.length > 0) {
      payData.value.items.forEach(item => {
        if (item.price && typeof item.price === 'number') {
          // 将单价从分转换为元
          item.price = parseFloat((item.price / 100).toFixed(2))
        }
      })
    }

    console.log('订单详情(转换后):', payData.value)
    console.log('订单状态:', orderData.status)
    console.log('创建时间:', orderData.createTime)

    // 加载用户地址列表
    await loadAddresses()

  } catch (err) {
    console.error('加载订单数据失败:', err)
    ElMessage.error('加载订单数据失败,请重试')
    router.push('/cart')
  } finally {
    loading.value = false
  }
}

// 加载用户地址
const loadAddresses = async () => {
  try {
    const res = await getMyAddresses()
    // 兼容不同的返回格式，并按照后端返回的字段映射
    const rawData = res.data || res
    const addresses = Array.isArray(rawData) ? rawData : []
    
    // 映射后端字段到前端显示
    addressList.value = addresses.map(item => ({
      id: item.id,
      receiverName: item.receiver,  // 后端返回 receiver
      receiverPhone: item.phone,    // 后端返回 phone
      isDefault: item.isDefault === 1,  // 后端返回 1 或 0
      // 后端返回的是完整地址字符串，需要解析
      fullAddress: item.address,
      // 尝试解析省市区（如果后端返回的是完整字符串）
      ...parseAddress(item.address)
    }))
    
    // 默认选中默认地址或第一个地址
    if (addressList.value.length > 0) {
      const defaultAddr = addressList.value.find(addr => addr.isDefault)
      selectedAddressId.value = defaultAddr ? defaultAddr.id : addressList.value[0].id
    }
  } catch (err) {
    console.error('加载地址失败:', err)
    ElMessage.warning('加载地址失败，请在下方添加收货地址')
  }
}

// 解析地址字符串（简单解析，兼容后端返回的完整地址）
const parseAddress = (fullAddress) => {
  // 如果后端已经返回了分开的字段，直接使用
  // 这里只是简单处理，实际应该根据后端返回格式调整
  return {
    province: '',
    city: '',
    district: '',
    detailAddress: fullAddress || ''
  }
}

// 获取当前选中的地址
const selectedAddress = computed(() => {
  return addressList.value.find(addr => addr.id === selectedAddressId.value)
})

// 选择地址
const selectAddress = (id) => {
  selectedAddressId.value = id
  showAddressPanel.value = false
}

// 地址表单
const addrForm = ref({
  name: '',
  phone: '',
  address: '',
  isDefault: false
})

// 重置表单
const resetAddrForm = () => {
  addrForm.value = {
    name: '',
    phone: '',
    address: '',
    isDefault: false
  }
}

// 提交新地址
const submitNewAddress = async () => {
  // 验证表单
  if (!addrForm.value.name.trim()) {
    ElMessage.warning('请输入收货人姓名')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(addrForm.value.phone)) {
    ElMessage.warning('请输入正确的手机号码')
    return
  }
  if (!addrForm.value.address.trim()) {
    ElMessage.warning('请输入详细地址')
    return
  }

  try {
    addrSubmitting.value = true
    
    const payload = {
      receiver: addrForm.value.name,
      phone: addrForm.value.phone,
      address: addrForm.value.address,
      isDefault: addrForm.value.isDefault ? 1 : 0
    }

    await addAddress(payload)
    ElMessage.success('地址添加成功')
    
    // 重新加载地址列表
    await loadAddresses()
    
    // 关闭弹窗
    showAddAddressDialog.value = false
    resetAddrForm()
    
    // 自动选中新添加的地址（最后一个）
    if (addressList.value.length > 0) {
      selectedAddressId.value = addressList.value[addressList.value.length - 1].id
    }
  } catch (err) {
    console.error('添加地址失败:', err)
    ElMessage.error(err.response?.data?.message || '添加地址失败')
  } finally {
    addrSubmitting.value = false
  }
}

// ================= 支付操作 =================
const handlePay = async () => {
  // 验证支付方式
  if (!selectedMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  // 验证收货地址
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  // 验证订单
  if (!payData.value.orderId) {
    ElMessage.error('订单信息缺失,请重新下单')
    return
  }

  try {
    paying.value = true

    // 映射支付方式到后端要求的格式
    const payChannelMap = {
      'wechat': 'WECHAT',
      'alipay': 'ALIPAY',
      'bank': 'BANK_CARD'
    }

    // 构造支付请求参数
    // 注意:后端 PayDTO 需要金额单位是分
    const payDTO = {
      orderId: payData.value.orderId,              // 订单ID
      payChannel: payChannelMap[selectedMethod.value] || 'WECHAT',  // 支付渠道
      amount: Math.round(payData.value.totalAmount * 100),  // 金额,单位:分
      addressId: selectedAddressId.value,          // 收货地址ID
      note: orderNote.value || '',                 // 订单备注
      couponId: null                               // 优惠券ID(如果有)
    }

    console.log('支付请求参数:', payDTO)

    // 调用后端支付接口
    const res = await createPay(payDTO)
    
    console.log('支付接口返回:', res)
    
    ElMessage.success('支付成功')
    
    // 跳转到订单详情页或首页
    setTimeout(() => {
      router.push('/home')
    }, 1500)

  } catch (err) {
    console.error('支付失败详情:', err)
    
    // 详细的错误提示
    let errorMsg = '支付失败,请重试'
    
    if (err.response) {
      const status = err.response.status
      const data = err.response.data
      
      switch (status) {
        case 400:
          // 请求参数错误
          errorMsg = data.message || data.msg || '请求参数错误,请检查订单信息'
          if (data.errors) {
            // 如果有具体的字段错误,显示出来
            errorMsg = Object.values(data.errors).join(';')
          }
          break
        case 401:
          errorMsg = '登录已过期,请重新登录后再支付'
          break
        case 403:
          errorMsg = '没有权限进行支付操作'
          break
        case 404:
          errorMsg = '订单不存在,请检查订单信息'
          break
        case 500:
          errorMsg = data.message || data.msg || '服务器错误,请稍后重试'
          break
        default:
          errorMsg = data.message || data.msg || `支付失败(错误码:${status})`
      }
    } else if (err.message) {
      if (err.message.includes('timeout')) {
        errorMsg = '支付请求超时,请检查网络连接后重试'
      } else if (err.message.includes('Network Error')) {
        errorMsg = '网络连接失败,请检查网络后重试'
      } else {
        errorMsg = err.message
      }
    }
    
    ElMessage.error(errorMsg)
  } finally {
    paying.value = false
  }
}

onMounted(() => loadPayData())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.pay-page {
  background: #F5F2EC;
  color: #1A1A18;
  min-height: 100vh;
  font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
  padding: 36px 0 80px;
}
.pay-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 40px;
}

/* ══ 页头 ══ */
.pay-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px;
}
.ph-left { display: flex; align-items: center; gap: 12px; }
.ph-back {
  width: 36px; height: 36px; border-radius: 10px;
  background: #FFF; border: 1px solid #E0D8C8;
  color: #4A4438; cursor: pointer; transition: .2s;
  display: flex; align-items: center; justify-content: center;
}
.ph-back:hover { border-color: #C9A84C; color: #A07830; background: rgba(201,168,76,0.05); }
.ph-title { font-size: 24px; font-weight: 500; color: #1A1A18; letter-spacing: -0.3px; }
.ph-order { font-size: 13px; color: #8A8070; font-family: 'Space Mono', monospace; }

/* ══ 加载中 ══ */
.pay-loading {
  display: flex; flex-direction: column; align-items: center;
  padding: 100px 0; gap: 16px;
}
.loading-spinner {
  width: 48px; height: 48px;
  border: 3px solid #E0D8C8;
  border-top-color: #C9A84C;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.pay-loading p {
  font-size: 14px; color: #8A8070;
}

/* ══ 主体 ══ */
.pay-body {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: flex-start;
}
.pay-left { display: flex; flex-direction: column; gap: 16px; }

/* ── 订单商品卡片 ── */
.order-card {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.oc-head {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 18px; border-bottom: 1px solid #F0EAE0;
  background: #FAF8F4;
  font-size: 14px; font-weight: 500; color: #1A1A18;
}
.oc-count { margin-left: auto; font-size: 12px; color: #8A8070; font-weight: 400; }

.oc-items { padding: 8px 0; }
.oi-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid #F5F0E8;
}
.oi-row:last-child { border-bottom: none; }
.oi-row:hover { background: #FFFBF2; }

.oi-img {
  width: 64px; height: 64px; border-radius: 8px;
  object-fit: cover; border: 1px solid #EDE8DC;
}
.oi-info { flex: 1; min-width: 0; }
.oi-name {
  font-size: 13px; font-weight: 500; color: #1A1A18;
  margin-bottom: 4px;
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
}
.oi-sku { font-size: 11px; color: #8A8070; }

.oi-right { text-align: right; }
.oi-price {
  display: block; font-size: 14px; font-weight: 700; color: #A07830;
  font-family: 'Space Mono', monospace; margin-bottom: 4px;
}
.oi-qty { font-size: 12px; color: #8A8070; }

/* ── 收货地址 ── */
.address-card {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.ac-head {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 18px; border-bottom: 1px solid #F0EAE0;
  background: #FAF8F4;
  font-size: 14px; font-weight: 500; color: #1A1A18;
}
.ac-body { padding: 16px 18px; }
.ac-empty {
  text-align: center;
  padding: 20px 0;
}
.ac-empty p {
  font-size: 13px;
  color: #8A8070;
  margin-bottom: 12px;
}
.ac-add-btn {
  background: linear-gradient(135deg, #A07830, #C9A84C);
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  color: #FFF;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: .2s;
}
.ac-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(160,120,48,0.3);
}

.ac-add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  border: 1px dashed #C9A84C;
  border-radius: 10px;
  background: rgba(201,168,76,0.05);
  color: #A07830;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: .2s;
  margin-top: 4px;
}
.ac-add-more:hover {
  background: rgba(201,168,76,0.1);
  border-color: #A07830;
}

.ac-selector {
  cursor: pointer;
  position: relative;
  padding-right: 24px;
}
.ac-selector svg {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #8A8070;
}
.ac-user {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 8px;
}
.ac-name { font-size: 14px; font-weight: 500; color: #1A1A18; }
.ac-phone { font-size: 13px; color: #8A8070; font-family: 'Space Mono', monospace; }
.ac-default {
  font-size: 10px;
  color: #A07830;
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.3);
  padding: 2px 6px;
  border-radius: 4px;
}
.ac-address { font-size: 13px; color: #4A4438; line-height: 1.6; }

/* 地址选择面板 */
.ac-panel {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #F0EAE0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}
.ac-option {
  padding: 12px;
  border: 1px solid #E0D8C8;
  border-radius: 10px;
  cursor: pointer;
  transition: .2s;
  background: #FAFAF8;
  position: relative;
}
.ac-option:hover { border-color: #C9A84C; background: rgba(201,168,76,0.05); }
.ac-option.active { border-color: #C9A84C; background: rgba(201,168,76,0.08); }
.ac-opt-user {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 6px;
}
.ac-opt-name { font-size: 13px; font-weight: 500; color: #1A1A18; }
.ac-opt-phone { font-size: 12px; color: #8A8070; font-family: 'Space Mono', monospace; }
.ac-opt-default {
  font-size: 9px;
  color: #A07830;
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.3);
  padding: 1px 5px;
  border-radius: 3px;
}
.ac-opt-address { font-size: 12px; color: #4A4438; line-height: 1.5; }
.ac-opt-check {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #A07830;
  font-size: 16px;
  font-weight: 700;
}

/* ══ 地址弹窗 ══ */
.addr-dialog-mask {
  position: fixed; inset: 0; background: rgba(26,26,24,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  backdrop-filter: blur(4px);
}
.addr-dialog {
  background: #FFF; border-radius: 14px; padding: 28px;
  width: 90%; max-width: 420px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); border: 1px solid #E0D8C8;
}
.addr-dialog-head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.addr-dialog-head h3 { font-size: 18px; font-weight: 500; color: #1A1A18; }
.dialog-close {
  background: none; border: none; font-size: 18px; color: #8A8070; cursor: pointer; padding: 4px;
}
.dialog-close:hover { color: #C0392B; }

.addr-form .form-item { margin-bottom: 16px; }
.addr-form label { display: block; font-size: 12px; color: #4A4438; margin-bottom: 6px; font-weight: 500; }
.addr-form input, .addr-form textarea {
  width: 100%; padding: 10px 12px; border: 1px solid #E0D8C8; border-radius: 8px;
  font-family: inherit; font-size: 14px; color: #1A1A18; background: #FAFAF8;
  transition: .2s; outline: none;
}
.addr-form input:focus, .addr-form textarea:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.08); }
.addr-form textarea { resize: vertical; }

.form-check {
  display: flex; align-items: center; gap: 8px; font-size: 13px; color: #4A4438;
  cursor: pointer; margin-bottom: 20px;
}
.form-check input { accent-color: #C9A84C; width: 14px; height: 14px; }

.form-footer { display: flex; gap: 12px; margin-top: 24px; }
.btn-ghost, .btn-primary {
  flex: 1; padding: 10px; border-radius: 100px; font-family: inherit; font-size: 13px;
  cursor: pointer; transition: .2s; border: none; font-weight: 500;
}
.btn-ghost { background: #FAFAF8; border: 1px solid #E0D8C8; color: #8A8070; }
.btn-ghost:hover { border-color: #C9A84C; color: #A07830; }
.btn-primary { background: linear-gradient(135deg, #C9A84C, #A07830); color: #FFF; }
.btn-primary:hover { filter: brightness(1.05); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; filter: none; }

/* 弹窗动画 */
.dialog-fade-enter-active, .dialog-fade-leave-active { transition: opacity .2s ease; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }

/* ── 配送方式 ── */
.delivery-card {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.dc-head {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 18px; border-bottom: 1px solid #F0EAE0;
  background: #FAF8F4;
  font-size: 14px; font-weight: 500; color: #1A1A18;
}
.dc-body {
  padding: 14px 18px;
  display: flex; align-items: center; justify-content: space-between;
}
.dc-type { font-size: 13px; font-weight: 500; color: #1A1A18; }
.dc-time { font-size: 12px; color: #8A8070; }

/* ── 订单备注 ── */
.note-card {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 16px; padding: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.nc-head {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 12px;
  font-size: 14px; font-weight: 500; color: #1A1A18;
}
.nc-input {
  width: 100%; min-height: 80px; padding: 12px;
  border: 1px solid #E0D8C8; border-radius: 10px;
  font-family: inherit; font-size: 13px;
  resize: vertical; transition: .2s;
  background: #FAFAF8;
}
.nc-input:focus {
  outline: none; border-color: #C9A84C;
  background: #FFF; box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
}
.nc-count {
  display: block; text-align: right;
  font-size: 11px; color: #8A8070; margin-top: 6px;
}

/* ══ 右侧支付 ══ */
.pay-right { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 90px; }

/* ── 支付方式 ── */
.pay-card {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 4px 20px rgba(201,168,76,0.1);
}
.pc-head {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 18px; border-bottom: 1px solid #F0EAE0;
  background: #FAF8F4;
  font-size: 14px; font-weight: 500; color: #1A1A18;
}

.pc-methods { padding: 8px 12px; }
.pm-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 10px;
  border: 1px solid #E0D8C8; cursor: pointer; transition: .2s;
  margin-bottom: 8px; background: #FAFAF8;
}
.pm-item:last-child { margin-bottom: 0; }
.pm-item:hover { border-color: #C9A84C; background: rgba(201,168,76,0.05); }
.pm-item.active { border-color: #C9A84C; background: rgba(201,168,76,0.08); }

.pm-icon { font-size: 24px; }
.pm-info { flex: 1; }
.pm-name { font-size: 13px; font-weight: 500; color: #1A1A18; margin-bottom: 2px; }
.pm-desc { font-size: 11px; color: #8A8070; }

.pm-radio {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid #C9A84C; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #FFF; transition: .2s;
}
.pm-radio.checked { background: #C9A84C; border-color: #C9A84C; }
.pm-radio.checked svg { color: #FFF; }

/* ── 价格明细 ── */
.summary-card {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 4px 20px rgba(201,168,76,0.1);
}

.price-rows {
  padding: 14px 18px; display: flex; flex-direction: column; gap: 10px;
  border-bottom: 1px solid #F0EAE0;
}
.pr-row { display: flex; justify-content: space-between; font-size: 13px; color: #8A8070; }
.pr-red   { color: #C0392B; }
.pr-green { color: #27AE60; }

.price-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid #F0EAE0;
}
.pt-label  { font-size: 14px; font-weight: 500; color: #4A4438; }
.pt-num-wrap { display: flex; align-items: baseline; gap: 2px; }
.pt-sym    { font-size: 14px; color: #1A1A18; }
.pt-num    { font-size: 26px; font-weight: 700; color: #1A1A18; font-family: 'Space Mono', monospace; line-height: 1; }

.pay-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: calc(100% - 32px); margin: 14px 16px;
  padding: 13px;
  background: linear-gradient(135deg, #A07830, #C9A84C);
  border: none; border-radius: 12px;
  color: #FFF; font-family: inherit; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: .25s;
  box-shadow: 0 4px 16px rgba(160,120,48,0.3);
}
.pay-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(160,120,48,0.45); }
.pay-btn:disabled { background: #E0D8C8; color: #B0A898; box-shadow: none; cursor: not-allowed; }
.pay-hint { text-align: center; font-size: 11px; color: #B0A898; padding: 0 16px 14px; }

/* ── 安全保障 ── */
.guarantee-card {
  background: #FFF; border: 1px solid #E0D8C8;
  border-radius: 14px; padding: 14px 18px;
  display: grid; grid-template-columns: repeat(2,1fr); gap: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.guar-item  { display: flex; align-items: center; gap: 7px; }
.guar-icon  { font-size: 14px; }
.guar-label { font-size: 11px; color: #8A8070; }

/* ── 响应式 ── */
@media (max-width:1100px) {
  .pay-body { grid-template-columns: 1fr; }
  .pay-right { position: static; }
}
@media (max-width:768px) {
  .pay-inner { padding: 0 20px; }
  .ph-order { display: none; }
}
@media (max-width:480px) {
  .pay-inner { padding: 0 14px; }
  .oi-img { width: 56px; height: 56px; }
}
</style>
