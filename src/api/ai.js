import request from '../utils/request'

/**
 * 发送消息给 AI 助手
 * @param {Object} data - { message: string, sessionId?: string }
 * @returns {Promise} - { code, data: { reply, sessionId } }
 */
export const sendAiMessage = (data) => request.post('/ai/chat', data)

/**
 * 获取 AI 对话历史
 * @param {string} sessionId - 会话 ID
 * @returns {Promise}
 */
export const getAiHistory = (sessionId) => request.get('/ai/history', { params: { sessionId } })

/**
 * 清除 AI 对话历史
 * @param {string} sessionId - 会话 ID
 * @returns {Promise}
 */
export const clearAiHistory = (sessionId) => request.delete('/ai/history/clear', { params: { sessionId } })

/**
 * AI 辅助商品审核
 * @param {Object} data - { name, price, stock }
 * @returns {Promise} - { code, data: { suggestion, reason } }
 */
export const aiReviewItem = (data) => request.post('/ai/review/item', data)
