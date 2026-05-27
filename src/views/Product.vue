<template>
    <div class="pd-page">
      <div class="pd-inner">
  
        <!-- ══ 面包屑 ══ -->
        <div class="breadcrumb">
          <span @click="$router.push('/home')" class="bc-link">首页</span>
          <span class="bc-sep">›</span>
          <span @click="$router.push('/search')" class="bc-link">数码电子</span>
          <span class="bc-sep">›</span>
          <span class="bc-cur">{{  itemDetail?.name }}</span>
        </div>
  
        <!-- ══ 主体：左内容 + 右购买栏 ══ -->
        <div class="pd-body">
  
          <!-- ── 左侧 ── -->
          <div class="pd-left">
  
            <!-- 商品图片区 -->
            <div class="gallery-section">
              <div class="gallery-main">
                <img :src="mainImg" alt="商品图" class="gallery-img" @error="handleImageError" />
              
              </div>
              <div class="gallery-thumbs">
                <div v-for="(img, i) in thumbs" :key="i"
                  :class="['thumb', { active: mainImg === img }]"
                  @click="mainImg = img">
                  <img :src="img" :alt="`图${i+1}`" @error="handleImageError" />
                </div>
              </div>
            </div>
  
            <!-- 商品详情 -->
            <div class="section-card">
              <div class="sc-head"><span class="sc-title">商品详情</span></div>
              <div class="detail-content">
                <div class="detail-imgs">
                  <img src="https://picsum.photos/800/400?random=50" alt="详情图1" class="detail-img" />
                  <img src="https://picsum.photos/800/400?random=51" alt="详情图2" class="detail-img" />
                </div>
                <table class="spec-table">
                  <tbody>
                    <tr v-for="s in specDetails" :key="s.key">
                      <td class="spec-key">{{ s.key }}</td>
                      <td class="spec-val">{{ s.val }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
  
            <!-- ══ 用户评价 ══ -->
            <div class="section-card" id="reviews">
              <div class="sc-head">
                <span class="sc-title">用户评价</span>
                <span class="sc-count">{{ reviews.length }} 条</span>
              </div>
              <div class="review-overview">
                <div class="ro-score">
                  <span class="ros-num">4.8</span>
                  <div class="ros-stars">
                    <span v-for="i in 5" :key="i" class="star">★</span>
                  </div>
                  <span class="ros-total">共 {{ reviews.length }} 条评价</span>
                </div>
                <div class="ro-bars">
                  <div v-for="r in ratingDist" :key="r.star" class="rb-row">
                    <span class="rb-label">{{ r.star }}星</span>
                    <div class="rb-track"><div class="rb-fill" :style="{ width: r.pct + '%' }"></div></div>
                    <span class="rb-pct">{{ r.pct }}%</span>
                  </div>
                </div>
                <div class="ro-tags">
                  <span v-for="t in reviewTags" :key="t.label"
                    :class="['ro-tag', { active: activeReviewTag===t.label }]"
                    @click="activeReviewTag = activeReviewTag===t.label ? '' : t.label"
                  >{{ t.label }} ({{ t.count }})</span>
                </div>
              </div>
              <div class="review-filter">
                <button v-for="f in reviewFilters" :key="f.key"
                  :class="['rf-btn', { active: reviewFilter===f.key }]"
                  @click="reviewFilter=f.key">{{ f.label }}</button>
                <label class="rf-img-check">
                  <input v-model="onlyWithImg" type="checkbox" class="rfi-real" />
                  <span class="rfi-box"></span>只看有图
                </label>
              </div>
              <div class="review-list">
                <div v-for="rv in filteredReviews" :key="rv.id" class="review-item">
                  <div class="ri-head">
                    <div class="ri-avatar">{{ rv.name[0] }}</div>
                    <div class="ri-meta">
                      <span class="ri-name">{{ rv.name }}</span>
                      <span class="ri-sku">{{ rv.sku }}</span>
                    </div>
                    <div class="ri-right">
                      <div class="ri-stars">
                        <span v-for="i in 5" :key="i" :class="['ri-star', { on: i<=rv.rating }]">★</span>
                      </div>
                      <span class="ri-date">{{ rv.date }}</span>
                    </div>
                  </div>
                  <p class="ri-text">{{ rv.text }}</p>
                  <div class="ri-imgs" v-if="rv.imgs && rv.imgs.length">
                    <img v-for="(img,i) in rv.imgs" :key="i" :src="img" class="ri-img" @error="handleImageError" />
                  </div>
                  <div class="ri-tags" v-if="rv.tags && rv.tags.length">
                    <span v-for="t in rv.tags" :key="t" class="ri-tag">{{ t }}</span>
                  </div>
                  <div class="ri-foot">
                    <button class="ri-like" @click="rv.liked=!rv.liked; rv.likes+=(rv.liked?1:-1)">
                      <svg width="12" height="12" viewBox="0 0 24 24" :fill="rv.liked?'#A07830':'none'" stroke="#A07830" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                      有用 ({{ rv.likes }})
                    </button>
                  </div>
                  <div class="ri-shop-reply" v-if="rv.shopReply">
                    <span class="sr-label">商家回复：</span><span class="sr-text">{{ rv.shopReply }}</span>
                  </div>
                </div>
              </div>
              <div class="write-review">
                <div class="wr-head">写下你的评价</div>
                <div class="wr-stars">
                  <span class="wr-label">评分：</span>
                  <span v-for="i in 5" :key="i"
                    :class="['wr-star', { on: i<=myRating, hover: i<=hoverRating }]"
                    @mouseenter="hoverRating=i" @mouseleave="hoverRating=0" @click="myRating=i">★</span>
                  <span class="wr-rating-label">{{ ratingLabels[myRating] }}</span>
                </div>
                <textarea v-model="myReview" class="wr-textarea" placeholder="分享你的使用感受，帮助更多人做出选择..." maxlength="500"></textarea>
                <div class="wr-foot">
                  <span class="wr-count">{{ myReview.length }}/500</span>
                  <button class="wr-submit" :disabled="!myReview.trim() || !myRating" @click="submitReview">发布评价</button>
                </div>
              </div>
            </div>
  
            <!-- ══ 商品问答 ══ -->
            <div class="section-card" id="qa">
              <div class="sc-head">
                <span class="sc-title">商品问答</span>
                <span class="sc-count">{{ qaList.length }} 个问题</span>
              </div>
              <div class="ask-box">
                <div class="ab-head">有疑问？来提问</div>
                <textarea v-model="myQuestion" class="ab-textarea" placeholder="描述你的问题，买家和商家都可以回答..." maxlength="200"></textarea>
                <div class="ab-foot">
                  <label class="ab-anon">
                    <input v-model="isAnon" type="checkbox" class="ab-anon-real" />
                    <span class="ab-anon-box"></span>匿名提问
                  </label>
                  <span class="ab-count">{{ myQuestion.length }}/200</span>
                  <button class="ab-submit" :disabled="!myQuestion.trim()" @click="submitQuestion">提交问题</button>
                </div>
              </div>
              <div class="qa-list">
                <div v-for="qa in qaList" :key="qa.id" class="qa-item">
                  <div class="qa-question">
                    <div class="qa-q-icon">Q</div>
                    <div class="qa-q-body">
                      <p class="qa-q-text">{{ qa.question }}</p>
                      <div class="qa-q-meta">
                        <span class="qa-q-user">{{ qa.isAnon ? '匿名用户' : qa.user }}</span>
                        <span class="qa-q-date">{{ qa.date }}</span>
                        <span class="qa-q-views">{{ qa.views }} 人看过</span>
                      </div>
                    </div>
                  </div>
                  <div class="qa-answers">
                    <div v-for="ans in qa.answers" :key="ans.id" class="qa-answer">
                      <div class="qa-a-icon" :class="{ shop: ans.isShop }">{{ ans.isShop ? '商' : 'A' }}</div>
                      <div class="qa-a-body">
                        <div class="qa-a-head">
                          <span class="qa-a-user" :class="{ shop: ans.isShop }">{{ ans.isShop ? '官方客服' : ans.user }}</span>
                          <span class="qa-a-date">{{ ans.date }}</span>
                          <button class="qa-a-like" @click="ans.liked=!ans.liked; ans.likes+=(ans.liked?1:-1)">
                            <svg width="11" height="11" viewBox="0 0 24 24" :fill="ans.liked?'#A07830':'none'" stroke="#A07830" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                            {{ ans.likes }}
                          </button>
                        </div>
                        <p class="qa-a-text">{{ ans.text }}</p>
                      </div>
                    </div>
                    <div class="qa-reply-area" v-if="qa.showReply">
                      <textarea v-model="qa.replyText" class="qa-reply-input" placeholder="写下你的回答..." maxlength="300"></textarea>
                      <div class="qa-reply-foot">
                        <button class="qa-reply-cancel" @click="qa.showReply=false">取消</button>
                        <button class="qa-reply-submit" :disabled="!qa.replyText?.trim()" @click="submitAnswer(qa)">发布回答</button>
                      </div>
                    </div>
                    <button class="qa-answer-btn" @click="qa.showReply=!qa.showReply" v-if="!qa.showReply">我来回答</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- ── 右侧购买栏 ── -->
          <div class="pd-right">
            <div class="buy-card">
              <div class="bc-info">
                <p class="bc-name">{{  itemDetail?.name }}</p>
                <p class="bc-brand">云梦精选 · 官方正品</p>
                <div class="bc-rating">
                  <span class="bc-stars">★★★★★</span>
                  <span class="bc-score">4.8</span>
                  <a href="#reviews" class="bc-review-link">128条评价</a>
                  <span class="bc-sep">·</span>
                  <a href="#qa" class="bc-review-link">23个问答</a>
                </div>
              </div>
              <div class="bc-divider"></div>
              <div class="bc-price-block">
                <div class="bc-price-row">
                  <span class="bc-price">¥{{ currentPrice }}</span>
                  <span class="bc-orig" v-if="currentOrigPrice">¥{{ currentOrigPrice }}</span>
                  <span class="bc-discount" v-if="currentOrigPrice">{{ Math.round((1 - currentPrice/currentOrigPrice)*100) }}% off</span>
                </div>
                <div class="bc-tags">
                  <span class="bc-tag">7天无理由退换</span>
                  <span class="bc-tag">正品保障</span>
                  <span class="bc-tag">免运费</span>
                </div>
              </div>
              <div class="bc-divider"></div>
              <div class="bc-spec-block">
                <div class="spec-group">
                  <div class="sg-label">颜色：<span class="sg-selected">{{ selectedColor }}</span></div>
                  <div class="sg-options">
                    <button v-for="c in colors" :key="c.name"
                      :class="['spec-btn color-btn', { active: selectedColor===c.name, disabled: !c.stock }]"
                      @click="c.stock && selectColor(c)">
                      <span class="color-dot" :style="{ background: c.hex }"></span>
                      {{ c.name }}<span v-if="!c.stock" class="sold-out">缺货</span>
                    </button>
                  </div>
                </div>
                <div class="spec-group">
                  <div class="sg-label">版本：<span class="sg-selected">{{ selectedVersion }}</span></div>
                  <div class="sg-options">
                    <button v-for="v in versions" :key="v.name"
                      :class="['spec-btn', { active: selectedVersion===v.name }]"
                      @click="selectVersion(v)">
                      {{ v.name }}<span class="spec-price-hint" v-if="v.priceDiff !== 0">{{ v.priceDiff > 0 ? '+' : '' }}¥{{ v.priceDiff }}</span>
                    </button>
                  </div>
                </div>
                <div class="spec-group">
                  <div class="sg-label">套餐：<span class="sg-selected">{{ selectedBundle }}</span></div>
                  <div class="sg-options column">
                    <button v-for="b in bundles" :key="b.name"
                      :class="['spec-btn bundle-btn', { active: selectedBundle===b.name }]"
                      @click="selectBundle(b)">
                      <div class="bb-left">
                        <span class="bb-name">{{ b.name }}</span>
                        <span class="bb-desc">{{ b.desc }}</span>
                      </div>
                      <span class="bb-price">¥{{ b.price }}</span>
                    </button>
                  </div>
                </div>
                <div class="spec-group">
                  <div class="sg-label">数量：</div>
                  <div class="qty-ctrl">
          
<button class="qty-btn" @click="qty>1 && qty--" :disabled="qty<=1">−</button>
<span class="qty-num">{{ qty }}</span>
<button class="qty-btn" @click="qty < currentStock && qty++" :disabled="qty >= currentStock">+</button>
<span class="qty-stock">库存 {{ currentStock }} 件</span>
                  </div>
                </div>
              </div>
              <div class="bc-divider"></div>
              <div class="bc-params">
                <p class="bp-title">规格参数</p>
                <div class="bp-grid">
                  <div v-for="p in quickParams" :key="p.key" class="bp-item">
                    <span class="bp-key">{{ p.key }}</span>
                    <span class="bp-val">{{ p.val }}</span>
                  </div>
                </div>
              </div>
              <div class="bc-divider"></div>
              <!-- 桌面端购买按钮 -->
              <div class="bc-btns">
                <button class="btn-cart" @click="addToCart">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  加入购物车
                </button>
                <button class="btn-buy" @click="buyNow">立即购买</button>
              </div>
              <div class="bc-guarantee">
                <div v-for="g in guarantees" :key="g" class="bg-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#27AE60" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ g }}
                </div>
              </div>
            </div>
            <div class="shop-card">
              <div class="shopcard-head">
                <div class="shop-avatar">云</div>
                <div class="shop-info">
                  <p class="shop-name">云梦精选旗舰店</p>
                  <p class="shop-score">综合评分 <em>4.9</em></p>
                </div>
                <button class="shop-follow">关注</button>
              </div>
              <div class="shop-stats">
                <div class="ss-item"><span class="ss-num">98.6%</span><span class="ss-label">好评率</span></div>
                <div class="ss-item"><span class="ss-num">24h</span><span class="ss-label">发货</span></div>
                <div class="ss-item"><span class="ss-num">15万+</span><span class="ss-label">销量</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- ══ 全端底部固定购买栏（所有屏幕尺寸都显示）══ -->
      <div class="floating-buy-bar">
        <div class="fbb-inner">
          <div class="fbb-price">
            <span class="fbb-sym">¥</span>
            <span class="fbb-num">{{ currentPrice }}</span>
            <span class="fbb-orig" v-if="currentOrigPrice">¥{{ currentOrigPrice }}</span>
          </div>
          <div class="fbb-spec">
            <span class="fbb-spec-text">{{ selectedColor }} · {{ selectedVersion }} · {{ selectedBundle }}</span>
            <span class="fbb-qty">×{{ qty }}</span>
          </div>
          <div class="fbb-btns">
            <button class="fbb-cart" @click="addToCart">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              加入购物车
            </button>
            <button class="fbb-buy" @click="buyNow">立即购买</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import request from '@/utils/request'
  import { addToCart as addCartItemApi } from '@/api/cart' 
  import { ElMessage } from 'element-plus' 
  import nofoundImage from '@/assets/images/nofound.png'
  
  const router = useRouter()
  const route  = useRoute()
  
  // 图片加载失败处理
  const handleImageError = (e) => {
    e.target.src = nofoundImage
  }
  
  // ─── 加载状态 ────────────────────────────────────────────────
  const loading = ref(true)
  
  // ─── 后端数据 ────────────────────────────────────────────────
  const itemDetail  = ref(null)
  const skuList     = ref([])
  const specGroups  = ref([])
  const quickParams = ref([])
  const specDetails = ref([])
  
  // ─── 图片 ────────────────────────────────────────────────────
  const mainImg = ref('')
  const thumbs  = ref([])
  
  // ─── 规格选中状态 ────────────────────────────────────────────
  const selectedSpecs = ref({})  // { 颜色: '黑色', 存储: '128G' }
  const qty = ref(1)
  
  // ─── 颜色名 → hex 映射 ───────────────────────────────────────
  const colorHexMap = {
    '星空黑': '#1A1A18', '曜石黑': '#1A1A18', '黑色': '#1A1A18',
    '月光白': '#F5F2EC', '白色':   '#F5F2EC',
    '玫瑰金': '#C9A84C', '金色':   '#C9A84C',
    '深海蓝': '#2C5F8A', '蓝色':   '#2C5F8A',
    '红色':   '#C0392B', '绿色':   '#27AE60',
  }
  
  // ─── 当前匹配 SKU ────────────────────────────────────────────
  const currentSku = computed(() =>
    skuList.value.find(sku =>
      Object.entries(selectedSpecs.value).every(([k, v]) => sku.specData[k] === v)
    ) || null
  )
  
  // ─── 价格（单位：分 → 元）────────────────────────────────────
  const currentPrice = computed(() => {
    const raw = currentSku.value?.price ?? itemDetail.value?.price ?? 0
    return (raw / 100).toFixed(2)
  })
  const currentOrigPrice = computed(() => {
    const raw = itemDetail.value?.originalPrice
    return raw ? (raw / 100).toFixed(2) : null
  })
  const currentStock = computed(() => currentSku.value?.stock ?? 0)
  
  // ─── 兼容旧模板的 computed（颜色/版本/套餐）────────────────
  const selectedColor   = computed(() => selectedSpecs.value['颜色'] || '')
  const selectedVersion = computed(() => selectedSpecs.value['存储'] || selectedSpecs.value['版本'] || '')
  const selectedBundle  = ref('单品')
  
  const colors = computed(() => {
    const g = specGroups.value.find(g => g.specName === '颜色')
    return g ? g.values.map(v => ({
      name: v.value,
      hex:  colorHexMap[v.value] || '#888888',
      stock: v.stock,
      priceDiff: 0,
    })) : []
  })
  const versions = computed(() => {
    const g = specGroups.value.find(g => g.specName === '存储' || g.specName === '版本')
    return g ? g.values.map(v => ({
      name: v.value,
      stock: v.stock ? 99 : 0,
      priceDiff: 0,
    })) : []
  })
  const bundles = ref([
    { name: '单品', desc: '商品×1', price: 0 },
  ])
  
  // ─── 规格选择 ────────────────────────────────────────────────
  const isSpecAvailable = (specName, value) => {
    const testSpecs = { ...selectedSpecs.value, [specName]: value }
    return skuList.value.some(sku =>
      Object.entries(testSpecs).every(([k, v]) => sku.specData[k] === v) && sku.stock > 0
    )
  }
  
  const selectSpec = (specName, value) => {
    if (!isSpecAvailable(specName, value)) return
    selectedSpecs.value = { ...selectedSpecs.value, [specName]: value }
    if (currentSku.value?.image) mainImg.value = currentSku.value.image
  }
  
  // 兼容旧模板调用
  const selectColor   = (c) => selectSpec('颜色', c.name)
  const selectVersion = (v) => {
    const key = specGroups.value.find(g => g.specName === '存储') ? '存储' : '版本'
    selectSpec(key, v.name)
  }
  const selectBundle = (b) => { selectedBundle.value = b.name }
  
  // ─── 拉取商品详情 ────────────────────────────────────────────
  const fetchItemDetail = async (id) => {
    loading.value = true
    try {
      // request 响应拦截器已返回 res.data，所以这里直接拿
      const res = await request.get(`/it/items/${id}`)
      const d = res.data ?? res  // 兼容后端是否有 { code, data } 包装
  
      itemDetail.value  = d
      skuList.value     = d.skus        || []
      specGroups.value  = d.specs       || []
      quickParams.value = d.quickParams || []
      specDetails.value = d.specDetails || []
  
      // 图片
      mainImg.value = d.mainImage || ''
      thumbs.value  = d.images?.length ? d.images : (d.mainImage ? [d.mainImage] : [])
  
      // 初始化规格：每组取第一个有库存的值
      const initSpecs = {}
      for (const group of (d.specs || [])) {
        const first = group.values.find(v => v.stock)
        if (first) initSpecs[group.specName] = first.value
      }
      selectedSpecs.value = initSpecs
  
    } catch (e) {
      console.error('加载商品详情失败', e)
    } finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    const id = route.params.id || route.query.id
    if (id) fetchItemDetail(id)
  })
  
  // ─── 加入购物车 / 立即购买 ───────────────────────────────────
  const addToCart = async () => {
    if (!currentSku.value) { 
      ElMessage.warning('请先选择完整的商品规格') // 或者保留你原来的 alert('请选择完整规格')
      return 
    }
    
    try {
      // 👇 使用封装好的 API，并修正参数名为 quantity (匹配后端 CartDTO)
      await addCartItemApi({ 
        skuId: currentSku.value.id, 
        quantity: qty.value 
      })
      
      const specText = Object.values(selectedSpecs.value).join(' ')
      ElMessage.success(`已加入购物车`)
      
    } catch (e) {
      console.error('加入购物车失败:', e)
      ElMessage.error('加入购物车失败，请重试')
    }
  }
  
  const buyNow = () => {
    if (!currentSku.value) { 
      ElMessage.warning('请先选择完整的商品规格')
      return 
    }
    // 立即购买跳转到结算页（或购物车）
    router.push({ 
      path: '/cart', 
      query: { 
        skuId: currentSku.value.id, 
        quantity: qty.value, // 把 num 改为 quantity 保持统一
        direct: 1 
      } 
    })
  }

  
  // ─── 评论（静态，后续可接接口）──────────────────────────────
  const reviewFilter    = ref('all')
  const activeReviewTag = ref('')
  const onlyWithImg     = ref(false)
  const myRating        = ref(0)
  const hoverRating     = ref(0)
  const myReview        = ref('')
  const ratingLabels    = { 0:'', 1:'非常差', 2:'比较差', 3:'一般', 4:'比较好', 5:'非常好' }
  const reviewFilters   = [
    { key:'all', label:'全部' }, { key:'good', label:'好评' },
    { key:'medium', label:'中评' }, { key:'bad', label:'差评' },
  ]
  const reviewTags = [
    { label:'音质出色', count:56 }, { label:'降噪效果好', count:43 },
    { label:'佩戴舒适', count:38 }, { label:'续航强', count:29 },
    { label:'做工精细', count:24 }, { label:'包装精美', count:18 },
  ]
  const ratingDist = [
    { star:5, pct:78 }, { star:4, pct:14 },
    { star:3, pct:5  }, { star:2, pct:2  }, { star:1, pct:1 },
  ]
  const reviews = ref([
    { id:1, name:'云***01', sku:'星空黑 / 标准版', rating:5, date:'2026-03-18',
      text:'音质非常棒，降噪效果超出预期！戴上之后外界噪音几乎消失，地铁里也能安静享受音乐。佩戴舒适，长时间佩戴耳朵不酸。',
      imgs:['https://picsum.photos/120/120?random=60','https://picsum.photos/120/120?random=61'],
      tags:['音质出色','降噪效果好'], likes:42, liked:false,
      shopReply:'感谢您的好评！您的认可是我们前进的动力，期待再次光临～' },
    { id:2, name:'李***22', sku:'月光白 / 标准版', rating:5, date:'2026-03-15',
      text:'收到货后第一时间开箱，包装很精致，耳机颜值超高！连接很稳定，续航也很强，性价比完全碾压大牌，值得推荐！',
      imgs:[], tags:['续航强','做工精细'], likes:28, liked:false, shopReply:'' },
    { id:3, name:'王***88', sku:'玫瑰金 / 豪华版', rating:4, date:'2026-03-12',
      text:'整体很满意，音质真的很好，低音有力不发混，人声清晰。客服响应也很快，态度很好。',
      imgs:['https://picsum.photos/120/120?random=62'],
      tags:['音质出色'], likes:16, liked:false, shopReply:'' },
    { id:4, name:'张***55', sku:'星空黑 / 限定版', rating:5, date:'2026-03-10',
      text:'限定版太好看了！金属质感很强，音质自然不用说，和大牌比一点不差。快递师傅态度也很好，满分好评！',
      imgs:[], tags:['做工精细','包装精美'], likes:33, liked:false, shopReply:'' },
  ])
  const filteredReviews = computed(() => {
    let list = reviews.value
    if (reviewFilter.value === 'good')   list = list.filter(r => r.rating >= 4)
    if (reviewFilter.value === 'medium') list = list.filter(r => r.rating === 3)
    if (reviewFilter.value === 'bad')    list = list.filter(r => r.rating <= 2)
    if (onlyWithImg.value)               list = list.filter(r => r.imgs?.length > 0)
    return list
  })
  const submitReview = () => {
    if (!myReview.value.trim() || !myRating.value) return
    reviews.value.unshift({
      id: Date.now(), name:'我', sku: Object.values(selectedSpecs.value).join(' / '),
      rating: myRating.value, date: new Date().toLocaleDateString('zh-CN'),
      text: myReview.value, imgs:[], tags:[], likes:0, liked:false, shopReply:'',
    })
    myReview.value = ''; myRating.value = 0
    alert('评价发布成功！')
  }
  
  // ─── 问答（静态，后续可接接口）──────────────────────────────
  const myQuestion = ref('')
  const isAnon     = ref(false)
  const qaList     = ref([
    { id:1, question:'这款耳机的降噪效果怎么样？地铁上用能明显感受到吗？',
      user:'购买者A', isAnon:false, date:'2026-03-10', views:328, showReply:false, replyText:'',
      answers:[
        { id:1, user:'官方客服', isShop:true,  date:'2026-03-10', text:'您好！本产品支持主动降噪（ANC），降噪深度高达35dB，地铁飞机等场景效果非常明显，可以完全沉浸在音乐中。', likes:24, liked:false },
        { id:2, user:'云***01', isShop:false, date:'2026-03-11', text:'我已经用了两周了，在地铁上效果非常明显，基本听不到列车噪音，强烈推荐！', likes:18, liked:false },
      ]},
    { id:2, question:'续航到底有多久？官方说的90小时是怎么算的？',
      user:'匿名用户', isAnon:true, date:'2026-03-08', views:215, showReply:false, replyText:'',
      answers:[
        { id:1, user:'官方客服', isShop:true, date:'2026-03-08', text:'您好！90小时=耳机本身30h+充电盒额外2次补充，共3×30=90小时总续航。支持10分钟快充=3小时使用。', likes:31, liked:false },
      ]},
    { id:3, question:'支持多设备同时连接吗？手机和电脑能同时用？',
      user:'李***22', isAnon:false, date:'2026-03-05', views:187, showReply:false, replyText:'',
      answers:[
        { id:1, user:'官方客服', isShop:true, date:'2026-03-05', text:'支持多点连接，最多同时配对2台设备，切换非常方便，接听电话时会自动切换到手机。', likes:19, liked:false },
        { id:2, user:'王***88', isShop:false, date:'2026-03-06', text:'我就是手机+MacBook同时连接，切换很流畅，没有延迟。', likes:12, liked:false },
      ]},
  ])
  const submitQuestion = () => {
    if (!myQuestion.value.trim()) return
    qaList.value.unshift({
      id: Date.now(), question: myQuestion.value, user:'我', isAnon: isAnon.value,
      date: new Date().toLocaleDateString('zh-CN'), views:1, showReply:false, replyText:'', answers:[],
    })
    myQuestion.value = ''
    alert('问题提交成功，等待商家或其他买家解答！')
  }
  const submitAnswer = (qa) => {
    if (!qa.replyText?.trim()) return
    qa.answers.push({
      id: Date.now(), user:'我', isShop:false,
      date: new Date().toLocaleDateString('zh-CN'),
      text: qa.replyText, likes:0, liked:false,
    })
    qa.replyText = ''; qa.showReply = false
  }
  
  const guarantees = ['正品保障·假一赔十','7天无理由退换','全程运费险','1年质保']
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@200;300;400;500&family=Space+Mono:wght@400;700&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .pd-page {
    background: #F5F2EC;
    min-height: 100vh;
    font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
    color: #1A1A18;
    /* 底部留出固定栏高度 */
    padding: 24px 0 90px;
  }
  .pd-inner { max-width: 1320px; margin: 0 auto; padding: 0 40px; }
  
  /* ══ 面包屑 ══ */
  .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
  .bc-link { color: #8A8070; cursor: pointer; transition: .2s; }
  .bc-link:hover { color: #A07830; }
  .bc-sep { color: #C9C0B0; }
  .bc-cur { color: #1A1A18; }
  
  /* ══ 主体 ══ */
  .pd-body { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: flex-start; }
  .pd-left { display: flex; flex-direction: column; gap: 20px; }
  
  /* ══ 右侧 sticky ══ */
  .pd-right {
    position: sticky; top: 20px;
    display: flex; flex-direction: column; gap: 16px;
    max-height: calc(100vh - 110px);
    overflow-y: auto;
    scrollbar-width: none;
  }
  .pd-right::-webkit-scrollbar { display: none; }
  
  /* ══ 图片区 ══ */
  .gallery-section { background: #FFF; border: 1px solid #E0D8C8; border-radius: 16px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
  .gallery-main { position: relative; border-radius: 12px; overflow: hidden; margin-bottom: 14px; border: 1px solid #EDE8DC; }
  .gallery-img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; transition: transform .4s; }
  .gallery-main:hover .gallery-img { transform: scale(1.04); }
  .gallery-tag { position: absolute; top: 12px; left: 12px; background: #E74C3C; color: #FFF; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 5px; }
  .gallery-thumbs { display: flex; gap: 10px; }
  .thumb { width: 72px; height: 72px; border-radius: 8px; overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: .2s; flex-shrink: 0; }
  .thumb:hover { border-color: #C9A84C; }
  .thumb.active { border-color: #A07830; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  
  /* ══ 通用卡片 ══ */
  .section-card { background: #FFF; border: 1px solid #E0D8C8; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
  .sc-head { display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid #F0EAE0; background: #FAFAF8; }
  .sc-title { font-size: 16px; font-weight: 500; color: #1A1A18; }
  .sc-count { font-size: 13px; color: #8A8070; }
  
  /* ══ 商品详情 ══ */
  .detail-content { padding: 20px; }
  .detail-imgs { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
  .detail-img { width: 100%; border-radius: 10px; display: block; }
  .spec-table { width: 100%; border-collapse: collapse; }
  .spec-table tr { border-bottom: 1px solid #F5F2EC; }
  .spec-table tr:last-child { border-bottom: none; }
  .spec-key { padding: 10px 16px; font-size: 13px; color: #8A8070; background: #FAFAF8; width: 120px; }
  .spec-val { padding: 10px 16px; font-size: 13px; color: #1A1A18; }
  
  /* ══ 评价 ══ */
  .review-overview { padding: 20px; display: flex; gap: 24px; align-items: flex-start; border-bottom: 1px solid #F0EAE0; }
  .ro-score { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; min-width: 90px; }
  .ros-num { font-size: 42px; font-weight: 700; color: #A07830; font-family: 'Space Mono', monospace; line-height: 1; }
  .ros-stars { display: flex; gap: 2px; }
  .star { font-size: 16px; color: #C9A84C; }
  .ros-total { font-size: 11px; color: #8A8070; }
  .ro-bars { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .rb-row { display: flex; align-items: center; gap: 8px; }
  .rb-label { font-size: 11px; color: #8A8070; width: 24px; flex-shrink: 0; }
  .rb-track { flex: 1; height: 6px; background: #EDE8DC; border-radius: 3px; overflow: hidden; }
  .rb-fill { height: 100%; background: linear-gradient(90deg, #A07830, #C9A84C); border-radius: 3px; }
  .rb-pct { font-size: 11px; color: #8A8070; width: 32px; text-align: right; font-family: 'Space Mono', monospace; }
  .ro-tags { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
  .ro-tag { font-size: 11px; color: #4A4438; padding: 5px 12px; border-radius: 100px; border: 1px solid #E0D8C8; background: #FFF; cursor: pointer; transition: .2s; white-space: nowrap; }
  .ro-tag:hover, .ro-tag.active { border-color: #C9A84C; color: #A07830; background: rgba(201,168,76,0.08); }
  .review-filter { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-bottom: 1px solid #F0EAE0; }
  .rf-btn { padding: 5px 14px; border-radius: 100px; border: 1px solid #E0D8C8; background: #FFF; color: #4A4438; font-family: inherit; font-size: 12px; cursor: pointer; transition: .2s; }
  .rf-btn:hover, .rf-btn.active { border-color: #C9A84C; color: #A07830; background: rgba(201,168,76,0.08); }
  .rf-img-check { display: flex; align-items: center; gap: 7px; cursor: pointer; font-size: 12px; color: #4A4438; margin-left: auto; }
  .rfi-real { display: none; }
  .rfi-box { width: 15px; height: 15px; border-radius: 4px; border: 1.5px solid #C9A84C; background: transparent; position: relative; transition: .2s; flex-shrink: 0; }
  .rfi-real:checked + .rfi-box { background: #C9A84C; }
  .rfi-real:checked + .rfi-box::after { content: '✓'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #FFF; font-weight: 700; }
  .review-list { padding: 16px 20px; display: flex; flex-direction: column; gap: 16px; }
  .review-item { border-bottom: 1px solid #F5F2EC; padding-bottom: 16px; }
  .review-item:last-child { border-bottom: none; padding-bottom: 0; }
  .ri-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .ri-avatar { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg, #A07830, #C9A84C); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: #FFF; }
  .ri-meta { display: flex; flex-direction: column; gap: 2px; }
  .ri-name { font-size: 13px; font-weight: 500; color: #1A1A18; }
  .ri-sku  { font-size: 10px; color: #8A8070; }
  .ri-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; margin-left: auto; }
  .ri-stars { display: flex; gap: 1px; }
  .ri-star { font-size: 13px; color: #EDE8DC; }
  .ri-star.on { color: #C9A84C; }
  .ri-date { font-size: 11px; color: #B0A898; }
  .ri-text { font-size: 13px; color: #4A4438; line-height: 1.7; margin-bottom: 10px; }
  .ri-imgs { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
  .ri-img  { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; border: 1px solid #E0D8C8; }
  .ri-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
  .ri-tag  { font-size: 10px; color: #A07830; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25); padding: 2px 8px; border-radius: 4px; }
  .ri-foot { display: flex; align-items: center; gap: 12px; }
  .ri-like { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #8A8070; background: none; border: 1px solid #E0D8C8; padding: 4px 10px; border-radius: 100px; cursor: pointer; transition: .2s; font-family: inherit; }
  .ri-like:hover { border-color: #C9A84C; color: #A07830; }
  .ri-shop-reply { margin-top: 10px; background: #FAFAF8; border: 1px solid #E0D8C8; border-radius: 8px; padding: 10px 14px; font-size: 12px; line-height: 1.6; }
  .sr-label { color: #A07830; font-weight: 500; }
  .sr-text  { color: #4A4438; }
  .write-review { padding: 20px; border-top: 1px solid #F0EAE0; background: #FAFAF8; }
  .wr-head { font-size: 14px; font-weight: 500; color: #1A1A18; margin-bottom: 12px; }
  .wr-stars { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
  .wr-label { font-size: 13px; color: #4A4438; }
  .wr-star { font-size: 24px; color: #EDE8DC; cursor: pointer; transition: .15s; }
  .wr-star.on, .wr-star.hover { color: #C9A84C; }
  .wr-rating-label { font-size: 12px; color: #A07830; margin-left: 6px; }
  .wr-textarea { width: 100%; min-height: 90px; border: 1.5px solid #E0D8C8; border-radius: 10px; padding: 12px 14px; resize: vertical; font-family: inherit; font-size: 13px; color: #1A1A18; background: #FFF; outline: none; transition: .2s; line-height: 1.6; }
  .wr-textarea:focus { border-color: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
  .wr-textarea::placeholder { color: #B0A898; }
  .wr-foot { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 10px; }
  .wr-count { font-size: 11px; color: #B0A898; }
  .wr-submit { padding: 9px 22px; border-radius: 100px; border: none; background: linear-gradient(135deg, #A07830, #C9A84C); color: #FFF; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: .2s; }
  .wr-submit:disabled { background: #E0D8C8; color: #B0A898; cursor: not-allowed; }
  
  /* ══ 问答 ══ */
  .ask-box { padding: 20px; border-bottom: 1px solid #F0EAE0; background: #FAFAF8; }
  .ab-head { font-size: 14px; font-weight: 500; color: #1A1A18; margin-bottom: 12px; }
  .ab-textarea { width: 100%; min-height: 80px; border: 1.5px solid #E0D8C8; border-radius: 10px; padding: 12px 14px; resize: vertical; font-family: inherit; font-size: 13px; color: #1A1A18; background: #FFF; outline: none; transition: .2s; line-height: 1.6; }
  .ab-textarea:focus { border-color: #C9A84C; }
  .ab-textarea::placeholder { color: #B0A898; }
  .ab-foot { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
  .ab-anon { display: flex; align-items: center; gap: 7px; cursor: pointer; font-size: 12px; color: #4A4438; }
  .ab-anon-real { display: none; }
  .ab-anon-box { width: 15px; height: 15px; border-radius: 4px; border: 1.5px solid #C9A84C; background: transparent; position: relative; transition: .2s; flex-shrink: 0; }
  .ab-anon-real:checked + .ab-anon-box { background: #C9A84C; }
  .ab-anon-real:checked + .ab-anon-box::after { content: '✓'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #FFF; font-weight: 700; }
  .ab-count { font-size: 11px; color: #B0A898; margin-left: auto; }
  .ab-submit { padding: 8px 20px; border-radius: 100px; border: none; background: linear-gradient(135deg, #A07830, #C9A84C); color: #FFF; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: .2s; }
  .ab-submit:disabled { background: #E0D8C8; color: #B0A898; cursor: not-allowed; }
  .qa-list { padding: 16px 20px; display: flex; flex-direction: column; gap: 20px; }
  .qa-item { border-bottom: 1px solid #F5F2EC; padding-bottom: 20px; }
  .qa-item:last-child { border-bottom: none; padding-bottom: 0; }
  .qa-question { display: flex; gap: 12px; margin-bottom: 14px; }
  .qa-q-icon { width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #A07830; }
  .qa-q-body { flex: 1; }
  .qa-q-text { font-size: 14px; font-weight: 500; color: #1A1A18; line-height: 1.5; margin-bottom: 6px; }
  .qa-q-meta { display: flex; align-items: center; gap: 10px; }
  .qa-q-user, .qa-q-date, .qa-q-views { font-size: 11px; color: #B0A898; }
  .qa-answers { display: flex; flex-direction: column; gap: 10px; padding-left: 40px; }
  .qa-answer  { display: flex; gap: 10px; }
  .qa-a-icon { width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0; background: #F5F2EC; border: 1px solid #E0D8C8; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #4A4438; }
  .qa-a-icon.shop { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.35); color: #A07830; }
  .qa-a-body { flex: 1; }
  .qa-a-head { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
  .qa-a-user { font-size: 12px; font-weight: 500; color: #4A4438; }
  .qa-a-user.shop { color: #A07830; }
  .qa-a-date { font-size: 11px; color: #B0A898; }
  .qa-a-like { display: flex; align-items: center; gap: 4px; margin-left: auto; font-size: 11px; color: #8A8070; background: none; border: 1px solid #E0D8C8; padding: 3px 9px; border-radius: 100px; cursor: pointer; transition: .2s; font-family: inherit; }
  .qa-a-like:hover { border-color: #C9A84C; color: #A07830; }
  .qa-a-text { font-size: 13px; color: #4A4438; line-height: 1.7; }
  .qa-reply-area { margin-top: 8px; }
  .qa-reply-input { width: 100%; min-height: 70px; border: 1.5px solid #E0D8C8; border-radius: 8px; padding: 10px 12px; resize: vertical; font-family: inherit; font-size: 13px; color: #1A1A18; background: #FFF; outline: none; transition: .2s; }
  .qa-reply-input:focus { border-color: #C9A84C; }
  .qa-reply-input::placeholder { color: #B0A898; }
  .qa-reply-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  .qa-reply-cancel { padding: 7px 16px; border-radius: 100px; background: #FFF; border: 1px solid #E0D8C8; color: #4A4438; font-family: inherit; font-size: 12px; cursor: pointer; }
  .qa-reply-cancel:hover { border-color: #C9A84C; color: #A07830; }
  .qa-reply-submit { padding: 7px 16px; border-radius: 100px; border: none; background: linear-gradient(135deg, #A07830, #C9A84C); color: #FFF; font-family: inherit; font-size: 12px; cursor: pointer; }
  .qa-reply-submit:disabled { background: #E0D8C8; color: #B0A898; cursor: not-allowed; }
  .qa-answer-btn { margin-top: 8px; font-size: 12px; color: #A07830; background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.3); padding: 6px 14px; border-radius: 100px; cursor: pointer; font-family: inherit; }
  .qa-answer-btn:hover { background: rgba(201,168,76,0.12); }
  
  /* ══ 购买栏（右侧卡片内） ══ */
  .buy-card { background: #FFF; border: 1px solid #E0D8C8; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(201,168,76,0.1); flex-shrink: 0; }
  .bc-info { padding: 18px 20px 14px; }
  .bc-name  { font-size: 15px; font-weight: 500; color: #1A1A18; line-height: 1.5; margin-bottom: 5px; }
  .bc-brand { font-size: 12px; color: #8A8070; margin-bottom: 8px; }
  .bc-rating { display: flex; align-items: center; gap: 6px; font-size: 12px; }
  .bc-stars { color: #C9A84C; letter-spacing: 1px; }
  .bc-score { font-weight: 600; color: #A07830; font-family: 'Space Mono', monospace; }
  .bc-review-link { color: #8A8070; text-decoration: none; transition: .2s; }
  .bc-review-link:hover { color: #A07830; }
  .bc-sep { color: #D8D0C4; }
  .bc-divider { height: 1px; background: #F0EAE0; }
  .bc-price-block { padding: 14px 20px; }
  .bc-price-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
  .bc-price    { font-size: 28px; font-weight: 700; color: #A07830; font-family: 'Space Mono', monospace; }
  .bc-orig     { font-size: 13px; color: #B0A898; text-decoration: line-through; font-family: 'Space Mono', monospace; }
  .bc-discount { font-size: 11px; color: #FFF; background: #E74C3C; padding: 2px 7px; border-radius: 4px; font-weight: 600; }
  .bc-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .bc-tag  { font-size: 10px; color: #A07830; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25); padding: 3px 9px; border-radius: 4px; }
  .bc-spec-block { padding: 14px 20px; display: flex; flex-direction: column; gap: 16px; }
  .spec-group { display: flex; flex-direction: column; gap: 8px; }
  .sg-label { font-size: 12px; color: #8A8070; }
  .sg-selected { color: #A07830; font-weight: 500; }
  .sg-options { display: flex; gap: 7px; flex-wrap: wrap; }
  .sg-options.column { flex-direction: column; }
  .spec-btn { padding: 7px 13px; border-radius: 8px; border: 1.5px solid #E0D8C8; background: #FFF; color: #4A4438; font-family: inherit; font-size: 12px; cursor: pointer; transition: .2s; }
  .spec-btn:hover:not(.disabled) { border-color: #C9A84C; color: #A07830; }
  .spec-btn.active { border-color: #C9A84C; background: rgba(201,168,76,0.08); color: #A07830; font-weight: 500; }
  .spec-btn.disabled { opacity: .4; cursor: not-allowed; }
  .spec-price-hint { font-size: 10px; color: #8A8070; margin-left: 4px; }
  .sold-out { font-size: 9px; color: #B0A898; margin-left: 3px; }
  .color-btn { display: flex; align-items: center; gap: 6px; }
  .color-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); flex-shrink: 0; }
  .bundle-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; text-align: left; padding: 10px 14px; }
  .bb-left { display: flex; flex-direction: column; gap: 2px; }
  .bb-name { font-size: 13px; }
  .bb-desc { font-size: 11px; color: #8A8070; }
  .bb-price { font-size: 15px; font-weight: 600; color: #A07830; font-family: 'Space Mono', monospace; }
  .qty-ctrl { display: flex; align-items: center; gap: 10px; }
  .qty-btn { width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid #E0D8C8; background: #FFF; color: #4A4438; font-size: 18px; cursor: pointer; transition: .2s; display: flex; align-items: center; justify-content: center; }
  .qty-btn:hover:not(:disabled) { border-color: #C9A84C; color: #A07830; }
  .qty-btn:disabled { opacity: .4; cursor: not-allowed; }
  .qty-num { min-width: 36px; text-align: center; font-size: 15px; font-weight: 600; font-family: 'Space Mono', monospace; color: #1A1A18; }
  .qty-stock { font-size: 11px; color: #8A8070; }
  .bc-params { padding: 14px 20px; }
  .bp-title { font-size: 13px; font-weight: 500; color: #4A4438; margin-bottom: 10px; }
  .bp-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .bp-item  { display: flex; flex-direction: column; gap: 2px; background: #FAFAF8; border-radius: 7px; padding: 8px 10px; }
  .bp-key   { font-size: 10px; color: #8A8070; }
  .bp-val   { font-size: 12px; color: #1A1A18; line-height: 1.4; }
  .bc-btns { padding: 14px 20px; display: flex; gap: 10px; }
  .btn-cart { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 11px; border-radius: 10px; border: 2px solid #C9A84C; background: rgba(201,168,76,0.06); color: #A07830; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: .2s; }
  .btn-cart:hover { background: rgba(201,168,76,0.14); }
  .btn-buy  { flex: 1; padding: 11px; border-radius: 10px; border: none; background: linear-gradient(135deg, #A07830, #C9A84C); color: #FFF; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: .2s; }
  .btn-buy:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(160,120,48,0.4); }
  .bc-guarantee { padding: 0 20px 16px; display: flex; flex-direction: column; gap: 6px; }
  .bg-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #4A4438; }
  
  /* ══ 店铺卡 ══ */
  .shop-card { background: #FFF; border: 1px solid #E0D8C8; border-radius: 14px; padding: 16px 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); flex-shrink: 0; }
  .shopcard-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .shop-avatar { width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; background: linear-gradient(135deg, #A07830, #C9A84C); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 500; color: #FFF; }
  .shop-info { flex: 1; }
  .shop-name  { font-size: 14px; font-weight: 500; color: #1A1A18; margin-bottom: 3px; }
  .shop-score { font-size: 12px; color: #8A8070; }
  .shop-score em { font-style: normal; color: #A07830; font-weight: 600; }
  .shop-follow { padding: 7px 14px; border-radius: 100px; border: 1.5px solid #C9A84C; background: rgba(201,168,76,0.06); color: #A07830; font-family: inherit; font-size: 12px; font-weight: 500; cursor: pointer; transition: .2s; }
  .shop-follow:hover { background: rgba(201,168,76,0.14); }
  .shop-stats { display: grid; grid-template-columns: repeat(3,1fr); border-top: 1px solid #F0EAE0; padding-top: 12px; }
  .ss-item { display: flex; flex-direction: column; align-items: center; gap: 3px; border-right: 1px solid #F0EAE0; }
  .ss-item:last-child { border-right: none; }
  .ss-num   { font-size: 16px; font-weight: 600; color: #A07830; font-family: 'Space Mono', monospace; }
  .ss-label { font-size: 11px; color: #8A8070; }
  
  /* ══ 底部固定购买栏（全端常驻）══ */
  .floating-buy-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 999;
    background: rgba(255,255,255,0.97);
    border-top: 1px solid #E0D8C8;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  }
  .fbb-inner {
    max-width: 1320px; margin: 0 auto;
    padding: 10px 40px;
    display: flex; align-items: center; gap: 20px;
  }
  .fbb-price { display: flex; align-items: baseline; gap: 4px; flex-shrink: 0; }
  .fbb-sym   { font-size: 14px; color: #A07830; font-weight: 400; }
  .fbb-num   { font-size: 26px; font-weight: 700; color: #A07830; font-family: 'Space Mono', monospace; line-height: 1; }
  .fbb-orig  { font-size: 12px; color: #B0A898; text-decoration: line-through; font-family: 'Space Mono', monospace; margin-left: 4px; }
  .fbb-spec  { display: flex; align-items: center; gap: 8px; flex: 1; }
  .fbb-spec-text { font-size: 12px; color: #8A8070; }
  .fbb-qty   { font-size: 12px; color: #4A4438; background: #F5F2EC; border: 1px solid #E0D8C8; padding: 2px 8px; border-radius: 4px; }
  .fbb-btns  { display: flex; gap: 10px; flex-shrink: 0; }
  .fbb-cart  {
    display: flex; align-items: center; gap: 7px;
    padding: 11px 24px; border-radius: 100px;
    border: 2px solid #C9A84C; background: rgba(201,168,76,0.06);
    color: #A07830; font-family: inherit; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: .2s; white-space: nowrap;
  }
  .fbb-cart:hover { background: rgba(201,168,76,0.14); }
  .fbb-buy   {
    padding: 11px 32px; border-radius: 100px; border: none;
    background: linear-gradient(135deg, #A07830, #C9A84C);
    color: #FFF; font-family: inherit; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: .2s; white-space: nowrap;
    box-shadow: 0 3px 12px rgba(160,120,48,0.3);
  }
  .fbb-buy:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(160,120,48,0.45); }
  
  /* ══ 响应式 ══ */
  @media (max-width:1100px) {
    .pd-body  { grid-template-columns: 1fr; }
    .pd-right { position: static; max-height: none; overflow: visible; }
    .bp-grid  { grid-template-columns: repeat(3,1fr); }
  }
  @media (max-width:768px) {
    .pd-inner { padding: 0 16px; }
    .fbb-inner { padding: 10px 16px; }
    .fbb-spec { display: none; }
    .review-overview { flex-direction: column; }
    .ro-tags { flex-direction: row; flex-wrap: wrap; }
    .bp-grid { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width:480px) {
    .gallery-thumbs { gap: 6px; }
    .thumb { width: 56px; height: 56px; }
    .fbb-cart { padding: 11px 16px; font-size: 13px; }
    .fbb-buy  { padding: 11px 20px; font-size: 13px; }
  }
  </style>