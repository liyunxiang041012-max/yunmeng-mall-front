<template>
  <div class="sp-root">
    <!-- ── 顶部操作栏 ── -->
    <div class="sp-toolbar">
      <div class="spt-left">
        <div class="spt-search">
          <Search :size="14" stroke-width="1.5" class="spt-s-icon" />
          <input v-model="searchKeyword" placeholder="搜索商品名称..." @input="onSearch" />
        </div>
        <select v-model="statusFilter" @change="page=1;loadProducts()" class="spt-select">
          <option value="">全部状态</option>
          <option value="1">上架中</option>
          <option value="0">已下架</option>
        </select>
      </div>
      <button class="btn-add" @click="openAdd">
        <Plus :size="15" stroke-width="2" />
        添加商品
      </button>
    </div>

    <!-- ── 加载/空状态 ── -->
    <div v-if="loading" class="sp-state">加载中...</div>
    <div v-else-if="!products.length" class="sp-state">
      <Package :size="40" stroke-width="1" />
      <p>还没有商品，点击上方按钮添加</p>
    </div>

    <!-- ── 商品表格 ── -->
    <div v-else class="sp-table-wrap">
      <table class="sp-table">
        <thead>
          <tr>
            <th style="width:56px">图片</th>
            <th>商品名称</th>
            <th>价格</th>
            <th>库存</th>
            <th>销量</th>
            <th>状态</th>
            <th style="width:72px">审核</th>
            <th>创建时间</th>
            <th style="width:170px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>
              <div class="spt-img-wrap">
                <img v-if="p.image" :src="p.image" class="spt-img" />
                <div v-else class="spt-img-placeholder"><Package :size="16" stroke-width="1.2" /></div>
              </div>
            </td>
            <td><span class="spt-name">{{ p.name }}</span></td>
            <td><strong>¥{{ formatPrice(p.price) }}</strong></td>
            <td>{{ p.stock ?? '-' }}</td>
            <td>{{ p.sold ?? 0 }}</td>
            <td>
              <span :class="['spt-status', p.status === 1 ? 'on' : 'off']">
                {{ p.status === 1 ? '上架中' : '已下架' }}
              </span>
            </td>
            <td>
              <span :class="['spt-status', auditClass(p.auditStatus)]">{{ auditLabel(p.auditStatus) }}</span>
            </td>
            <td><span class="spt-time">{{ formatDate(p.createTime) }}</span></td>
            <td>
              <div class="spt-actions">
                <button class="spta-btn edit" @click="openEdit(p)">编辑</button>
                <button
                  class="spta-btn toggle"
                  :disabled="p.auditStatus !== 1"
                  :title="p.auditStatus !== 1 ? '审核通过后才能上下架' : ''"
                  @click="handleToggleStatus(p)"
                >
                  {{ p.status === 1 ? '下架' : '上架' }}
                </button>
                <button class="spta-btn delete" @click="confirmDelete(p)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── 分页 ── -->
    <div v-if="totalPages > 1" class="sp-pagination">
      <button :disabled="page === 1" @click="page--; loadProducts()">上一页</button>
      <span v-for="i in totalPages" :key="i">
        <button :class="{ active: i === page }" @click="page=i; loadProducts()">{{ i }}</button>
      </span>
      <button :disabled="page === totalPages" @click="page++; loadProducts()">下一页</button>
    </div>

    <!-- ── 添加/编辑弹窗 ── -->
    <Teleport to="body">
      <div v-if="showModal" class="sp-modal-overlay" @mousedown.self="closeModal">
        <div class="sp-modal">
          <div class="spm-head">
            <h3>{{ isEdit ? '编辑商品' : '添加商品' }}</h3>
            <button class="spm-close" @click="closeModal"><X :size="18" stroke-width="1.5" /></button>
          </div>
          <form @submit.prevent="handleSave" class="spm-form">
            <div class="spm-body">
              <!-- 左侧：表单 -->
              <div class="spm-left">
                <!-- 商品名称 -->
                <div class="spmf-field">
                  <label>商品名称 <span class="required">*</span></label>
                  <input v-model="form.name" type="text" placeholder="请输入商品名称" required maxlength="100" />
                </div>

                <!-- 价格 + 库存 -->
                <div class="spmf-row">
                  <div class="spmf-field">
                    <label>价格（元）<span class="required">*</span></label>
                    <input v-model.number="formPriceYuan" type="number" step="0.01" min="0" placeholder="0.00" required />
                  </div>
                  <div class="spmf-field">
                    <label>库存 <span class="required">*</span></label>
                    <input v-model.number="form.stock" type="number" min="0" placeholder="0" required />
                  </div>
                </div>

                <!-- 分类级联选择 -->
                <div class="spmf-field">
                  <label>商品分类</label>
                  <div class="spmf-cascade">
                    <select v-model="cate1" @change="onCate1Change" :disabled="cateLoading">
                      <option value="">请选择一级分类</option>
                      <option v-for="c in cateLevel1" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <select v-if="cateLevel2.length" v-model="cate2" @change="onCate2Change" :disabled="cateLoading">
                      <option value="">请选择二级分类</option>
                      <option v-for="c in cateLevel2" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <select v-if="cateLevel3.length" v-model="cate3" @change="onCate3Change" :disabled="cateLoading">
                      <option value="">请选择三级分类（选填）</option>
                      <option v-for="c in cateLevel3" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                  </div>
                </div>

                <!-- 品牌 -->
                <div class="spmf-field">
                  <label>品牌</label>
                  <select v-model="form.brandId">
                    <option value="">请选择品牌（选填）</option>
                    <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
                  </select>
                </div>

                <p v-if="!isEdit" class="spmf-note">新增后默认「已下架」，需手动点击上架。</p>
                <p class="spmf-error" v-if="modalError">{{ modalError }}</p>

                <div class="spmf-actions">
                  <button type="button" class="btn-cancel" @click="closeModal">取消</button>
                  <button type="button" class="btn-save" :disabled="saving" @click="handleSave">
                    {{ saving ? '保存中...' : (isEdit ? '保存修改' : '发布商品') }}
                  </button>
                </div>
              </div>

              <!-- 右侧：图片上传 & 预览 -->
              <div class="spm-right">
                <input ref="imgInput" type="file" accept="image/*" hidden @change="handleImageUpload" />
                <label class="spmr-label">商品图片</label>
                <div
                  :class="['spmr-drop', { 'has-image': form.image, 'drag-over': dragOver }]"
                  @click="imgInput?.click()"
                  @dragover.prevent="dragOver = true"
                  @dragleave="dragOver = false"
                  @drop.prevent="handleDrop"
                >
                  <template v-if="form.image">
                    <img :src="form.image" class="spmr-preview" />
                    <div class="spmr-overlay">
                      <Upload :size="14" stroke-width="2" />
                      <span>{{ imageUploading ? '上传中...' : '拖拽或点击更换' }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <Upload :size="28" stroke-width="1.2" />
                    <span class="spmr-hint">拖拽图片到此处</span>
                    <span class="spmr-sub">或点击上传 · JPG/PNG/WebP · ≤5MB</span>
                  </template>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ── 删除确认弹窗 ── -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="sp-modal-overlay" @mousedown.self="showDeleteConfirm = false">
        <div class="sp-modal sp-modal-sm">
          <div class="spm-head">
            <h3>确认删除</h3>
            <button class="spm-close" @click="showDeleteConfirm = false"><X :size="18" stroke-width="1.5" /></button>
          </div>
          <p class="spm-confirm-text">确定要删除「{{ deleteTarget?.name }}」吗？删除后可在数据库恢复。</p>
          <div class="spmf-actions">
            <button class="btn-cancel" @click="showDeleteConfirm = false">取消</button>
            <button class="btn-save btn-danger" :disabled="deleting" @click="handleDelete">
              {{ deleting ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus, Package, Upload, X } from 'lucide-vue-next'
import {
  getShopProductPage, createShopProduct, updateShopProduct,
  deleteShopProduct, toggleShopProductStatus, uploadProductImage
} from '../api/shop'
import { getTopCategories, getCategoryChildren, getBrandList } from '../api/item'

const products = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)

const showModal = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const saving = ref(false)
const modalError = ref('')
const imgInput = ref(null)
const dragOver = ref(false)
const imageUploading = ref(false)
const formPriceYuan = ref(0)

const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

// ─── 分类级联 ───
const cateLevel1 = ref([])
const cateLevel2 = ref([])
const cateLevel3 = ref([])
const cate1 = ref('')
const cate2 = ref('')
const cate3 = ref('')
const cateLoading = ref(false)

async function loadCateLevel1() {
  if (cateLevel1.value.length) return
  cateLoading.value = true
  try {
    const list = await getTopCategories()
    cateLevel1.value = list ?? []
  } catch (e) {
    console.error('加载一级分类失败:', e)
  } finally {
    cateLoading.value = false
  }
}

async function onCate1Change() {
  cate2.value = ''
  cate3.value = ''
  cateLevel2.value = []
  cateLevel3.value = []
  form.categoryId = cate1.value || ''
  if (!cate1.value) return
  cateLoading.value = true
  try {
    cateLevel2.value = await getCategoryChildren(cate1.value) ?? []
  } catch (e) {
    console.error('加载二级分类失败:', e)
  } finally {
    cateLoading.value = false
  }
}

async function onCate2Change() {
  cate3.value = ''
  cateLevel3.value = []
  form.categoryId = cate2.value || cate1.value || ''
  if (!cate2.value) return
  cateLoading.value = true
  try {
    cateLevel3.value = await getCategoryChildren(cate2.value) ?? []
  } catch (e) {
    console.error('加载三级分类失败:', e)
  } finally {
    cateLoading.value = false
  }
}

function onCate3Change() {
  form.categoryId = cate3.value || cate2.value || cate1.value || ''
}

function resetCate() {
  cate1.value = ''
  cate2.value = ''
  cate3.value = ''
  cateLevel2.value = []
  cateLevel3.value = []
}

// ─── 品牌 ───
const brands = ref([])

async function loadBrands() {
  if (brands.value.length) return
  try {
    brands.value = await getBrandList() ?? []
  } catch (e) {
    console.error('加载品牌失败:', e)
  }
}

const defaultForm = () => ({ name: '', image: '', price: 0, stock: 0, categoryId: '', brandId: '' })
const form = reactive(defaultForm())

// ─── 价格格式化 ───
function formatPrice(priceInCents) {
  if (priceInCents == null) return '-'
  return (priceInCents / 100).toFixed(2)
}

let searchTimer
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; loadProducts() }, 400)
}

function formatDate(d) {
  if (!d) return '-'
  const s = String(d).replace('T', ' ')
  const dt = new Date(s.replace(/-/g, '/'))
  if (isNaN(dt.getTime())) return s
  const pad = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`
}

function auditLabel(s) {
  if (s === 0) return '待审核'
  if (s === 1) return '已通过'
  if (s === 2) return '已驳回'
  return '未知'
}

function auditClass(s) {
  if (s === 0) return 'pending'
  if (s === 1) return 'on'
  if (s === 2) return 'off'
  return ''
}

// ─── 加载列表 ───
async function loadProducts() {
  loading.value = true
  try {
    const params = { page: page.value, size: pageSize.value }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (statusFilter.value !== '') params.status = Number(statusFilter.value)

    const res = await getShopProductPage(params)
    const data = res.data || res
    if (data.list) {
      products.value = data.list
      totalPages.value = Math.max(1, Math.ceil((data.total || 0) / pageSize.value))
    } else if (Array.isArray(data)) {
      products.value = data
      totalPages.value = 1
    }
  } catch (e) {
    console.error('加载商品失败:', e)
  } finally {
    loading.value = false
  }
}

// ─── 添加/编辑弹窗 ───
function openAdd() {
  isEdit.value = false
  editId.value = null
  Object.assign(form, defaultForm())
  formPriceYuan.value = 0
  modalError.value = ''
  showModal.value = true
  loadCateLevel1()
  loadBrands()
  resetCate()
}

function openEdit(p) {
  isEdit.value = true
  editId.value = p.id
  Object.assign(form, {
    name: p.name || '',
    image: p.image || '',
    price: p.price || 0,
    stock: p.stock || 0,
    categoryId: p.categoryId || '',
    brandId: p.brandId || '',
  })
  formPriceYuan.value = p.price ? Number((p.price / 100).toFixed(2)) : 0
  modalError.value = ''
  showModal.value = true
  loadCateLevel1()
  loadBrands()
  resetCate()
}

function closeModal() { showModal.value = false }

async function handleImageUpload(e) {
  const file = e.target?.files?.[0]
  if (!file) return
  await uploadFile(file)
  if (e.target) e.target.value = ''
}

async function handleDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  await uploadFile(file)
}

async function uploadFile(file) {
  if (file.size > 5 * 1024 * 1024) { modalError.value = '图片不能超过 5MB'; return }
  modalError.value = ''
  imageUploading.value = true
  try {
    const res = await uploadProductImage(file)
    console.log('[商品图片] 上传返回:', res, typeof res)
    // 响应拦截器已解包 body.data，OSS 接口返回纯 URL 字符串
    const url = typeof res === 'string' ? res : (res?.data || res?.url || '')
    if (!url || typeof url !== 'string') {
      modalError.value = '上传成功但未获取到图片地址'
      console.error('[商品图片] 无法提取 URL，res=', res)
      return
    }
    form.image = url
    console.log('[商品图片] 最终地址:', url)
  } catch (err) {
    modalError.value = err.message || '上传失败'
    console.error('[商品图片] 上传失败:', err)
  } finally {
    imageUploading.value = false
  }
}

async function handleSave() {
  if (!form.name.trim()) { modalError.value = '请输入商品名称'; return }
  if (!formPriceYuan.value || formPriceYuan.value <= 0) { modalError.value = '请输入有效价格'; return }
  if (form.stock == null || form.stock < 0) { modalError.value = '请输入有效库存'; return }

  saving.value = true
  modalError.value = ''
  try {
    // 价格 元→分
    const payload = {
      name: form.name.trim(),
      price: Math.round(formPriceYuan.value * 100),
      stock: form.stock,
      image: form.image || undefined,
      categoryId: form.categoryId || undefined,
      brandId: form.brandId || undefined,
    }
    if (isEdit.value) {
      await updateShopProduct(editId.value, payload)
    } else {
      await createShopProduct(payload)
    }
    closeModal()
    await loadProducts()
  } catch (err) {
    modalError.value = err.message || '保存失败'
  } finally {
    saving.value = false
  }
}

// ─── 上架/下架 ───
async function handleToggleStatus(p) {
  try {
    await toggleShopProductStatus(p.id)
    await loadProducts()
  } catch (err) {
    console.error('切换状态失败:', err)
  }
}

// ─── 删除 ───
function confirmDelete(p) { deleteTarget.value = p; showDeleteConfirm.value = true }

async function handleDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deleteShopProduct(deleteTarget.value.id)
    showDeleteConfirm.value = false
    deleteTarget.value = null
    await loadProducts()
  } catch (err) {
    console.error('删除失败:', err)
  } finally {
    deleting.value = false
  }
}

onMounted(() => { loadProducts() })
</script>

<style scoped>
/* ═══════ 根 ═══════ */
.sp-root {
  --bg-card:    #FFFFFF;
  --bg-input:   #F5F1E8;
  --gold:       #A07830;
  --gold-dim:   #8C6308;
  --gold-light: #C9A84C;
  --gold-soft:  rgba(160,120,48,0.05);
  --gold-glow:  rgba(160,120,48,0.12);
  --text-primary:   #1A1712;
  --text-secondary: #5C5546;
  --text-tertiary:  #9B9484;
  --border:     #E0D8C4;
  --border-light:#EDE7D6;
  --error:      #C0392B;
  --green:      #27AE60;
  --radius-sm:  8px;
  --radius-md:  12px;
  font-family: 'Noto Sans SC','PingFang SC',-apple-system,sans-serif;
  color: var(--text-primary);
}
* { box-sizing: border-box; margin: 0; padding: 0; }

/* ═══════ 工具栏 ═══════ */
.sp-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
.spt-left { display: flex; align-items: center; gap: 12px; }
.spt-search {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-input); border-radius: var(--radius-sm);
  padding: 0 12px; border: 1.5px solid transparent; transition: border-color 0.2s;
}
.spt-search:focus-within { border-color: var(--gold-light); background: #FFF; }
.spt-search input {
  border: none; background: none; padding: 9px 0;
  font-size: 13px; color: var(--text-primary); outline: none;
  width: 180px; font-family: inherit;
}
.spt-search input::placeholder { color: var(--text-tertiary); }
.spt-s-icon { color: var(--text-tertiary); flex-shrink: 0; }
.spt-select {
  padding: 9px 12px; border: 1.5px solid var(--border-light);
  border-radius: var(--radius-sm); background: #FFF; font-size: 13px;
  color: var(--text-secondary); cursor: pointer; outline: none; font-family: inherit;
}
.btn-add {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 9px;
  background: #1A1A1A;
  color: #FAFAFA;
  font-size: 13.5px; font-weight: 530;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  font-family: inherit;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06);
  -webkit-font-smoothing: antialiased;
}
.btn-add:hover {
  background: #2A2A2A;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.1);
}
.btn-add:active {
  transform: scale(0.975);
  background: #111;
}

/* ═══════ 空状态 ═══════ */
.sp-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 20px; color: var(--text-tertiary); }
.sp-state p { font-size: 14px; }

/* ═══════ 表格 ═══════ */
.sp-table-wrap { overflow-x: auto; }
.sp-table {
  width: 100%; border-collapse: collapse;
  background: var(--bg-card); border-radius: var(--radius-md);
  overflow: hidden; border: 1px solid var(--border-light);
}
.sp-table th {
  text-align: left; padding: 13px 14px;
  font-size: 11px; font-weight: 600; color: var(--text-tertiary);
  text-transform: uppercase; letter-spacing: 0.06em;
  background: #FAF8F4; border-bottom: 2px solid var(--border-light);
}
.sp-table td { padding: 14px; font-size: 13px; color: var(--text-secondary); border-bottom: 1px solid var(--border-light); }
.sp-table tbody tr:last-child td { border-bottom: none; }
.sp-table tbody tr:hover { background: var(--gold-soft); }

.spt-img-wrap { width: 44px; height: 44px; border-radius: 8px; overflow: hidden; }
.spt-img { width: 100%; height: 100%; object-fit: cover; }
.spt-img-placeholder {
  width: 100%; height: 100%; background: var(--bg-input);
  display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);
}
.spt-name { font-weight: 500; color: var(--text-primary); }
.spt-time { font-size: 12px; color: var(--text-tertiary); }
.spt-status { padding: 3px 10px; border-radius: 5px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.spt-status.on  { background: #ECFDF5; color: #065F46; }
.spt-status.off { background: #FEF2F2; color: #991B1B; }
.spt-status.pending { background: #FEF3C7; color: #D97706; }

.spt-actions { display: flex; gap: 6px; }
.spta-btn {
  padding: 5px 11px; border-radius: 5px; border: 1px solid var(--border-light);
  font-size: 11px; cursor: pointer; font-weight: 500; transition: all 0.2s;
  background: transparent; font-family: inherit; color: var(--text-secondary);
}
.spta-btn:hover { border-color: var(--gold); color: var(--gold); }
.spta-btn.toggle:hover { border-color: var(--green); color: var(--green); background: #ECFDF5; }
.spta-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.spta-btn:disabled:hover { border-color: var(--border-light); color: var(--text-secondary); background: transparent; }
.spta-btn.delete { color: var(--error); border-color: rgba(192,57,43,0.2); }
.spta-btn.delete:hover { background: var(--error); color: #FFF; border-color: var(--error); }

/* ═══════ 分页 ═══════ */
.sp-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 20px; }
.sp-pagination button {
  padding: 7px 14px; border: 1px solid var(--border-light);
  border-radius: 6px; background: #FFF; color: var(--text-secondary);
  font-size: 12px; cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.sp-pagination button:hover:not(:disabled) { border-color: var(--gold-light); color: var(--gold); }
.sp-pagination button.active { background: var(--gold); color: #FFF; border-color: var(--gold); }
.sp-pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

.spmf-field { display: flex; flex-direction: column; gap: 6px; }
.sp-modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.35); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.sp-modal { background: #FFF; border-radius: 14px; width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.15); }
.sp-modal-sm { max-width: 400px; }
.spm-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.spm-head h3 { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; color: var(--text-primary); }
.spm-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); transition: all 0.2s; }
.spm-close:hover { background: #F5F1E8; color: var(--text-primary); }
.spm-confirm-text { padding: 16px 24px; font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

.spm-form { padding: 0 24px 24px; }
.spm-body { display: grid; grid-template-columns: 1.1fr 1fr; gap: 28px; }
.spm-left { display: flex; flex-direction: column; gap: 14px; padding-top: 4px; }
.spmf-field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.02em; }
.required { color: var(--error); }
.spmf-field input, .spmf-field textarea, .spmf-field select {
  padding: 10px 12px; border: 1.5px solid var(--border-light);
  border-radius: var(--radius-sm); font-size: 13px; color: var(--text-primary);
  outline: none; font-family: inherit; background: #FFF; transition: border-color 0.2s;
}
.spmf-field input:focus { border-color: var(--gold-light); }
.spmf-field select {
  padding: 10px 12px; border: 1.5px solid var(--border-light);
  border-radius: var(--radius-sm); font-size: 13px; color: var(--text-primary);
  outline: none; font-family: inherit; background: #FFF; transition: border-color 0.2s;
  cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239B9484' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center; padding-right: 32px;
}
.spmf-field select:focus { border-color: var(--gold-light); }
.spmf-cascade { display: flex; flex-wrap: wrap; gap: 8px; }
.spmf-cascade select { flex: 1; min-width: 130px; }
.spmf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* ══ 右侧图片拖拽上传 ══ */
.spm-right { display: flex; flex-direction: column; }
.spmr-label {
  font-size: 12px; font-weight: 600; color: var(--text-secondary);
  letter-spacing: 0.02em; margin-bottom: 8px;
}
.spmr-drop {
  flex: 1; min-height: 260px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px;
  border: 2px dashed #E0D8C4; border-radius: 12px;
  background: #FAF8F4;
  cursor: pointer; transition: all 0.2s;
  position: relative; overflow: hidden;
}
.spmr-drop:hover { border-color: #C9A84C; background: #FFFBF5; }
.spmr-drop.drag-over { border-color: #A07830; background: #FFF8ED; border-style: solid; box-shadow: 0 0 0 4px rgba(160,120,48,0.08); }
.spmr-drop.has-image { padding: 0; border-style: solid; border-color: #E0D8C4; }
.spmr-drop.has-image:hover .spmr-overlay { opacity: 1; }
.spmr-preview {
  width: 100%; height: 100%; object-fit: cover;
  position: absolute; inset: 0;
}
.spmr-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; color: #FFF; font-size: 12px; font-weight: 500;
  opacity: 0; transition: opacity 0.2s;
}
.spmr-hint { font-size: 14px; color: #5C5546; font-weight: 500; }
.spmr-sub { font-size: 11px; color: #B0A898; }

.spmf-note { font-size: 12px; color: var(--text-tertiary); text-align: center; background: #FFF8E7; padding: 8px 12px; border-radius: 6px; }
.spmf-error { font-size: 12px; color: var(--error); text-align: center; }
.spmf-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

.btn-cancel {
  padding: 9px 18px; border: 1px solid #E0D8C4; border-radius: 9px;
  background: #FFF; color: #5C5546; font-size: 13.5px; font-weight: 500;
  cursor: pointer; transition: border-color 0.15s, background 0.15s;
  font-family: inherit; -webkit-font-smoothing: antialiased;
}
.btn-cancel:hover { border-color: #C0B8A0; background: #FAF8F4; }
.btn-save {
  padding: 9px 22px; border: none; border-radius: 9px;
  background: #1A1A1A; color: #FAFAFA;
  font-size: 13.5px; font-weight: 530; letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  font-family: inherit; -webkit-font-smoothing: antialiased;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06);
}
.btn-save:hover:not(:disabled) {
  background: #2A2A2A;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.1);
}
.btn-save:active:not(:disabled) { transform: scale(0.975); background: #111; }
.btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-danger { background: #DC2626; }
.btn-danger:hover:not(:disabled) { background: #B91C1C; }
</style>
