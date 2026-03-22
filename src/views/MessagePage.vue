<template>
    <div class="msg-page">
  
      <!-- ══ 顶部导航 ══ -->
      <header class="msg-nav">
        <div class="mn-inner">
          <button class="mn-back" @click="$router.push('/home')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            返回
          </button>
          <span class="mn-title">消息中心</span>
          <span class="mn-badge" v-if="totalUnread > 0">{{ totalUnread }} 条未读</span>
        </div>
      </header>
  
      <div class="msg-body">
  
        <!-- ══ 左侧会话列表 ══ -->
        <div class="conv-list">
          <div class="cl-head">
            <span class="cl-title">全部会话</span>
            <button class="cl-clear" @click="markAllRead">全部已读</button>
          </div>
  
          <!-- 搜索 -->
          <div class="cl-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input v-model="searchKw" placeholder="搜索商家…" />
          </div>
  
          <!-- 会话列表 -->
          <div class="cl-items">
            <div
              v-for="conv in filteredConvs"
              :key="conv.id"
              :class="['cl-item', { active: activeConv?.id === conv.id }]"
              @click="selectConv(conv)"
            >
              <div class="cl-avatar-wrap">
                <div class="cl-avatar" :style="{ background: conv.color }">{{ conv.name[0] }}</div>
                <span class="cl-online" v-if="conv.online"></span>
              </div>
              <div class="cl-info">
                <div class="cl-row1">
                  <span class="cl-name">{{ conv.name }}</span>
                  <span class="cl-time">{{ conv.lastTime }}</span>
                </div>
                <div class="cl-row2">
                  <span class="cl-last">{{ conv.lastMsg }}</span>
                  <span class="cl-unread" v-if="conv.unread > 0">{{ conv.unread }}</span>
                </div>
              </div>
            </div>
            <div v-if="filteredConvs.length === 0" class="cl-empty">没有找到相关会话</div>
          </div>
        </div>
  
        <!-- ══ 右侧聊天区 ══ -->
        <div class="chat-area" v-if="activeConv">
  
          <!-- 聊天头部 -->
          <div class="chat-head">
            <div class="ch-left">
              <div class="ch-avatar" :style="{ background: activeConv.color }">{{ activeConv.name[0] }}</div>
              <div class="ch-info">
                <span class="ch-name">{{ activeConv.name }}</span>
                <span class="ch-status" :class="{ online: activeConv.online }">
                  {{ activeConv.online ? '● 在线 · 通常5分钟内回复' : '○ 离线' }}
                </span>
              </div>
            </div>
            <div class="ch-actions">
              <button class="ch-btn" title="电话">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.7a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
              <button class="ch-btn" title="更多">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
            </div>
          </div>
  
          <!-- 关联订单卡片 -->
          <div class="order-card" v-if="activeConv.order">
            <div class="oc-label">咨询关联订单</div>
            <div class="oc-body">
              <div class="oc-img"></div>
              <div class="oc-info">
                <p class="oc-name">{{ activeConv.order.name }}</p>
                <p class="oc-no">订单号：{{ activeConv.order.no }}</p>
              </div>
              <span class="oc-status" :class="activeConv.order.statusClass">{{ activeConv.order.status }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
  
          <!-- 消息列表 -->
          <div class="msg-list" ref="msgListRef">
            <div
              v-for="msg in activeConv.messages"
              :key="msg.id"
              :class="['msg-row', msg.from === 'me' ? 'me' : 'them']"
            >
              <!-- 时间分隔 -->
              <div class="msg-time-sep" v-if="msg.showTime">{{ msg.time }}</div>
  
              <!-- 消息气泡 -->
              <div class="msg-bubble-wrap">
                <div class="msg-av" v-if="msg.from !== 'me'" :style="{ background: activeConv.color }">
                  {{ activeConv.name[0] }}
                </div>
                <div class="msg-av me-av" v-if="msg.from === 'me'">我</div>
  
                <div class="msg-content">
                  <!-- 文字消息 -->
                  <div class="msg-bubble" :class="msg.from" v-if="msg.type === 'text'">
                    {{ msg.content }}
                  </div>
                  <!-- 图片消息 -->
                  <div class="msg-img-wrap" v-if="msg.type === 'image'">
                    <img :src="msg.content" class="msg-img" />
                  </div>
                  <!-- 系统消息：订单卡片 -->
                  <div class="msg-order-card" v-if="msg.type === 'order'">
                    <div class="moc-head">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A07830" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                      订单信息
                    </div>
                    <p class="moc-name">{{ msg.orderName }}</p>
                    <p class="moc-no">{{ msg.orderNo }}</p>
                    <span class="moc-status">{{ msg.orderStatus }}</span>
                  </div>
                  <!-- 已读状态 -->
                  <span class="msg-read" v-if="msg.from === 'me'">{{ msg.read ? '已读' : '未读' }}</span>
                </div>
              </div>
            </div>
  
            <!-- 对方正在输入 -->
            <div class="typing-indicator" v-if="activeConv.typing">
              <div class="typing-av" :style="{ background: activeConv.color }">{{ activeConv.name[0] }}</div>
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
  
          <!-- 快捷问题 -->
          <div class="quick-replies">
            <button v-for="q in quickReplies" :key="q" class="qr-btn" @click="sendQuick(q)">{{ q }}</button>
          </div>
  
          <!-- 输入区 -->
          <div class="input-area">
            <div class="ia-tools">
              <button class="ia-tool" title="图片">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <button class="ia-tool" title="表情">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </button>
              <button class="ia-tool" title="商品">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </button>
              <button class="ia-tool" title="订单">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </button>
            </div>
            <div class="ia-input-wrap">
              <textarea
                v-model="inputText"
                class="ia-input"
                placeholder="输入消息，Enter 发送，Shift+Enter 换行"
                @keydown.enter.exact.prevent="sendMsg"
                rows="1"
                @input="autoResize"
                ref="inputRef"
              ></textarea>
              <button class="ia-send" :disabled="!inputText.trim()" @click="sendMsg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>
              </button>
            </div>
          </div>
        </div>
  
        <!-- 空状态 -->
        <div class="chat-empty" v-else>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p class="ce-title">选择一个会话开始聊天</p>
          <p class="ce-sub">在左侧选择商家或联系客服</p>
        </div>
  
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, nextTick, watch } from 'vue'
  
  const searchKw   = ref('')
  const inputText  = ref('')
  const msgListRef = ref(null)
  const inputRef   = ref(null)
  const activeConv = ref(null)
  
  const quickReplies = ['查询订单状态', '申请退款', '催发货', '查询物流', '换货/退货', '投诉建议']
  
  const conversations = ref([
    {
      id: 1,
      name: '云梦精选旗舰店',
      color: 'linear-gradient(135deg,#A07830,#C9A84C)',
      online: true,
      unread: 2,
      lastMsg: '您的订单已在仓库备货，预计明天发出',
      lastTime: '10:32',
      order: { name:'极简无线降噪耳机 Pro', no:'YM20260318001', status:'备货中', statusClass:'status-preparing' },
      typing: false,
      messages: [
        { id:1, from:'shop', type:'text', content:'您好！欢迎来到云梦精选旗舰店，我是专属客服小云，请问有什么可以帮您？', time:'10:20', showTime:true, read:true },
        { id:2, from:'shop', type:'order', orderName:'极简无线降噪耳机 Pro', orderNo:'订单号：YM20260318001', orderStatus:'备货中', time:'10:20', showTime:false, read:true },
        { id:3, from:'me', type:'text', content:'你好，我买的耳机什么时候发货？', time:'10:28', showTime:false, read:true },
        { id:4, from:'shop', type:'text', content:'您的订单已在仓库备货，预计明天下午发出，发出后会立即给您推送物流信息，请注意查收～', time:'10:32', showTime:false, read:true },
        { id:5, from:'me', type:'text', content:'好的，能加急处理吗？', time:'10:33', showTime:false, read:false },
      ]
    },
    {
      id: 2,
      name: '全球好物直邮',
      color: 'linear-gradient(135deg,#2C5F8A,#4A8AB0)',
      online: true,
      unread: 0,
      lastMsg: '感谢您的购买，祝您购物愉快！',
      lastTime: '昨天',
      order: { name:'香氛扩香石套装礼盒', no:'YM20260317008', status:'已发货', statusClass:'status-shipped' },
      typing: false,
      messages: [
        { id:1, from:'shop', type:'text', content:'您好！感谢选择全球好物直邮，有任何问题请随时联系我们！', time:'昨天 14:00', showTime:true, read:true },
        { id:2, from:'me', type:'text', content:'我的香氛礼盒发货了吗？', time:'昨天 15:22', showTime:false, read:true },
        { id:3, from:'shop', type:'text', content:'您的订单已于昨天上午从广州仓发出，预计后天送达，快递单号：SF1234567890，可直接查询顺丰物流。', time:'昨天 15:30', showTime:false, read:true },
        { id:4, from:'me', type:'text', content:'好的，谢谢！', time:'昨天 15:32', showTime:false, read:true },
        { id:5, from:'shop', type:'text', content:'感谢您的购买，祝您购物愉快！如有任何问题欢迎随时联系～', time:'昨天 15:33', showTime:false, read:true },
      ]
    },
    {
      id: 3,
      name: '数码旗舰专区',
      color: 'linear-gradient(135deg,#6B4CA0,#9B6FD0)',
      online: false,
      unread: 1,
      lastMsg: '您好，请问有什么可以帮您？',
      lastTime: '周一',
      order: null,
      typing: false,
      messages: [
        { id:1, from:'shop', type:'text', content:'您好，欢迎光临数码旗舰专区！请问有什么可以帮您？', time:'周一 09:15', showTime:true, read:true },
        { id:2, from:'me', type:'text', content:'这款耳机支持aptX HD吗？', time:'周一 09:18', showTime:false, read:true },
      ]
    },
    {
      id: 4,
      name: '云梦官方客服',
      color: 'linear-gradient(135deg,#A07830,#C9A84C)',
      online: true,
      unread: 0,
      lastMsg: '您的投诉已受理，我们会在24小时内处理',
      lastTime: '上周',
      order: null,
      typing: false,
      messages: [
        { id:1, from:'shop', type:'text', content:'您好！我是云梦官方客服，有任何平台问题都可以联系我。', time:'上周三 10:00', showTime:true, read:true },
        { id:2, from:'me', type:'text', content:'我要投诉一个商家发货慢的问题', time:'上周三 10:05', showTime:false, read:true },
        { id:3, from:'shop', type:'text', content:'非常抱歉给您带来不好的体验！您的投诉已受理，编号：CP2026031501，我们会在24小时内处理并给您反馈。', time:'上周三 10:08', showTime:false, read:true },
      ]
    },
  ])
  
  const filteredConvs = computed(() => {
    if (!searchKw.value.trim()) return conversations.value
    return conversations.value.filter(c => c.name.includes(searchKw.value.trim()))
  })
  
  const totalUnread = computed(() => conversations.value.reduce((s, c) => s + c.unread, 0))
  
  const selectConv = (conv) => {
    activeConv.value = conv
    conv.unread = 0
    nextTick(() => scrollToBottom())
  }
  
  const markAllRead = () => {
    conversations.value.forEach(c => c.unread = 0)
  }
  
  const scrollToBottom = () => {
    if (msgListRef.value) {
      msgListRef.value.scrollTop = msgListRef.value.scrollHeight
    }
  }
  
  const autoResize = () => {
    if (!inputRef.value) return
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 120) + 'px'
  }
  
  const sendMsg = () => {
    if (!inputText.value.trim() || !activeConv.value) return
    const text = inputText.value.trim()
    activeConv.value.messages.push({
      id: Date.now(), from:'me', type:'text', content: text,
      time: new Date().toLocaleTimeString('zh-CN', { hour:'2-digit', minute:'2-digit' }),
      showTime: false, read: false,
    })
    activeConv.value.lastMsg = text
    activeConv.value.lastTime = '刚刚'
    inputText.value = ''
    if (inputRef.value) inputRef.value.style.height = 'auto'
    nextTick(() => scrollToBottom())
  
    // 模拟客服回复
    activeConv.value.typing = true
    setTimeout(() => {
      if (!activeConv.value) return
      activeConv.value.typing = false
      activeConv.value.messages.push({
        id: Date.now() + 1, from:'shop', type:'text',
        content: getAutoReply(text),
        time: new Date().toLocaleTimeString('zh-CN', { hour:'2-digit', minute:'2-digit' }),
        showTime: false, read: true,
      })
      nextTick(() => scrollToBottom())
    }, 1500 + Math.random() * 1000)
  }
  
  const sendQuick = (q) => {
    inputText.value = q
    sendMsg()
  }
  
  const getAutoReply = (text) => {
    if (text.includes('退款') || text.includes('退货')) return '您好，申请退款请进入"我的订单"页面，点击对应订单选择"申请退款"，我们会在1-3个工作日内处理。如需帮助请告知！'
    if (text.includes('物流') || text.includes('快递')) return '您的物流信息：顺丰快递，单号SF1234567890，当前状态：运输中，预计明天送达。'
    if (text.includes('发货') || text.includes('加急')) return '收到！我已向仓库申请加急处理，会尽快为您发出，给您带来不便非常抱歉！'
    if (text.includes('换货') || text.includes('换货')) return '申请换货需要提供商品照片和问题描述，请问您的商品遇到了什么问题？'
    if (text.includes('投诉')) return '非常抱歉给您带来不好的体验！您的反馈已记录，编号：CP' + Date.now().toString().slice(-8) + '，我们会认真处理。'
    return '收到您的消息！请稍等，我查看一下您的情况，马上为您处理～'
  }
  
  // 默认选中第一个
  selectConv(conversations.value[0])
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  .msg-page {
    background: #F5F2EC;
    min-height: 100vh;
    font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
    color: #1A1A18;
    display: flex;
    flex-direction: column;
  }
  
  /* ══ 顶部导航 ══ */
  .msg-nav {
    background: rgba(250,250,248,0.97);
    border-bottom: 1px solid #E0D8C8;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    flex-shrink: 0;
  }
  .mn-inner {
    max-width: 1320px; margin: 0 auto; padding: 0 40px;
    height: 58px; display: flex; align-items: center; gap: 16px;
  }
  .mn-back {
    display: flex; align-items: center; gap: 6px;
    background: none; border: 1px solid #E0D8C8; border-radius: 100px;
    color: #4A4438; font-family: inherit; font-size: 13px;
    padding: 6px 14px; cursor: pointer; transition: .2s;
  }
  .mn-back:hover { border-color: #C9A84C; color: #A07830; }
  .mn-title { font-size: 16px; font-weight: 500; color: #1A1A18; }
  .mn-badge {
    font-size: 12px; color: #FFF;
    background: linear-gradient(135deg, #A07830, #C9A84C);
    padding: 3px 10px; border-radius: 100px;
  }
  
  /* ══ 主体 ══ */
  .msg-body {
    flex: 1; display: grid; grid-template-columns: 300px 1fr;
    max-width: 1320px; width: 100%; margin: 24px auto;
    padding: 0 40px; gap: 16px;
    align-items: flex-start;
    min-height: calc(100vh - 58px - 48px);
  }
  
  /* ══ 左侧会话列表 ══ */
  .conv-list {
    background: #FFF; border: 1px solid #E0D8C8;
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    display: flex; flex-direction: column;
    height: calc(100vh - 58px - 48px);
  }
  .cl-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; border-bottom: 1px solid #F0EAE0;
    background: #FAFAF8; flex-shrink: 0;
  }
  .cl-title { font-size: 14px; font-weight: 500; color: #1A1A18; }
  .cl-clear {
    font-size: 12px; color: #8A8070; background: none; border: none;
    cursor: pointer; font-family: inherit; transition: .2s;
  }
  .cl-clear:hover { color: #A07830; }
  
  .cl-search {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; border-bottom: 1px solid #F0EAE0;
    background: #FAFAF8; flex-shrink: 0;
  }
  .cl-search svg { color: #8A8070; flex-shrink: 0; }
  .cl-search input {
    flex: 1; border: none; outline: none; background: none;
    font-family: inherit; font-size: 13px; color: #1A1A18;
  }
  .cl-search input::placeholder { color: #B0A898; }
  
  .cl-items { flex: 1; overflow-y: auto; }
  .cl-items::-webkit-scrollbar { width: 3px; }
  .cl-items::-webkit-scrollbar-thumb { background: #E0D8C8; border-radius: 2px; }
  
  .cl-item {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 18px; cursor: pointer; transition: .2s;
    border-bottom: 1px solid #F5F2EC;
  }
  .cl-item:hover { background: #FAFAF8; }
  .cl-item.active { background: rgba(201,168,76,0.06); border-left: 3px solid #C9A84C; padding-left: 15px; }
  
  .cl-avatar-wrap { position: relative; flex-shrink: 0; }
  .cl-avatar {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 500; color: #FFF;
  }
  .cl-online {
    position: absolute; bottom: -1px; right: -1px;
    width: 11px; height: 11px; border-radius: 50%;
    background: #27AE60; border: 2px solid #FFF;
  }
  
  .cl-info { flex: 1; min-width: 0; }
  .cl-row1 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
  .cl-name { font-size: 13px; font-weight: 500; color: #1A1A18; }
  .cl-time { font-size: 10px; color: #B0A898; flex-shrink: 0; }
  .cl-row2 { display: flex; justify-content: space-between; align-items: center; }
  .cl-last { font-size: 12px; color: #8A8070; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
  .cl-unread {
    flex-shrink: 0; min-width: 18px; height: 18px; border-radius: 9px;
    background: #C0392B; color: #FFF; font-size: 10px; font-weight: 600;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px; margin-left: 6px;
  }
  .cl-empty { padding: 32px; text-align: center; font-size: 13px; color: #8A8070; }
  
  /* ══ 聊天区 ══ */
  .chat-area {
    background: #FFF; border: 1px solid #E0D8C8;
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    display: flex; flex-direction: column;
    height: calc(100vh - 58px - 48px);
  }
  
  /* 聊天头部 */
  .chat-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid #F0EAE0;
    background: #FAFAF8; flex-shrink: 0;
  }
  .ch-left { display: flex; align-items: center; gap: 12px; }
  .ch-avatar {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 500; color: #FFF; flex-shrink: 0;
  }
  .ch-info { display: flex; flex-direction: column; gap: 2px; }
  .ch-name   { font-size: 15px; font-weight: 500; color: #1A1A18; }
  .ch-status { font-size: 11px; color: #B0A898; }
  .ch-status.online { color: #27AE60; }
  .ch-actions { display: flex; gap: 8px; }
  .ch-btn {
    width: 32px; height: 32px; border-radius: 8px;
    background: #F5F2EC; border: 1px solid #E0D8C8;
    color: #8A8070; cursor: pointer; transition: .2s;
    display: flex; align-items: center; justify-content: center;
  }
  .ch-btn:hover { border-color: #C9A84C; color: #A07830; }
  
  /* 关联订单 */
  .order-card {
    padding: 10px 20px; border-bottom: 1px solid #F0EAE0;
    background: #FFFBF5; flex-shrink: 0;
  }
  .oc-label { font-size: 10px; color: #A07830; font-weight: 500; margin-bottom: 7px; letter-spacing: 0.5px; }
  .oc-body {
    display: flex; align-items: center; gap: 10px;
    background: #FFF; border: 1px solid rgba(201,168,76,0.25);
    border-radius: 9px; padding: 8px 12px; cursor: pointer; transition: .2s;
  }
  .oc-body:hover { border-color: #C9A84C; }
  .oc-img { width: 36px; height: 36px; background: #EDE8DC; border-radius: 6px; flex-shrink: 0; }
  .oc-info { flex: 1; min-width: 0; }
  .oc-name { font-size: 12px; font-weight: 500; color: #1A1A18; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
  .oc-no   { font-size: 10px; color: #8A8070; }
  .oc-status { font-size: 10px; padding: 3px 8px; border-radius: 100px; flex-shrink: 0; }
  .status-preparing { color: #A07830; background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25); }
  .status-shipped   { color: #27AE60; background: rgba(39,174,96,0.08); border: 1px solid rgba(39,174,96,0.2); }
  .status-delivered { color: #2C5F8A; background: rgba(44,95,138,0.08); border: 1px solid rgba(44,95,138,0.2); }
  
  /* 消息列表 */
  .msg-list {
    flex: 1; overflow-y: auto; padding: 16px 20px;
    display: flex; flex-direction: column; gap: 4px;
    background: #FAFAF8;
  }
  .msg-list::-webkit-scrollbar { width: 3px; }
  .msg-list::-webkit-scrollbar-thumb { background: #E0D8C8; border-radius: 2px; }
  
  .msg-time-sep {
    text-align: center; font-size: 11px; color: #B0A898;
    margin: 10px 0 6px;
  }
  .msg-row { display: flex; flex-direction: column; }
  .msg-bubble-wrap {
    display: flex; align-items: flex-end; gap: 8px; margin-bottom: 8px;
  }
  .msg-row.me .msg-bubble-wrap { flex-direction: row-reverse; }
  
  .msg-av {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 500; color: #FFF;
  }
  .me-av { background: #EDE8DC; color: #8A8070; }
  
  .msg-content { display: flex; flex-direction: column; gap: 3px; max-width: 70%; }
  .msg-row.me .msg-content { align-items: flex-end; }
  
  .msg-bubble {
    padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.6;
    word-break: break-word;
  }
  .msg-bubble.shop {
    background: #FFF; border: 1px solid #E0D8C8;
    border-radius: 14px 14px 14px 3px; color: #4A4438;
  }
  .msg-bubble.me {
    background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.28);
    border-radius: 14px 14px 3px 14px; color: #4A4438;
  }
  .msg-img-wrap img.msg-img {
    max-width: 200px; border-radius: 10px; display: block;
    border: 1px solid #E0D8C8;
  }
  .msg-order-card {
    background: #FFF; border: 1px solid rgba(201,168,76,0.25);
    border-radius: 12px; padding: 12px 14px; min-width: 200px;
  }
  .moc-head {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; color: #A07830; font-weight: 500;
    margin-bottom: 7px;
  }
  .moc-name   { font-size: 12px; font-weight: 500; color: #1A1A18; margin-bottom: 3px; }
  .moc-no     { font-size: 10px; color: #8A8070; margin-bottom: 7px; }
  .moc-status {
    font-size: 10px; color: #A07830;
    background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25);
    padding: 2px 8px; border-radius: 100px;
  }
  .msg-read { font-size: 10px; color: #B0A898; }
  
  /* 正在输入 */
  .typing-indicator { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .typing-av {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: #FFF;
  }
  .typing-dots {
    display: flex; align-items: center; gap: 4px;
    background: #FFF; border: 1px solid #E0D8C8;
    border-radius: 14px 14px 14px 3px;
    padding: 10px 14px;
  }
  .typing-dots span {
    width: 6px; height: 6px; border-radius: 50%; background: #C9A84C;
    animation: typing 1.2s ease-in-out infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: .2s; }
  .typing-dots span:nth-child(3) { animation-delay: .4s; }
  @keyframes typing { 0%,60%,100%{opacity:.2;transform:scale(.8)} 30%{opacity:1;transform:scale(1)} }
  
  /* 快捷回复 */
  .quick-replies {
    display: flex; gap: 7px; padding: 10px 20px;
    border-top: 1px solid #F0EAE0; flex-wrap: wrap;
    background: #FAFAF8; flex-shrink: 0;
  }
  .qr-btn {
    font-size: 11px; color: #A07830;
    background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25);
    padding: 5px 12px; border-radius: 100px; cursor: pointer; transition: .2s;
    font-family: inherit; white-space: nowrap;
  }
  .qr-btn:hover { background: rgba(201,168,76,0.15); border-color: #C9A84C; }
  
  /* 输入区 */
  .input-area { border-top: 1px solid #E0D8C8; background: #FFF; flex-shrink: 0; }
  .ia-tools {
    display: flex; gap: 4px; padding: 10px 16px 6px;
    border-bottom: 1px solid #F5F2EC;
  }
  .ia-tool {
    width: 30px; height: 30px; border-radius: 8px;
    background: none; border: 1px solid transparent;
    color: #8A8070; cursor: pointer; transition: .2s;
    display: flex; align-items: center; justify-content: center;
  }
  .ia-tool:hover { border-color: #E0D8C8; color: #4A4438; background: #F5F2EC; }
  .ia-input-wrap { display: flex; align-items: flex-end; gap: 10px; padding: 10px 16px 14px; }
  .ia-input {
    flex: 1; border: none; outline: none; background: none;
    font-family: inherit; font-size: 14px; color: #1A1A18;
    resize: none; line-height: 1.6; max-height: 120px;
    min-height: 24px;
  }
  .ia-input::placeholder { color: #B0A898; }
  .ia-send {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, #A07830, #C9A84C);
    border: none; color: #FFF; cursor: pointer; transition: .2s;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 10px rgba(160,120,48,0.3);
  }
  .ia-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 4px 14px rgba(160,120,48,0.4); }
  .ia-send:disabled { background: #E0D8C8; box-shadow: none; cursor: not-allowed; }
  
  /* 空状态 */
  .chat-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 14px; flex: 1;
    background: #FFF; border: 1px solid #E0D8C8;
    border-radius: 16px;
  }
  .ce-title { font-size: 16px; font-weight: 500; color: #1A1A18; }
  .ce-sub   { font-size: 13px; color: #8A8070; }
  
  /* ══ 响应式 ══ */
  @media (max-width: 960px) {
    .msg-body { grid-template-columns: 240px 1fr; padding: 0 20px; }
  }
  @media (max-width: 768px) {
    .msg-body { grid-template-columns: 1fr; padding: 0 16px; }
    .conv-list { height: 300px; }
    .chat-area { height: calc(100vh - 58px - 348px); }
  }
  </style>