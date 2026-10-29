import axios from 'axios'
import { getApiHost } from '@/config/proxy'

const host: string = getApiHost()

const sleep = (delay: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delay))

let isRefresh = false
let success = false

export async function tryRefreshToken(): Promise<boolean> {
  if (isRefresh) {
    while (isRefresh) {
      await sleep(10)
    }
    return success
  }
  isRefresh = true
  const resp = await axios.get(host + '/as/accounts/refresh', {
    withCredentials: true,
  })
  if (resp.status === 200 && resp.data.code === 200) {
    sessionStorage.setItem('token', resp.data.data)
    success = true
  } else {
    sessionStorage.removeItem('token')
    success = false
  }
  isRefresh = false
  return success
}
