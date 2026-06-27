<template>
  <div class="ad-root">
    <!-- ══ 侧边栏 ══ -->
    <aside class="ad-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="ads-brand" @click="activeMenu = 'overview'">
        <div class="ads-logo">
          <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
            <rect width="40" height="40" rx="10" fill="#2563EB"/>
            <path d="M10 26 Q20 12 30 26" stroke="#1A1712" stroke-width="2" fill="none" stroke-linecap="round"/>
            <circle cx="20" cy="18" r="3" fill="#1A1712"/>
          </svg>
        </div>
        <transition name="fade">
          <div v-if="!sidebarCollapsed" class="ads-brand-text">
            <span class="ads-brand-zh">云梦管理</span>
            <span class="ads-brand-en">ADMIN PANEL</span>
          </div>
        </transition>
      </div>

      <nav class="ads-nav">
        <a v-for="item in menuItems" :key="item.key"
          :class="['ads-nav-item', { active: activeMenu === item.key }]"
          @click="activeMenu = item.key">
          <component :is="item.icon" :size="18" stroke-width="1.8"/>
          <transition name="fade">
            <span v-if="!sidebarCollapsed">{{ item.label }}</span>
          </transition>
          <span v-if="item.badge && !sidebarCollapsed" class="ads-badge">{{ item.badge }}</span>
        </a>
      </nav>

      <div class="ads-bottom">
        <button class="ads-collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <ChevronLeft v-if="!sidebarCollapsed" :size="16" stroke-width="2"/>
          <ChevronRight v-else :size="16" stroke-width="2"/>
        </button>
        <a class="ads-nav-item logout" @click="handleLogout">
          <LogOut :size="18" stroke-width="1.8"/>
          <span v-if="!sidebarCollapsed">退出</span>
        </a>
      </div>
    </aside>

    <!-- ══ 主内容区 ══ -->
    <main class="ad-main">
      <!-- 顶栏 -->
      <header class="ad-topbar">
        <div class="adt-left">
          <h1 class="adt-title">{{ currentMenuLabel }}</h1>
          <span class="adt-time">{{ currentTime }}</span>
        </div>
        <div class="adt-right">
          <button class="adt-icon-btn">
            <Bell :size="18" stroke-width="1.5"/>
            <span class="adt-dot"></span>
          </button>
          <div class="adt-user">
            <div class="adt-avatar">A</div>
            <span class="adt-name">Admin</span>
          </div>
        </div>
      </header>

      <div class="ad-content">

        <!-- ═══════ 概览 ═══════ -->
        <template v-if="activeMenu === 'overview'">
          <!-- 加载中 -->
          <div v-if="overviewLoading" class="um-loading" style="padding:80px 0">
            <div class="um-spinner"></div>
            <span>数据加载中...</span>
          </div>
          <template v-else>
          <!-- 核心指标卡片 -->
          <div class="stats-row">
            <div v-for="card in statCards" :key="card.label" class="stat-card" :style="{ '--card-accent': card.accent }">
              <div class="sc-glow"></div>
              <div class="sc-top">
                <div class="sc-icon" :style="{ background: card.bg }">
                  <component :is="card.icon" :size="18" stroke-width="1.8"/>
                </div>
                <span :class="['sc-trend', card.trend > 0 ? 'up' : 'down']">
                  <TrendingUp v-if="card.trend > 0" :size="12"/>
                  <TrendingDown v-else :size="12"/>
                  {{ Math.abs(card.trend) }}%
                </span>
              </div>
              <div class="sc-value">{{ card.value }}</div>
              <div class="sc-label">{{ card.label }}</div>
              <div class="sc-sub">
                <span class="sc-delta-arr" v-if="card.trend > 0">▲</span>
                <span class="sc-delta-arr down" v-else>▼</span>
                较昨日 {{ card.delta }}
              </div>
            </div>
          </div>

          <!-- 图表+用户画像 双栏 -->
          <div class="content-grid-2">
            <!-- 收入趋势 -->
            <div class="panel chart-panel">
              <div class="panel-head">
                <h3>收入趋势</h3>
                <div class="period-tabs">
                  <button v-for="p in ['7天','30天','季度']" :key="p"
                    :class="{ active: revenuePeriod === p }" @click="revenuePeriod = p">{{ p }}</button>
                </div>
              </div>
              <div class="chart-body">
                <svg viewBox="0 0 600 220" preserveAspectRatio="none" class="revenue-chart">
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#2563EB" stop-opacity="0.2"/>
                      <stop offset="100%" stop-color="#2563EB" stop-opacity="0.02"/>
                    </linearGradient>
                  </defs>
                  <path :d="revenueAreaPath" fill="url(#revGrad)"/>
                  <path :d="revenueLinePath" fill="none" stroke="#2563EB" stroke-width="2.2"
                    stroke-linecap="round" stroke-linejoin="round"/>
                  <circle v-for="(pt, i) in revenuePoints" :key="i"
                    :cx="pt.x" :cy="pt.y" r="3.5" fill="#1A1712" stroke="#2563EB" stroke-width="2"/>
                </svg>
                <div class="chart-x-labels">
                  <span v-for="label in revenueXLabels" :key="label">{{ label }}</span>
                </div>
              </div>
            </div>

            <!-- 用户画像 -->
            <div class="panel user-portrait-panel">
              <div class="panel-head">
                <h3>用户画像</h3>
                <span class="panel-badge">实时</span>
              </div>

              <!-- 性别比例 -->
              <div class="up-section">
                <p class="up-label">性别分布</p>
                <div class="gender-row">
                  <div class="gender-bar-wrap">
                    <div class="gender-bar male" :style="{ width: userPortrait.gender.male + '%' }">
                      <span v-if="userPortrait.gender.male > 15">{{ userPortrait.gender.male }}%</span>
                    </div>
                  </div>
                  <span class="gender-icon">♂</span>
                </div>
                <div class="gender-row">
                  <div class="gender-bar-wrap">
                    <div class="gender-bar female" :style="{ width: userPortrait.gender.female + '%' }">
                      <span v-if="userPortrait.gender.female > 15">{{ userPortrait.gender.female }}%</span>
                    </div>
                  </div>
                  <span class="gender-icon female-icon">♀</span>
                </div>
              </div>

              <!-- 年龄段分布 -->
              <div class="up-section">
                <p class="up-label">年龄段分布</p>
                <div class="age-bars">
                  <div v-for="age in userPortrait.ages" :key="age.label" class="age-bar-item">
                    <span class="age-label">{{ age.label }}</span>
                    <div class="age-track">
                      <div class="age-fill" :style="{ width: age.percent + '%', background: age.color }"></div>
                    </div>
                    <span class="age-val">{{ age.percent }}%</span>
                  </div>
                </div>
              </div>

              <!-- 地域分布 TOP5 -->
              <div class="up-section">
                <p class="up-label">地域分布 TOP5</p>
                <div class="region-list">
                  <div v-for="(r, i) in userPortrait.regions" :key="r.name" class="region-item">
                    <span class="ri-rank" :class="'rank-' + (i + 1)">{{ i + 1 }}</span>
                    <span class="ri-name">{{ r.name }}</span>
                    <div class="ri-bar">
                      <div class="ri-fill" :style="{ width: r.percent + '%' }"></div>
                    </div>
                    <span class="ri-val">{{ r.percent }}%</span>
                  </div>
                </div>
              </div>

              <!-- 消费水平 -->
              <div class="up-section">
                <p class="up-label">消费水平分布</p>
                <div class="consume-donut">
                  <svg viewBox="0 0 100 100" width="100" height="100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E4E4E7" stroke-width="12"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#2563EB" stroke-width="12"
                      stroke-dasharray="138.2 251.2" stroke-dashoffset="0" transform="rotate(-90 50 50)" stroke-linecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#18181B" stroke-width="12"
                      stroke-dasharray="62.8 251.2" stroke-dashoffset="-138.2" transform="rotate(-90 50 50)" stroke-linecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#93C5FD" stroke-width="12"
                      stroke-dasharray="50.2 251.2" stroke-dashoffset="-200.9" transform="rotate(-90 50 50)" stroke-linecap="round"/>
                    <text x="50" y="46" text-anchor="middle" fill="#18181B" font-size="11" font-weight="700">消费</text>
                    <text x="50" y="60" text-anchor="middle" fill="#A1A1AA" font-size="9">水平</text>
                  </svg>
                  <div class="donut-legend">
                    <div v-for="l in consumeLevels" :key="l.label" class="dl-item">
                      <span class="dl-dot" :style="{ background: l.color }"></span>
                      <span class="dl-label">{{ l.label }}</span>
                      <span class="dl-val">{{ l.percent }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 近期订单 + 热销商品 -->
          <div class="content-grid-2">
            <div class="panel">
              <div class="panel-head">
                <h3>近期订单</h3>
                <button class="panel-link">查看全部 →</button>
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>订单号</th><th>用户</th><th>商品</th><th>金额</th><th>状态</th><th>时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="o in recentOrders" :key="o.orderNo">
                    <td class="td-mono">{{ o.orderNo }}</td>
                    <td>{{ o.user || '-' }}</td>
                    <td>{{ o.product }}</td>
                    <td class="td-price">¥{{ o.amount }}</td>
                    <td><span :class="['status-tag', o.statusClass]">{{ o.status }}</span></td>
                    <td class="td-time">{{ o.time }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="panel">
              <div class="panel-head">
                <h3>热销商品 TOP5</h3>
                <button class="panel-link">查看更多 →</button>
              </div>
              <div class="top-items">
                <div v-for="(item, i) in topProducts" :key="i" class="top-item">
                  <span class="ti-rank" :class="'tr-' + (i + 1)">{{ i + 1 }}</span>
                  <div class="ti-avatar" :style="{ background: item.color }">{{ item.name[0] }}</div>
                  <div class="ti-info">
                    <p class="ti-name">{{ item.name }}</p>
                    <p class="ti-sales">销量 {{ item.sales }}</p>
                  </div>
                  <span class="ti-revenue">¥{{ item.revenue }}</span>
                </div>
              </div>
            </div>
          </div>
          </template>
        </template>

        <!-- ═══════ 数据分析 ═══════ -->
        <template v-if="activeMenu === 'analytics'">
          <div class="panel" style="min-height:400px;display:flex;align-items:center;justify-content:center">
            <div class="empty-hint">
              <BarChart3 :size="48" stroke-width="1" style="color:#2563EB;margin-bottom:16px"/>
              <p>数据分析模块即将上线</p>
              <span>将提供多维度销售分析、流量来源、转化漏斗等深度数据</span>
            </div>
          </div>
        </template>

        <!-- ═══════ 用户管理 ═══════ -->
        <template v-if="activeMenu === 'users'">
          <!-- 搜索/筛选工具栏 -->
          <div class="panel" style="margin-bottom:16px;padding:16px 20px">
            <div class="um-toolbar">
              <div class="um-search-box">
                <Search :size="15" stroke-width="1.6" class="um-search-icon"/>
                <input
                  v-model="userKeyword"
                  type="text"
                  placeholder="搜索用户名 / 手机号 / 昵称..."
                  @keyup.enter="handleUserSearch"
                  class="um-search-input"
                />
                <button v-if="userKeyword" class="um-clear-btn" @click="userKeyword = ''; handleUserSearch()">
                  <X :size="13" stroke-width="2"/>
                </button>
              </div>
              <select v-model="userRoleFilter" @change="handleUserSearch" class="um-select">
                <option :value="null">全部角色</option>
                <option :value="0">普通用户</option>
                <option :value="1">商家</option>
                <option :value="2">管理员</option>
              </select>
              <select v-model="userStatusFilter" @change="handleUserSearch" class="um-select">
                <option :value="null">全部状态</option>
                <option :value="1">正常</option>
                <option :value="0">已禁用</option>
              </select>
              <button class="um-btn um-btn-search" @click="handleUserSearch">
                <Search :size="13" stroke-width="1.8"/>
                <span>搜索</span>
              </button>
              <button class="um-btn um-btn-reset" @click="handleUserReset">
                <RefreshCw :size="13" stroke-width="1.8"/>
                <span>重置</span>
              </button>
            </div>
          </div>

          <!-- 用户表格 -->
          <div class="panel" style="flex:1; overflow:auto; padding:0">
            <div v-if="userLoading" class="um-loading">
              <div class="um-spinner"></div>
              <span>加载中...</span>
            </div>
            <table v-else class="data-table um-table">
              <thead>
                <tr>
                  <th style="width:70px">ID</th>
                  <th>用户名</th>
                  <th>手机号</th>
                  <th>昵称</th>
                  <th style="width:90px">角色</th>
                  <th style="width:80px">状态</th>
                  <th style="width:150px">注册时间</th>
                  <th style="width:180px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="userList.length === 0 && !userLoading">
                  <td colspan="8" style="text-align:center;padding:48px;color:#9B9484">
                    <Users :size="32" stroke-width="1" style="display:block;margin:0 auto 12px;color:#2563EB"/>
                    暂无用户数据
                  </td>
                </tr>
                <tr v-for="u in userList" :key="u.id">
                  <td class="td-mono" style="font-size:11px">{{ u.id }}</td>
                  <td>
                    <div class="um-user-cell">
                      <img v-if="u.avatar" :src="u.avatar" class="um-avatar" />
                      <div v-else class="um-avatar um-avatar-placeholder">{{ (u.nickname || u.username || '?')[0] }}</div>
                      <span>{{ u.username }}</span>
                    </div>
                  </td>
                  <td class="td-mono" style="font-size:12px">{{ u.phone || '-' }}</td>
                  <td>{{ u.nickname || '-' }}</td>
                  <td>
                    <span :class="['um-role-tag', 'role-' + u.role]">
                      <Shield v-if="u.role === 2" :size="10" stroke-width="2.5"/>
                      {{ roleMap[u.role] || '未知' }}
                    </span>
                  </td>
                  <td>
                    <span :class="['um-status-tag', u.status === 1 ? 'on' : 'off']">
                      <span class="um-status-dot"></span>
                      {{ statusMap[u.status] || '未知' }}
                    </span>
                  </td>
                  <td class="td-time" style="font-size:11px">{{ u.createTime ? u.createTime.slice(0, 10) : '-' }}</td>
                  <td>
                    <div class="um-actions">
                      <button class="um-act-btn" title="查看详情" @click="openDetail(u)">
                        <Eye :size="13" stroke-width="1.6"/>
                      </button>
                      <button
                        :class="['um-act-btn', u.status === 1 ? 'danger' : 'success']"
                        :title="u.status === 1 ? '禁用' : '启用'"
                        @click="handleToggleStatus(u)"
                      >
                        <Ban v-if="u.status === 1" :size="13" stroke-width="1.6"/>
                        <UserCheck v-else :size="13" stroke-width="1.6"/>
                      </button>
                      <button
                        v-if="u.role !== 2"
                        class="um-act-btn"
                        title="切换角色"
                        @click="handleChangeRole(u)"
                      >
                        <RefreshCw :size="13" stroke-width="1.6"/>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div v-if="userPages > 1" class="um-pagination">
            <span class="ump-info">共 {{ userTotal }} 条，{{ userPages }} 页</span>
            <div class="ump-btns">
              <button
                :disabled="userPage <= 1"
                @click="handleUserPageChange(userPage - 1)"
                class="ump-btn"
              >上一页</button>
              <button
                v-for="p in Math.min(userPages, 7)"
                :key="p"
                :class="['ump-btn', { active: p === userPage }]"
                @click="handleUserPageChange(p)"
              >{{ p }}</button>
              <button
                :disabled="userPage >= userPages"
                @click="handleUserPageChange(userPage + 1)"
                class="ump-btn"
              >下一页</button>
            </div>
          </div>
        </template>

        <!-- ═══════ 商品管理 ═══════ -->
        <template v-if="activeMenu === 'products'">
          <!-- 搜索工具栏 -->
          <div class="panel" style="margin-bottom:16px;padding:16px 20px">
            <div class="um-toolbar">
              <div class="um-search-box">
                <Search :size="15" stroke-width="1.6" class="um-search-icon"/>
                <input
                  v-model="prodKeyword"
                  type="text"
                  placeholder="搜索商品名称..."
                  @keyup.enter="handleProdSearch"
                  class="um-search-input"
                />
                <button v-if="prodKeyword" class="um-clear-btn" @click="prodKeyword = ''; handleProdSearch()">
                  <X :size="13" stroke-width="2"/>
                </button>
              </div>
              <select v-model="prodAuditStatus" class="um-filter-select" @change="handleProdSearch">
                <option value="0">待审核</option>
                <option value="">全部审核</option>
                <option value="1">已通过</option>
                <option value="2">已驳回</option>
              </select>
              <select v-model="prodStatus" class="um-filter-select" @change="handleProdSearch">
                <option value="">全部上下架</option>
                <option value="1">上架中</option>
                <option value="0">已下架</option>
              </select>
              <button class="um-btn um-btn-search" @click="handleProdSearch">
                <Search :size="13" stroke-width="1.8"/>
                <span>搜索</span>
              </button>
              <button class="um-btn um-btn-reset" @click="prodKeyword = ''; prodAuditStatus = '0'; prodStatus = ''; prodPage = 1; loadProducts()">
                <RefreshCw :size="13" stroke-width="1.8"/>
                <span>重置</span>
              </button>
            </div>
          </div>

          <!-- 商品表格 -->
          <div class="panel" style="flex:1; overflow:auto; padding:0">
            <div v-if="prodLoading" class="um-loading">
              <div class="um-spinner"></div>
              <span>加载中...</span>
            </div>
            <table v-else class="data-table um-table">
              <thead>
                <tr>
                  <th style="width:72px">图片</th>
                  <th>商品名称</th>
                  <th>店铺</th>
                  <th style="width:100px">价格</th>
                  <th style="width:70px">库存</th>
                  <th style="width:70px">销量</th>
                  <th style="width:72px">审核</th>
                  <th style="width:72px">上下架</th>
                  <th style="width:120px">创建时间</th>
                  <th style="width:120px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="productList.length === 0 && !prodLoading">
                  <td colspan="10" style="text-align:center;padding:48px;color:#9B9484">
                    <Package :size="32" stroke-width="1" style="display:block;margin:0 auto 12px;color:#2563EB"/>
                    暂无商品数据
                  </td>
                </tr>
                <tr v-for="p in productList" :key="p.id">
                  <td>
                    <div class="prod-img-wrap" @click="openImageZoom(p.image || p.mainImage)">
                      <img v-if="p.image || p.mainImage" :src="p.image || p.mainImage" class="prod-img" />
                      <div v-else class="prod-img-placeholder">
                        <Package :size="16" stroke-width="1.2"/>
                      </div>
                      <div v-if="p.image || p.mainImage" class="prod-img-zoom-icon">
                        <Eye :size="12" stroke-width="2"/>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="prod-name">{{ p.name }}</span>
                  </td>
                  <td>
                    <span class="prod-shop">{{ p.shopName || p.shop?.name || '-' }}</span>
                  </td>
                  <td class="td-price">¥{{ fmtPrice(p.price) }}</td>
                  <td>{{ p.stock ?? '-' }}</td>
                  <td>{{ p.sold ?? p.salesCount ?? 0 }}</td>
                  <td>
                    <span :class="['prod-status-tag', auditClass(p.auditStatus)]">{{ auditLabel(p.auditStatus) }}</span>
                  </td>
                  <td>
                    <span :class="['prod-status-tag', p.status === 1 ? 'active' : 'inactive']">
                      {{ p.status === 1 ? '上架' : '下架' }}
                    </span>
                  </td>
                  <td class="td-time">{{ fmtDateShort(p.createTime) }}</td>
                  <td>
                    <div v-if="p.auditStatus === 0" class="prod-actions">
                      <button class="pact-btn approve" @click="handleApprove(p)" :disabled="p._acting">
                        <CheckCircle :size="13" stroke-width="1.8"/>
                        <span>{{ p._acting ? '处理中' : '通过' }}</span>
                      </button>
                      <button class="pact-btn reject" @click="handleReject(p)" :disabled="p._acting">
                        <XCircle :size="13" stroke-width="1.8"/>
                        <span>{{ p._acting ? '处理中' : '驳回' }}</span>
                      </button>
                    </div>
                    <button v-else-if="p.auditStatus === 1"
                      :class="['pact-btn', p.status === 1 ? 'reject' : 'approve']"
                      @click="handleAdminToggleStatus(p)" :disabled="p._acting"
                    >
                      {{ p._acting ? '处理中' : (p.status === 1 ? '下架' : '上架') }}
                    </button>
                    <span v-else class="prod-no-action">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div v-if="prodPages > 1" class="um-pagination">
            <span class="ump-info">共 {{ prodTotal }} 条，{{ prodPages }} 页</span>
            <div class="ump-btns">
              <button :disabled="prodPage <= 1" @click="prodPage--; loadProducts()" class="ump-btn">上一页</button>
              <button
                v-for="p in displayProdPages"
                :key="p"
                :class="['ump-btn', { active: p === prodPage }]"
                @click="prodPage = p; loadProducts()"
              >{{ p }}</button>
              <button :disabled="prodPage >= prodPages" @click="prodPage++; loadProducts()" class="ump-btn">下一页</button>
            </div>
          </div>
        </template>

        <!-- ═══════ 商家管理 ═══════ -->
        <template v-if="activeMenu === 'shops'">
          <!-- 搜索工具栏 -->
          <div class="panel" style="margin-bottom:16px;padding:16px 20px">
            <div class="um-toolbar">
              <div class="um-search-box">
                <Search :size="15" stroke-width="1.6" class="um-search-icon"/>
                <input
                  v-model="shopKeyword"
                  type="text"
                  placeholder="搜索商家名称..."
                  @keyup.enter="handleShopSearch"
                  class="um-search-input"
                />
                <button v-if="shopKeyword" class="um-clear-btn" @click="shopKeyword = ''; handleShopSearch()">
                  <X :size="13" stroke-width="2"/>
                </button>
              </div>
              <button class="um-btn um-btn-search" @click="handleShopSearch">
                <Search :size="13" stroke-width="1.8"/>
                <span>搜索</span>
              </button>
              <button class="um-btn um-btn-reset" @click="shopKeyword = ''; shopPageNum = 1; loadShops()">
                <RefreshCw :size="13" stroke-width="1.8"/>
                <span>重置</span>
              </button>
            </div>
          </div>

          <!-- 商家表格 -->
          <div class="panel" style="flex:1; overflow:auto; padding:0">
            <div v-if="shopLoading" class="um-loading">
              <div class="um-spinner"></div>
              <span>加载中...</span>
            </div>
            <table v-else class="data-table um-table">
              <thead>
                <tr>
                  <th>商家名称</th>
                  <th style="width:120px">联系人</th>
                  <th style="width:140px">电话</th>
                  <th style="width:90px">营业状态</th>
                  <th style="width:100px">商品数</th>
                  <th style="width:150px">创建时间</th>
                  <th style="width:100px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="shopList.length === 0 && !shopLoading">
                  <td colspan="7" style="text-align:center;padding:48px;color:#9B9484">
                    <Store :size="32" stroke-width="1" style="display:block;margin:0 auto 12px;color:#2563EB"/>
                    暂无商家数据
                  </td>
                </tr>
                <tr v-for="s in shopList" :key="s.id">
                  <td>
                    <span class="prod-name">{{ s.name }}</span>
                  </td>
                  <td>{{ s.contactName || s.contact || '-' }}</td>
                  <td>{{ s.phone || s.contactPhone || '-' }}</td>
                  <td>
                    <span :class="['prod-status-tag', s.status === 1 ? 'active' : 'inactive']">
                      {{ s.status === 1 ? '营业中' : '已停业' }}
                    </span>
                  </td>
                  <td>{{ s.itemCount ?? s.productCount ?? '-' }}</td>
                  <td class="td-time">{{ fmtDateShort(s.createTime) }}</td>
                  <td>
                    <button
                      :class="['pact-btn', s.status === 1 ? 'reject' : 'approve']"
                      @click="handleToggleShop(s)"
                      :disabled="s._acting"
                    >
                      {{ s._acting ? '处理中' : (s.status === 1 ? '停业' : '开业') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div v-if="shopPages > 1" class="um-pagination">
            <span class="ump-info">共 {{ shopTotal }} 条，{{ shopPages }} 页</span>
            <div class="ump-btns">
              <button :disabled="shopPageNum <= 1" @click="shopPageNum--; loadShops()" class="ump-btn">上一页</button>
              <button
                v-for="p in displayShopPages"
                :key="p"
                :class="['ump-btn', { active: p === shopPageNum }]"
                @click="shopPageNum = p; loadShops()"
              >{{ p }}</button>
              <button :disabled="shopPageNum >= shopPages" @click="shopPageNum++; loadShops()" class="ump-btn">下一页</button>
            </div>
          </div>
        </template>

        <!-- ══ 图片放大灯箱 ══ -->
        <Teleport to="body">
          <div v-if="zoomImage" class="img-zoom-overlay" @mousedown.self="zoomImage = null">
            <button class="img-zoom-close" @click="zoomImage = null"><X :size="20" stroke-width="2"/></button>
            <img :src="zoomImage" class="img-zoom-src" />
          </div>
        </Teleport>

        <!-- ═══════ 分类管理 ═══════ -->
        <template v-if="activeMenu === 'categories'">
          <div v-if="catLoading" class="um-loading" style="padding:80px 0">
            <div class="um-spinner"></div>
            <span>数据加载中...</span>
          </div>
          <template v-else>
            <!-- 顶部工具栏 -->
            <div class="panel" style="margin-bottom:16px;padding:16px 20px">
              <div class="um-toolbar">
                <span style="font-size:13px;color:var(--text-secondary);font-weight:500">
                  共 {{ catFlatList.length }} 个分类，其中一级 {{ topCats.length }} 个
                </span>
                <div style="flex:1"></div>
                <button class="um-btn um-btn-search" @click="openCatModal(null)">
                  <Plus :size="14" stroke-width="2"/> 添加一级分类
                </button>
              </div>
            </div>

            <!-- 分类列表 -->
            <div class="panel" style="padding:0;overflow:hidden">
              <div v-if="!displayList.length" class="empty-hint" style="padding:56px 20px">
                <FolderTree :size="48" stroke-width="1" style="color:#2563EB;margin-bottom:16px"/>
                <p>暂无分类数据</p>
                <span>点击上方按钮添加第一个一级分类</span>
              </div>

              <div v-for="item in displayList" :key="item.id" class="cat-group">
                <div
                  class="cat-row"
                  :class="{ 'cat-row-clickable': hasCatChildren(item.id) }"
                  :style="{ paddingLeft: 20 + item.depth * 28 + 'px' }"
                  @click="hasCatChildren(item.id) && toggleCatExpand(item.id)"
                >
                  <div class="cat-expand">
                    <template v-if="hasCatChildren(item.id)">
                      <ChevronRightIcon v-if="!expandedCats.has(item.id)" :size="14" stroke-width="2"/>
                      <ChevronDown v-else :size="14" stroke-width="2"/>
                    </template>
                    <span v-else class="cat-expand-spacer"></span>
                  </div>
                  <FolderTree v-if="item.depth === 0" :size="16" stroke-width="1.6" class="cat-icon-top"/>
                  <FolderOpen v-else :size="15" stroke-width="1.4" class="cat-icon-sub"/>
                  <span class="cat-name">{{ item.name }}</span>
                  <span v-if="hasCatChildren(item.id)" class="cat-count">{{ countCatDescendants(item.id) }} 个子分类</span>
                  <div class="cat-actions" @click.stop>
                    <button class="um-act-btn" title="添加子分类" @click="openCatModal(item)">
                      <Plus :size="13" stroke-width="1.6"/>
                    </button>
                    <button class="um-act-btn" title="编辑" @click="openCatModal(null, item)">
                      <Pencil :size="13" stroke-width="1.6"/>
                    </button>
                    <button class="um-act-btn danger" title="删除" @click="handleCatDelete(item)">
                      <Trash2 :size="13" stroke-width="1.6"/>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ══ 分类新增/编辑弹窗 ══ -->
            <transition name="modal-fade">
              <div v-if="catModalVisible" class="cat-modal-overlay" @click.self="closeCatModal">
                <div class="cat-modal">
                  <div class="catm-head">
                    <h3>{{ catEditing ? '编辑分类' : '添加分类' }}</h3>
                    <button class="umd-close" @click="closeCatModal"><X :size="18" stroke-width="1.8"/></button>
                  </div>
                  <div class="catm-body">
                    <div class="umd-field">
                      <span class="umdf-label">上级分类</span>
                      <select v-model="catForm.parentId" class="um-select" style="width:260px">
                        <option :value="null">无（作为一级分类）</option>
                        <option v-for="p in selectableParents" :key="p.id" :value="p.id">{{ p.label }}</option>
                      </select>
                    </div>
                    <div class="umd-field">
                      <span class="umdf-label">分类名称 <span style="color:#EF4444">*</span></span>
                      <input
                        v-model="catForm.name"
                        type="text"
                        class="catm-input"
                        placeholder="例如：图书、电子产品、服装"
                        maxlength="50"
                        @keyup.enter="handleCatSave"
                      />
                    </div>
                    <p v-if="catFormError" class="catm-error">{{ catFormError }}</p>
                  </div>
                  <div class="catm-footer">
                    <button class="um-btn um-btn-reset" @click="closeCatModal">取消</button>
                    <button class="um-btn um-btn-search" :disabled="catSaving" @click="handleCatSave">
                      {{ catSaving ? '保存中...' : '保存' }}
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </template>
        </template>

        <!-- ═══════ 订单管理 ═══════ -->
        <template v-if="activeMenu === 'orders'">
          <div class="panel" style="min-height:400px;display:flex;align-items:center;justify-content:center">
            <div class="empty-hint">
              <ClipboardList :size="48" stroke-width="1" style="color:#2563EB;margin-bottom:16px"/>
              <p>订单管理模块即将上线</p>
              <span>将提供订单查询、退款处理、物流追踪等功能</span>
            </div>
          </div>
        </template>

        <!-- ═══════ 系统通知 ═══════ -->
        <template v-if="activeMenu === 'notices'">
          <div class="panel" style="padding:24px">
            <h3 style="font-family:var(--font-serif);font-size:17px;font-weight:600;color:var(--text-primary);margin-bottom:20px">
              <Megaphone :size="18" stroke-width="1.8" style="vertical-align:-3px;margin-right:8px;color:var(--accent)"/>
              发送系统通知
            </h3>
            <div class="notice-form">
              <div class="nf-row">
                <label class="nf-label">通知标题 <span style="color:#EF4444">*</span></label>
                <input
                  v-model="noticeForm.title"
                  type="text"
                  class="nf-input"
                  placeholder="例如：系统维护通知"
                  maxlength="100"
                />
              </div>
              <div class="nf-row">
                <label class="nf-label">通知内容 <span style="color:#EF4444">*</span></label>
                <textarea
                  v-model="noticeForm.content"
                  class="nf-input nf-textarea"
                  placeholder="请输入通知详情..."
                  rows="5"
                  maxlength="2000"
                ></textarea>
              </div>
              <div class="nf-row">
                <label class="nf-label">发送对象</label>
                <select v-model="noticeForm.targetRole" class="um-select" style="width:200px">
                  <option :value="-1">全部用户</option>
                  <option :value="0">普通用户</option>
                  <option :value="1">商家</option>
                  <option :value="2">管理员</option>
                </select>
              </div>
              <p v-if="noticeError" class="nf-error">{{ noticeError }}</p>
              <p v-if="noticeSuccess" class="nf-success">{{ noticeSuccess }}</p>
              <div class="nf-actions">
                <button class="um-btn um-btn-search" :disabled="noticeSending" @click="handleSendNotice">
                  <Megaphone :size="14" stroke-width="2"/>
                  {{ noticeSending ? '发送中...' : '发送通知' }}
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- ═══════ 优惠券管理 ═══════ -->
        <template v-if="activeMenu === 'coupons'">
          <!-- 统计卡片行 -->
          <div class="coupon-stats-row">
            <div class="coupon-stat-card">
              <div class="csc-icon" style="background:linear-gradient(135deg,#DBEAFE,#3B82F6)"><Ticket :size="18" stroke-width="1.8"/></div>
              <div class="csc-info">
                <span class="csc-value">{{ couponStats.total }}</span>
                <span class="csc-label">券总数</span>
              </div>
            </div>
            <div class="coupon-stat-card">
              <div class="csc-icon" style="background:linear-gradient(135deg,#D1FAE5,#10B981)"><CheckCircle :size="18" stroke-width="1.8"/></div>
              <div class="csc-info">
                <span class="csc-value">{{ couponStats.active }}</span>
                <span class="csc-label">进行中</span>
              </div>
            </div>
            <div class="coupon-stat-card">
              <div class="csc-icon" style="background:linear-gradient(135deg,#FEF3C7,#F59E0B)"><Clock :size="18" stroke-width="1.8"/></div>
              <div class="csc-info">
                <span class="csc-value">{{ couponStats.pending }}</span>
                <span class="csc-label">未开始</span>
              </div>
            </div>
            <div class="coupon-stat-card">
              <div class="csc-icon" style="background:linear-gradient(135deg,#FEE2E2,#EF4444)"><AlertCircle :size="18" stroke-width="1.8"/></div>
              <div class="csc-info">
                <span class="csc-value">{{ couponStats.ended }}</span>
                <span class="csc-label">已结束</span>
              </div>
            </div>
          </div>

          <!-- 搜索/筛选工具栏 -->
          <div class="panel" style="margin-bottom:16px;padding:16px 20px">
            <div class="um-toolbar">
              <div class="um-search-box" style="max-width:320px">
                <Search :size="15" stroke-width="1.6" class="um-search-icon"/>
                <input
                  v-model="couponSearch"
                  type="text"
                  placeholder="搜索优惠券名称..."
                  class="um-search-input"
                  @input="onCouponSearch"
                />
                <button v-if="couponSearch" class="um-clear-btn" @click="couponSearch = ''; onCouponSearch()">
                  <X :size="13" stroke-width="2"/>
                </button>
              </div>
              <select v-model="couponStatusFilter" class="um-select" style="width:130px" @change="onCouponSearch">
                <option value="">全部状态</option>
                <option value="active">进行中</option>
                <option value="pending">未开始</option>
                <option value="ended">已结束</option>
              </select>
              <div style="flex:1"></div>
              <button class="um-btn um-btn-search" @click="openCouponAdd">
                <Plus :size="14" stroke-width="2"/> 新建优惠券
              </button>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="couponListLoading" class="um-loading">
            <div class="um-spinner"></div>
            <span>加载优惠券中...</span>
          </div>

          <!-- 空状态 -->
          <div v-else-if="filteredCoupons.length === 0 && couponList.length === 0" class="coupon-empty">
            <div class="coupon-empty-illustration">
              <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
                <rect x="18" y="14" width="84" height="54" rx="8" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="5 4" fill="#F8FAFC"/>
                <path d="M18 36 L102 36" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 3"/>
                <circle cx="36" cy="24" r="4" fill="#E2E8F0"/>
                <rect x="44" y="21" width="30" height="6" rx="3" fill="#E2E8F0"/>
                <rect x="28" y="44" width="20" height="16" rx="3" fill="#DBEAFE" opacity="0.6"/>
                <rect x="54" y="44" width="32" height="16" rx="3" fill="#F1F5F9"/>
              </svg>
            </div>
            <p class="coupon-empty-title">暂未创建优惠券</p>
            <p class="coupon-empty-desc">创建优惠券吸引用户，提升下单转化率</p>
            <button class="um-btn um-btn-search" style="margin-top:20px" @click="openCouponAdd">
              <Plus :size="14" stroke-width="2"/> 创建第一张优惠券
            </button>
          </div>

          <!-- 筛选空结果 -->
          <div v-else-if="filteredCoupons.length === 0" class="coupon-empty">
            <Search :size="40" stroke-width="1" style="color:#CBD5E1;margin-bottom:12px"/>
            <p class="coupon-empty-title">没有匹配的优惠券</p>
            <p class="coupon-empty-desc">试试调整搜索条件或筛选状态</p>
          </div>

          <!-- 券卡片网格 -->
          <div v-else class="coupon-grid">
            <div
              v-for="c in filteredCoupons"
              :key="c.id"
              :class="['coupon-card', couponCardStatusClass(c)]"
            >
              <!-- 左侧色条装饰 -->
              <div :class="['coupon-card-accent', couponCardAccentClass(c)]"></div>

              <!-- 主体内容 -->
              <div class="coupon-card-body">
                <div class="coupon-card-header">
                  <span :class="['coupon-type-badge', couponTypeBadgeClass(c.discountType)]">
                    {{ discountTypeMap[c.discountType] || '优惠券' }}
                  </span>
                  <div class="coupon-card-actions">
                    <button class="cc-act-btn" title="编辑" @click="openCouponEdit(c)"><Pencil :size="13" stroke-width="1.8"/></button>
                    <button class="cc-act-btn danger" title="删除" @click="handleDeleteCoupon(c)"><Trash2 :size="13" stroke-width="1.8"/></button>
                  </div>
                </div>

                <h4 class="coupon-card-name">{{ c.name }}</h4>

                <!-- 面额大数字 -->
                <div class="coupon-card-value">
                  <span class="ccv-amount">{{ formatCouponValue(c.discountValue, c.discountType) }}</span>
                  <span v-if="c.thresholdAmount" class="ccv-threshold">满{{ (c.thresholdAmount / 100).toFixed(0) }}元可用</span>
                  <span v-else class="ccv-threshold">无门槛</span>
                </div>

                <!-- 元信息 -->
                <div class="coupon-card-meta">
                  <div class="ccm-item">
                    <Calendar :size="12" stroke-width="1.6"/>
                    <span>{{ formatCouponDateRange(c.issueBeginTime, c.issueEndTime) }}</span>
                  </div>
                  <div class="ccm-item">
                    <Users :size="12" stroke-width="1.6"/>
                    <span>已领 {{ c.issueNum || 0 }}{{ c.totalNum ? ' / ' + c.totalNum : '' }}</span>
                  </div>
                </div>

                <!-- 底部状态栏 -->
                <div class="coupon-card-footer">
                  <span :class="['coupon-status-pill', couponStatusClass(c)]">
                    <span class="csp-dot"></span>
                    {{ couponStatusText(c) }}
                  </span>
                  <span v-if="c.obtainWay === 2" class="coupon-code-hint">兑换码</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ══ 用户详情抽屉 ══ -->
        <transition name="drawer-slide">
          <div v-if="detailVisible" class="um-drawer-overlay" @click.self="closeDetail">
            <div class="um-drawer">
              <div class="umd-head">
                <h3>用户详情</h3>
                <button class="umd-close" @click="closeDetail">
                  <X :size="18" stroke-width="1.8"/>
                </button>
              </div>
              <div class="umd-body">
                <div v-if="detailLoading" class="um-loading">
                  <div class="um-spinner"></div>
                  <span>加载中...</span>
                </div>
                <template v-else-if="currentUserDetail">
                  <div class="umd-avatar-section">
                    <img v-if="currentUserDetail.avatar" :src="currentUserDetail.avatar" class="umd-avatar-img" />
                    <div v-else class="umd-avatar-img umd-avatar-placeholder">{{ (currentUserDetail.nickname || currentUserDetail.username || '?')[0] }}</div>
                    <div class="umd-avatar-info">
                      <span class="umd-name">{{ currentUserDetail.nickname || currentUserDetail.username }}</span>
                      <span class="umd-username">@{{ currentUserDetail.username }}</span>
                    </div>
                  </div>
                  <div class="umd-fields">
                    <div class="umd-field">
                      <span class="umdf-label">用户 ID</span>
                      <span class="umdf-value td-mono">{{ currentUserDetail.id }}</span>
                    </div>
                    <div class="umd-field">
                      <span class="umdf-label">手机号</span>
                      <span class="umdf-value td-mono">{{ currentUserDetail.phone || '-' }}</span>
                    </div>
                    <div class="umd-field">
                      <span class="umdf-label">角色</span>
                      <span :class="['um-role-tag', 'role-' + currentUserDetail.role]">{{ roleMap[currentUserDetail.role] || '未知' }}</span>
                    </div>
                    <div class="umd-field">
                      <span class="umdf-label">状态</span>
                      <span :class="['um-status-tag', currentUserDetail.status === 1 ? 'on' : 'off']">
                        <span class="um-status-dot"></span>
                        {{ statusMap[currentUserDetail.status] || '未知' }}
                      </span>
                    </div>
                    <div class="umd-field">
                      <span class="umdf-label">经验值</span>
                      <span class="umdf-value">{{ currentUserDetail.experience ?? '-' }}</span>
                    </div>
                    <div class="umd-field">
                      <span class="umdf-label">地区</span>
                      <span class="umdf-value">{{ currentUserDetail.region || '-' }}</span>
                    </div>
                    <div class="umd-field">
                      <span class="umdf-label">注册时间</span>
                      <span class="umdf-value td-time" style="font-size:12px">{{ currentUserDetail.createTime || '-' }}</span>
                    </div>
                    <div class="umd-field">
                      <span class="umdf-label">最近更新</span>
                      <span class="umdf-value td-time" style="font-size:12px">{{ currentUserDetail.updateTime || '-' }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </transition>

        <!-- ══ 优惠券新增/编辑弹窗 ══ -->
        <transition name="dialog-fade">
          <div v-if="couponDialogVisible" class="um-modal-overlay" @click.self="closeCouponDialog">
            <div class="coupon-modal">
              <div class="coupon-modal-head">
                <div class="cmh-left">
                  <div class="cmh-icon-wrap">
                    <Ticket :size="20" stroke-width="1.8"/>
                  </div>
                  <div>
                    <h3>{{ couponEditing ? '编辑优惠券' : '创建优惠券' }}</h3>
                    <p class="cmh-sub">{{ couponEditing ? '修改券面信息，已领取用户不受影响' : '配置优惠规则，吸引用户下单' }}</p>
                  </div>
                </div>
                <button class="umd-close" @click="closeCouponDialog"><X :size="18" stroke-width="1.8"/></button>
              </div>

              <div class="coupon-modal-body">
                <!-- 左侧券面预览 -->
                <div class="cmb-preview">
                  <div class="cmbp-card" :class="'cmbp-' + couponForm.discountType">
                    <div class="cmbp-left">
                      <span class="cmbp-value">
                        <template v-if="couponForm.discountType === 2">
                          <em>{{ couponForm.discountValue || '?' }}</em>折
                        </template>
                        <template v-else-if="couponForm.discountType === 3">
                          <em>免</em>
                        </template>
                        <template v-else>
                          <em>¥{{ couponForm.discountValue || '?' }}</em>
                        </template>
                      </span>
                      <span class="cmbp-cond">
                        {{ couponForm.thresholdAmount && couponForm.discountType !== 3 ? '满' + couponForm.thresholdAmount + '元可用' : '无门槛' }}
                      </span>
                    </div>
                    <div class="cmbp-right">
                      <span class="cmbp-name">{{ couponForm.name || '优惠券名称' }}</span>
                      <span class="cmbp-type">{{ discountTypeMap[couponForm.discountType] }}</span>
                      <span class="cmbp-date">{{ couponForm.issueBeginTime ? couponForm.issueBeginTime.slice(0,10) : '--' }} ~ {{ couponForm.issueEndTime ? couponForm.issueEndTime.slice(0,10) : '--' }}</span>
                    </div>
                  </div>
                  <p class="cmbp-hint">实时预览券面效果</p>
                </div>

                <!-- 右侧表单 -->
                <div class="cmb-form">
                  <div class="cmbf-group">
                    <label class="cmbf-label">基础信息</label>
                    <div class="cmbf-field">
                      <span class="cmbf-tag">名称 <i>*</i></span>
                      <input v-model="couponForm.name" class="cmbf-input" placeholder="例如：新人专享券、双十一满减券" maxlength="30"/>
                    </div>
                    <div class="cmbf-row">
                      <div class="cmbf-field" style="flex:1">
                        <span class="cmbf-tag">优惠类型 <i>*</i></span>
                        <select v-model="couponForm.discountType" class="cmbf-select">
                          <option :value="4">满减券</option>
                          <option :value="2">折扣券</option>
                          <option :value="3">无门槛券</option>
                          <option :value="1">每满减券</option>
                        </select>
                      </div>
                      <div class="cmbf-field" style="flex:1" v-if="couponForm.discountType !== 3">
                        <span class="cmbf-tag">
                          {{ couponForm.discountType === 2 ? '折扣率' : '优惠金额' }} <i>*</i>
                        </span>
                        <div class="cmbf-input-wrap">
                          <span v-if="couponForm.discountType !== 2" class="cmbf-prefix">¥</span>
                          <input
                            v-model.number="couponForm.discountValue"
                            type="number"
                            class="cmbf-input"
                            :class="{ 'has-prefix': couponForm.discountType !== 2 }"
                            :placeholder="couponForm.discountType === 2 ? '8.5' : '10'"
                            min="0" step="0.01"
                          />
                          <span v-if="couponForm.discountType === 2" class="cmbf-suffix">折</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="cmbf-group" v-if="couponForm.discountType !== 3">
                    <label class="cmbf-label">使用限制</label>
                    <div class="cmbf-row">
                      <div class="cmbf-field" style="flex:1">
                        <span class="cmbf-tag">使用门槛</span>
                        <div class="cmbf-input-wrap">
                          <span class="cmbf-prefix">¥</span>
                          <input v-model.number="couponForm.thresholdAmount" type="number" class="cmbf-input has-prefix" placeholder="留空 = 无门槛" min="0" step="0.01"/>
                        </div>
                      </div>
                      <div class="cmbf-field" style="flex:1" v-if="couponForm.discountType === 2 || couponForm.discountType === 1">
                        <span class="cmbf-tag">最高优惠</span>
                        <div class="cmbf-input-wrap">
                          <span class="cmbf-prefix">¥</span>
                          <input v-model.number="couponForm.maxDiscountAmount" type="number" class="cmbf-input has-prefix" placeholder="0 = 不限制" min="0" step="0.01"/>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="cmbf-group">
                    <label class="cmbf-label">发放规则</label>
                    <div class="cmbf-row">
                      <div class="cmbf-field" style="flex:1">
                        <span class="cmbf-tag">获取方式</span>
                        <select v-model="couponForm.obtainWay" class="cmbf-select">
                          <option :value="1">手动领取</option>
                          <option :value="2">兑换码</option>
                        </select>
                      </div>
                      <div class="cmbf-field" style="flex:1">
                        <span class="cmbf-tag">发行总量</span>
                        <input v-model.number="couponForm.totalNum" type="number" class="cmbf-input" placeholder="留空 = 不限量" min="0"/>
                      </div>
                    </div>
                    <div class="cmbf-row">
                      <div class="cmbf-field" style="flex:1">
                        <span class="cmbf-tag">每人限领</span>
                        <input v-model.number="couponForm.userLimit" type="number" class="cmbf-input" placeholder="留空 = 不限" min="1"/>
                      </div>
                      <div class="cmbf-field" style="flex:1">
                        <span class="cmbf-tag">有效期(天)</span>
                        <input v-model.number="couponForm.termDays" type="number" class="cmbf-input" placeholder="0 = 使用起止时间" min="0"/>
                      </div>
                    </div>
                  </div>

                  <div class="cmbf-group">
                    <label class="cmbf-label">发放时间</label>
                    <div class="cmbf-row">
                      <div class="cmbf-field" style="flex:1">
                        <span class="cmbf-tag">开始时间 <i>*</i></span>
                        <input v-model="couponForm.issueBeginTime" type="datetime-local" class="cmbf-input"/>
                      </div>
                      <div class="cmbf-field" style="flex:1">
                        <span class="cmbf-tag">结束时间 <i>*</i></span>
                        <input v-model="couponForm.issueEndTime" type="datetime-local" class="cmbf-input"/>
                      </div>
                    </div>
                  </div>

                  <div class="cmbf-group">
                    <label class="cmbf-check">
                      <input type="checkbox" v-model="couponForm.specific" />
                      <span class="cmbf-check-text">限定使用范围（指定商品/分类可用）</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="coupon-modal-foot">
                <button class="um-btn um-btn-reset" @click="closeCouponDialog">取消</button>
                <button class="um-btn um-btn-search" :disabled="couponSubmitting" @click="handleCouponSubmit">
                  {{ couponSubmitting ? '提交中...' : (couponEditing ? '保存修改' : '立即创建') }}
                </button>
              </div>
            </div>
          </div>
        </transition>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  LayoutDashboard, TrendingUp, TrendingDown, Users, Package, ShoppingBag,
  ClipboardList, Settings, LogOut, ChevronLeft, ChevronRight, Bell,
  BarChart3, PieChart, DollarSign, Search, X, UserCheck, Shield, RefreshCw, Eye, Ban,
  FolderTree, FolderOpen, Tag, Ticket, Pencil, Trash2, ChevronDown, ChevronRight as ChevronRightIcon, Plus, Megaphone, CheckCircle, XCircle, Store,
  Clock, AlertCircle, Calendar
} from 'lucide-vue-next'
import { getUserPage, getUserDetail, updateUserStatus, updateUserRole, getAdminOverview, getAdminRevenue, sendAdminNotice } from '../api/admin'
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../api/admin'
import { getAdminItemPage, approveItem, rejectItem, toggleAdminItemStatus } from '../api/admin'
import { getShopPage, toggleShopStatus } from '../api/admin'
import { getAdminCouponPage, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '../api/admin'

const router = useRouter()

// ═══ 侧边栏 ═══
const sidebarCollapsed = ref(false)
const activeMenu = ref('overview')

const menuItems = [
  { key: 'overview',  label: '概览',     icon: LayoutDashboard },
  { key: 'analytics', label: '数据分析', icon: BarChart3,      badge: 'NEW' },
  { key: 'users',     label: '用户管理', icon: Users },
  { key: 'products',  label: '商品管理', icon: Package },
  { key: 'shops',     label: '商家管理', icon: Store },
  { key: 'categories',label: '分类管理', icon: FolderTree },
  { key: 'orders',    label: '订单管理', icon: ClipboardList,   badge: '12' },
  { key: 'notices',   label: '系统通知', icon: Megaphone },
  { key: 'coupons',   label: '优惠券管理', icon: Ticket },
]

const currentMenuLabel = computed(() => {
  const item = menuItems.find(m => m.key === activeMenu.value)
  return item ? item.label : '概览'
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('isLogin')
  localStorage.removeItem('userName')
  ElMessage.success('已退出登录')
  router.push('/admin')
}

// ═══ 时钟 ═══
const currentTime = ref('')
let clockTimer = null
onMounted(() => {
  const update = () => {
    const now = new Date()
    currentTime.value = now.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    })
  }
  update()
  clockTimer = setInterval(update, 1000)
})
onUnmounted(() => { if (clockTimer) clearInterval(clockTimer) })

// ═══ 核心指标 ═══
const statCards = ref([
  { label: '平台 GMV',     value: '—', trend: 0, delta: '—', icon: DollarSign,     bg: 'linear-gradient(135deg, #DBEAFE, #2563EB)', accent: '#2563EB' },
  { label: '总订单数',     value: '—', trend: 0, delta: '—', icon: ShoppingBag,   bg: 'linear-gradient(135deg, #DBEAFE, #60A5FA)', accent: '#60A5FA' },
  { label: '活跃用户',     value: '—', trend: 0, delta: '—', icon: Users,         bg: 'linear-gradient(135deg, #E8D5F5, #A78BFA)', accent: '#A78BFA' },
  { label: '转化率',       value: '—', trend: 0, delta: '—', icon: TrendingUp,    bg: 'linear-gradient(135deg, #D5F0E2, #34D399)', accent: '#34D399' },
])

// ═══ 收入趋势图 ═══
const revenuePeriod = ref('7天')
const revenueData7 = ref([4200, 3800, 5100, 4600, 6800, 7200, 12850])
const revenueData30 = ref([])
const revenueDataQ = ref([])
const revenueLoading = ref(false)

const revenueData = computed(() => {
  if (revenuePeriod.value === '30天') return revenueData30.value.length ? revenueData30.value : revenueData7.value
  if (revenuePeriod.value === '季度') return revenueDataQ.value.length ? revenueDataQ.value : revenueData7.value
  return revenueData7.value
})

const revenueXLabels = computed(() => {
  const d = revenueData.value
  if (d.length <= 7) return ['周一','周二','周三','周四','周五','周六','周日'].slice(0, d.length)
  return d.map((_, i) => `${i + 1}`)
})

const CHART_W = 600, CHART_H = 220, PAD_L = 0, PAD_R = 0, PAD_T = 16, PAD_B = 8
const chartW = CHART_W - PAD_L - PAD_R
const chartH = CHART_H - PAD_T - PAD_B

const revenuePoints = computed(() => {
  const d = revenueData.value
  const max = Math.max(...d, 1)
  return d.map((v, i) => ({
    x: PAD_L + (i / Math.max(d.length - 1, 1)) * chartW,
    y: PAD_T + (1 - v / max) * chartH,
  }))
})

const revenueLinePath = computed(() => {
  const pts = revenuePoints.value
  if (!pts.length) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
})

const revenueAreaPath = computed(() => {
  const pts = revenuePoints.value
  if (!pts.length) return ''
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${line} L${last.x},${CHART_H - PAD_B} L${first.x},${CHART_H - PAD_B} Z`
})

// ═══ 用户画像 ═══
const userPortrait = ref({
  gender: { male: 0, female: 0 },
  ages: [],
  regions: [],
})

const consumeLevels = ref([
  { label: '高消费', percent: 0, color: '#2563EB' },
  { label: '中等消费', percent: 0, color: '#18181B' },
  { label: '低消费', percent: 0, color: '#93C5FD' },
])

// ═══ 近期订单 ═══
const recentOrders = ref([
  { orderNo: '—', user: '—', product: '加载中...', amount: '—', status: '—', statusClass: '', time: '—' }
])

const topProducts = ref([])

// ═══ 用户管理 ═══
const userList = ref([])
const userTotal = ref(0)
const userPages = ref(0)
const userPage = ref(1)
const userSize = ref(10)
const userKeyword = ref('')
const userRoleFilter = ref(null)
const userStatusFilter = ref(null)
const userLoading = ref(false)
const detailVisible = ref(false)
const currentUserDetail = ref(null)
const detailLoading = ref(false)

const roleMap = { 0: '普通用户', 1: '商家', 2: '管理员' }
const statusMap = { 0: '已禁用', 1: '正常' }

const fetchUserPage = async () => {
  userLoading.value = true
  try {
    const params = {
      page: userPage.value,
      size: userSize.value,
    }
    if (userKeyword.value) params.keyword = userKeyword.value
    if (userRoleFilter.value !== null && userRoleFilter.value !== '') params.role = userRoleFilter.value
    if (userStatusFilter.value !== null && userStatusFilter.value !== '') params.status = userStatusFilter.value
    const data = await getUserPage(params)
    userList.value = data.list || []
    userTotal.value = data.total || 0
    userPages.value = data.pages || 0
  } catch (e) {
    // 错误已在拦截器中提示
  } finally {
    userLoading.value = false
  }
}

const handleUserSearch = () => {
  userPage.value = 1
  fetchUserPage()
}

const handleUserReset = () => {
  userKeyword.value = ''
  userRoleFilter.value = null
  userStatusFilter.value = null
  userPage.value = 1
  fetchUserPage()
}

const handleUserPageChange = (page) => {
  userPage.value = page
  fetchUserPage()
}

const openDetail = async (user) => {
  detailLoading.value = true
  detailVisible.value = true
  try {
    const data = await getUserDetail(user.id)
    currentUserDetail.value = data
  } catch (e) {
    // 失败时至少展示列表中的基础信息
    currentUserDetail.value = user
  } finally {
    detailLoading.value = false
  }
}

const closeDetail = () => {
  detailVisible.value = false
  currentUserDetail.value = null
}

const handleToggleStatus = async (user) => {
  const newStatus = user.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户「${user.nickname || user.username}」吗？`, '操作确认', {
      confirmButtonText: action,
      cancelButtonText: '取消',
      type: 'warning',
    })
    await updateUserStatus(user.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchUserPage()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(`${action}失败，请稍后重试`)
  }
}

const handleChangeRole = async (user) => {
  const action = user.role === 0 ? '设为商家' : user.role === 1 ? '设为普通用户' : '取消管理员'
  const newRole = user.role === 0 ? 1 : user.role === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(`确定将「${user.nickname || user.username}」${action}吗？`, '角色变更', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })
    await updateUserRole(user.id, newRole)
    ElMessage.success('角色修改成功')
    fetchUserPage()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('角色修改失败，请稍后重试')
  }
}

// 监听用户管理菜单激活时自动加载数据
const overviewLoading = ref(false)

// ═══ 后端金色系 → 前端蓝色系颜色映射 ═══
const COLOR_MAP = {
  '#D9A53C': '#2563EB',  // gold → blue
  '#A07830': '#1D4ED8',  // deep gold → deep blue
  '#1A1712': '#18181B',  // dark brown → near black
  '#8C6308': '#60A5FA',  // dark gold → light blue
  '#9B9484': '#93C5FD',  // dusty gold → lighter blue
  '#C0B8A8': '#BFDBFE',  // light gold → very light blue
  '#FDE8C8': '#DBEAFE',  // pale gold → pale blue
}

const safeMapColor = (color) => COLOR_MAP[color] || color

const fetchOverview = async () => {
  overviewLoading.value = true
  try {
    const data = await getAdminOverview()
    console.log('[Admin] overview 接口返回:', JSON.stringify(data, null, 2))
    // 指标卡片
    if (data.stats) {
      const keys = ['gmv', 'orders', 'users', 'conversion']
      keys.forEach((k, i) => {
        if (data.stats[k]) {
          statCards.value[i].value = data.stats[k].value ?? statCards.value[i].value
          statCards.value[i].trend = data.stats[k].trend ?? 0
          statCards.value[i].delta = data.stats[k].delta ?? '—'
        }
      })
    }
    // 用户画像（后端返回金色系颜色，映射为蓝色系）
    if (data.userPortrait) {
      const up = { ...data.userPortrait }
      if (up.ages && up.ages.length) {
        up.ages = up.ages.map(a => ({ ...a, color: safeMapColor(a.color) }))
      } else {
        // 兜底：后端未返回年龄段数据时使用静态数据
        up.ages = [
          { label: '18-24', percent: 28, color: '#2563EB' },
          { label: '25-34', percent: 42, color: '#18181B' },
          { label: '35-44', percent: 18, color: '#60A5FA' },
          { label: '45-54', percent: 8,  color: '#93C5FD' },
          { label: '55+',   percent: 4,  color: '#BFDBFE' }
        ]
      }
      if (!up.regions || !up.regions.length) {
        up.regions = [
          { name: '—', percent: 0 }
        ]
      }
      userPortrait.value = { ...userPortrait.value, ...up }
    }
    // 消费水平（后端返回金色系颜色，映射为蓝色系）
    if (data.consumeLevels && data.consumeLevels.length) {
      consumeLevels.value = data.consumeLevels.map(l => ({
        ...l,
        color: safeMapColor(l.color)
      }))
    } else {
      // 兜底静态数据
      consumeLevels.value = [
        { label: '高消费',   percent: 55, color: '#2563EB' },
        { label: '中等消费', percent: 25, color: '#18181B' },
        { label: '低消费',   percent: 20, color: '#93C5FD' }
      ]
    }
    // 近期订单
    if (data.recentOrders && data.recentOrders.length) {
      recentOrders.value = data.recentOrders
      console.log(`[Admin] 近期订单: ${data.recentOrders.length} 条`)
    } else {
      console.warn('[Admin] recentOrders 为空或缺失，使用兜底占位')
      recentOrders.value = [
        { orderNo: '—', user: '—', product: '暂无订单数据', amount: '—', status: '—', statusClass: '', time: '—' }
      ]
    }
    // 热销商品（topProducts.color 也需要映射）
    if (data.topProducts && data.topProducts.length) {
      topProducts.value = data.topProducts.map(p => ({
        ...p,
        revenue: String(p.revenue || '').replace(/^¥/, ''),
        color: safeMapColor(p.color)
      }))
    } else {
      // 兜底占位数据
      topProducts.value = [
        { name: '暂无数据', sales: '—', revenue: '—', color: '#DBEAFE' }
      ]
    }
  } catch (e) {
    console.error('[Admin] overview 请求失败:', e)
    ElMessage.error('加载概览数据失败，请检查后端服务是否正常')
    // 失败时显示占位
    if (!recentOrders.value.length) {
      recentOrders.value = [
        { orderNo: '—', user: '—', product: '数据加载失败', amount: '—', status: '—', statusClass: '', time: '—' }
      ]
    }
  } finally {
    overviewLoading.value = false
  }
}

const fetchRevenue = async (period) => {
  revenueLoading.value = true
  try {
    const data = await getAdminRevenue(period)
    console.log(`[Admin] revenue period=${period} 返回:`, JSON.stringify(data))
    if (data && data.values && data.values.length) {
      if (period === '30天') revenueData30.value = data.values
      else if (period === '季度') revenueDataQ.value = data.values
      else revenueData7.value = data.values
    } else {
      console.warn(`[Admin] revenue period=${period} 返回空数据，保留默认值`)
    }
  } catch (e) {
    console.error(`[Admin] revenue period=${period} 请求失败:`, e)
    // 失败保留现有数据
  } finally {
    revenueLoading.value = false
  }
}

// 切换收入周期时拉取数据
watch(revenuePeriod, (val) => {
  if (val === '7天' && revenueData7.value.length <= 1) fetchRevenue(7)
  else if (val === '30天') fetchRevenue(30)
  else if (val === '季度') fetchRevenue(90)
})

watch(activeMenu, (val) => {
  if (val === 'users') fetchUserPage()
  if (val === 'categories') fetchCategories()
  if (val === 'overview') {
    fetchOverview()
    fetchRevenue(7)
  }
}, { immediate: true })

// ══════════════════════════════════════
// ★ 分类管理
// ══════════════════════════════════════
const catFlatList = ref([])           // 后端返回的平铺分类列表
const catLoading = ref(false)
const expandedCats = ref(new Set())   // 展开的一级分类 ID 集合
// 弹窗
const catModalVisible = ref(false)
const catEditing = ref(false)
const catEditId = ref(null)
const catSaving = ref(false)
const catFormError = ref('')
const catForm = ref({ name: '', parentId: null })

// 从平铺列表计算一级分类
const topCats = computed(() =>
  catFlatList.value.filter(c => !c.parentId || c.parentId === 0)
)
// 父ID → 子分类列表
const childrenMap = computed(() => {
  const map = {}
  catFlatList.value.forEach(c => {
    const pid = c.parentId || 0
    if (!map[pid]) map[pid] = []
    map[pid].push(c)
  })
  return map
})

// 递归构建显示列表（只展示展开路径上的节点）
const displayList = computed(() => {
  const result = []
  const walk = (parentId, depth) => {
    const children = childrenMap.value[parentId] || []
    for (const c of children) {
      result.push({ ...c, depth })
      if (expandedCats.value.has(c.id)) {
        walk(c.id, depth + 1)
      }
    }
  }
  walk(0, 0)
  return result
})

// 判断分类是否有子分类
function hasCatChildren(id) {
  return !!(childrenMap.value[id] && childrenMap.value[id].length)
}

// 统计所有子孙分类数量
function countCatDescendants(id) {
  let count = 0
  const stack = [...(childrenMap.value[id] || [])]
  while (stack.length) {
    const node = stack.pop()
    count++
    const kids = childrenMap.value[node.id] || []
    kids.forEach(k => stack.push(k))
  }
  return count
}

// 弹窗中的可选父分类（带层级缩进）
const selectableParents = computed(() => {
  const result = []
  const walk = (parentId, depth) => {
    const children = childrenMap.value[parentId] || []
    for (const c of children) {
      const prefix = depth > 0 ? '\u3000'.repeat(depth) + '\u251C ' : ''
      result.push({ id: c.id, label: prefix + c.name })
      walk(c.id, depth + 1)
    }
  }
  walk(0, 0)
  return result
})

// 加载分类
async function fetchCategories() {
  catLoading.value = true
  try {
    const data = await getAllCategories()
    catFlatList.value = Array.isArray(data) ? data : []
    // 默认展开所有一级分类
    topCats.value.forEach(c => expandedCats.value.add(c.id))
  } catch (e) {
    catFlatList.value = []
  } finally {
    catLoading.value = false
  }
}

// 展开/折叠
function toggleCatExpand(id) {
  if (expandedCats.value.has(id)) {
    expandedCats.value.delete(id)
  } else {
    expandedCats.value.add(id)
  }
  // 触发响应式更新
  expandedCats.value = new Set(expandedCats.value)
}

// 打开弹窗（parent: 父分类对象，editTarget: 要编辑的分类对象）
function openCatModal(parent, editTarget) {
  catFormError.value = ''
  if (editTarget) {
    // 编辑模式
    catEditing.value = true
    catEditId.value = editTarget.id
    catForm.value = {
      name: editTarget.name || '',
      parentId: editTarget.parentId || null,
    }
  } else {
    // 新增模式
    catEditing.value = false
    catEditId.value = null
    catForm.value = {
      name: '',
      parentId: parent ? parent.id : null,
    }
  }
  catModalVisible.value = true
}

// 关闭弹窗
function closeCatModal() {
  catModalVisible.value = false
  catFormError.value = ''
}

// 保存分类
async function handleCatSave() {
  const name = (catForm.value.name || '').trim()
  if (!name) {
    catFormError.value = '请输入分类名称'
    return
  }
  if (name.length < 2) {
    catFormError.value = '分类名称至少需要 2 个字符'
    return
  }
  catSaving.value = true
  catFormError.value = ''
  try {
    const payload = {
      name,
      parentId: catForm.value.parentId || 0,
    }
    if (catEditing.value) {
      await updateCategory(catEditId.value, payload)
    } else {
      await createCategory(payload)
    }
    closeCatModal()
    await fetchCategories()
  } catch (e) {
    catFormError.value = e.message || '保存失败，请稍后重试'
  } finally {
    catSaving.value = false
  }
}

// 删除分类
async function handleCatDelete(cat) {
  const children = childrenMap.value[cat.id] || []
  const warnMsg = children.length
    ? `「${cat.name}」下有 ${children.length} 个子分类，删除后子分类也将一并删除，确定继续吗？`
    : `确定要删除分类「${cat.name}」吗？`
  try {
    await ElMessageBox.confirm(warnMsg, '删除确认', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteCategory(cat.id)
    ElMessage.success('删除成功')
    await fetchCategories()
  } catch (e) {
    if (e !== 'cancel') {
      // 错误已在拦截器中处理
    }
  }
}

// ══════════════════════════════════════
// ★ 系统通知
// ══════════════════════════════════════
const noticeForm = ref({ title: '', content: '', targetRole: -1 })
const noticeSending = ref(false)
const noticeError = ref('')
const noticeSuccess = ref('')

async function handleSendNotice() {
  const title = (noticeForm.value.title || '').trim()
  const content = (noticeForm.value.content || '').trim()
  if (!title) { noticeError.value = '请输入通知标题'; noticeSuccess.value = ''; return }
  if (title.length < 2) { noticeError.value = '标题至少需要2个字符'; noticeSuccess.value = ''; return }
  if (!content) { noticeError.value = '请输入通知内容'; noticeSuccess.value = ''; return }
  noticeError.value = ''
  noticeSuccess.value = ''
  noticeSending.value = true
  try {
    await sendAdminNotice({
      title,
      content,
      targetRole: noticeForm.value.targetRole,
    })
    noticeSuccess.value = '通知已成功发送！'
    noticeForm.value = { title: '', content: '', targetRole: -1 }
  } catch (e) {
    noticeError.value = e.message || '发送失败，请稍后重试'
  } finally {
    noticeSending.value = false
  }
}

// ══════════════════════════════════════
// ★ 商品管理（审核）
// ══════════════════════════════════════
const productList = ref([])
const prodLoading = ref(false)
const prodKeyword = ref('')
const prodAuditStatus = ref('0')
const prodStatus = ref('')
const prodPage = ref(1)
const prodPageSize = 12
const prodTotal = ref(0)
const prodPages = ref(1)
const zoomImage = ref(null)

const displayProdPages = computed(() => {
  const pages = []
  const max = Math.min(prodPages.value, 7)
  for (let i = 1; i <= max; i++) pages.push(i)
  return pages
})

function fmtPrice(p) {
  if (p == null) return '-'
  return (p / 100).toFixed(2)
}

function fmtDateShort(d) {
  if (!d) return '-'
  const s = String(d)
  return s.includes('T') ? s.split('T')[0] : (s.includes(' ') ? s.split(' ')[0] : s)
}

function auditLabel(s) {
  if (s === 0) return '待审核'
  if (s === 1) return '已通过'
  if (s === 2) return '已驳回'
  return '未知'
}

function auditClass(s) {
  if (s === 0) return 'pending'
  if (s === 1) return 'active'
  if (s === 2) return 'inactive'
  return ''
}

function openImageZoom(src) {
  if (!src) return
  zoomImage.value = src
}

function handleProdSearch() {
  prodPage.value = 1
  loadProducts()
}

async function loadProducts() {
  prodLoading.value = true
  try {
    const params = { page: prodPage.value, size: prodPageSize }
    if (prodKeyword.value) params.keyword = prodKeyword.value
    if (prodAuditStatus.value !== '') params.auditStatus = Number(prodAuditStatus.value)
    if (prodStatus.value !== '') params.status = Number(prodStatus.value)
    const res = await getAdminItemPage(params)
    productList.value = (res.list || []).map(p => ({ ...p, _acting: false }))
    prodTotal.value = res.total || 0
    prodPages.value = Math.max(1, Math.ceil(prodTotal.value / prodPageSize))
  } catch (e) {
    console.error('加载商品列表失败:', e)
    productList.value = []
  } finally {
    prodLoading.value = false
  }
}

async function handleApprove(p) {
  try {
    await ElMessageBox.confirm(`确定审核通过「${p.name}」吗？`, '审核确认', {
      confirmButtonText: '通过', cancelButtonText: '取消', type: 'success',
    })
  } catch { return }
  p._acting = true
  try {
    await approveItem(p.id)
    ElMessage.success('审核通过')
    loadProducts()
  } catch (e) {
    ElMessage.error('审核失败，请重试')
  } finally {
    p._acting = false
  }
}

async function handleReject(p) {
  try {
    await ElMessageBox.confirm(`确定驳回「${p.name}」吗？`, '驳回确认', {
      confirmButtonText: '驳回', cancelButtonText: '取消', type: 'warning',
    })
  } catch { return }
  p._acting = true
  try {
    await rejectItem(p.id)
    ElMessage.success('已驳回')
    loadProducts()
  } catch (e) {
    ElMessage.error('驳回失败，请重试')
  } finally {
    p._acting = false
  }
}

async function handleAdminToggleStatus(p) {
  const action = p.status === 1 ? '下架' : '上架'
  try {
    await ElMessageBox.confirm(`确定将「${p.name}」${action}吗？`, '操作确认', {
      confirmButtonText: action, cancelButtonText: '取消', type: 'warning',
    })
  } catch { return }
  p._acting = true
  try {
    await toggleAdminItemStatus(p.id)
    ElMessage.success(`已${action}`)
    loadProducts()
  } catch (e) {
    ElMessage.error(`${action}失败，请重试`)
  } finally {
    p._acting = false
  }
}

// 切换到商品管理时自动加载
watch(activeMenu, (val) => {
  if (val === 'products' && productList.value.length === 0) loadProducts()
})

// ══════════════════════════════════════
// ★ 商家管理
// ══════════════════════════════════════
const shopList = ref([])
const shopLoading = ref(false)
const shopKeyword = ref('')
const shopPageNum = ref(1)
const shopPageSize = 10
const shopTotal = ref(0)
const shopPages = ref(1)

const displayShopPages = computed(() => {
  const pages = []
  const max = Math.min(shopPages.value, 7)
  for (let i = 1; i <= max; i++) pages.push(i)
  return pages
})

function handleShopSearch() {
  shopPageNum.value = 1
  loadShops()
}

async function loadShops() {
  shopLoading.value = true
  try {
    const params = { page: shopPageNum.value, size: shopPageSize }
    if (shopKeyword.value) params.keyword = shopKeyword.value
    const res = await getShopPage(params)
    shopList.value = (res.list || []).map(s => ({ ...s, _acting: false }))
    shopTotal.value = res.total || 0
    shopPages.value = Math.max(1, Math.ceil(shopTotal.value / shopPageSize))
  } catch (e) {
    console.error('加载商家列表失败:', e)
    shopList.value = []
  } finally {
    shopLoading.value = false
  }
}

async function handleToggleShop(s) {
  const action = s.status === 1 ? '停业' : '开业'
  try {
    await ElMessageBox.confirm(`确定让「${s.name}」${action}吗？`, '操作确认', {
      confirmButtonText: action, cancelButtonText: '取消', type: 'warning',
    })
  } catch { return }
  s._acting = true
  try {
    await toggleShopStatus(s.id)
    ElMessage.success(`已${action}`)
    loadShops()
  } catch (e) {
    ElMessage.error(`${action}失败，请重试`)
  } finally {
    s._acting = false
  }
}

// 切换到商家管理时自动加载
watch(activeMenu, (val) => {
  if (val === 'shops' && shopList.value.length === 0) loadShops()
})

// ═══ 优惠券管理 ═══
const couponList = ref([])
const couponListLoading = ref(false)
const couponDialogVisible = ref(false)
const couponEditing = ref(false)
const couponEditingId = ref(null)
const couponSubmitting = ref(false)

// 搜索 & 筛选
const couponSearch = ref('')
const couponStatusFilter = ref('')

// 统计
const couponStats = computed(() => {
  const now = Date.now()
  let active = 0, pending = 0, ended = 0
  couponList.value.forEach(c => {
    const end = c.issueEndTime ? new Date(String(c.issueEndTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
    const start = c.issueBeginTime ? new Date(String(c.issueBeginTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
    if (end && now > end) ended++
    else if (c.totalNum && c.issueNum >= c.totalNum) ended++
    else if (start && now < start) pending++
    else active++
  })
  return { total: couponList.value.length, active, pending, ended }
})

// 过滤后列表
const filteredCoupons = computed(() => {
  let list = couponList.value
  if (couponSearch.value.trim()) {
    const kw = couponSearch.value.trim().toLowerCase()
    list = list.filter(c => c.name && c.name.toLowerCase().includes(kw))
  }
  if (couponStatusFilter.value) {
    const now = Date.now()
    list = list.filter(c => {
      const end = c.issueEndTime ? new Date(String(c.issueEndTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
      const start = c.issueBeginTime ? new Date(String(c.issueBeginTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
      if (couponStatusFilter.value === 'ended') return (end && now > end) || (c.totalNum && c.issueNum >= c.totalNum)
      if (couponStatusFilter.value === 'pending') return start && now < start
      if (couponStatusFilter.value === 'active') {
        if (end && now > end) return false
        if (c.totalNum && c.issueNum >= c.totalNum) return false
        return !(start && now < start)
      }
      return true
    })
  }
  return list
})

const onCouponSearch = () => {} // 搜索由computed自动响应

// 卡片样式辅助
const couponCardStatusClass = (c) => {
  const now = Date.now()
  const end = c.issueEndTime ? new Date(String(c.issueEndTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
  if (end && now > end) return 'is-ended'
  if (c.totalNum && c.issueNum >= c.totalNum) return 'is-ended'
  return ''
}

const couponCardAccentClass = (c) => {
  if (c.discountType === 3) return 'accent-free'
  if (c.discountType === 1) return 'accent-per'
  if (c.discountType === 2) return 'accent-discount'
  return 'accent-full'
}

const couponTypeBadgeClass = (type) => {
  if (type === 3) return 'badge-free'
  if (type === 1) return 'badge-per'
  if (type === 2) return 'badge-discount'
  return 'badge-full'
}

const defaultCouponForm = () => ({
  name: '',
  discountType: 4,
  specific: false,
  discountValue: null,
  thresholdAmount: null,
  maxDiscountAmount: 0,
  obtainWay: 1,
  issueBeginTime: '',
  issueEndTime: '',
  termDays: 0,
  totalNum: null,
  userLimit: null,
})
const couponForm = ref(defaultCouponForm())

const discountTypeMap = {
  1: '每满减券',
  2: '折扣券',
  3: '无门槛券',
  4: '满减券',
}

const formatCouponValue = (val, type) => {
  if (!val && val !== 0) return '--'
  if (type === 2) return (Number(val) / 10).toFixed(1) + '折'
  return '¥' + (Number(val) / 100).toFixed(2)
}

const formatCouponDateRange = (start, end) => {
  const fmt = (v) => {
    if (!v) return ''
    const d = new Date(String(v).replace(/-/g, '/').replace('T', ' '))
    if (isNaN(d.getTime())) return v
    return `${d.getMonth()+1}.${d.getDate()}`
  }
  return `${fmt(start)} - ${fmt(end)}`
}

const couponStatusClass = (c) => {
  const now = Date.now()
  const end = c.issueEndTime ? new Date(String(c.issueEndTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
  if (end && now > end) return 'off'
  if (c.totalNum && c.issueNum >= c.totalNum) return 'off'
  return 'on'
}

const couponStatusText = (c) => {
  const now = Date.now()
  const end = c.issueEndTime ? new Date(String(c.issueEndTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
  if (end && now > end) return '已过期'
  if (c.totalNum && c.issueNum >= c.totalNum) return '已领完'
  const start = c.issueBeginTime ? new Date(String(c.issueBeginTime).replace(/-/g, '/').replace('T', ' ')).getTime() : 0
  if (start && now < start) return '未开始'
  return '进行中'
}

const loadCoupons = async () => {
  couponListLoading.value = true
  try {
    const res = await getAdminCouponPage({ pageNo: 1, pageSize: 100 })
    const list = res?.records ?? res?.list ?? []
    if (list.length > 0) {
      console.log('[管理端] 优惠券列表第一条 keys:', Object.keys(list[0]))
      console.log('[管理端] 优惠券列表第一条:', JSON.stringify(list[0], null, 2))
      console.log('[管理端] receivedCount 字段值:', list[0].receivedCount, 'type:', typeof list[0].receivedCount)
    }
    couponList.value = list
  } catch (e) {
    console.error('加载优惠券失败:', e)
    ElMessage.error('加载优惠券列表失败')
  } finally {
    couponListLoading.value = false
  }
}

const openCouponAdd = () => {
  couponEditing.value = false
  couponEditingId.value = null
  couponForm.value = defaultCouponForm()
  couponDialogVisible.value = true
}

const openCouponEdit = (c) => {
  couponEditing.value = true
  couponEditingId.value = c.id
  couponForm.value = {
    name: c.name || '',
    discountType: c.discountType ?? 4,
    specific: c.specific || false,
    discountValue: c.discountType === 2 ? c.discountValue : (c.discountValue ? Number(c.discountValue) / 100 : null),
    thresholdAmount: c.thresholdAmount ? Number(c.thresholdAmount) / 100 : null,
    maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) / 100 : 0,
    obtainWay: c.obtainWay ?? 1,
    issueBeginTime: c.issueBeginTime ? toDatetimeLocal(c.issueBeginTime) : '',
    issueEndTime: c.issueEndTime ? toDatetimeLocal(c.issueEndTime) : '',
    termDays: c.termDays ?? 0,
    totalNum: c.totalNum ?? null,
    userLimit: c.userLimit ?? null,
  }
  couponDialogVisible.value = true
}

const toDatetimeLocal = (val) => {
  const d = new Date(String(val).replace(/-/g, '/').replace('T', ' '))
  if (isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const closeCouponDialog = () => {
  couponDialogVisible.value = false
  couponForm.value = defaultCouponForm()
}

const handleCouponSubmit = async () => {
  const f = couponForm.value
  if (!f.name.trim()) return ElMessage.error('请输入优惠券名称')
  if (!f.issueBeginTime) return ElMessage.error('请选择发放开始时间')
  if (!f.issueEndTime) return ElMessage.error('请选择发放结束时间')
  if (f.discountType !== 3 && !f.discountValue && f.discountValue !== 0) {
    return ElMessage.error('请输入优惠面额')
  }

  couponSubmitting.value = true
  try {
    const payload = {
      name: f.name.trim(),
      discountType: f.discountType,
      specific: f.specific,
      discountValue: f.discountType === 2 ? f.discountValue : (f.discountValue ? Math.round(f.discountValue * 100) : 0),
      thresholdAmount: f.thresholdAmount ? Math.round(f.thresholdAmount * 100) : 0,
      maxDiscountAmount: f.maxDiscountAmount ? Math.round(f.maxDiscountAmount * 100) : 0,
      obtainWay: f.obtainWay,
      issueBeginTime: f.issueBeginTime.replace('T', ' ') + ':00',
      issueEndTime: f.issueEndTime.replace('T', ' ') + ':00',
      termDays: f.termDays || 0,
      totalNum: f.totalNum || null,
      userLimit: f.userLimit || null,
    }
    if (couponEditing.value) {
      await adminUpdateCoupon(couponEditingId.value, payload)
      ElMessage.success('优惠券已更新')
    } else {
      await adminCreateCoupon(payload)
      ElMessage.success('优惠券已创建')
    }
    closeCouponDialog()
    loadCoupons()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    couponSubmitting.value = false
  }
}

const handleDeleteCoupon = async (c) => {
  try {
    await ElMessageBox.confirm(`确定要删除优惠券「${c.name}」吗？已领取的用户将无法使用。`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await adminDeleteCoupon(c.id)
    ElMessage.success('已删除')
    loadCoupons()
  } catch { /* 取消 */ }
}

// 切换到优惠券管理时自动加载
watch(activeMenu, (val) => {
  if (val === 'coupons' && couponList.value.length === 0) loadCoupons()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,200;9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

.ad-root {
  --accent: #2563EB; --accent-deep: #1D4ED8; --accent-light: #DBEAFE;
  --accent-soft: rgba(37,99,235,0.06); --accent-glow: rgba(37,99,235,0.10);
  --bg: #FAFAF9; --surface: #FFFFFF;
  --text-primary: #18181B; --text-secondary: #52525B; --text-tertiary: #A1A1AA;
  --border: #E4E4E7; --border-light: #F4F4F5;
  --radius: 14px; --radius-sm: 10px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 25px -5px rgba(0,0,0,0.08), 0 4px 10px -6px rgba(0,0,0,0.04);
  --transition: 0.2s cubic-bezier(0.4,0,0.2,1);
  --font-sans: 'DM Sans','PingFang SC',-apple-system,sans-serif;
  --font-serif: 'DM Serif Display','Noto Serif SC',serif;
  --font-mono: 'JetBrains Mono',monospace;
  position: fixed; inset: 0; display: flex;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased; background: var(--bg);
  color: var(--text-primary);
}
*{box-sizing:border-box;margin:0;padding:0}

/* ══ SIDEBAR ══ */
.ad-sidebar{
  width:230px;flex-shrink:0;
  background:#18181B;
  display:flex;flex-direction:column;padding:24px 16px 20px;
  transition:width .3s cubic-bezier(.4,0,.2,1);overflow:hidden;
  border-right:1px solid rgba(255,255,255,.06);
  z-index:20;
}
.ad-sidebar.collapsed{width:68px;padding:24px 10px 20px}
.ads-brand{display:flex;align-items:center;gap:10px;padding:0 6px 24px;margin-bottom:24px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer}
.ads-logo{flex-shrink:0}
.ads-logo svg{filter:drop-shadow(0 4px 8px rgba(37,99,235,.3))}
.ads-brand-text{display:flex;flex-direction:column;white-space:nowrap}
.ads-brand-zh{font-size:15px;font-weight:600;color:#FFF;letter-spacing:.5px}
.ads-brand-en{font-size:7.5px;letter-spacing:4px;color:rgba(255,255,255,.2);margin-top:1px;font-family:var(--font-mono)}
.ads-nav{flex:1;display:flex;flex-direction:column;gap:2px}
.ads-nav-item{
  display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;
  color:rgba(255,255,255,.4);font-size:13px;font-weight:450;
  cursor:pointer;transition:all var(--transition);
  text-decoration:none;position:relative;white-space:nowrap;
}
.ads-nav-item:hover{color:rgba(255,255,255,.75);background:rgba(255,255,255,.04)}
.ads-nav-item.active{
  color:#FFF;background:rgba(37,99,235,.15);
  font-weight:550;
  box-shadow:inset 3px 0 0 var(--accent);
}
.ads-nav-item.logout{color:rgba(255,255,255,.5);margin-top:auto}
.ads-nav-item.logout:hover{color:#F87171;background:rgba(248,113,113,.1)}
.ads-badge{
  position:absolute;right:8px;
  font-size:10px;padding:1px 7px;border-radius:6px;
  background:var(--accent);color:#FFF;font-weight:600;
  font-family:var(--font-mono);
}
.ads-bottom{display:flex;flex-direction:column;gap:4px;padding-top:16px;border-top:1px solid rgba(255,255,255,.06)}
.ads-collapse-btn{
  display:flex;align-items:center;justify-content:center;padding:8px;
  border:none;background:rgba(255,255,255,.03);color:rgba(255,255,255,.3);
  border-radius:6px;cursor:pointer;transition:all var(--transition);
}
.ads-collapse-btn:hover{background:rgba(255,255,255,.08);color:#FFF}
.fade-enter-active,.fade-leave-active{transition:opacity .15s}
.fade-enter-from,.fade-leave-to{opacity:0}

/* ══ MAIN + TOPBAR ══ */
.ad-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.ad-topbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:0 36px;height:66px;
  background:rgba(255,255,255,.8);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border);z-index:10;
}
.adt-left{display:flex;flex-direction:column}
.adt-title{font-size:19px;font-weight:650;color:var(--text-primary);letter-spacing:-.3px;font-family:var(--font-serif)}
.adt-time{font-size:11px;color:var(--text-tertiary);margin-top:1px;font-family:var(--font-mono);font-weight:500}
.adt-right{display:flex;align-items:center;gap:14px}
.adt-icon-btn{
  position:relative;width:38px;height:38px;
  border:1px solid var(--border);border-radius:var(--radius-sm);
  background:var(--surface);display:flex;align-items:center;justify-content:center;
  color:var(--text-tertiary);cursor:pointer;transition:all var(--transition);
}
.adt-icon-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
.adt-dot{
  position:absolute;top:7px;right:7px;width:7px;height:7px;border-radius:50%;
  background:#EF4444;border:2px solid #FFF;animation:dotPulse 2s ease-in-out infinite;
}
@keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.5}}
.adt-user{display:flex;align-items:center;gap:10px}
.adt-avatar{
  width:34px;height:34px;border-radius:10px;
  background:linear-gradient(135deg,var(--accent-deep),var(--accent));
  color:#FFF;font-weight:700;font-size:13px;
  display:flex;align-items:center;justify-content:center;
}
.adt-name{font-size:13px;color:var(--text-secondary);font-weight:500}

/* ══ CONTENT ══ */
.ad-content{flex:1;overflow-y:auto;overflow-x:hidden;padding:32px 36px 44px}
.ad-content::-webkit-scrollbar{width:5px}
.ad-content::-webkit-scrollbar-track{background:transparent}
.ad-content::-webkit-scrollbar-thumb{background:#D4D4D8;border-radius:10px}

/* ══ STAT CARDS ══ */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:32px}
.stat-card{
  position:relative;background:var(--surface);
  border:1px solid var(--border);border-radius:var(--radius);
  padding:24px 26px;overflow:hidden;
  transition:all var(--transition);
}
.stat-card:hover{
  transform:translateY(-2px);
  box-shadow:var(--shadow-lg);
  border-color:var(--accent-light);
}
.sc-glow{
  position:absolute;top:-32px;right:-32px;width:100px;height:100px;border-radius:50%;
  background:radial-gradient(circle,var(--card-accent,var(--accent)) 0%,transparent 70%);
  opacity:.05;pointer-events:none;transition:opacity var(--transition);
}
.stat-card:hover .sc-glow{opacity:.1}
.sc-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;position:relative;z-index:1}
.sc-icon{
  width:44px;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;color:#FFF;
  box-shadow:0 4px 12px rgba(0,0,0,.08);
}
.sc-trend{
  display:flex;align-items:center;gap:3px;font-size:11px;font-weight:600;
  font-family:var(--font-mono);padding:3px 9px;border-radius:6px;
}
.sc-trend.up{color:#059669;background:#ECFDF5}
.sc-trend.down{color:#DC2626;background:#FEF2F2}
.sc-value{font-size:32px;font-weight:700;color:var(--text-primary);font-family:var(--font-mono);margin-bottom:4px;position:relative;z-index:1;letter-spacing:-1px}
.sc-label{font-size:12px;color:var(--text-tertiary);margin-bottom:6px;position:relative;z-index:1;font-weight:500}
.sc-sub{font-size:11px;color:var(--text-tertiary);position:relative;z-index:1;display:flex;align-items:center;gap:4px}
.sc-delta-arr{font-size:9px;color:#059669}
.sc-delta-arr.down{color:#DC2626}

/* ══ LAYOUT ══ */
.content-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px}

/* ══ PANEL ══ */
.panel{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius);padding:24px 26px;
  transition:box-shadow var(--transition);
}
.panel:hover{box-shadow:var(--shadow)}
.panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.panel-head h3{font-size:15px;font-weight:600;color:var(--text-primary);letter-spacing:-.2px;font-family:var(--font-serif)}
.panel-link{font-size:12px;color:var(--accent);border:none;background:none;cursor:pointer;font-weight:500;transition:opacity .15s}
.panel-link:hover{opacity:.75}
.panel-badge{
  font-size:10px;padding:3px 10px;border-radius:8px;
  background:#ECFDF5;color:#059669;font-weight:600;letter-spacing:.3px;
}
.period-tabs{display:flex;gap:3px;background:var(--border-light);border-radius:8px;padding:3px}
.period-tabs button{
  padding:6px 14px;border:none;border-radius:6px;
  background:transparent;color:var(--text-tertiary);
  font-family:inherit;font-size:12px;font-weight:500;
  cursor:pointer;transition:all .15s;
}
.period-tabs button.active{
  background:var(--surface);color:var(--text-primary);
  font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.06);
}
.period-tabs button:hover:not(.active){color:var(--text-secondary)}

/* ══ CHART ══ */
.chart-body{position:relative}
.revenue-chart{width:100%;height:220px;border-radius:4px}
.revenue-chart circle{transition:r .2s}
.revenue-chart:hover circle{r:5.5}
.chart-x-labels{display:flex;justify-content:space-between;padding:8px 0 0}
.chart-x-labels span{font-size:10px;color:var(--text-tertiary);font-family:var(--font-mono);font-weight:500}

/* ══ USER PORTRAIT ══ */
.up-section{margin-bottom:22px}
.up-section:last-child{margin-bottom:0}
.up-label{
  font-size:10px;font-weight:600;color:var(--text-tertiary);
  letter-spacing:1.2px;margin-bottom:12px;text-transform:uppercase;
}
.gender-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.gender-bar-wrap{flex:1;height:28px;background:var(--border-light);border-radius:8px;overflow:hidden}
.gender-bar{
  height:100%;border-radius:8px;display:flex;align-items:center;
  justify-content:flex-end;padding-right:10px;
  font-size:11px;font-weight:600;color:#FFF;
  transition:width .6s cubic-bezier(.4,0,.2,1);min-width:0;
}
.gender-bar.male{background:linear-gradient(90deg,#60A5FA,#2563EB);box-shadow:0 2px 8px rgba(37,99,235,.25)}
.gender-bar.female{background:linear-gradient(90deg,#F472B6,#DB2777);box-shadow:0 2px 8px rgba(219,39,119,.25)}
.gender-icon{font-size:16px;flex-shrink:0;color:#2563EB}
.gender-icon.female-icon{color:#DB2777}
.age-bars{display:flex;flex-direction:column;gap:10px}
.age-bar-item{display:flex;align-items:center;gap:12px}
.age-label{width:38px;font-size:11px;color:var(--text-secondary);text-align:right;font-weight:500}
.age-track{flex:1;height:8px;background:var(--border-light);border-radius:4px;overflow:hidden}
.age-fill{height:100%;border-radius:4px;transition:width .6s cubic-bezier(.4,0,.2,1)}
.age-val{width:32px;font-size:11px;color:var(--text-tertiary);font-family:var(--font-mono);font-weight:500}
.region-list{display:flex;flex-direction:column;gap:10px}
.region-item{display:flex;align-items:center;gap:10px}
.ri-rank{
  width:22px;height:22px;border-radius:6px;font-size:10px;font-weight:700;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  background:var(--border-light);color:var(--text-tertiary);
}
.ri-rank.rank-1{background:var(--accent);color:#FFF}
.ri-rank.rank-2{background:var(--accent-light);color:var(--accent-deep)}
.ri-rank.rank-3{background:var(--border-light);color:var(--text-secondary);font-weight:600}
.ri-name{width:42px;font-size:12px;color:var(--text-primary);text-align:right;flex-shrink:0;font-weight:500}
.ri-bar{flex:1;height:6px;background:var(--border-light);border-radius:3px;overflow:hidden}
.ri-fill{
  height:100%;border-radius:3px;
  background:linear-gradient(90deg,var(--accent-deep),var(--accent));
  transition:width .6s cubic-bezier(.4,0,.2,1);
}
.ri-val{width:32px;font-size:11px;color:var(--text-tertiary);font-family:var(--font-mono);font-weight:500}
.consume-donut{display:flex;align-items:center;gap:24px}
.donut-legend{display:flex;flex-direction:column;gap:8px}
.dl-item{display:flex;align-items:center;gap:8px}
.dl-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
.dl-label{font-size:12px;color:var(--text-secondary);font-weight:500}
.dl-val{font-size:12px;color:var(--text-tertiary);font-family:var(--font-mono);margin-left:auto;font-weight:500}

/* ══ TABLE ══ */
.data-table{width:100%;border-collapse:collapse}
.data-table thead th{
  text-align:left;padding:13px 14px;font-size:10px;font-weight:600;
  color:var(--text-tertiary);letter-spacing:.8px;text-transform:uppercase;
  border-bottom:2px solid var(--border);background:var(--bg);
}
.data-table tbody td{
  padding:13px 14px;font-size:13px;color:var(--text-primary);
  border-bottom:1px solid var(--border-light);transition:background .12s;
}
.data-table tbody tr{transition:background .12s}
.data-table tbody tr:hover{background:#F8FAFC}
.data-table tbody tr:last-child td{border-bottom:none}
.td-mono{font-family:var(--font-mono);font-size:12px}
.td-price{font-family:var(--font-mono);font-weight:600;color:var(--text-primary)}
.td-time{font-size:12px;color:var(--text-tertiary)}
.status-tag{font-size:11px;padding:3px 10px;border-radius:5px;font-weight:600;letter-spacing:.2px}
.status-tag.paid{background:#DBEAFE;color:#1D4ED8}
.status-tag.shipped{background:#FEF3C7;color:#B45309}
.status-tag.pending{background:#FCE7F3;color:#BE185D}
.status-tag.done{background:#D1FAE5;color:#047857}
.status-tag.cancel{background:var(--border-light);color:#78716C}

/* ══ TOP PRODUCTS ══ */
.top-items{display:flex;flex-direction:column;gap:8px}
.top-item{
  display:flex;align-items:center;gap:12px;padding:10px 12px;
  border-radius:10px;transition:all var(--transition);cursor:default;
}
.top-item:hover{background:#F8FAFC}
.ti-rank{
  width:26px;height:26px;border-radius:7px;font-size:11px;font-weight:700;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  background:var(--border-light);color:var(--text-tertiary);
}
.ti-rank.tr-1{background:var(--accent);color:#FFF}
.ti-rank.tr-2{background:var(--accent-light);color:var(--accent-deep)}
.ti-rank.tr-3{background:var(--border-light);color:var(--text-secondary);font-weight:600}
.ti-avatar{
  width:38px;height:38px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font-size:14px;font-weight:700;color:var(--text-primary);
  flex-shrink:0;border:2px solid var(--border-light);
}
.ti-info{flex:1;min-width:0}
.ti-name{
  font-size:13px;font-weight:600;color:var(--text-primary);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.ti-sales{font-size:11px;color:var(--text-tertiary);margin-top:2px}
.ti-revenue{font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--accent)}
.empty-hint{text-align:center;padding:48px 20px}
.empty-hint p{font-size:15px;color:var(--text-secondary);font-weight:500;margin-bottom:6px}
.empty-hint span{font-size:12px;color:var(--text-tertiary)}

/* ══ USER MANAGEMENT ══ */
.um-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.um-search-box{
  flex:1;min-width:200px;max-width:380px;
  display:flex;align-items:center;gap:8px;padding:0 14px;height:40px;
  background:var(--bg);border:1.5px solid var(--border);border-radius:10px;
  transition:all var(--transition);
}
.um-search-box:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft);background:var(--surface)}
.um-search-icon{color:var(--text-tertiary);flex-shrink:0}
.um-search-input{flex:1;border:none;outline:none;background:none;font-family:inherit;font-size:13px;color:var(--text-primary)}
.um-search-input::placeholder{color:var(--text-tertiary)}
.um-clear-btn{padding:2px;border:none;background:none;color:var(--text-tertiary);cursor:pointer;display:flex;align-items:center}
.um-clear-btn:hover{color:var(--text-primary)}
.um-select{
  height:40px;padding:0 34px 0 14px;
  border:1.5px solid var(--border);border-radius:10px;
  background:var(--surface);font-family:inherit;font-size:13px;
  color:var(--text-primary);cursor:pointer;
  -webkit-appearance:none;appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23A1A1AA' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 12px center;
  transition:border-color var(--transition);
}
.um-select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.um-btn{
  height:40px;padding:0 18px;border:1.5px solid var(--border);border-radius:10px;
  font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;
  display:flex;align-items:center;gap:6px;
  transition:all var(--transition);white-space:nowrap;
}
.um-btn-search{
  background:var(--accent);color:#FFF;border-color:transparent;
  box-shadow:0 2px 8px rgba(37,99,235,.25);
}
.um-btn-search:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(37,99,235,.35)}
.um-btn-reset{background:var(--surface);color:var(--text-secondary)}
.um-btn-reset:hover{border-color:var(--text-primary);color:var(--text-primary);background:var(--bg)}
.um-loading{
  display:flex;flex-direction:column;align-items:center;gap:14px;
  padding:60px 0;color:var(--text-tertiary);font-size:13px;
}
.um-spinner{
  width:32px;height:32px;
  border:3px solid var(--border-light);border-top-color:var(--accent);
  border-radius:50%;animation:um-spin .7s linear infinite;
}
@keyframes um-spin{to{transform:rotate(360deg)}}
.um-table thead tr{position:sticky;top:0;z-index:2;background:var(--bg)}
.um-table thead th{white-space:nowrap}
.um-user-cell{display:flex;align-items:center;gap:10px}
.um-avatar{width:34px;height:34px;border-radius:10px;object-fit:cover;flex-shrink:0;border:2px solid var(--border-light)}
.um-avatar-placeholder{
  background:var(--accent-soft);color:var(--accent);font-weight:700;font-size:13px;
  display:flex;align-items:center;justify-content:center;
}
.um-role-tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:5px}
.um-role-tag.role-0{background:#EFF6FF;color:#1D4ED8}
.um-role-tag.role-1{background:#FEF3C7;color:#B45309}
.um-role-tag.role-2{background:#DBEAFE;color:#1E40AF}
.um-status-tag{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500}
.um-status-dot{width:7px;height:7px;border-radius:50%;box-shadow:0 0 6px currentColor}
.um-status-tag.on .um-status-dot{background:#10B981}
.um-status-tag.on{color:#059669}
.um-status-tag.off .um-status-dot{background:#EF4444}
.um-status-tag.off{color:#DC2626}
.um-actions{display:flex;gap:6px}
.um-act-btn{
  width:32px;height:32px;border-radius:8px;
  border:1.5px solid var(--border);background:var(--surface);
  color:var(--text-secondary);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all var(--transition);
}
.um-act-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-soft);transform:translateY(-1px)}
.um-act-btn.danger:hover{border-color:#EF4444;color:#EF4444;background:#FEF2F2}
.um-act-btn.success:hover{border-color:#10B981;color:#059669;background:#ECFDF5}
.um-pagination{display:flex;align-items:center;justify-content:space-between;padding:16px 0 0;gap:12px}
.ump-info{font-size:12px;color:var(--text-tertiary);font-weight:500}
.ump-btns{display:flex;gap:5px}
.ump-btn{
  min-width:36px;height:34px;padding:0 12px;
  border:1.5px solid var(--border);border-radius:8px;
  background:var(--surface);font-family:inherit;font-size:12px;font-weight:500;
  color:var(--text-secondary);cursor:pointer;transition:all var(--transition);
}
.ump-btn:hover:not(:disabled){border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
.ump-btn.active{
  background:var(--accent);color:#FFF;border-color:transparent;
  font-weight:600;box-shadow:0 2px 8px rgba(37,99,235,.25);
}
.ump-btn:disabled{opacity:.35;cursor:not-allowed}

/* ══ DRAWER ══ */
.um-drawer-overlay{
  position:fixed;inset:0;z-index:100;
  background:rgba(24,24,27,.4);backdrop-filter:blur(4px);
  display:flex;justify-content:flex-end;
}
.um-drawer{
  width:420px;max-width:100vw;height:100%;
  background:var(--surface);box-shadow:-16px 0 48px rgba(0,0,0,.12);
  display:flex;flex-direction:column;overflow:hidden;
}
.umd-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 28px;border-bottom:1px solid var(--border-light);flex-shrink:0;
}
.umd-head h3{font-size:16px;font-weight:600;color:var(--text-primary);font-family:var(--font-serif)}
.umd-close{
  width:34px;height:34px;border-radius:8px;
  border:1.5px solid var(--border);background:var(--surface);
  color:var(--text-tertiary);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all var(--transition);
}
.umd-close:hover{border-color:var(--text-primary);color:var(--text-primary)}
.umd-body{flex:1;overflow-y:auto;padding:28px}
.umd-avatar-section{
  display:flex;align-items:center;gap:16px;
  padding-bottom:28px;margin-bottom:28px;
  border-bottom:1px solid var(--border-light);
}
.umd-avatar-img{width:60px;height:60px;border-radius:16px;object-fit:cover;flex-shrink:0;border:3px solid var(--border-light)}
.umd-avatar-placeholder{
  background:var(--accent-soft);color:var(--accent);
  font-size:22px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
}
.umd-avatar-info{display:flex;flex-direction:column;gap:3px}
.umd-name{font-size:17px;font-weight:600;color:var(--text-primary)}
.umd-username{font-size:12px;color:var(--text-tertiary);font-weight:400}
.umd-fields{display:flex;flex-direction:column}
.umd-field{
  display:flex;align-items:center;justify-content:space-between;
  padding:15px 0;border-bottom:1px solid var(--border-light);
}
.umd-field:last-child{border-bottom:none}
.umdf-label{font-size:12px;color:var(--text-tertiary);font-weight:500}
.umdf-value{font-size:13px;color:var(--text-primary);font-weight:500}
.drawer-slide-enter-active,.drawer-slide-leave-active{transition:all .3s ease}
.drawer-slide-enter-active .um-drawer,.drawer-slide-leave-active .um-drawer{transition:transform .3s cubic-bezier(.4,0,.2,1)}
.drawer-slide-enter-from{opacity:0}
.drawer-slide-enter-from .um-drawer{transform:translateX(100%)}
.drawer-slide-leave-to{opacity:0}
.drawer-slide-leave-to .um-drawer{transform:translateX(100%)}

/* ══ CATEGORY MANAGEMENT ══ */
.cat-group{border-bottom:1px solid var(--border-light)}
.cat-group:last-child{border-bottom:none}
.cat-row{
  display:flex;align-items:center;gap:10px;
  padding-top:13px;padding-bottom:13px;padding-right:20px;
  transition:background .12s;cursor:default;
}
.cat-row:hover{background:#F8FAFC}
.cat-row-clickable{cursor:pointer}
.cat-expand{
  width:20px;height:20px;display:flex;align-items:center;justify-content:center;
  color:var(--text-tertiary);flex-shrink:0;
}
.cat-expand-spacer{visibility:hidden}
.cat-icon-top{color:var(--accent);flex-shrink:0}
.cat-icon-sub{color:var(--text-tertiary);flex-shrink:0}
.cat-name{font-size:13px;color:var(--text-primary);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cat-count{
  font-size:11px;color:var(--text-tertiary);font-family:var(--font-mono);
  background:var(--border-light);padding:2px 8px;border-radius:4px;white-space:nowrap;
}
.cat-actions{display:flex;gap:5px;margin-left:auto}

/* ══ CATEGORY MODAL ══ */
.cat-modal-overlay{
  position:fixed;inset:0;z-index:100;
  background:rgba(24,24,27,.4);backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;
}
.cat-modal{
  width:440px;max-width:92vw;max-height:80vh;
  background:var(--surface);border-radius:var(--radius);overflow:hidden;
  box-shadow:0 24px 80px rgba(0,0,0,.18);
  display:flex;flex-direction:column;
}
.catm-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 24px;border-bottom:1px solid var(--border-light);
}
.catm-head h3{font-size:16px;font-weight:600;color:var(--text-primary);font-family:var(--font-serif)}
.catm-body{padding:24px;display:flex;flex-direction:column;gap:18px;flex:1;overflow-y:auto}
.catm-input{
  width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;
  font-family:inherit;font-size:13px;color:var(--text-primary);outline:none;
  transition:border-color var(--transition);background:var(--bg);
}
.catm-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.catm-error{font-size:12px;color:#EF4444;margin-top:-8px}
.catm-footer{
  display:flex;justify-content:flex-end;gap:10px;
  padding:16px 24px;border-top:1px solid var(--border-light);background:var(--bg);
}

/* ══ NOTICE FORM ══ */
.notice-form{max-width:640px}
.nf-row{margin-bottom:16px}
.nf-label{display:block;font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:6px}
.nf-input{
  width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;
  font-family:inherit;font-size:13px;color:var(--text-primary);outline:none;
  transition:border-color var(--transition);background:var(--bg);
}
.nf-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.nf-textarea{resize:vertical;min-height:100px;line-height:1.6}
.nf-error{font-size:12px;color:#EF4444;margin-top:-8px;margin-bottom:12px}
.nf-success{font-size:12px;color:#10B981;margin-top:-8px;margin-bottom:12px;font-weight:500}
.nf-actions{display:flex;gap:10px}

.modal-fade-enter-active,.modal-fade-leave-active{transition:all .2s ease}
.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}
.modal-fade-enter-from .cat-modal{transform:scale(.95)}
.modal-fade-leave-to .cat-modal{transform:scale(.98)}

/* ══ RESPONSIVE ══ */
/* ══ PRODUCT MANAGEMENT ══ */
.prod-img-wrap {
  width: 52px; height: 52px; border-radius: 9px; overflow: hidden;
  cursor: pointer; position: relative; flex-shrink: 0;
  border: 1px solid var(--border-light);
  transition: box-shadow 0.15s, transform 0.15s;
}
.prod-img-wrap:hover {
  box-shadow: 0 0 0 3px var(--accent-soft);
  transform: scale(1.05);
}
.prod-img-wrap:hover .prod-img-zoom-icon { opacity: 1; }
.prod-img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.prod-img-placeholder {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: var(--border-light); color: var(--text-tertiary);
}
.prod-img-zoom-icon {
  position: absolute; bottom: 3px; right: 3px;
  width: 20px; height: 20px; border-radius: 5px;
  background: rgba(0,0,0,0.55); color: #FFF;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.15s;
}
.prod-name { font-weight: 500; color: var(--text-primary); }
.prod-shop { font-size: 12px; color: var(--text-tertiary); }

/* status tag */
.prod-status-tag {
  display: inline-block; padding: 3px 10px; border-radius: 6px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}
.prod-status-tag.pending { background: #FEF3C7; color: #D97706; }
.prod-status-tag.active { background: #D1FAE5; color: #059669; }
.prod-status-tag.inactive { background: #F3F4F6; color: #6B7280; }

/* action buttons */
.prod-actions { display: flex; gap: 6px; }
.prod-no-action { color: var(--text-tertiary); font-size: 12px; }
.pact-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 10px; border-radius: 7px; border: none;
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: all 0.15s; font-family: inherit;
}
.pact-btn.approve { background: #D1FAE5; color: #059669; }
.pact-btn.approve:hover { background: #A7F3D0; }
.pact-btn.reject { background: #FEE2E2; color: #DC2626; }
.pact-btn.reject:hover { background: #FECACA; }
.pact-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* filter select */
.um-filter-select {
  padding: 8px 12px; border: 1.5px solid var(--border); border-radius: 10px;
  font-family: inherit; font-size: 13px; color: var(--text-primary);
  background: var(--bg); outline: none; cursor: pointer;
  transition: border-color var(--transition); min-width: 110px;
}
.um-filter-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

/* ══ COUPON MANAGEMENT - 大厂风格 ══ */
/* Stats Row */
.coupon-stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;
}
.coupon-stat-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 18px 20px; display: flex; align-items: center; gap: 14px;
  transition: all var(--transition);
}
.coupon-stat-card:hover {
  transform: translateY(-2px); box-shadow: var(--shadow-lg); border-color: var(--accent-light);
}
.csc-icon {
  width: 42px; height: 42px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  color: #FFF; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.csc-info { display: flex; flex-direction: column; gap: 2px; }
.csc-value { font-size: 24px; font-weight: 700; color: var(--text-primary); font-family: var(--font-mono); letter-spacing: -0.5px; line-height: 1; }
.csc-label { font-size: 12px; color: var(--text-tertiary); font-weight: 500; }

/* Empty State */
.coupon-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 64px 20px; text-align: center;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
}
.coupon-empty-illustration { margin-bottom: 20px; }
.coupon-empty-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
.coupon-empty-desc { font-size: 13px; color: var(--text-tertiary); }

/* Card Grid */
.coupon-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;
}

/* Coupon Card */
.coupon-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  overflow: hidden; display: flex;
  transition: all var(--transition);
  position: relative;
}
.coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04);
  border-color: #CBD5E1;
}
.coupon-card.is-ended { opacity: 0.55; }
.coupon-card.is-ended:hover { opacity: 0.7; }

/* Left accent bar */
.coupon-card-accent {
  width: 4px; flex-shrink: 0;
  background: linear-gradient(180deg, #3B82F6, #2563EB);
}
.coupon-card-accent.accent-free { background: linear-gradient(180deg, #10B981, #059669); }
.coupon-card-accent.accent-per { background: linear-gradient(180deg, #F59E0B, #D97706); }
.coupon-card-accent.accent-discount { background: linear-gradient(180deg, #8B5CF6, #7C3AED); }

.coupon-card-body {
  flex: 1; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; min-width: 0;
}

/* Header */
.coupon-card-header {
  display: flex; align-items: center; justify-content: space-between;
}

.coupon-type-badge {
  display: inline-block; padding: 3px 10px; border-radius: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
  background: #EFF6FF; color: #1D4ED8;
}
.coupon-type-badge.badge-free { background: #ECFDF5; color: #059669; }
.coupon-type-badge.badge-per { background: #FFFBEB; color: #D97706; }
.coupon-type-badge.badge-discount { background: #F5F3FF; color: #7C3AED; }

.coupon-card-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
.coupon-card:hover .coupon-card-actions { opacity: 1; }
.cc-act-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1.5px solid var(--border); background: var(--surface);
  color: var(--text-tertiary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all var(--transition);
}
.cc-act-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.cc-act-btn.danger:hover { border-color: #EF4444; color: #EF4444; background: #FEF2F2; }

/* Name */
.coupon-card-name {
  font-size: 14px; font-weight: 600; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* Value */
.coupon-card-value {
  display: flex; align-items: baseline; gap: 10px;
}
.ccv-amount {
  font-size: 28px; font-weight: 700; color: #EF4444;
  font-family: var(--font-mono); letter-spacing: -1px; line-height: 1;
}
.coupon-card.is-ended .ccv-amount { color: #9CA3AF; }
.ccv-threshold {
  font-size: 12px; color: var(--text-tertiary); font-weight: 500;
  background: var(--border-light); padding: 2px 8px; border-radius: 4px;
}

/* Meta */
.coupon-card-meta {
  display: flex; flex-direction: column; gap: 5px;
}
.ccm-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--text-tertiary);
}
.ccm-item svg { color: var(--text-tertiary); flex-shrink: 0; }

/* Footer */
.coupon-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 8px; border-top: 1px solid var(--border-light);
}
.coupon-status-pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 500;
}
.csp-dot { width: 6px; height: 6px; border-radius: 50%; }
.coupon-status-pill.on .csp-dot { background: #10B981; box-shadow: 0 0 6px rgba(16,185,129,0.4); }
.coupon-status-pill.on { color: #059669; }
.coupon-status-pill.off .csp-dot { background: #9CA3AF; }
.coupon-status-pill.off { color: #9CA3AF; }
.coupon-code-hint {
  font-size: 10px; padding: 2px 8px; border-radius: 4px;
  background: #FFF7ED; color: #EA580C; font-weight: 600;
}

/* ══ COUPON MODAL ══ */
.coupon-modal {
  width: 820px; max-width: 94vw; max-height: 86vh;
  background: var(--surface); border-radius: 16px; overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.18);
  display: flex; flex-direction: column;
}
.coupon-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 28px; border-bottom: 1px solid var(--border-light); flex-shrink: 0;
}
.cmh-left { display: flex; align-items: center; gap: 14px; }
.cmh-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #DBEAFE, #2563EB);
  display: flex; align-items: center; justify-content: center; color: #FFF;
  box-shadow: 0 4px 12px rgba(37,99,235,0.2);
}
.cmh-left h3 { font-size: 17px; font-weight: 600; color: var(--text-primary); }
.cmh-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

.coupon-modal-body {
  display: flex; flex: 1; overflow: hidden;
}

/* Preview Panel */
.cmb-preview {
  width: 280px; flex-shrink: 0;
  background: #F8FAFC; border-right: 1px solid var(--border-light);
  padding: 28px 24px;
  display: flex; flex-direction: column; align-items: center;
}
.cmbp-card {
  width: 100%; border-radius: 12px; overflow: hidden;
  display: flex; height: 120px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.cmbp-left {
  width: 110px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; color: #FFF;
}
.cmbp-4 .cmbp-left { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.cmbp-3 .cmbp-left { background: linear-gradient(135deg, #10B981, #059669); }
.cmbp-2 .cmbp-left { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }
.cmbp-1 .cmbp-left { background: linear-gradient(135deg, #F59E0B, #D97706); }
.cmbp-value { font-size: 14px; font-weight: 500; letter-spacing: 0.5px; }
.cmbp-value em { font-size: 28px; font-weight: 700; font-style: normal; letter-spacing: -1px; }
.cmbp-cond { font-size: 11px; opacity: 0.8; }
.cmbp-right {
  flex: 1; background: #FFF;
  display: flex; flex-direction: column; justify-content: center;
  padding: 16px; gap: 4px; min-width: 0;
}
.cmbp-name { font-size: 13px; font-weight: 600; color: #18181B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cmbp-type { font-size: 11px; color: var(--text-tertiary); }
.cmbp-date { font-size: 10px; color: #CBD5E1; font-family: var(--font-mono); }
.cmbp-hint { font-size: 11px; color: #CBD5E1; margin-top: 16px; }

/* Form Panel */
.cmb-form {
  flex: 1; overflow-y: auto; padding: 24px 28px;
  display: flex; flex-direction: column; gap: 20px;
}
.cmbf-group { display: flex; flex-direction: column; gap: 10px; }
.cmbf-label {
  font-size: 11px; font-weight: 600; color: var(--text-tertiary);
  letter-spacing: 1px; text-transform: uppercase;
  padding-bottom: 4px; border-bottom: 1px solid var(--border-light);
}
.cmbf-row { display: flex; gap: 12px; }
.cmbf-field { display: flex; flex-direction: column; gap: 5px; }
.cmbf-tag { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
.cmbf-tag i { color: #EF4444; font-style: normal; margin-left: 1px; }
.cmbf-input-wrap { position: relative; display: flex; align-items: center; }
.cmbf-prefix {
  position: absolute; left: 12px; font-size: 13px; color: var(--text-tertiary);
  font-weight: 600; z-index: 1; pointer-events: none;
}
.cmbf-suffix {
  position: absolute; right: 12px; font-size: 12px; color: var(--text-tertiary);
  font-weight: 600; z-index: 1; pointer-events: none;
}
.cmbf-input {
  width: 100%; padding: 9px 13px; border: 1.5px solid var(--border); border-radius: 9px;
  font-family: inherit; font-size: 13px; color: var(--text-primary);
  background: var(--bg); outline: none;
  transition: all var(--transition);
}
.cmbf-input.has-prefix { padding-left: 28px; }
.cmbf-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); background: var(--surface); }
.cmbf-select {
  width: 100%; padding: 9px 32px 9px 13px; border: 1.5px solid var(--border); border-radius: 9px;
  font-family: inherit; font-size: 13px; color: var(--text-primary);
  background: var(--bg); outline: none;
  -webkit-appearance: none; appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23A1A1AA' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center;
  transition: all var(--transition);
}
.cmbf-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); background: var(--surface); }
.cmbf-check {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
}
.cmbf-check input[type="checkbox"] {
  width: 16px; height: 16px; accent-color: var(--accent); cursor: pointer;
}
.cmbf-check-text { font-size: 13px; color: var(--text-secondary); user-select: none; }

/* Modal Footer */
.coupon-modal-foot {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 28px; border-top: 1px solid var(--border-light);
  background: var(--bg); flex-shrink: 0;
}

/* Responsive */
@media(max-width: 860px) {
  .coupon-modal { max-width: 98vw; }
  .coupon-modal-body { flex-direction: column; }
  .cmb-preview { width: 100%; padding: 20px; flex-direction: row; align-items: flex-start; gap: 20px; }
  .cmbp-card { width: 220px; flex-shrink: 0; }
  .cmb-form { padding: 20px; }
}
.img-zoom-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.78); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}
.img-zoom-close {
  position: absolute; top: 20px; right: 20px;
  width: 40px; height: 40px; border-radius: 10px; border: none;
  background: rgba(255,255,255,0.12); color: #FFF;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.img-zoom-close:hover { background: rgba(255,255,255,0.2); }
.img-zoom-src {
  max-width: 90vw; max-height: 85vh;
  border-radius: 12px; box-shadow: 0 24px 80px rgba(0,0,0,0.4);
  object-fit: contain;
}

@media(max-width:1200px){.stats-row{grid-template-columns:repeat(2,1fr)}.content-grid-2{grid-template-columns:1fr}}
@media(max-width:768px){
  .ad-sidebar{width:68px}.ad-sidebar .ads-brand-text,.ad-sidebar .ads-nav-item span,.ad-sidebar .ads-badge{display:none}
  .stats-row{grid-template-columns:1fr}
  .ad-content{padding:20px}
  .ad-topbar{padding:0 20px}
}
</style>
