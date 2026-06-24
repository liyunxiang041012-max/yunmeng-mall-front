<template>
    <div class="register-container">
      <div class="register-box">
        <div class="register-header">
          <h2>云梦商城</h2>
          <p>用户注册</p>
        </div>
        
        <el-form 
          ref="registerFormRef" 
          :model="registerForm" 
          :rules="registerRules" 
          class="register-form"
          @keyup.enter="handleRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item prop="nickname">
            <el-input
              v-model="registerForm.nickname"
              placeholder="请输入昵称"
              prefix-icon="User"
              size="large"
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="register-button"
              :loading="loading"
              @click="handleRegister"
            >
              {{ loading ? '注册中...' : '注册' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="register-footer">
          <span>已有账号？</span>
          <el-link type="primary" @click="goToLogin">立即登录</el-link>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { register, sendSmsCode as apiSendSms, login } from '@/api/user'  // ← 引入真实接口
  
  const router = useRouter()
  const registerFormRef = ref()
  const loading = ref(false)
  const countdown = ref(0)
  const registerForm = reactive({
    phone: '',        // ← 改成手机号
    password: '',
    confirmPassword: '',
    nickname: ''      // ← 昵称
  })
  
const doSendSms = async () => {
  // 先验证手机号格式
  try {
    await registerFormRef.value.validateField('phone')
  } catch {
    return
  }

  // 手机号格式正确，请求后端发验证码
  try {
    const res = await apiSendSms({ phone: registerForm.phone })
    // 成功才走到这里
    ElMessage.success('验证码已发送')

    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (err) {
    ElMessage.error('验证码发送失败，请稍后重试')
  }
}
  // 手机号格式验证
  const validatePhone = (rule, value, callback) => {
    const phoneReg = /^1[3-9]\d{9}$/
    if (!value) {
      callback(new Error('请输入手机号'))
    } else if (!phoneReg.test(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  }
  
  // 确认密码验证
  const validateConfirmPassword = (rule, value, callback) => {
    if (!value) {
      callback(new Error('请再次输入密码'))
    } else if (value !== registerForm.password) {
      callback(new Error('两次输入密码不一致'))
    } else {
      callback()
    }
  }
  
  // 密码强度验证：至少8位，且包含字母和数字
const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 8) {
    callback(new Error('密码长度至少8位'))
  } else if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
    callback()
  }
}

  const registerRules = {
    phone: [
      { validator: validatePhone, trigger: 'blur' }
    ],
    password: [
    { validator: validatePassword, trigger: 'blur' }
    ],
    confirmPassword: [
      { validator: validateConfirmPassword, trigger: 'blur' }
    ],
    nickname: [
      { required: true, message: '请输入昵称', trigger: 'blur' },
      { max: 20, message: '昵称最多20个字符', trigger: 'blur' }
    ]
  }
  
  const handleRegister = async () => {
    if (!registerFormRef.value) return
    
    try {
      await registerFormRef.value.validate()
      loading.value = true
  
      // 👇 清掉旧 token，防止注册请求带上已登录商家的身份
      localStorage.removeItem('token')
      
      // 调用真实注册接口
      await register({
        phone: registerForm.phone,
        password: registerForm.password,
        nickname: registerForm.nickname
      })
      
      // 后端注册接口返回 data: null，需调 login 获取 token
      const loginRes = await login({ account: registerForm.phone, password: registerForm.password })
      localStorage.setItem('token', loginRes.token)
      ElMessage.success('注册成功！')
      router.push('/profile/setup')
  
    } catch (err) {
      ElMessage.error('注册失败，该手机号可能已注册')
    } finally {
      loading.value = false
    }
  }
  // 发验证码按钮点击
const sendCode = async () => {
  // 单独验证手机号字段
  try {
    await registerFormRef.value.validateField('phone')
  } catch {
    return
  }

  // 手机号格式正确，发验证码
  try {
    const res = await apiSendSms({ phone: registerForm.phone })
    // 成功才走到这里
    ElMessage.success('验证码已发送')
  } catch (err) {
    ElMessage.error('验证码发送失败，请稍后重试')
    return
  }

  // 倒计时60秒
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}
  const goToLogin = () => {
    router.push('/login')
  }
  </script>

  <style scoped>
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }
  
  .register-box {
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    padding: 40px 30px;
  }
  
  .register-header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .register-header h2 {
    color: #333;
    font-size: 28px;
    margin-bottom: 10px;
  }
  
  .register-header p {
    color: #666;
    font-size: 14px;
  }
  
  .register-form {
    margin-bottom: 20px;
  }
  
  .register-button {
    width: 100%;
  }
  
  .register-footer {
    text-align: center;
    color: #666;
    font-size: 14px;
  }
  
  .register-footer span {
    margin-right: 5px;
  }
  </style>