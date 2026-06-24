<template>
  <div class="so-root">
    <!-- ── 筛选栏 ── -->
    <div class="so-toolbar">
      <div class="sot-tabs">
        <button v-for="tab in statusTabs" :key="tab.key"
          :class="['sott-btn', { active: statusFilter === tab.key }]"
          @click="statusFilter = tab.key; page = 1; loadOrders()">
          {{ tab.label }}
        </button>
      </div>
      <div class="sot-search">
        <Search :size="14" stroke-width="1.5" class="sots-icon" />
        <input v-model="keyword" placeholder="搜索订单号/商品名..." @input="onSearch" />
      </div>
    </div>

    <!-- ── 加载/空状态 ── -->
    <div v-if="loading" class="so-state">加载中...</div>
    <div v-else-if="!orders.length" class="so-state">
      <ClipboardList :size="40" stroke-width="1" />
      <p>暂无订单</p>
    </div>

    <!-- ── 订单表格 ── -->
    <div v-else class="so-table-wrap">
      <table class="so-table">
        <thead>
          <tr>
            <th>订单号</th>
            <th>商品</th>
            <th>买家</th>
            <th>金额</th>
            <th>状态</th>
            <th>时间</th>
            <th style="width:160px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id" :class="{ 'row-expanded': expandedId === o.id }">
            <td><span class="sot-mono">{{ o.orderNo || o.id }}</span></td>
            <td>
              <div class="sot-product">
                <div class="sotp-img"><img v-if="o.productImage" :src="o.productImage" /></div>
                <span>{{ o.productName || '-' }}</span>
              </div>
            </td>
            <td>{{ o.buyerName || '-' }}</td>
            <td><strong>¥{{ o.amount }}</strong></td>
            <td><span :class="['sot-status', statusClass(o.rawStatus)]">{{ statusLabel(o.rawStatus) }}</span></td>
            <td><span class="sot-mono">{{ formatDate(o.createTime) }}</span></td>
            <td>
              <div class="sot-actions">
                <button class="sota-btn" @click="toggleDetail(o)">详情</button>
                <button v-if="o.rawStatus === 'PAID'" class="sota-btn ship" @click="openShip(o)">发货</button>
              </div>
            </td>
          </tr>
          <!-- 展开的订单详情 -->
          <tr v-if="expandedId && expandedOrder" class="so-detail-row">
            <td colspan="7">
              <div class="so-detail">
                <div class="sod-grid">
                  <div class="sod-item">
                    <span class="sodi-label">订单编号</span>
                    <span class="sodi-val">{{ expandedOrder.orderNo || expandedOrder.id }}</span>
                  </div>
                  <div class="sod-item">
                    <span class="sodi-label">买家</span>
                    <span class="sodi-val">{{ expandedOrder.buyerName || '-' }}</span>
                  </div>
                  <div class="sod-item">
                    <span class="sodi-label">收货地址</span>
                    <span class="sodi-val">{{ expandedOrder.address || '-' }}</span>
                  </div>
                  <div class="sod-item">
                    <span class="sodi-label">联系电话</span>
                    <span class="sodi-val">{{ expandedOrder.phone || '-' }}</span>
                  </div>
                  <div class="sod-item">
                    <span class="sodi-label">物流单号</span>
                    <span class="sodi-val">{{ expandedOrder.trackingNo || '暂无' }}</span>
                  </div>
                  <div class="sod-item">
                    <span class="sodi-label">备注</span>
                    <span class="sodi-val">{{ expandedOrder.remark || '无' }}</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── 分页 ── -->
    <div v-if="totalPages > 1" class="so-pagination">
      <button :disabled="page === 1" @click="page--; loadOrders()">上一页</button>
      <span v-for="i in totalPages" :key="i">
        <button :class="{ active: i === page }" @click="page = i; loadOrders()">{{ i }}</button>
      </span>
      <button :disabled="page === totalPages" @click="page++; loadOrders()">下一页</button>
    </div>

    <!-- ── 发货弹窗 ── -->
    <Teleport to="body">
      <div v-if="showShipModal" class="so-modal-overlay" @mousedown.self="closeShip">
        <div class="so-modal">
          <div class="som-head">
            <h3>确认发货</h3>
            <button class="som-close" @click="closeShip">
              <X :size="18" stroke-width="1.5" />
            </button>
          </div>
          <div class="som-body">
            <p class="somb-info">订单号：{{ shipTarget?.orderNo || shipTarget?.id }}</p>
            <div class="somf-field">
              <label>物流单号（选填）</label>
              <input v-model="shipForm.trackingNo" placeholder="输入快递单号" />
            </div>
            <p class="somf-error" v-if="shipError">{{ shipError }}</p>
            <div class="somf-actions">
              <button class="btn-cancel" @click="closeShip">取消</button>
              <button class="btn-save" :disabled="shipping" @click="handleShip">
                {{ shipping ? '处理中...' : '确认发货' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Search, ClipboardList, X } from 'lucide-vue-next'
import { getShopOrders, getShopOrderDetail, shipOrder } from '../api/shop'

const orders = ref([])
const loading = ref(false)
const keyword = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const totalCount = ref(0)

const expandedId = ref(null)
const expandedOrder = ref(null)

const showShipModal = ref(false)
const shipTarget = ref(null)
const shipForm = reactive({ trackingNo: '' })
const shipping = ref(false)
const shipError = ref('')

const statusTabs = [
  { key: '',                label: '全部' },
  { key: 'PENDING_PAYMENT', label: '待付款' },
  { key: 'PAID',            label: '待发货' },
  { key: 'SHIPPED',         label: '已发货' },
  { key: 'COMPLETED',       label: '已完成' },
  { key: 'CANCELLED',       label: '已取消' },
]

const statusLabelMap = {
  PENDING_PAYMENT: '待付款',
  PAID:             '待发货',
  SHIPPED:          '已发货',
  COMPLETED:        '已完成',
  CANCELLED:        '已取消',
}
const statusClassMap = {
  PENDING_PAYMENT: 'st-pending',
  PAID:             'st-paid',
  SHIPPED:          'st-shipped',
  COMPLETED:        'st-done',
  CANCELLED:        'st-cancel',
}

function statusLabel(s) { return statusLabelMap[s] || s }
function statusClass(s) { return statusClassMap[s] || '' }

// 金额：分 → 元
function toYuan(cents) {
  if (cents == null) return '—'
  return (cents / 100).toFixed(2)
}

function formatDate(d) {
  if (!d) return '-'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return String(d)
  const pad = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

// ─── 加载 ───
async function loadOrders() {
  loading.value = true
  try {
    const params = { page: page.value, size: pageSize.value }
    if (statusFilter.value) params.status = statusFilter.value
    if (keyword.value) params.keyword = keyword.value

    const res = await getShopOrders(params)
    // res = { code:200, data:{ total, pages, list:[...] } }
    const data = res
    if (data && Array.isArray(data.list)) {
      orders.value = data.list.map(o => ({
        ...o,
        rawStatus: o.status,
        amount: toYuan(o.totalAmount),
      }))
      totalPages.value = data.pages || 1
      totalCount.value = data.total || 0
    } else {
      orders.value = []
      totalPages.value = 1
      totalCount.value = 0
    }
  } catch (e) {
    console.error('加载订单失败:', e)
  } finally {
    loading.value = false
  }
}

let searchTimer
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; loadOrders() }, 400)
}

// ─── 详情 ───
async function toggleDetail(o) {
  if (expandedId.value === o.id) {
    expandedId.value = null
    expandedOrder.value = null
    return
  }
  expandedId.value = o.id
  loading.value = true
  try {
    const res = await getShopOrderDetail(o.id)
    // res = { code:200, data:{ ... } }
    expandedOrder.value = res
  } catch {
    expandedOrder.value = o
  } finally {
    loading.value = false
  }
}

// ─── 发货 ───
function openShip(o) {
  shipTarget.value = o
  shipForm.trackingNo = ''
  shipError.value = ''
  showShipModal.value = true
}

function closeShip() {
  showShipModal.value = false
  shipTarget.value = null
}

async function handleShip() {
  shipping.value = true
  shipError.value = ''
  try {
    await shipOrder(shipTarget.value.id, {
      trackingNo: shipForm.trackingNo || undefined,
    })
    closeShip()
    await loadOrders()
  } catch (e) {
    shipError.value = e.message || '发货失败'
  } finally {
    shipping.value = false
  }
}

onMounted(() => { loadOrders() })
</script>

<style scoped>
.so-root {
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
}

/* ═══════ 工具栏 ═══════ */
.so-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; gap: 16px; flex-wrap: wrap;
}
.sot-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.sott-btn {
  padding: 7px 16px; border: 1.5px solid var(--border-light);
  border-radius: var(--radius-sm); background: #FFF;
  font-size: 12px; color: var(--text-tertiary); cursor: pointer;
  font-weight: 500; transition: all 0.2s; font-family: inherit;
}
.sott-btn:hover { border-color: var(--gold-light); color: var(--gold); }
.sott-btn.active {
  background: var(--gold-soft); border-color: var(--gold-light); color: var(--gold);
}

.sot-search {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-input); border-radius: var(--radius-sm);
  padding: 0 12px; border: 1.5px solid transparent;
  transition: border-color 0.2s;
}
.sot-search:focus-within { border-color: var(--gold-light); background: #FFF; }
.sot-search input {
  border: none; background: none; padding: 9px 0;
  font-size: 13px; color: var(--text-primary); outline: none;
  width: 180px; font-family: inherit;
}
.sot-search input::placeholder { color: var(--text-tertiary); }
.sots-icon { color: var(--text-tertiary); flex-shrink: 0; }

/* ═══════ 空状态 ═══════ */
.so-state {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 60px 20px; color: var(--text-tertiary);
}
.so-state p { font-size: 14px; }

/* ═══════ 表格 ═══════ */
.so-table-wrap { overflow-x: auto; }
.so-table {
  width: 100%; border-collapse: collapse;
  background: var(--bg-card); border-radius: var(--radius-md);
  overflow: hidden; border: 1px solid var(--border-light);
}
.so-table th {
  text-align: left; padding: 13px 14px;
  font-size: 11px; font-weight: 600; color: var(--text-tertiary);
  text-transform: uppercase; letter-spacing: 0.06em;
  background: #FAF8F4; border-bottom: 2px solid var(--border-light);
}
.so-table td {
  padding: 14px; font-size: 13px; color: var(--text-secondary);
  border-bottom: 1px solid var(--border-light); vertical-align: middle;
}
.so-table tbody tr:last-child td { border-bottom: none; }
.so-table tbody tr:not(.so-detail-row):hover { background: var(--gold-soft); }
.row-expanded > td { border-bottom: none; }

.sot-mono { font-size: 12px; color: var(--text-tertiary); }
.sot-product { display: flex; align-items: center; gap: 10px; }
.sotp-img {
  width: 36px; height: 36px; border-radius: 8px;
  background: var(--bg-input); overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sotp-img img { width: 100%; height: 100%; object-fit: cover; }

.sot-status {
  padding: 3px 10px; border-radius: 5px; font-size: 11px; font-weight: 600; white-space: nowrap;
}
.sot-status.st-pending  { background: #FEE2E2; color: #991B1B; }
.sot-status.st-paid     { background: #FEF3C7; color: #92400E; }
.sot-status.st-shipped  { background: #DBEAFE; color: #1E40AF; }
.sot-status.st-done     { background: #D1FAE5; color: #065F46; }
.sot-status.st-cancel   { background: #F3F4F6; color: #6B7280; }

.sot-actions { display: flex; gap: 8px; }
.sota-btn {
  padding: 5px 14px; border-radius: 5px; border: 1px solid var(--border-light);
  font-size: 11px; cursor: pointer; font-weight: 500; transition: all 0.2s;
  background: transparent; font-family: inherit; color: var(--text-secondary);
}
.sota-btn:hover { border-color: var(--gold); color: var(--gold); }
.sota-btn.ship {
  background: var(--gold); color: #FFF; border-color: var(--gold);
}
.sota-btn.ship:hover { background: var(--gold-dim); }

/* ═══════ 详情行 ═══════ */
.so-detail-row td {
  padding: 0 14px 16px; background: #FAF8F4;
}
.so-detail {
  background: #FFF; border-radius: var(--radius-sm);
  padding: 20px; border: 1px solid var(--border-light);
}
.sod-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.sod-item { display: flex; flex-direction: column; gap: 3px; }
.sodi-label { font-size: 11px; color: var(--text-tertiary); font-weight: 500; }
.sodi-val { font-size: 13px; color: var(--text-primary); }

/* ═══════ 分页 ═══════ */
.so-pagination {
  display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 20px;
}
.so-pagination button {
  padding: 7px 14px; border: 1px solid var(--border-light);
  border-radius: 6px; background: #FFF; color: var(--text-secondary);
  font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.so-pagination button:hover:not(:disabled) { border-color: var(--gold-light); color: var(--gold); }
.so-pagination button.active { background: var(--gold); color: #FFF; border-color: var(--gold); }
.so-pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

/* ═══════ 弹窗 ═══════ */
.so-modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.35); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.so-modal {
  background: #FFF; border-radius: var(--radius-md);
  width: 100%; max-width: 460px; box-shadow: 0 24px 64px rgba(0,0,0,0.15);
}
.som-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 0;
}
.som-head h3 {
  font-family: 'Playfair Display', serif;
  font-size: 18px; font-weight: 600; color: var(--text-primary);
}
.som-close {
  width: 32px; height: 32px; border-radius: 8px; border: none;
  background: transparent; cursor: pointer; display: flex;
  align-items: center; justify-content: center; color: var(--text-tertiary);
  transition: all 0.2s;
}
.som-close:hover { background: #F5F1E8; color: var(--text-primary); }

.som-body { padding: 16px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
.somb-info { font-size: 13px; color: var(--text-secondary); }
.somf-field { display: flex; flex-direction: column; gap: 6px; }
.somf-field label {
  font-size: 12px; font-weight: 600; color: var(--text-secondary);
}
.somf-field input {
  padding: 10px 12px; border: 1.5px solid var(--border-light);
  border-radius: var(--radius-sm); font-size: 13px;
  color: var(--text-primary); outline: none; font-family: inherit;
  transition: border-color 0.2s;
}
.somf-field input:focus { border-color: var(--gold-light); }
.somf-error { font-size: 12px; color: var(--error); text-align: center; }
.somf-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-cancel {
  padding: 10px 20px; border: 1.5px solid var(--border-light);
  border-radius: var(--radius-sm); background: #FFF;
  color: var(--text-secondary); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.btn-cancel:hover { border-color: var(--text-tertiary); }
.btn-save {
  padding: 10px 24px; border: none; border-radius: var(--radius-sm);
  background: var(--gold); color: #FFF; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.25s; font-family: inherit;
}
.btn-save:hover:not(:disabled) { background: var(--gold-dim); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
