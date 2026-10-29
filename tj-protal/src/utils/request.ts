import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { getApiHost } from '@/config/proxy'
import { ElMessageBox } from 'element-plus'
import router from '@/router'
import { tryRefreshToken } from '@/utils/refreshToken'
import { BizCode, type R } from '@/types/api'

const host: string = getApiHost()

let isLogin = true

const instance: AxiosInstance = axios.create({
  baseURL: host,
  timeout: 1000,
  withCredentials: false,
})

instance.interceptors.request.use((config) => {
  const TOKEN = sessionStorage.getItem('token')
  const userInfoStr = sessionStorage.getItem('userInfo')
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {}

  const userName = userInfo.name || ''
  const userGender =
    userInfo.gender === 0 ? '男' : userInfo.gender === 1 ? '女' : ''
  const userProvince = userInfo.province || ''
  const userCity = userInfo.city || ''
  const encodedUserName = encodeURIComponent(userName)
  const encodedUserGender = encodeURIComponent(userGender)
  const encodedUserProvince = encodeURIComponent(userProvince)
  const encodedUserCity = encodeURIComponent(userCity)
  config.headers = {
    'Content-Type': 'application/json',
    authorization: TOKEN,
    'X-User-Name': encodedUserName,
    'X-User-Gender': encodedUserGender,
    'X-User-Province': encodedUserProvince,
    'X-User-City': encodedUserCity,
  } as never
  return config
})

instance.defaults.timeout = 5000

async function refreshToken(err: { config: AxiosRequestConfig }): Promise<unknown> {
  const success: boolean = await tryRefreshToken()
  if (success) {
    return instance(err.config)
  }
  ElMessageBox.alert('请先登录！', '未登录或登录超时', {
    confirmButtonText: '重新登录',
    callback: () => {
      router.push('/login')
    },
  })
  return true
}

function alertLoginMessage(): void {
  isLogin = false
  sessionStorage.removeItem('userInfo')
  sessionStorage.removeItem('token')
  ElMessageBox.confirm(
    '您的账号登录超时或在其他机器登录，请重新登录或更换账号登录！',
    '登录超时',
    {
      confirmButtonText: '重新登录',
      cancelButtonText: '继续浏览',
      type: 'warning',
    }
  )
    .then(() => {
      router.push('/login')
    })
    .catch(() => {
      router.go(0)
    })
}

instance.interceptors.response.use(
  async (response: AxiosResponse) => {
    const code: number = response.data.code
    if (code === BizCode.SUCC) {
      return response.data
    }

    if (code === BizCode.UNAUTH && isLogin) {
      isLogin = false
      alertLoginMessage()
    }

    return response.data
  },
  async (err) => {
    console.log(err)
    if (err.response.status === 401 && isLogin) {
      return refreshToken(err)
    }
    return Promise.reject(err)
  }
)

export function request<T>(config: AxiosRequestConfig): Promise<R<T>> {
  return instance(config) as unknown as Promise<R<T>>
}

export default instance
