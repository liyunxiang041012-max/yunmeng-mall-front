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
        <div class="avatar-wrap">
          <div class="av-ring r1"></div>
          <div class="av-ring r2"></div>
          <div class="av-core"><span class="av-initial">云</span></div>
          <div class="av-edit">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
        </div>
        <div class="uh-meta">
          <h2 class="uh-name">云梦探索者</h2>
          <p class="uh-uid"><span class="uid-label">UID</span>YM20260318</p>
          <div class="uh-tags">
            <span class="utag gold">♛ 黄金会员</span>
            <span class="utag blue">上海</span>
            <span class="utag purple">2024年加入</span>
          </div>
        </div>
        <div class="uh-stats">
          <div v-for="s in userStats" :key="s.label" class="ustat">
            <span class="ustat-num">{{ s.value }}</span>
            <span class="ustat-label">{{ s.label }}</span>
          </div>
        </div>
        <button class="uh-setting-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
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
        <div v-for="s in orderStatuses" :key="s.label"
          :class="['ostatus', { active: orderTab === s.label }]"
          @click="orderTab = s.label">
          <div class="ostatus-icon">{{ s.icon }}</div>
          <span class="ostatus-label">{{ s.label }}</span>
          <em v-if="s.count > 0" class="ostatus-badge">{{ s.count }}</em>
        </div>
      </div>
      <div class="order-list">
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
              <img :src="g.image" :alt="g.name" />
              <div class="og-info">
                <p class="og-name">{{ g.name }}</p>
                <p class="og-sku">{{ g.sku }}</p>
              </div>
              <div class="og-right">
                <span class="og-price">¥{{ g.price }}</span>
                <span class="og-qty">×{{ g.qty }}</span>
              </div>
            </div>
          </div>
          <div class="order-footer">
            <span class="order-total">共{{ order.totalQty }}件 · 实付 <strong>¥{{ order.total }}</strong></span>
            <div class="order-actions">
              <button v-if="order.status==='待付款'" class="oa-primary">立即付款</button>
              <button v-if="order.status==='待收货'" class="oa-default">确认收货</button>
              <button v-if="order.status==='已完成'" class="oa-primary">再次购买</button>
              <button v-if="order.status==='已完成'" class="oa-default">写评价</button>
              <button class="oa-default" @click="toggleLogistics(order.id)">
                {{ expandedOrder === order.id ? '收起' : '查看详情' }}
              </button>
            </div>
          </div>
          <transition name="expand">
            <div v-if="expandedOrder === order.id && order.logistics.length" class="order-logistics">
              <p class="logistics-title">📦 物流跟踪</p>
              <div v-for="(step, i) in order.logistics" :key="i" :class="['ltrack', { active: i===0 }]">
                <div class="ltrack-dot"></div>
                <div class="ltrack-line" v-if="i < order.logistics.length-1"></div>
                <div class="ltrack-text">
                  <p class="ltrack-desc">{{ step.desc }}</p>
                  <p class="ltrack-time">{{ step.time }}</p>
                </div>
              </div>
            </div>
          </transition>
        </div>
        <div v-if="filteredOrders.length === 0" class="empty-state">
          <span class="empty-icon">📦</span>
          <p>暂无{{ orderTab === '全部' ? '' : orderTab }}订单</p>
        </div>
      </div>
    </section>

    <!-- ══ 钱包 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">WALLET</span>
        <h2 class="section-title">我的钱包</h2>
        <button class="ghost-btn">账单明细 →</button>
      </div>
      <div class="wallet-card">
        <div class="wc-glow"></div>
        <div class="wc-left">
          <p class="wc-bal-label">账户余额</p>
          <div class="wc-bal"><span class="wc-unit">¥</span><span class="wc-num">1,286.50</span></div>
          <p class="wc-sub">可用 ¥1,186.50 · 冻结 ¥100.00</p>
          <div class="wc-btns">
            <button class="wc-btn primary">+ 充值</button>
            <button class="wc-btn">↑ 提现</button>
          </div>
        </div>
        <div class="wc-assets">
          <div v-for="a in walletAssets" :key="a.label" class="wasset">
            <span class="wasset-val" :style="{ color: a.color }">{{ a.value }}</span>
            <span class="wasset-label">{{ a.label }}</span>
            <button class="wasset-use">使用</button>
          </div>
        </div>
      </div>
      <div class="txn-wrap">
        <div class="txn-topbar">
          <span class="txn-title">最近收支</span>
          <div class="txn-filters">
            <button v-for="f in ['全部','收入','支出']" :key="f"
              :class="['txn-f', { active: txnFilter === f }]"
              @click="txnFilter = f">{{ f }}</button>
          </div>
        </div>
        <div class="txn-list">
          <div v-for="tx in filteredTxns" :key="tx.id" class="txn-item">
            <div class="txn-icon" :class="tx.type === '收入' ? 'income' : 'expense'">{{ tx.icon }}</div>
            <div class="txn-info">
              <p class="txn-name">{{ tx.name }}</p>
              <p class="txn-time">{{ tx.time }}</p>
            </div>
            <span :class="['txn-amt', tx.type === '收入' ? 'income' : 'expense']">
              {{ tx.type === '收入' ? '+' : '-' }}¥{{ tx.amount }}
            </span>
          </div>
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
            <button v-for="d in ['今天','昨天','更早']" :key="d"
              :class="['hdate', { active: historyDate === d }]"
              @click="historyDate = d">{{ d }}</button>
          </div>
          <button class="ghost-btn red-ghost" @click="clearHistory">清空</button>
        </div>
      </div>
      <div v-if="historyItems.length > 0" class="history-grid">
        <div v-for="item in historyItems" :key="item.id" class="hcard">
          <div class="hcard-media">
            <img :src="item.image" :alt="item.name" />
            <button class="hcard-del" @click.stop="removeHistory(item.id)">✕</button>
            <span class="hcard-time">{{ item.viewTime }}</span>
          </div>
          <div class="hcard-body">
            <p class="hcard-name">{{ item.name }}</p>
            <div class="hcard-foot">
              <span class="hcard-price">¥{{ item.price }}</span>
              <button class="hcard-cart">加购</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state"><span class="empty-icon">👀</span><p>暂无浏览记录</p></div>
    </section>

    <!-- ══ 我的收藏 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">FAVORITES</span>
        <h2 class="section-title">我的收藏</h2>
        <button class="ghost-btn">全部收藏 →</button>
      </div>
      <div class="fav-grid">
        <div v-for="item in favItems" :key="item.id" class="fav-card">
          <div class="fav-media">
            <img :src="item.image" :alt="item.name" />
            <button class="fav-heart" @click="removeFav(item.id)">♥</button>
          </div>
          <div class="fav-body">
            <p class="fav-name">{{ item.name }}</p>
            <div class="fav-foot">
              <span class="fav-price">¥{{ item.price }}</span>
              <button class="fav-buy">购买</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ 更多服务 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">SERVICES</span>
        <h2 class="section-title">更多服务</h2>
      </div>
      <div class="tools-grid">
        <div v-for="tool in toolItems" :key="tool.id" class="tool-card" :style="{'--tc': tool.color}">
          <div class="tool-icon">{{ tool.icon }}</div>
          <div class="tool-info">
            <span class="tool-name">{{ tool.name }}</span>
            <span class="tool-desc">{{ tool.desc }}</span>
          </div>
          <svg class="tool-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          <em v-if="tool.badge" class="tool-badge">{{ tool.badge }}</em>
        </div>
      </div>
    </section>

    <!-- ══ 会员成长 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">MEMBERSHIP</span>
        <h2 class="section-title">会员成长</h2>
      </div>
      <div class="member-card">
        <div class="mc-glow"></div>
        <div class="mc-left">
          <div class="mc-badge-row">
            <div class="mc-badge-icon">♛</div>
            <div><p class="mc-level">黄金会员</p><p class="mc-exp-txt">3,200 EXP</p></div>
          </div>
          <div class="mc-progress-wrap">
            <div class="mc-bar"><div class="mc-fill" style="width:64%"><div class="mc-fill-dot"></div></div></div>
            <div class="mc-bar-labels"><span>3,200 EXP</span><span>距铂金还差 800 EXP</span></div>
          </div>
          <div class="mc-perks">
            <span v-for="p in memberPerks" :key="p" class="mc-perk">✦ {{ p }}</span>
          </div>
        </div>
        <div class="mc-right">
          <div v-for="lvl in memberLevels" :key="lvl.name"
            :class="['mc-lvl', { current: lvl.current, passed: lvl.passed }]">
            <span class="mc-lvl-icon">{{ lvl.icon }}</span>
            <div class="mc-lvl-info">
              <span class="mc-lvl-name">{{ lvl.name }}</span>
              <span class="mc-lvl-req">{{ lvl.req }}</span>
            </div>
            <span v-if="lvl.passed" class="mc-check">✓</span>
            <span v-if="lvl.current" class="mc-cur-tag">当前</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ 收货地址 ══ -->
    <section class="section-block">
      <div class="section-head">
        <span class="eyebrow">ADDRESS</span>
        <h2 class="section-title">收货地址</h2>
        <button class="ghost-btn">+ 新增地址</button>
      </div>
      <div class="address-list">
        <div v-for="addr in addresses" :key="addr.id"
          :class="['addr-card', { 'is-default': addr.isDefault }]">
          <span v-if="addr.isDefault" class="addr-default-tag">默认</span>
          <div class="addr-main">
            <div class="addr-name-row">
              <span class="addr-name">{{ addr.name }}</span>
              <span class="addr-phone">{{ addr.phone }}</span>
            </div>
            <p class="addr-full">{{ addr.full }}</p>
          </div>
          <div class="addr-actions">
            <button class="addr-btn">编辑</button>
            <button class="addr-btn del" @click="deleteAddr(addr.id)">删除</button>
            <button v-if="!addr.isDefault" class="addr-btn" @click="setDefault(addr.id)">设为默认</button>
          </div>
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
          <div class="sec-info">
            <p class="sec-name">{{ item.name }}</p>
            <p class="sec-desc">{{ item.desc }}</p>
          </div>
          <div class="sec-right">
            <span :class="['sec-status', item.ok ? 'ok' : 'warn']">{{ item.ok ? '已设置' : '未设置' }}</span>
            <button class="sec-btn">{{ item.action }}</button>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const userStats = ref([
  { label:'关注', value:128 }, { label:'粉丝', value:56 },
  { label:'收藏', value:34  }, { label:'足迹', value:210 },
])
const orderTab      = ref('全部')
const expandedOrder = ref(null)
const orderStatuses = ref([
  { label:'全部',     icon:'📋', count:0 }, { label:'待付款',   icon:'⏳', count:1 },
  { label:'待发货',   icon:'📦', count:2 }, { label:'待收货',   icon:'🚚', count:1 },
  { label:'已完成',   icon:'✓',  count:0 }, { label:'退款售后', icon:'↩️', count:0 },
])
const orders = ref([
  {
    id:1, shop:'云梦精选旗舰店', no:'YM202603181423',
    status:'待收货', statusClass:'st-shipping', total:'218.00', totalQty:2,
    goods:[
      { id:1, image:'https://picsum.photos/100/100?random=1', name:'极简无线降噪耳机', sku:'黑色 / 标准版', price:'89.00', qty:1 },
      { id:2, image:'https://picsum.photos/100/100?random=2', name:'轻量碳纤维背包', sku:'深空灰 / 20L', price:'129.00', qty:1 },
    ],
    logistics:[
      { desc:'您的包裹已到达【上海浦东新区派送站】，派件员正在派送', time:'2026-03-18 09:30' },
      { desc:'包裹已从【上海转运中心】发出', time:'2026-03-17 22:14' },
      { desc:'商品已出库，快递公司揽收', time:'2026-03-17 14:05' },
    ]
  },
  {
    id:2, shop:'全球好物直邮', no:'YM202603151820',
    status:'已完成', statusClass:'st-done', total:'599.00', totalQty:1,
    goods:[
      { id:3, image:'https://picsum.photos/100/100?random=3', name:'AI智能降噪蓝牙耳机旗舰版', sku:'星空白 / 旗舰版', price:'599.00', qty:1 },
    ],
    logistics:[
      { desc:'您已确认收货，交易完成', time:'2026-03-17 16:00' },
      { desc:'包裹已签收', time:'2026-03-17 15:42' },
    ]
  },
  {
    id:3, shop:'云梦精选旗舰店', no:'YM202603181956',
    status:'待付款', statusClass:'st-pending', total:'349.00', totalQty:1,
    goods:[
      { id:4, image:'https://picsum.photos/100/100?random=4', name:'多功能空气炸锅无油烹饪', sku:'白色 / 4.5L', price:'349.00', qty:1 },
    ],
    logistics:[]
  },
])
const filteredOrders = computed(() => {
  if (orderTab.value === '全部') return orders.value
  return orders.value.filter(o => o.status === orderTab.value)
})
const toggleLogistics = (id) => { expandedOrder.value = expandedOrder.value === id ? null : id }

const txnFilter    = ref('全部')
const walletAssets = ref([
  { label:'优惠券', value:'8张',   color:'#a78bfa' },
  { label:'积分',   value:'3,280', color:'#f0cc7a' },
  { label:'红包',   value:'¥30',   color:'#ff5c75' },
  { label:'礼品卡', value:'2张',   color:'#38bdf8' },
])
const transactions = ref([
  { id:1, type:'支出', icon:'🛍️', name:'订单支付 · 极简降噪耳机', time:'2026-03-18 14:23', amount:'89.00'  },
  { id:2, type:'收入', icon:'↩️', name:'退款到账 · 轻量背包',     time:'2026-03-17 09:11', amount:'129.00' },
  { id:3, type:'支出', icon:'🛍️', name:'订单支付 · 香氛套装',     time:'2026-03-16 20:05', amount:'59.00'  },
  { id:4, type:'收入', icon:'🎁', name:'新人红包奖励',             time:'2026-03-15 00:00', amount:'30.00'  },
  { id:5, type:'支出', icon:'💳', name:'会员充值',                 time:'2026-03-14 16:40', amount:'98.00'  },
  { id:6, type:'收入', icon:'💰', name:'余额充值',                 time:'2026-03-12 11:22', amount:'500.00' },
])
const filteredTxns = computed(() => {
  if (txnFilter.value === '全部') return transactions.value
  return transactions.value.filter(t => t.type === txnFilter.value)
})

const historyDate  = ref('今天')
const historyItems = ref([
  { id:1, image:'https://picsum.photos/280/360?random=20', name:'极简风阔腿裤春秋新款',     price:'128',  viewTime:'10分钟前' },
  { id:2, image:'https://picsum.photos/280/360?random=21', name:'AI智能降噪蓝牙耳机旗舰版', price:'599',  viewTime:'32分钟前' },
  { id:3, image:'https://picsum.photos/280/360?random=22', name:'手工研磨挂耳咖啡礼盒20入', price:'89',   viewTime:'1小时前'  },
  { id:4, image:'https://picsum.photos/280/360?random=23', name:'复古黑胶唱片机家用音响',   price:'1299', viewTime:'2小时前'  },
  { id:5, image:'https://picsum.photos/280/360?random=24', name:'北欧风实木床头柜简约现代', price:'219',  viewTime:'3小时前'  },
  { id:6, image:'https://picsum.photos/280/360?random=25', name:'香氛扩香石套装精品礼盒',   price:'59',   viewTime:'5小时前'  },
])
const removeHistory = (id) => { historyItems.value = historyItems.value.filter(i => i.id !== id) }
const clearHistory  = () => { historyItems.value = [] }

const favItems = ref([
  { id:1, image:'https://picsum.photos/280/340?random=30', name:'轻奢皮革钱包男士长款', price:'299' },
  { id:2, image:'https://picsum.photos/280/340?random=31', name:'智能温控随行杯保温',   price:'168' },
  { id:3, image:'https://picsum.photos/280/340?random=32', name:'真皮手工笔记本A5',     price:'78'  },
  { id:4, image:'https://picsum.photos/280/340?random=33', name:'无线充电桌面台灯',     price:'399' },
])
const removeFav = (id) => { favItems.value = favItems.value.filter(i => i.id !== id) }

const toolItems = ref([
  { id:1, icon:'⭐', name:'商品评价',   desc:'待评价 3 件',  color:'#f0cc7a', badge:'3'   },
  { id:2, icon:'🔔', name:'消息通知',   desc:'2条未读',      color:'#a78bfa', badge:'2'   },
  { id:3, icon:'🎫', name:'我的优惠券', desc:'8张可用',      color:'#f472b6', badge:'8'   },
  { id:4, icon:'🎁', name:'礼品卡',     desc:'2张未使用',    color:'#22c55e', badge:null  },
  { id:5, icon:'🤝', name:'邀请有礼',   desc:'邀好友得红包', color:'#ff6b35', badge:'NEW' },
  { id:6, icon:'📊', name:'消费统计',   desc:'查看消费报告', color:'#38bdf8', badge:null  },
  { id:7, icon:'📍', name:'收货地址',   desc:'管理收货地址', color:'#818cf8', badge:null  },
  { id:8, icon:'🛡️', name:'账号安全',   desc:'保护账号安全', color:'#94a3b8', badge:null  },
])

const memberPerks  = ['专属折扣','生日礼包','优先客服','积分加倍']
const memberLevels = ref([
  { name:'普通会员', icon:'○', req:'0 EXP',     passed:true,  current:false },
  { name:'白银会员', icon:'◇', req:'500 EXP',   passed:true,  current:false },
  { name:'黄金会员', icon:'◆', req:'2000 EXP',  passed:false, current:true  },
  { name:'铂金会员', icon:'✦', req:'4000 EXP',  passed:false, current:false },
  { name:'钻石会员', icon:'♛', req:'10000 EXP', passed:false, current:false },
])

const addresses = ref([
  { id:1, name:'李小云', phone:'138****8888', full:'上海市浦东新区世纪大道100号 XX大厦 2201室', isDefault:true  },
  { id:2, name:'李小云', phone:'138****8888', full:'北京市朝阳区三里屯路19号 XX公寓 B栋 305室',   isDefault:false },
])
const deleteAddr = (id) => { addresses.value = addresses.value.filter(a => a.id !== id) }
const setDefault = (id) => { addresses.value.forEach(a => a.isDefault = a.id === id) }

const securityItems = ref([
  { id:1, icon:'🔑', name:'登录密码', desc:'建议定期修改密码',  color:'#a78bfa', ok:true,  action:'修改'    },
  { id:2, icon:'📱', name:'手机绑定', desc:'138****8888',       color:'#22c55e', ok:true,  action:'更换'    },
  { id:3, icon:'📧', name:'邮箱绑定', desc:'未绑定邮箱',        color:'#ff5c75', ok:false, action:'立即绑定' },
  { id:4, icon:'👆', name:'生物识别', desc:'指纹/面容快捷登录', color:'#38bdf8', ok:false, action:'去开启'  },
  { id:5, icon:'🛡️', name:'实名认证', desc:'已完成实名认证',    color:'#f0cc7a', ok:true,  action:'查看'    },
])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&family=Space+Mono:wght@400;700&display=swap');

/* ══ 与 HomePage 完全一致的变量 ══ */
:root {
  --bg:      #07091a;
  --bg2:     #0d1128;
  --surf:    rgba(255,255,255,0.06);
  --surf2:   rgba(255,255,255,0.11);
  --border:  rgba(255,255,255,0.11);
  --border2: rgba(255,255,255,0.24);
  --text:    #eef0fa;
  --text2:   #c4cde2;
  --text3:   #7e8ba3;
  --neon:    #a78bfa;
  --neon2:   #38bdf8;
  --gold:    #f0cc7a;
  --red:     #ff5c75;
  --radius:  18px;
  --glow:    0 0 32px rgba(167,139,250,0.18);
}
* { box-sizing:border-box; margin:0; padding:0; }

/* ══ 页面根：全宽，无多余留白 ══ */
.my-page {
  background: #0c1020;
  color: var(--text);
  min-height: 100vh;
  width: 100%;                      /* 撑满全屏 */
  font-family: 'Noto Serif SC','PingFang SC',serif;
  padding: 0 0 80px;                /* 顶部无 padding，内容区各自控制 */
}

/* ══ 通用区块 ══ */
.section-block {
  margin-bottom: 50px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 40px;
}
.section-head  { display:flex; align-items:center; gap:18px; margin-bottom:22px; flex-wrap:wrap; }
.eyebrow { font-family:'Space Mono',monospace; font-size:9px; letter-spacing:3px; color:#a78bfa; font-weight:700; }
.section-title { font-size:22px; font-weight:600; color:#eef0fa; }
.ghost-btn {
  margin-left:auto; background:none; border:1px solid rgba(255,255,255,.18);
  color:#c4cde2; font-family:inherit; font-size:12px;
  padding:7px 15px; border-radius:100px; cursor:pointer; transition:.2s; white-space:nowrap;
}
.ghost-btn:hover { border-color:var(--neon); color:#c4b0ff; }
.red-ghost { border-color:rgba(255,92,117,.25); color:#ff8099; margin-left:10px; }
.red-ghost:hover { border-color:#ff5c75; color:#ff5c75; background:none; }
.empty-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:50px 0; color:#7e8ba3; }
.empty-icon { font-size:36px; opacity:.5; }
.empty-state p { font-size:14px; }

/* ══ 用户英雄区：全宽 ══ */
.user-hero {
  position:relative; overflow:hidden;
  margin-bottom: 40px;
  width: 100%;
}
.uh-bg {
  position:absolute; inset:0;
  background:linear-gradient(135deg,#0f1535 0%,#140d2a 50%,#0a1628 100%);
}
.uh-orb { position:absolute; border-radius:50%; filter:blur(60px); pointer-events:none; }
.o1 { width:320px; height:320px; top:-80px;  left:-60px;  background:rgba(124,111,255,.18); }
.o2 { width:250px; height:250px; top:-40px;  right:10%;   background:rgba(56,189,248,.12);  }
.o3 { width:200px; height:200px; bottom:-60px; right:20%; background:rgba(167,139,250,.11); }
.uh-grid {
  position:absolute; inset:0;
  background-image:
    linear-gradient(rgba(167,139,250,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(167,139,250,.04) 1px, transparent 1px);
  background-size:40px 40px;
}
/* 英雄区内容居中对齐主内容区 */
.uh-inner {
  position:relative; z-index:2;
  display:flex; align-items:center; gap:36px;
  padding: 40px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 头像 */
.avatar-wrap { position:relative; flex-shrink:0; }
.av-ring {
  position:absolute; border-radius:50%; border:1px solid rgba(167,139,250,.22);
  top:50%; left:50%; transform:translate(-50%,-50%);
  animation:avPulse 3s ease-in-out infinite;
}
.r1 { width:100px; height:100px; }
.r2 { width:130px; height:130px; animation-delay:.5s; border-color:rgba(56,189,248,.12); }
@keyframes avPulse {
  0%,100%{ opacity:.8; transform:translate(-50%,-50%) scale(1); }
  50%    { opacity:.25;transform:translate(-50%,-50%) scale(1.05); }
}
.av-core {
  width:82px; height:82px; border-radius:24px;
  background:linear-gradient(135deg,#7c6fff,#38bdf8);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 0 32px rgba(124,111,255,.55),0 0 70px rgba(124,111,255,.18);
  position:relative; z-index:1;
}
.av-initial { font-size:32px; font-weight:700; color:#fff; text-shadow:0 0 16px rgba(255,255,255,.8); }
.av-edit {
  position:absolute; bottom:-4px; right:-4px; z-index:2;
  width:26px; height:26px; border-radius:50%;
  background:#1a2040; border:2px solid rgba(167,139,250,.4);
  display:flex; align-items:center; justify-content:center;
  color:#a78bfa; cursor:pointer; transition:.2s;
}
.av-edit:hover { background:rgba(167,139,250,.2); border-color:#a78bfa; }

.uh-meta { flex:1; }
.uh-name { font-size:28px; font-weight:600; color:#fff; letter-spacing:2px; margin-bottom:8px; text-shadow:0 0 30px rgba(167,139,250,.28); }
.uh-uid { font-family:'Space Mono',monospace; font-size:11px; color:#7e8ba3; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
.uid-label { background:rgba(167,139,250,.15); color:#a78bfa; padding:2px 6px; border-radius:4px; font-size:9px; letter-spacing:1px; }
.uh-tags { display:flex; gap:8px; flex-wrap:wrap; }
.utag { font-size:11px; padding:4px 11px; border-radius:100px; border:1px solid; font-weight:500; }
.utag.gold   { color:#f0cc7a; border-color:rgba(240,204,122,.35); background:rgba(240,204,122,.07); }
.utag.blue   { color:#38bdf8; border-color:rgba(56,189,248,.3);   background:rgba(56,189,248,.07);  }
.utag.purple { color:#a78bfa; border-color:rgba(167,139,250,.3);  background:rgba(167,139,250,.07); }

.uh-stats {
  display:flex; flex-shrink:0;
  background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:16px; overflow:hidden;
}
.ustat { display:flex; flex-direction:column; align-items:center; padding:18px 28px; cursor:pointer; transition:.2s; border-right:1px solid rgba(255,255,255,.07); }
.ustat:last-child { border-right:none; }
.ustat:hover { background:rgba(255,255,255,.05); }
.ustat-num   { font-family:'Space Mono',monospace; font-size:22px; font-weight:700; color:#eef0fa; line-height:1; margin-bottom:5px; }
.ustat-label { font-size:11px; color:#7e8ba3; }

.uh-setting-btn {
  flex-shrink:0; display:flex; align-items:center; gap:7px; padding:9px 18px;
  border-radius:100px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.14);
  color:#c4cde2; font-family:inherit; font-size:13px; cursor:pointer; transition:.2s;
}
.uh-setting-btn:hover { border-color:rgba(255,255,255,.28); color:#eef0fa; }

/* ══ 订单状态栏 ══ */
.order-status-bar {
  display:flex; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09);
  border-radius:16px; overflow:hidden; margin-bottom:20px;
}
.ostatus { flex:1; display:flex; flex-direction:column; align-items:center; gap:7px; padding:18px 8px; cursor:pointer; transition:.2s; position:relative; border-right:1px solid rgba(255,255,255,.07); }
.ostatus:last-child { border-right:none; }
.ostatus:hover { background:rgba(255,255,255,.05); }
.ostatus.active { background:rgba(167,139,250,.1); }
.ostatus.active .ostatus-label { color:#a78bfa; }
.ostatus-icon  { font-size:22px; }
.ostatus-label { font-size:12px; color:#c4cde2; white-space:nowrap; }
.ostatus-badge { position:absolute; top:10px; right:calc(50% - 22px); background:#ff5c75; color:#fff; font-size:9px; font-weight:700; font-style:normal; min-width:16px; height:16px; border-radius:8px; display:flex; align-items:center; justify-content:center; padding:0 3px; }

.order-list { display:flex; flex-direction:column; gap:14px; }
.order-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); border-radius:var(--radius); overflow:hidden; transition:.3s; }
.order-card:hover { border-color:rgba(255,255,255,.16); }
.order-header { display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-bottom:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.03); }
.order-shop-row { display:flex; align-items:center; gap:14px; }
.order-shop { font-size:13px; font-weight:600; color:#eef0fa; }
.order-no   { font-family:'Space Mono',monospace; font-size:10px; color:#7e8ba3; }
.order-stag { font-size:11px; font-weight:600; padding:4px 11px; border-radius:100px; }
.st-pending  { color:#f0cc7a; background:rgba(240,204,122,.12); border:1px solid rgba(240,204,122,.25); }
.st-shipping { color:#38bdf8; background:rgba(56,189,248,.12);  border:1px solid rgba(56,189,248,.25);  }
.st-done     { color:#22c55e; background:rgba(34,197,94,.1);    border:1px solid rgba(34,197,94,.22);   }

.order-goods { padding:14px 18px; display:flex; flex-direction:column; gap:12px; }
.order-good  { display:flex; align-items:center; gap:14px; }
.order-good img { width:68px; height:68px; border-radius:10px; object-fit:cover; flex-shrink:0; }
.og-info { flex:1; }
.og-name { font-size:13px; color:#eef0fa; margin-bottom:4px; }
.og-sku  { font-size:11px; color:#7e8ba3; }
.og-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; }
.og-price { font-size:15px; font-weight:700; color:#a78bfa; font-family:'Space Mono',monospace; }
.og-qty   { font-size:11px; color:#7e8ba3; }

.order-footer { display:flex; justify-content:space-between; align-items:center; padding:12px 18px; border-top:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.02); }
.order-total { font-size:12px; color:#7e8ba3; }
.order-total strong { color:#eef0fa; font-family:'Space Mono',monospace; }
.order-actions { display:flex; gap:8px; }
.oa-primary { padding:7px 16px; background:#a78bfa; border:none; border-radius:100px; color:#fff; font-family:inherit; font-size:12px; font-weight:600; cursor:pointer; transition:.2s; }
.oa-primary:hover { box-shadow:0 0 14px rgba(167,139,250,.5); transform:translateY(-1px); }
.oa-default { padding:7px 16px; background:transparent; border:1px solid rgba(255,255,255,.16); border-radius:100px; color:#c4cde2; font-family:inherit; font-size:12px; cursor:pointer; transition:.2s; }
.oa-default:hover { border-color:rgba(255,255,255,.3); color:#eef0fa; }

.order-logistics { padding:16px 18px 18px; border-top:1px solid rgba(255,255,255,.07); background:rgba(167,139,250,.04); }
.logistics-title { font-size:12px; color:#a78bfa; margin-bottom:14px; font-weight:600; }
.ltrack { display:flex; gap:14px; position:relative; padding-bottom:16px; }
.ltrack:last-child { padding-bottom:0; }
.ltrack-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:3px; background:rgba(255,255,255,.15); border:2px solid rgba(255,255,255,.2); }
.ltrack.active .ltrack-dot { background:#a78bfa; border-color:#a78bfa; box-shadow:0 0 8px rgba(167,139,250,.6); }
.ltrack-line { position:absolute; left:4px; top:14px; bottom:0; width:1px; background:rgba(255,255,255,.1); }
.ltrack-desc { font-size:12px; color:#c4cde2; line-height:1.5; }
.ltrack-time { font-size:10px; color:#7e8ba3; margin-top:2px; font-family:'Space Mono',monospace; }

.expand-enter-active,.expand-leave-active { transition:all .3s ease; overflow:hidden; }
.expand-enter-from,.expand-leave-to { opacity:0; max-height:0; padding-top:0; padding-bottom:0; }
.expand-enter-to,.expand-leave-from { opacity:1; max-height:400px; }

/* ══ 钱包 ══ */
.wallet-card { position:relative; border-radius:22px; overflow:hidden; border:1px solid rgba(167,139,250,.22); background:linear-gradient(135deg,#0f1535 0%,#160d30 60%,#0a1628 100%); padding:32px 36px; display:flex; gap:40px; align-items:center; margin-bottom:20px; }
.wc-glow { position:absolute; width:300px; height:300px; border-radius:50%; top:-80px; left:-60px; background:rgba(124,111,255,.16); filter:blur(70px); pointer-events:none; }
.wc-left { flex-shrink:0; position:relative; z-index:1; }
.wc-bal-label { font-size:11px; color:#7e8ba3; letter-spacing:2px; margin-bottom:8px; font-family:'Space Mono',monospace; }
.wc-bal  { display:flex; align-items:baseline; gap:4px; margin-bottom:6px; }
.wc-unit { font-size:20px; color:#c4cde2; font-weight:300; }
.wc-num  { font-family:'Space Mono',monospace; font-size:48px; font-weight:700; color:#fff; line-height:1; text-shadow:0 0 30px rgba(167,139,250,.35); }
.wc-sub  { font-size:11px; color:#7e8ba3; margin-bottom:20px; }
.wc-btns { display:flex; gap:10px; }
.wc-btn  { padding:9px 22px; border-radius:100px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:.2s; background:transparent; border:1px solid rgba(255,255,255,.18); color:#c4cde2; }
.wc-btn.primary { background:#a78bfa; border-color:#a78bfa; color:#fff; }
.wc-btn.primary:hover { box-shadow:0 0 20px rgba(167,139,250,.55); transform:translateY(-1px); }
.wc-btn:not(.primary):hover { border-color:rgba(255,255,255,.35); color:#eef0fa; }
.wc-assets { flex:1; display:grid; grid-template-columns:repeat(4,1fr); gap:12px; position:relative; z-index:1; }
.wasset { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:16px 14px; display:flex; flex-direction:column; gap:4px; transition:.2s; cursor:pointer; }
.wasset:hover { background:rgba(255,255,255,.11); border-color:rgba(255,255,255,.2); }
.wasset-val   { font-family:'Space Mono',monospace; font-size:18px; font-weight:700; }
.wasset-label { font-size:11px; color:#7e8ba3; }
.wasset-use   { margin-top:8px; align-self:flex-start; padding:4px 10px; border-radius:100px; font-size:10px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.14); color:#c4cde2; cursor:pointer; font-family:inherit; transition:.2s; }
.wasset-use:hover { border-color:rgba(255,255,255,.3); color:#eef0fa; }

.txn-wrap { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); border-radius:var(--radius); overflow:hidden; }
.txn-topbar { display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid rgba(255,255,255,.07); }
.txn-title { font-size:14px; font-weight:600; color:#eef0fa; }
.txn-filters { display:flex; gap:4px; }
.txn-f { padding:5px 13px; border-radius:100px; font-family:inherit; font-size:11px; background:transparent; border:1px solid rgba(255,255,255,.1); color:#7e8ba3; cursor:pointer; transition:.2s; }
.txn-f.active { background:rgba(167,139,250,.15); border-color:#a78bfa; color:#a78bfa; }
.txn-f:hover:not(.active) { border-color:rgba(255,255,255,.22); color:#c4cde2; }
.txn-list { display:flex; flex-direction:column; }
.txn-item { display:flex; align-items:center; gap:14px; padding:14px 20px; border-bottom:1px solid rgba(255,255,255,.05); transition:.2s; }
.txn-item:last-child { border-bottom:none; }
.txn-item:hover { background:rgba(255,255,255,.03); }
.txn-icon { width:38px; height:38px; border-radius:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:16px; }
.txn-icon.income  { background:rgba(34,197,94,.1); }
.txn-icon.expense { background:rgba(255,92,117,.1); }
.txn-info { flex:1; }
.txn-name { font-size:13px; color:#eef0fa; margin-bottom:3px; }
.txn-time { font-size:10px; color:#7e8ba3; font-family:'Space Mono',monospace; }
.txn-amt  { font-family:'Space Mono',monospace; font-size:15px; font-weight:700; }
.txn-amt.income  { color:#22c55e; }
.txn-amt.expense { color:#ff8099; }

/* ══ 历史浏览 ══ */
.history-bar-right { display:flex; align-items:center; margin-left:auto; }
.hdate-tabs { display:flex; gap:4px; }
.hdate { padding:5px 12px; border-radius:100px; font-family:inherit; font-size:11px; background:transparent; border:1px solid rgba(255,255,255,.1); color:#7e8ba3; cursor:pointer; transition:.2s; }
.hdate.active { background:rgba(167,139,250,.15); border-color:#a78bfa; color:#a78bfa; }
.hdate:hover:not(.active) { border-color:rgba(255,255,255,.22); color:#c4cde2; }

.history-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:14px; }
.hcard { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09); border-radius:14px; overflow:hidden; transition:.3s; cursor:pointer; }
.hcard:hover { border-color:rgba(255,255,255,.2); transform:translateY(-5px); box-shadow:0 14px 28px rgba(0,0,0,.4),var(--glow); }
.hcard-media { position:relative; overflow:hidden; }
.hcard-media img { width:100%; aspect-ratio:3/4; object-fit:cover; display:block; transition:.4s; }
.hcard:hover .hcard-media img { transform:scale(1.05); }
.hcard-del { position:absolute; top:7px; right:7px; width:22px; height:22px; border-radius:50%; background:rgba(7,9,26,.7); border:1px solid rgba(255,255,255,.15); color:#c4cde2; font-size:9px; cursor:pointer; transition:.2s; display:flex; align-items:center; justify-content:center; opacity:0; }
.hcard:hover .hcard-del { opacity:1; }
.hcard-del:hover { background:rgba(255,92,117,.3); border-color:#ff5c75; color:#ff8099; }
.hcard-time { position:absolute; bottom:7px; left:7px; background:rgba(7,9,26,.7); color:#7e8ba3; font-size:9px; padding:2px 7px; border-radius:100px; font-family:'Space Mono',monospace; }
.hcard-body { padding:10px 11px; }
.hcard-name { font-size:11px; color:#c4cde2; line-height:1.4; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.hcard-foot  { display:flex; justify-content:space-between; align-items:center; }
.hcard-price { font-size:13px; font-weight:700; color:#a78bfa; font-family:'Space Mono',monospace; }
.hcard-cart  { padding:4px 10px; background:#a78bfa; border:none; border-radius:100px; color:#fff; font-family:inherit; font-size:10px; font-weight:600; cursor:pointer; transition:.2s; }
.hcard-cart:hover { box-shadow:0 0 10px rgba(167,139,250,.5); }

/* ══ 收藏 ══ */
.fav-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.fav-card { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09); border-radius:var(--radius); overflow:hidden; transition:.3s; cursor:pointer; }
.fav-card:hover { border-color:rgba(255,255,255,.2); transform:translateY(-6px); box-shadow:0 16px 32px rgba(0,0,0,.4),var(--glow); }
.fav-media { position:relative; overflow:hidden; }
.fav-media img { width:100%; aspect-ratio:4/5; object-fit:cover; display:block; transition:.4s; }
.fav-card:hover .fav-media img { transform:scale(1.05); }
.fav-heart { position:absolute; top:10px; right:10px; width:30px; height:30px; border-radius:50%; background:rgba(7,9,26,.6); border:1px solid rgba(255,92,117,.4); color:#ff5c75; font-size:14px; cursor:pointer; transition:.2s; display:flex; align-items:center; justify-content:center; }
.fav-heart:hover { background:rgba(255,92,117,.2); }
.fav-body  { padding:12px 14px; }
.fav-name  { font-size:13px; color:#c4cde2; line-height:1.45; margin-bottom:10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.fav-foot  { display:flex; justify-content:space-between; align-items:center; }
.fav-price { font-size:16px; font-weight:700; color:#a78bfa; font-family:'Space Mono',monospace; }
.fav-buy   { padding:6px 14px; background:transparent; border:1px solid rgba(167,139,250,.35); border-radius:100px; color:#a78bfa; font-family:inherit; font-size:11px; cursor:pointer; transition:.2s; }
.fav-buy:hover { background:rgba(167,139,250,.15); }

/* ══ 工具 ══ */
.tools-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.tool-card { display:flex; align-items:center; gap:14px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.09); border-radius:16px; padding:18px 16px; cursor:pointer; transition:.3s; position:relative; overflow:hidden; }
.tool-card::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 0% 50%, var(--tc), transparent 65%); opacity:0; transition:.3s; }
.tool-card:hover { border-color:rgba(255,255,255,.18); transform:translateY(-3px); }
.tool-card:hover::before { opacity:.12; }
.tool-icon  { font-size:24px; flex-shrink:0; position:relative; z-index:1; }
.tool-info  { flex:1; display:flex; flex-direction:column; gap:2px; position:relative; z-index:1; }
.tool-name  { font-size:13px; font-weight:600; color:#eef0fa; }
.tool-desc  { font-size:11px; color:#7e8ba3; }
.tool-arrow { color:#7e8ba3; flex-shrink:0; position:relative; z-index:1; transition:.2s; }
.tool-card:hover .tool-arrow { color:#a78bfa; transform:translateX(3px); }
.tool-badge { position:absolute; top:10px; right:10px; z-index:2; background:#ff5c75; color:#fff; font-size:9px; font-weight:700; font-style:normal; padding:2px 6px; border-radius:100px; }

/* ══ 会员 ══ */
.member-card { position:relative; border-radius:22px; overflow:hidden; border:1px solid rgba(240,204,122,.2); background:linear-gradient(135deg,#12100a 0%,#1a1306 60%,#0f1020 100%); padding:32px 36px; display:flex; gap:48px; }
.mc-glow { position:absolute; width:280px; height:280px; border-radius:50%; top:-80px; left:-60px; background:rgba(240,204,122,.1); filter:blur(70px); pointer-events:none; }
.mc-left { flex:1; position:relative; z-index:1; }
.mc-badge-row { display:flex; align-items:center; gap:16px; margin-bottom:28px; }
.mc-badge-icon { width:56px; height:56px; border-radius:16px; background:linear-gradient(135deg,#c8a84b,#f0cc7a); display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:0 0 24px rgba(240,204,122,.38); }
.mc-level   { font-size:18px; font-weight:700; color:#f0cc7a; margin-bottom:4px; }
.mc-exp-txt { font-family:'Space Mono',monospace; font-size:12px; color:#7e8ba3; }
.mc-progress-wrap { margin-bottom:20px; }
.mc-bar { height:6px; background:rgba(255,255,255,.08); border-radius:10px; overflow:hidden; margin-bottom:8px; }
.mc-fill { height:100%; position:relative; background:linear-gradient(90deg,#c8a84b,#f0cc7a,#fde68a); border-radius:10px; }
.mc-fill-dot { position:absolute; right:0; top:50%; transform:translateY(-50%); width:12px; height:12px; border-radius:50%; background:#f0cc7a; box-shadow:0 0 10px rgba(240,204,122,.9); }
.mc-bar-labels { display:flex; justify-content:space-between; font-size:10px; color:#7e8ba3; font-family:'Space Mono',monospace; }
.mc-perks { display:flex; gap:8px; flex-wrap:wrap; }
.mc-perk  { font-size:11px; color:#c8a84b; padding:4px 11px; border-radius:100px; border:1px solid rgba(240,204,122,.2); background:rgba(240,204,122,.06); }
.mc-right { flex-shrink:0; width:240px; display:flex; flex-direction:column; gap:8px; position:relative; z-index:1; }
.mc-lvl { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:11px; border:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.03); transition:.2s; }
.mc-lvl.passed  { opacity:.45; }
.mc-lvl.current { border-color:rgba(240,204,122,.3); background:rgba(240,204,122,.07); }
.mc-lvl-icon { font-size:16px; flex-shrink:0; width:22px; text-align:center; }
.mc-lvl-info { flex:1; display:flex; justify-content:space-between; }
.mc-lvl-name { font-size:12px; color:#eef0fa; font-weight:500; }
.mc-lvl-req  { font-size:10px; color:#7e8ba3; font-family:'Space Mono',monospace; }
.mc-check    { color:#22c55e; font-size:12px; font-weight:700; }
.mc-cur-tag  { font-size:9px; color:#f0cc7a; font-weight:700; padding:2px 7px; border-radius:100px; background:rgba(240,204,122,.15); border:1px solid rgba(240,204,122,.3); }

/* ══ 地址 ══ */
.address-list { display:flex; flex-direction:column; gap:12px; }
.addr-card { display:flex; align-items:center; gap:24px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); border-radius:16px; padding:18px 22px; position:relative; transition:.2s; }
.addr-card.is-default { border-color:rgba(167,139,250,.25); background:rgba(167,139,250,.05); }
.addr-default-tag { position:absolute; top:14px; right:18px; font-size:10px; color:#a78bfa; font-weight:600; padding:3px 9px; border-radius:100px; background:rgba(167,139,250,.15); border:1px solid rgba(167,139,250,.3); }
.addr-main { flex:1; }
.addr-name-row { display:flex; align-items:center; gap:12px; margin-bottom:6px; }
.addr-name  { font-size:15px; font-weight:600; color:#eef0fa; }
.addr-phone { font-size:13px; color:#7e8ba3; font-family:'Space Mono',monospace; }
.addr-full  { font-size:13px; color:#c4cde2; line-height:1.5; }
.addr-actions { display:flex; gap:8px; flex-shrink:0; }
.addr-btn { padding:6px 14px; border-radius:100px; font-family:inherit; font-size:12px; background:transparent; border:1px solid rgba(255,255,255,.15); color:#c4cde2; cursor:pointer; transition:.2s; }
.addr-btn:hover { border-color:rgba(255,255,255,.3); color:#eef0fa; }
.addr-btn.del { border-color:rgba(255,92,117,.2); color:#ff8099; }
.addr-btn.del:hover { border-color:#ff5c75; background:rgba(255,92,117,.08); }

/* ══ 安全 ══ */
.security-list { display:flex; flex-direction:column; gap:10px; }
.sec-item { display:flex; align-items:center; gap:16px; padding:18px 22px; border-radius:14px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); transition:.2s; }
.sec-item:hover { border-color:rgba(255,255,255,.14); background:rgba(255,255,255,.06); }
.sec-icon  { font-size:22px; flex-shrink:0; width:28px; text-align:center; }
.sec-info  { flex:1; }
.sec-name  { font-size:13px; font-weight:600; color:#eef0fa; margin-bottom:3px; }
.sec-desc  { font-size:11px; color:#7e8ba3; }
.sec-right { display:flex; align-items:center; gap:14px; flex-shrink:0; }
.sec-status { font-size:11px; font-weight:600; padding:3px 10px; border-radius:100px; }
.sec-status.ok   { color:#22c55e; background:rgba(34,197,94,.1);  border:1px solid rgba(34,197,94,.22);  }
.sec-status.warn { color:#ff8099; background:rgba(255,92,117,.1); border:1px solid rgba(255,92,117,.2);  }
.sec-btn { padding:7px 16px; border-radius:100px; font-family:inherit; font-size:12px; background:transparent; border:1px solid rgba(255,255,255,.16); color:#c4cde2; cursor:pointer; transition:.2s; white-space:nowrap; }
.sec-btn:hover { border-color:#a78bfa; color:#c4b0ff; }

/* ── 响应式 ── */
@media (max-width:1200px) {
  .history-grid { grid-template-columns:repeat(4,1fr); }
  .tools-grid   { grid-template-columns:repeat(3,1fr); }
  .wc-assets    { grid-template-columns:repeat(2,1fr); }
}
@media (max-width:960px) {
  .section-block { padding: 0 24px; }
  .uh-inner      { padding: 28px 24px; flex-wrap:wrap; }
  .uh-stats      { width:100%; }
  .history-grid  { grid-template-columns:repeat(3,1fr); }
  .fav-grid      { grid-template-columns:repeat(3,1fr); }
  .tools-grid    { grid-template-columns:repeat(2,1fr); }
  .wallet-card   { flex-direction:column; padding:24px; }
  .wc-assets     { grid-template-columns:repeat(4,1fr); }
  .member-card   { flex-direction:column; padding:24px; gap:24px; }
  .mc-right      { width:100%; }
}
@media (max-width:640px) {
  .section-block { padding: 0 16px; }
  .uh-inner      { padding: 20px 16px; }
  .history-grid  { grid-template-columns:repeat(2,1fr); }
  .fav-grid      { grid-template-columns:repeat(2,1fr); }
  .tools-grid    { grid-template-columns:repeat(2,1fr); }
  .wc-assets     { grid-template-columns:repeat(2,1fr); }
  .ustat         { flex:1; min-width:calc(50% - 1px); }
  .order-status-bar { flex-wrap:wrap; }
  .ostatus       { min-width:calc(33% - 1px); }
}
</style>