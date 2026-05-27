<template>
  <div class="search-page">
    <div class="sp-inner">

      <!-- ══ 顶部搜索栏 ══ -->
      <div class="search-bar">
        <div class="sb-input-wrap" :class="{ focused: focus.search }">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            v-model="searchForm.keyword"
            type="text"
            placeholder="搜索商品名称、品牌..."
            @focus="focus.search = true"
            @blur="focus.search = false"
            @keyup.enter="doSearch"
          />
          <button v-if="searchForm.keyword" class="sb-clear" @click="searchForm.keyword = ''; doSearch()">✕</button>
        </div>
        <button class="sb-search-btn" @click="doSearch">搜索</button>
        <button class="sb-filter-btn" :class="{ active: hasFilter }" @click="showDrawer = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          筛选
          <span v-if="filterCount > 0" class="filter-badge">{{ filterCount }}</span>
        </button>
      </div>

      <!-- ══ 分类标签 ══ -->
      <div class="cat-bar">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['cat-btn', { active: filter.categoryId === cat.id }]"
          @click="selectCat(cat.id)"
        >{{ cat.name }}</button>
      </div>

      <!-- ══ 已选筛选标签 ══ -->
      <div class="active-filters" v-if="hasFilter">
        <span class="af-label">已选：</span>
        <span v-if="filter.categoryId !== 0" class="af-tag" @click="selectCat(0)">
          {{ categories.find(c => c.id === filter.categoryId)?.name }} ✕
        </span>
        <span v-if="filter.minPrice !== '' || filter.maxPrice !== ''" class="af-tag"
          @click="filter.minPrice = ''; filter.maxPrice = ''; doSearch()">
          ¥{{ filter.minPrice || 0 }} - ¥{{ filter.maxPrice || '不限' }} ✕
        </span>
        <button class="af-clear" @click="clearFilters">清空全部</button>
      </div>

      <!-- ══ 结果栏 ══ -->
      <div class="result-bar">
        <span class="result-count">共 <em>{{ page.total }}</em> 件商品</span>
        <div class="sort-tabs">
          <button
            v-for="s in sortOptions"
            :key="s.key"
            :class="['sort-btn', { active: sort.key === s.key }]"
            @click="setSort(s.key)"
          >
            {{ s.label }}
            <svg v-if="s.key !== 'default' && sort.key === s.key" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path v-if="sort.dir === 'asc'" d="M5 15l7-7 7 7"/>
              <path v-else d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
        <div class="view-btns">
          <button :class="['view-btn', { active: viewMode === 'grid' }]" @click="viewMode = 'grid'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button :class="['view-btn', { active: viewMode === 'list' }]" @click="viewMode = 'list'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- ══ 加载中 ══ -->
      <div v-if="loading" class="loading-state">加载中...</div>

      <!-- ══ 商品列表 ══ -->
      <div v-else-if="goodsList.length > 0" :class="['goods-area', viewMode]">
        <div
          v-for="item in goodsList"
          :key="item.id"
          :class="['goods-card', viewMode]"
          @click="$router.push('/product/' + item.id)"
        >
          <div class="gc-img-wrap">
            <img :src="item.image" :alt="item.name" class="gc-img" @error="handleImageError" />
            <button class="gc-fav" @click.stop="toggleFav(item.id)">
              <svg width="13" height="13" viewBox="0 0 24 24" :fill="item.faved ? '#C0392B' : 'none'" stroke="#C0392B" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
          <div class="gc-info">
            <p class="gc-name">{{ item.name }}</p>
            <p class="gc-brand">{{ item.shopName }}</p>
            <div class="gc-price-row">
              <div class="gc-prices">
                <span class="gc-price">¥{{ (item.price / 100).toFixed(2) }}</span>
              </div>
              <button class="gc-cart-btn" @click.stop="addToCart(item)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                加购
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <p class="empty-title">未找到相关商品</p>
        <p class="empty-sub">试试换个关键词或清空筛选条件</p>
        <button class="empty-btn" @click="clearFilters">清空筛选</button>
      </div>

      <!-- ══ 分页 ══ -->
      <div class="pagination" v-if="page.pages > 1">
        <button class="page-btn" :disabled="page.current === 1" @click="goPage(page.current - 1)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <template v-for="p in pageNums" :key="p">
          <span v-if="p === '...'" class="page-ellipsis">···</span>
          <button v-else :class="['page-btn', { active: page.current === p }]" @click="goPage(p)">{{ p }}</button>
        </template>
        <button class="page-btn" :disabled="page.current === page.pages" @click="goPage(page.current + 1)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <span class="page-info">第 {{ page.current }}/{{ page.pages }} 页，共 {{ page.total }} 件</span>
      </div>

    </div>

    <!-- ══ 筛选抽屉遮罩 ══ -->
    <transition name="fade">
      <div v-if="showDrawer" class="drawer-mask" @click="showDrawer = false"></div>
    </transition>

    <!-- ══ 筛选抽屉 ══ -->
    <transition name="slide-right">
      <div v-if="showDrawer" class="filter-drawer">
        <div class="fd-head">
          <span class="fd-title">筛选条件</span>
          <button class="fd-close" @click="showDrawer = false">✕</button>
        </div>

        <div class="fd-body">

          <!-- 分类 -->
          <div class="fd-section">
            <p class="fd-section-title">商品分类</p>
            <div class="fd-cats">
              <button
                v-for="cat in categories"
                :key="cat.id"
                :class="['fd-cat-btn', { active: tempFilter.categoryId === cat.id }]"
                @click="tempFilter.categoryId = cat.id"
              >{{ cat.name }}</button>
            </div>
          </div>

          <!-- 价格区间 -->
          <div class="fd-section">
            <p class="fd-section-title">价格区间</p>
            <div class="fd-price-presets">
              <button
                v-for="p in pricePresets"
                :key="p.label"
                :class="['fd-preset', { active: tempFilter.priceLabel === p.label }]"
                @click="selectPreset(p)"
              >{{ p.label }}</button>
            </div>
            <div class="fd-price-custom">
              <div class="fd-price-input">
                <span>¥</span>
                <input v-model="tempFilter.minPrice" type="number" placeholder="最低价" min="0" @input="tempFilter.priceLabel = ''" />
              </div>
              <span class="fd-price-sep">—</span>
              <div class="fd-price-input">
                <span>¥</span>
                <input v-model="tempFilter.maxPrice" type="number" placeholder="最高价" min="0" @input="tempFilter.priceLabel = ''" />
              </div>
            </div>
          </div>

          <!-- 其他 -->
          <div class="fd-section">
            <p class="fd-section-title">其他</p>
            <div class="fd-checks">
              <label class="fd-check">
                <input v-model="tempFilter.inStock" type="checkbox" class="fd-check-real" />
                <span class="fd-check-box"></span>
                <span>有货</span>
              </label>
            </div>
          </div>

        </div>

        <div class="fd-foot">
          <button class="fd-reset" @click="resetTempFilter">重置</button>
          <button class="fd-apply" @click="applyFilter">应用筛选</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTopCategories, getItemPage } from '@/api/item'
import { addToCart as apiAddToCart } from '@/api/cart'
import nofoundImage from '@/assets/images/nofound.png'

const router = useRouter()

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.src = nofoundImage
}

// ══ 常量 ══
const PAGE_SIZE = 15

const sortOptions = [
  { key: 'default', label: '综合' },
  { key: 'sold',    label: '销量' },
  { key: 'price',   label: '价格' },
  { key: 'new',     label: '新品' },
]

const pricePresets = [
  { label: '¥0-100',    min: 0,    max: 100  },
  { label: '¥100-300',  min: 100,  max: 300  },
  { label: '¥300-500',  min: 300,  max: 500  },
  { label: '¥500-1000', min: 500,  max: 1000 },
  { label: '¥1000以上',  min: 1000, max: ''   },
]

// ══ 状态 ══
const loading    = ref(false)
const showDrawer = ref(false)
const viewMode   = ref('grid')

// 输入框 focus 状态（与登录页保持一致用 reactive 统一管理）
const focus = reactive({ search: false })

// 搜索关键词（独立 reactive，方便扩展）
const searchForm = reactive({ keyword: '' })

// 当前生效的筛选条件
const filter = reactive({
  categoryId: 0,
  minPrice:   '',
  maxPrice:   '',
  inStock:    false,
})

// 排序状态
const sort = reactive({ key: 'default', dir: 'desc' })

// 分页状态
const page = reactive({ current: 1, pages: 0, total: 0 })

// 抽屉临时筛选条件（打开抽屉时从 filter 同步，应用时写回 filter）
const tempFilter = reactive({
  categoryId: 0,
  minPrice:   '',
  maxPrice:   '',
  priceLabel: '',
  inStock:    false,
})

// ══ 后端数据 ══
const categories = ref([{ id: 0, name: '全部' }])
const goodsList  = ref([])

// ══ 计算属性 ══
const hasFilter = computed(() =>
  filter.categoryId !== 0 ||
  filter.minPrice !== '' ||
  filter.maxPrice !== '' ||
  filter.inStock
)

const filterCount = computed(() => {
  let n = 0
  if (filter.categoryId !== 0)                n++
  if (filter.minPrice !== '' || filter.maxPrice !== '') n++
  if (filter.inStock)                         n++
  return n
})

const pageNums = computed(() => {
  const total = page.pages
  const cur   = page.current
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (cur <= 4)        return [1, 2, 3, 4, 5, '...', total]
  if (cur >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total]
  return [1, '...', cur-1, cur, cur+1, '...', total]
})

// ══ API 调用 ══
const fetchCategories = async () => {
  try {
    const res = await getTopCategories()
    categories.value = [{ id: 0, name: '全部' }, ...res.data]
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '分类加载失败')
  }
}

const fetchGoods = async () => {
  loading.value = true
  try {
    const params = {
      pageNo:   page.current,
      pageSize: PAGE_SIZE,
    }
    if (searchForm.keyword.trim())    params.keyword    = searchForm.keyword.trim()
    if (filter.categoryId !== 0)      params.categoryId = filter.categoryId
    if (filter.minPrice !== '')       params.minPrice   = Number(filter.minPrice) * 100
    if (filter.maxPrice !== '')       params.maxPrice   = Number(filter.maxPrice) * 100
    if (filter.inStock)               params.inStock    = true
    if (sort.key !== 'default') {
      params.sortBy = sort.key
      params.isAsc  = sort.dir === 'asc'
    }

    const res = await getItemPage(params)
    goodsList.value = res.data.list   || []
    page.total      = res.data.total  || 0
    page.pages      = res.data.pages  || 0
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '商品加载失败，请重试')
    goodsList.value = []
  } finally {
    loading.value = false
  }
}

// ══ 操作方法 ══
const doSearch = () => {
  page.current = 1
  fetchGoods()
}

const selectCat = (id) => {
  filter.categoryId = id
  page.current = 1
  fetchGoods()
}

const setSort = (key) => {
  if (sort.key === key && key !== 'default') {
    sort.dir = sort.dir === 'asc' ? 'desc' : 'asc'
  } else {
    sort.key = key
    sort.dir = 'desc'
  }
  page.current = 1
  fetchGoods()
}

const goPage = (p) => {
  page.current = p
  fetchGoods()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearFilters = () => {
  filter.categoryId = 0
  filter.minPrice   = ''
  filter.maxPrice   = ''
  filter.inStock    = false
  page.current      = 1
  fetchGoods()
}

const toggleFav = (id) => {
  const item = goodsList.value.find(g => g.id === id)
  if (item) item.faved = !item.faved
}

const addToCart = async (item) => {
  try {
    await apiAddToCart({
      skuId: item.id,
      quantity: 1
    })
    ElMessage.success(`已加入购物车:${item.name}`)
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '加入购物车失败,请重试')
  }
}

// ══ 抽屉相关 ══
const syncTempFilter = () => {
  tempFilter.categoryId = filter.categoryId
  tempFilter.minPrice   = filter.minPrice
  tempFilter.maxPrice   = filter.maxPrice
  tempFilter.priceLabel = ''
  tempFilter.inStock    = filter.inStock
}

watch(showDrawer, (visible) => {
  if (visible) syncTempFilter()
})

const selectPreset = (p) => {
  tempFilter.minPrice   = p.min
  tempFilter.maxPrice   = p.max
  tempFilter.priceLabel = p.label
}

const resetTempFilter = () => {
  tempFilter.categoryId = 0
  tempFilter.minPrice   = ''
  tempFilter.maxPrice   = ''
  tempFilter.priceLabel = ''
  tempFilter.inStock    = false
}

const applyFilter = () => {
  filter.categoryId = tempFilter.categoryId
  filter.minPrice   = tempFilter.minPrice
  filter.maxPrice   = tempFilter.maxPrice
  filter.inStock    = tempFilter.inStock
  page.current      = 1
  showDrawer.value  = false
  fetchGoods()
}

// ══ 初始化 ══
onMounted(() => {
  fetchCategories()
  fetchGoods()
})
</script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .search-page {
    background: #F5F2EC;
    min-height: 100vh;
    font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
    color: #1A1A18;
    padding: 28px 0 80px;
  }
  .sp-inner {
    max-width: 1320px; margin: 0 auto; padding: 0 40px;
    display: flex; flex-direction: column; gap: 16px;
  }
  
  /* ══ 搜索栏 ══ */
  .search-bar { display: flex; gap: 10px; align-items: center; }
  .sb-input-wrap {
    flex: 1; display: flex; align-items: center; gap: 10px;
    background: #FFF; border: 1.5px solid #E0D8C8;
    border-radius: 12px; padding: 0 14px; transition: .2s;
  }
  .sb-input-wrap.focused { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
  .sb-input-wrap svg { color: #8A8070; flex-shrink: 0; }
  .sb-input-wrap input {
    flex: 1; border: none; outline: none; background: none;
    font-family: inherit; font-size: 14px; color: #1A1A18; padding: 12px 0;
  }
  .sb-input-wrap input::placeholder { color: #B0A898; }
  .sb-clear {
    background: none; border: none; color: #B0A898; cursor: pointer;
    font-size: 14px; padding: 4px; transition: .2s;
  }
  .sb-clear:hover { color: #4A4438; }
  .sb-search-btn {
    padding: 12px 24px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #A07830, #C9A84C);
    color: #FFF; font-family: inherit; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: .2s; white-space: nowrap;
    box-shadow: 0 3px 12px rgba(160,120,48,0.25);
  }
  .sb-search-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(160,120,48,0.35); }
  .sb-filter-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 12px 18px; border-radius: 12px;
    background: #FFF; border: 1.5px solid #E0D8C8;
    color: #4A4438; font-family: inherit; font-size: 14px; font-weight: 400;
    cursor: pointer; transition: .2s; white-space: nowrap; position: relative;
  }
  .sb-filter-btn:hover, .sb-filter-btn.active { border-color: #C9A84C; color: #A07830; }
  .filter-badge {
    position: absolute; top: -6px; right: -6px;
    width: 18px; height: 18px; border-radius: 50%;
    background: #C9A84C; color: #FFF; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  
  /* ══ 分类标签 ══ */
  .cat-bar { display: flex; gap: 8px; flex-wrap: wrap; }
  .cat-btn {
    padding: 7px 16px; border-radius: 100px;
    border: 1px solid #E0D8C8; background: #FFF;
    color: #4A4438; font-family: inherit; font-size: 13px; font-weight: 300;
    cursor: pointer; transition: .2s; white-space: nowrap;
  }
  .cat-btn:hover { border-color: #C9A84C; color: #A07830; }
  .cat-btn.active {
    background: linear-gradient(135deg, #A07830, #C9A84C);
    border-color: transparent; color: #FFF; font-weight: 500;
    box-shadow: 0 2px 10px rgba(160,120,48,0.25);
  }
  
  /* ══ 已选标签 ══ */
  .active-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .af-label { font-size: 12px; color: #8A8070; }
  .af-tag {
    font-size: 12px; color: #A07830;
    background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.3);
    padding: 4px 10px; border-radius: 100px; cursor: pointer; transition: .2s;
  }
  .af-tag:hover { background: rgba(201,168,76,0.15); }
  .af-clear {
    font-size: 12px; color: #C0392B; background: rgba(192,57,43,0.06);
    border: 1px solid rgba(192,57,43,0.2); padding: 4px 12px;
    border-radius: 100px; cursor: pointer; transition: .2s; font-family: inherit;
  }
  .af-clear:hover { background: rgba(192,57,43,0.12); border-color: #C0392B; }
  
  /* ══ 结果栏 ══ */
  .result-bar { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .result-count { font-size: 13px; color: #8A8070; margin-right: auto; }
  .result-count em { font-style: normal; color: #A07830; font-weight: 600; }
  .sort-tabs { display: flex; gap: 4px; }
  .sort-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid #E0D8C8; background: #FFF;
    color: #4A4438; font-family: inherit; font-size: 12px; font-weight: 300;
    cursor: pointer; transition: .2s;
  }
  .sort-btn:hover { border-color: #C9A84C; color: #A07830; }
  .sort-btn.active { background: rgba(201,168,76,0.08); border-color: #C9A84C; color: #A07830; font-weight: 500; }
  .view-btns { display: flex; gap: 4px; }
  .view-btn {
    width: 32px; height: 32px; border-radius: 8px;
    border: 1px solid #E0D8C8; background: #FFF;
    color: #8A8070; cursor: pointer; transition: .2s;
    display: flex; align-items: center; justify-content: center;
  }
  .view-btn:hover, .view-btn.active { border-color: #C9A84C; color: #A07830; background: rgba(201,168,76,0.06); }
  
  /* ══ 商品网格 ══ */
  .goods-area.grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 14px; }
  .goods-area.list { display: flex; flex-direction: column; gap: 12px; }
  
  /* 网格卡片 */
  .goods-card.grid {
    background: #FFF; border: 1px solid #E0D8C8;
    border-radius: 14px; overflow: hidden; cursor: pointer;
    transition: .25s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .goods-card.grid:hover { border-color: #C9A84C; transform: translateY(-4px); box-shadow: 0 8px 24px rgba(201,168,76,0.15); }
  
  .gc-img-wrap { position: relative; overflow: hidden; }
  .goods-card.grid .gc-img-wrap { aspect-ratio: 1; }
  .goods-card.list .gc-img-wrap { width: 120px; height: 120px; flex-shrink: 0; border-radius: 10px; }
  .gc-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s; }
  .goods-card:hover .gc-img { transform: scale(1.05); }
  .gc-tag {
    position: absolute; top: 7px; left: 7px;
    font-size: 9px; font-weight: 600; color: #FFF;
    padding: 2px 7px; border-radius: 4px;
  }
  .gc-fav {
    position: absolute; top: 7px; right: 7px;
    width: 26px; height: 26px; border-radius: 50%;
    background: rgba(255,255,255,0.9); border: 1px solid #E0D8C8;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: .2s; opacity: 0;
  }
  .goods-card:hover .gc-fav { opacity: 1; }
  .gc-fav:hover { border-color: #C0392B; }
  
  .goods-card.grid .gc-info { padding: 12px; }
  .gc-name {
    font-size: 13px; color: #1A1A18; font-weight: 400; line-height: 1.45;
    margin-bottom: 4px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .gc-brand { font-size: 11px; color: #8A8070; margin-bottom: 6px; }
  .gc-rating { display: flex; align-items: center; gap: 5px; margin-bottom: 8px; }
  .stars { color: #C9A84C; font-size: 11px; letter-spacing: 1px; }
  .rating-num { font-size: 11px; color: #4A4438; font-family: 'Space Mono', monospace; }
  .sales-num { font-size: 10px; color: #B0A898; margin-left: 2px; }
  .gc-price-row { display: flex; align-items: center; justify-content: space-between; }
  .gc-prices { display: flex; align-items: baseline; gap: 5px; }
  .gc-price { font-size: 16px; font-weight: 600; color: #A07830; font-family: 'Space Mono', monospace; }
  .gc-orig  { font-size: 11px; color: #B0A898; text-decoration: line-through; font-family: 'Space Mono', monospace; }
  .gc-cart-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 5px 11px; border-radius: 100px; border: none;
    background: linear-gradient(135deg, #A07830, #C9A84C);
    color: #FFF; font-family: inherit; font-size: 11px; font-weight: 500;
    cursor: pointer; transition: .2s;
  }
  .gc-cart-btn:hover { transform: scale(1.05); box-shadow: 0 2px 10px rgba(160,120,48,0.35); }
  
  /* 列表卡片 */
  .goods-card.list {
    background: #FFF; border: 1px solid #E0D8C8; border-radius: 14px;
    overflow: hidden; cursor: pointer; transition: .25s;
    display: flex; gap: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .goods-card.list:hover { border-color: #C9A84C; box-shadow: 0 4px 18px rgba(201,168,76,0.12); }
  .goods-card.list .gc-img-wrap { margin: 14px 0 14px 14px; }
  .goods-card.list .gc-info {
    flex: 1; padding: 14px 18px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .goods-card.list .gc-name { -webkit-line-clamp: 1; font-size: 14px; }
  .goods-card.list .gc-price { font-size: 18px; }
  
  /* ══ 空状态 ══ */
  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    padding: 80px 0; gap: 14px;
  }
  .empty-title { font-size: 18px; font-weight: 500; color: #1A1A18; }
  .empty-sub   { font-size: 13px; color: #8A8070; }
  .empty-btn {
    padding: 10px 28px; border-radius: 100px; border: none;
    background: linear-gradient(135deg, #A07830, #C9A84C);
    color: #FFF; font-family: inherit; font-size: 13px; cursor: pointer;
    margin-top: 8px; box-shadow: 0 3px 12px rgba(160,120,48,0.25);
  }
  
  /* ══ 分页 ══ */
  .pagination { display: flex; align-items: center; justify-content: center; gap: 6px; padding-top: 8px; }
  .page-btn {
    min-width: 34px; height: 34px; padding: 0 8px;
    border-radius: 9px; border: 1px solid #E0D8C8;
    background: #FFF; color: #4A4438; font-family: 'Space Mono', monospace; font-size: 13px;
    cursor: pointer; transition: .2s; display: flex; align-items: center; justify-content: center;
  }
  .page-btn:hover:not(:disabled) { border-color: #C9A84C; color: #A07830; }
  .page-btn.active { background: linear-gradient(135deg,#A07830,#C9A84C); border-color: transparent; color: #FFF; font-weight: 700; }
  .page-btn:disabled { opacity: .35; cursor: not-allowed; }
  .page-ellipsis { color: #8A8070; padding: 0 4px; font-size: 14px; }
  .page-info { font-size: 12px; color: #8A8070; margin-left: 10px; white-space: nowrap; }
  
  /* ══ 筛选抽屉 ══ */
  .drawer-mask {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 999;
  }
  .filter-drawer {
    position: fixed; top: 0; right: 0; bottom: 0; width: 360px;
    background: #FAFAF8; z-index: 1000;
    display: flex; flex-direction: column;
    box-shadow: -8px 0 32px rgba(0,0,0,0.12);
  }
  .fd-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid #E0D8C8;
    background: #FFF;
  }
  .fd-title { font-size: 16px; font-weight: 500; color: #1A1A18; }
  .fd-close { background: none; border: none; color: #8A8070; font-size: 18px; cursor: pointer; transition: .2s; padding: 4px; }
  .fd-close:hover { color: #1A1A18; }
  
  .fd-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 24px; }
  .fd-body::-webkit-scrollbar { width: 4px; }
  .fd-body::-webkit-scrollbar-thumb { background: #E0D8C8; border-radius: 2px; }
  
  .fd-section { display: flex; flex-direction: column; gap: 12px; }
  .fd-section-title {
    font-size: 13px; font-weight: 500; color: #4A4438;
    padding-bottom: 8px; border-bottom: 1px solid #F0EAE0;
  }
  
  .fd-cats { display: flex; flex-wrap: wrap; gap: 8px; }
  .fd-cat-btn {
    padding: 6px 14px; border-radius: 100px;
    border: 1px solid #E0D8C8; background: #FFF;
    color: #4A4438; font-family: inherit; font-size: 12px; font-weight: 300;
    cursor: pointer; transition: .2s;
  }
  .fd-cat-btn:hover { border-color: #C9A84C; color: #A07830; }
  .fd-cat-btn.active { background: rgba(201,168,76,0.1); border-color: #C9A84C; color: #A07830; font-weight: 500; }
  
  .fd-price-presets { display: flex; flex-wrap: wrap; gap: 8px; }
  .fd-preset {
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid #E0D8C8; background: #FFF;
    color: #4A4438; font-family: inherit; font-size: 12px; font-weight: 300;
    cursor: pointer; transition: .2s;
  }
  .fd-preset:hover { border-color: #C9A84C; color: #A07830; }
  .fd-preset.active { background: rgba(201,168,76,0.1); border-color: #C9A84C; color: #A07830; font-weight: 500; }
  
  .fd-price-custom { display: flex; align-items: center; gap: 10px; }
  .fd-price-sep { color: #8A8070; font-size: 14px; }
  .fd-price-input {
    flex: 1; display: flex; align-items: center; gap: 6px;
    background: #FFF; border: 1px solid #E0D8C8; border-radius: 8px; padding: 8px 12px;
  }
  .fd-price-input span { font-size: 13px; color: #8A8070; }
  .fd-price-input input {
    flex: 1; border: none; outline: none; background: none;
    font-family: 'Space Mono', monospace; font-size: 13px; color: #1A1A18;
    width: 0;
  }
  
  .fd-brands { display: flex; flex-wrap: wrap; gap: 8px; }
  .fd-brand-btn {
    padding: 6px 14px; border-radius: 8px;
    border: 1px solid #E0D8C8; background: #FFF;
    color: #4A4438; font-family: inherit; font-size: 12px; font-weight: 300;
    cursor: pointer; transition: .2s;
  }
  .fd-brand-btn:hover { border-color: #C9A84C; color: #A07830; }
  .fd-brand-btn.active { background: rgba(201,168,76,0.1); border-color: #C9A84C; color: #A07830; font-weight: 500; }
  
  .fd-ratings { display: flex; flex-direction: column; gap: 8px; }
  .fd-rating-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    border: 1px solid #E0D8C8; background: #FFF;
    color: #4A4438; font-family: inherit; font-size: 13px; font-weight: 300;
    cursor: pointer; transition: .2s; text-align: left;
  }
  .fd-rating-btn:hover { border-color: #C9A84C; color: #A07830; }
  .fd-rating-btn.active { background: rgba(201,168,76,0.08); border-color: #C9A84C; color: #A07830; font-weight: 500; }
  .r-stars { color: #C9A84C; font-size: 14px; letter-spacing: 1px; }
  
  .fd-checks { display: flex; flex-direction: column; gap: 10px; }
  .fd-check {
    display: flex; align-items: center; gap: 10px;
    cursor: pointer; font-size: 13px; color: #4A4438; font-weight: 300;
  }
  .fd-check-real { display: none; }
  .fd-check-box {
    width: 17px; height: 17px; border-radius: 5px; flex-shrink: 0;
    border: 1.5px solid #C9A84C; background: transparent; transition: .2s; position: relative;
  }
  .fd-check-real:checked + .fd-check-box { background: #C9A84C; }
  .fd-check-real:checked + .fd-check-box::after {
    content: '✓'; position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: #FFF; font-weight: 700;
  }
  
  .fd-foot {
    display: flex; gap: 10px; padding: 16px 24px;
    border-top: 1px solid #E0D8C8; background: #FFF;
  }
  .fd-reset {
    flex: 1; padding: 12px; border-radius: 10px;
    background: #FFF; border: 1.5px solid #E0D8C8;
    color: #4A4438; font-family: inherit; font-size: 14px; font-weight: 400;
    cursor: pointer; transition: .2s;
  }
  .fd-reset:hover { border-color: #C9A84C; color: #A07830; }
  .fd-apply {
    flex: 2; padding: 12px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #A07830, #C9A84C);
    color: #FFF; font-family: inherit; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: .2s;
    box-shadow: 0 3px 12px rgba(160,120,48,0.3);
  }
  .fd-apply:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(160,120,48,0.4); }
  
  /* ══ 动画 ══ */
  .fade-enter-active, .fade-leave-active { transition: opacity .25s; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
  .slide-right-enter-active, .slide-right-leave-active { transition: transform .3s cubic-bezier(.4,0,.2,1); }
  .slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }
  
  /* ══ 响应式 ══ */
  @media (max-width:1200px) { .goods-area.grid { grid-template-columns: repeat(4,1fr); } }
  @media (max-width:960px)  {
    .sp-inner { padding: 0 24px; }
    .goods-area.grid { grid-template-columns: repeat(3,1fr); }
    .filter-drawer { width: 320px; }
  }
  @media (max-width:640px)  {
    .sp-inner { padding: 0 16px; }
    .goods-area.grid { grid-template-columns: repeat(2,1fr); }
    .sort-tabs { display: none; }
    .filter-drawer { width: 100%; }
  }
  </style>