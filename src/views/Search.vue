<template>
    <div class="search-page">
      <div class="sp-inner">
  
        <!-- ══ 顶部搜索栏 ══ -->
        <div class="search-bar">
          <div class="sb-input-wrap" :class="{ focused: searchFocused }">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索商品名称、品牌..."
              @focus="searchFocused=true"
              @blur="searchFocused=false"
              @keyup.enter="doSearch"
            />
            <button v-if="keyword" class="sb-clear" @click="keyword=''; doSearch()">✕</button>
          </div>
          <button class="sb-search-btn" @click="doSearch">搜索</button>
          <button class="sb-filter-btn" :class="{ active: hasFilter }" @click="showDrawer=true">
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
            :class="['cat-btn', { active: selectedCat === cat.id }]"
            @click="selectCat(cat.id)"
          >{{ cat.name }}</button>
        </div>
  
        <!-- ══ 已选筛选标签 ══ -->
        <div class="active-filters" v-if="hasFilter">
          <span class="af-label">已选：</span>
          <span v-if="selectedCat !== 0" class="af-tag" @click="selectCat(0)">
            {{ categories.find(c=>c.id===selectedCat)?.name }} ✕
          </span>
          <span v-if="priceMin || priceMax" class="af-tag" @click="priceMin=''; priceMax=''; doSearch()">
            ¥{{ priceMin||0 }} - ¥{{ priceMax||'不限' }} ✕
          </span>
          <span v-if="selectedBrands.length" v-for="b in selectedBrands" :key="b" class="af-tag" @click="removeBrand(b)">
            {{ b }} ✕
          </span>
          <span v-if="selectedRating" class="af-tag" @click="selectedRating=0; doSearch()">
            {{ selectedRating }}星以上 ✕
          </span>
          <button class="af-clear" @click="clearFilters">清空全部</button>
        </div>
  
        <!-- ══ 结果栏 ══ -->
        <div class="result-bar">
          <span class="result-count">共 <em>{{ totalCount }}</em> 件商品</span>
          <div class="sort-tabs">
            <button
              v-for="s in sortOptions"
              :key="s.key"
              :class="['sort-btn', { active: sortKey===s.key }]"
              @click="setSort(s.key)"
            >
              {{ s.label }}
              <svg v-if="s.key!=='default' && sortKey===s.key" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path v-if="sortDir==='asc'" d="M5 15l7-7 7 7"/>
                <path v-else d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
          <div class="view-btns">
            <button :class="['view-btn', { active: viewMode==='grid' }]" @click="viewMode='grid'">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button :class="['view-btn', { active: viewMode==='list' }]" @click="viewMode='list'">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
  
        <!-- ══ 商品列表 ══ -->
        <div v-if="pagedGoods.length > 0" :class="['goods-area', viewMode]">
          <div
            v-for="item in pagedGoods"
            :key="item.id"
            :class="['goods-card', viewMode]"
            @click="$router.push('/product')"
          >
            <div class="gc-img-wrap">
              <img :src="item.image" :alt="item.name" class="gc-img" />
              <span v-if="item.tag" class="gc-tag" :style="{ background: item.tagColor }">{{ item.tag }}</span>
              <button class="gc-fav" @click.stop="toggleFav(item.id)">
                <svg width="13" height="13" viewBox="0 0 24 24" :fill="item.faved?'#C0392B':'none'" stroke="#C0392B" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>
            <div class="gc-info">
              <p class="gc-name">{{ item.name }}</p>
              <p class="gc-brand">{{ item.brand }}</p>
              <div class="gc-rating">
                <span class="stars">{{ '★'.repeat(Math.floor(item.rating)) }}{{ item.rating % 1 >= 0.5 ? '☆' : '' }}</span>
                <span class="rating-num">{{ item.rating }}</span>
                <span class="sales-num">{{ item.sales }}人购买</span>
              </div>
              <div class="gc-price-row">
                <div class="gc-prices">
                  <span class="gc-price">¥{{ item.price }}</span>
                  <span class="gc-orig" v-if="item.originalPrice">¥{{ item.originalPrice }}</span>
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
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage===1" @click="goPage(currentPage-1)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <template v-for="p in pageNums" :key="p">
            <span v-if="p==='...'" class="page-ellipsis">···</span>
            <button v-else :class="['page-btn', { active: currentPage===p }]" @click="goPage(p)">{{ p }}</button>
          </template>
          <button class="page-btn" :disabled="currentPage===totalPages" @click="goPage(currentPage+1)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <span class="page-info">第 {{ currentPage }}/{{ totalPages }} 页，共 {{ totalCount }} 件</span>
        </div>
  
      </div>
  
      <!-- ══ 筛选抽屉遮罩 ══ -->
      <transition name="fade">
        <div v-if="showDrawer" class="drawer-mask" @click="showDrawer=false"></div>
      </transition>
  
      <!-- ══ 筛选抽屉 ══ -->
      <transition name="slide-right">
        <div v-if="showDrawer" class="filter-drawer">
          <div class="fd-head">
            <span class="fd-title">筛选条件</span>
            <button class="fd-close" @click="showDrawer=false">✕</button>
          </div>
  
          <div class="fd-body">
  
            <!-- 分类 -->
            <div class="fd-section">
              <p class="fd-section-title">商品分类</p>
              <div class="fd-cats">
                <button
                  v-for="cat in categories"
                  :key="cat.id"
                  :class="['fd-cat-btn', { active: tempCat===cat.id }]"
                  @click="tempCat=cat.id"
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
                  :class="['fd-preset', { active: tempPriceLabel===p.label }]"
                  @click="selectPreset(p)"
                >{{ p.label }}</button>
              </div>
              <div class="fd-price-custom">
                <div class="fd-price-input">
                  <span>¥</span>
                  <input v-model="tempPriceMin" type="number" placeholder="最低价" min="0" @input="tempPriceLabel=''" />
                </div>
                <span class="fd-price-sep">—</span>
                <div class="fd-price-input">
                  <span>¥</span>
                  <input v-model="tempPriceMax" type="number" placeholder="最高价" min="0" @input="tempPriceLabel=''" />
                </div>
              </div>
            </div>
  
            <!-- 品牌 -->
            <div class="fd-section">
              <p class="fd-section-title">品牌</p>
              <div class="fd-brands">
                <button
                  v-for="b in brands"
                  :key="b"
                  :class="['fd-brand-btn', { active: tempBrands.includes(b) }]"
                  @click="toggleBrand(b)"
                >{{ b }}</button>
              </div>
            </div>
  
            <!-- 评分 -->
            <div class="fd-section">
              <p class="fd-section-title">评分</p>
              <div class="fd-ratings">
                <button
                  v-for="r in [4,3,2]"
                  :key="r"
                  :class="['fd-rating-btn', { active: tempRating===r }]"
                  @click="tempRating = tempRating===r ? 0 : r"
                >
                  <span class="r-stars">{{ '★'.repeat(r) }}</span>
                  {{ r }}星以上
                </button>
              </div>
            </div>
  
            <!-- 其他 -->
            <div class="fd-section">
              <p class="fd-section-title">其他</p>
              <div class="fd-checks">
                <label class="fd-check">
                  <input v-model="tempFreeShip" type="checkbox" class="fd-check-real" />
                  <span class="fd-check-box"></span>
                  <span>免运费</span>
                </label>
                <label class="fd-check">
                  <input v-model="tempDiscount" type="checkbox" class="fd-check-real" />
                  <span class="fd-check-box"></span>
                  <span>有折扣</span>
                </label>
                <label class="fd-check">
                  <input v-model="tempInStock" type="checkbox" class="fd-check-real" />
                  <span class="fd-check-box"></span>
                  <span>有货</span>
                </label>
              </div>
            </div>
  
          </div>
  
          <div class="fd-foot">
            <button class="fd-reset" @click="resetTemp">重置</button>
            <button class="fd-apply" @click="applyFilter">应用筛选</button>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  
  const PAGE_SIZE = 15
  
  const keyword      = ref('')
  const searchFocused = ref(false)
  const selectedCat  = ref(0)
  const sortKey      = ref('default')
  const sortDir      = ref('desc')
  const viewMode     = ref('grid')
  const currentPage  = ref(1)
  const showDrawer   = ref(false)
  
  const priceMin      = ref('')
  const priceMax      = ref('')
  const selectedBrands = ref([])
  const selectedRating = ref(0)
  const freeShip      = ref(false)
  const discount      = ref(false)
  const inStock       = ref(false)
  
  // 抽屉临时状态
  const tempCat        = ref(0)
  const tempPriceMin   = ref('')
  const tempPriceMax   = ref('')
  const tempPriceLabel = ref('')
  const tempBrands     = ref([])
  const tempRating     = ref(0)
  const tempFreeShip   = ref(false)
  const tempDiscount   = ref(false)
  const tempInStock    = ref(false)
  
  const categories = [
    { id:0, name:'全部' },
    { id:1, name:'数码电子' },
    { id:2, name:'服装穿搭' },
    { id:3, name:'美妆护肤' },
    { id:4, name:'家居生活' },
    { id:5, name:'运动户外' },
    { id:6, name:'食品生鲜' },
    { id:7, name:'图书音像' },
    { id:8, name:'母婴用品' },
  ]
  
  const brands = ['云梦精选','全球直邮','国际大牌','国货之光','新锐品牌','小众好物']
  
  const pricePresets = [
    { label:'¥0-100',   min:0,   max:100  },
    { label:'¥100-300', min:100, max:300  },
    { label:'¥300-500', min:300, max:500  },
    { label:'¥500-1000',min:500, max:1000 },
    { label:'¥1000以上', min:1000,max:''  },
  ]
  
  const sortOptions = [
    { key:'default', label:'综合' },
    { key:'sales',   label:'销量' },
    { key:'price',   label:'价格' },
    { key:'rating',  label:'评分' },
    { key:'new',     label:'新品' },
  ]
  
  // 生成模拟商品数据
  const allGoods = ref(Array.from({ length: 120 }, (_, i) => {
    const cats = [1,2,3,4,5,6,7,8]
    const tagList = [{ name:'秒杀', color:'#E74C3C' },{ name:'新品', color:'#8E44AD' },{ name:'爆款', color:'#E67E22' },null,null,null]
    const brandList = ['云梦精选','全球直邮','国际大牌','国货之光','新锐品牌','小众好物']
    const nameList = [
      '极简无线降噪耳机 Pro','轻量碳纤维背包 20L','AI智能蓝牙耳机旗舰版','香氛扩香石套装礼盒',
      '复古黑胶唱片机音响','智能温控随行保温杯','北欧风实木床头柜','手工研磨挂耳咖啡礼盒',
      '纯棉透气重磅T恤','多功能空气炸锅无油','真皮手工笔记本A5','无线充电桌面台灯',
      '轻便碳纤维折叠雨伞','丝滑真丝睡衣套装','手冲咖啡套装礼盒',
    ]
    const t = tagList[Math.floor(Math.random() * tagList.length)]
    const price = Math.floor(Math.random() * 900) + 29
    const originalPrice = Math.random() > 0.5 ? price + Math.floor(Math.random() * 200) + 50 : null
    return {
      id: i + 1,
      name: nameList[i % nameList.length] + (i > 14 ? ` ${String.fromCharCode(65 + (i % 26))}款` : ''),
      brand: brandList[i % brandList.length],
      cat: cats[i % cats.length],
      price,
      originalPrice,
      rating: +(3.5 + Math.random() * 1.5).toFixed(1),
      sales: `${Math.floor(Math.random() * 50 + 1)}k+`,
      image: `https://picsum.photos/300/300?random=${i + 10}`,
      tag: t?.name || '',
      tagColor: t?.color || '',
      freeShip: Math.random() > 0.4,
      hasDiscount: !!originalPrice,
      faved: false,
    }
  }))
  
  const filteredGoods = computed(() => {
    let list = allGoods.value
  
    if (keyword.value.trim()) {
      const kw = keyword.value.trim().toLowerCase()
      list = list.filter(g => g.name.toLowerCase().includes(kw) || g.brand.toLowerCase().includes(kw))
    }
    if (selectedCat.value !== 0) {
      list = list.filter(g => g.cat === selectedCat.value)
    }
    if (priceMin.value !== '') {
      list = list.filter(g => g.price >= Number(priceMin.value))
    }
    if (priceMax.value !== '') {
      list = list.filter(g => g.price <= Number(priceMax.value))
    }
    if (selectedBrands.value.length > 0) {
      list = list.filter(g => selectedBrands.value.includes(g.brand))
    }
    if (selectedRating.value > 0) {
      list = list.filter(g => g.rating >= selectedRating.value)
    }
    if (freeShip.value) list = list.filter(g => g.freeShip)
    if (discount.value) list = list.filter(g => g.hasDiscount)
  
    if (sortKey.value === 'price') {
      list = [...list].sort((a, b) => sortDir.value === 'asc' ? a.price - b.price : b.price - a.price)
    } else if (sortKey.value === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating)
    } else if (sortKey.value === 'new') {
      list = [...list].sort((a, b) => b.id - a.id)
    }
  
    return list
  })
  
  const totalCount = computed(() => filteredGoods.value.length)
  const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))
  const pagedGoods = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredGoods.value.slice(start, start + PAGE_SIZE)
  })
  
  const pageNums = computed(() => {
    const total = totalPages.value
    const cur = currentPage.value
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages = []
    if (cur <= 4) {
      pages.push(1,2,3,4,5,'...',total)
    } else if (cur >= total - 3) {
      pages.push(1,'...',total-4,total-3,total-2,total-1,total)
    } else {
      pages.push(1,'...',cur-1,cur,cur+1,'...',total)
    }
    return pages
  })
  
  const hasFilter = computed(() =>
    selectedCat.value !== 0 || priceMin.value !== '' || priceMax.value !== '' ||
    selectedBrands.value.length > 0 || selectedRating.value > 0 || freeShip.value || discount.value
  )
  const filterCount = computed(() => {
    let n = 0
    if (selectedCat.value !== 0) n++
    if (priceMin.value || priceMax.value) n++
    if (selectedBrands.value.length) n++
    if (selectedRating.value) n++
    if (freeShip.value) n++
    if (discount.value) n++
    return n
  })
  
  watch(filteredGoods, () => { currentPage.value = 1 })
  
  const doSearch = () => { currentPage.value = 1 }
  const selectCat = (id) => { selectedCat.value = id; currentPage.value = 1 }
  const setSort = (key) => {
    if (sortKey.value === key && key !== 'default') {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDir.value = 'desc'
    }
  }
  const goPage = (p) => { currentPage.value = p; window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const removeBrand = (b) => { selectedBrands.value = selectedBrands.value.filter(x => x !== b); currentPage.value = 1 }
  const toggleFav = (id) => { const g = allGoods.value.find(g => g.id === id); if (g) g.faved = !g.faved }
  const addToCart = (item) => { alert(`已加入购物车：${item.name}`) }
  
  const clearFilters = () => {
    selectedCat.value = 0; priceMin.value = ''; priceMax.value = ''
    selectedBrands.value = []; selectedRating.value = 0
    freeShip.value = false; discount.value = false; inStock.value = false
    currentPage.value = 1
  }
  
  const openDrawer = () => {
    tempCat.value = selectedCat.value
    tempPriceMin.value = priceMin.value
    tempPriceMax.value = priceMax.value
    tempPriceLabel.value = ''
    tempBrands.value = [...selectedBrands.value]
    tempRating.value = selectedRating.value
    tempFreeShip.value = freeShip.value
    tempDiscount.value = discount.value
    tempInStock.value = inStock.value
    showDrawer.value = true
  }
  
  watch(showDrawer, (v) => { if (v) openDrawer() })
  
  const selectPreset = (p) => {
    tempPriceMin.value = p.min
    tempPriceMax.value = p.max
    tempPriceLabel.value = p.label
  }
  const toggleBrand = (b) => {
    const idx = tempBrands.value.indexOf(b)
    if (idx >= 0) tempBrands.value.splice(idx, 1)
    else tempBrands.value.push(b)
  }
  const resetTemp = () => {
    tempCat.value = 0; tempPriceMin.value = ''; tempPriceMax.value = ''
    tempPriceLabel.value = ''; tempBrands.value = []; tempRating.value = 0
    tempFreeShip.value = false; tempDiscount.value = false; tempInStock.value = false
  }
  const applyFilter = () => {
    selectedCat.value = tempCat.value
    priceMin.value = tempPriceMin.value
    priceMax.value = tempPriceMax.value
    selectedBrands.value = [...tempBrands.value]
    selectedRating.value = tempRating.value
    freeShip.value = tempFreeShip.value
    discount.value = tempDiscount.value
    inStock.value = tempInStock.value
    currentPage.value = 1
    showDrawer.value = false
  }
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