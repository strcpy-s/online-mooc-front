import axios from 'axios';
import { getApiHost } from '../config/proxy';
import { ElMessage, ElMessageBox } from 'element-plus';
import  router  from '../router';
import {ref} from "vue";
import {tryRefreshToken} from './refreshToken'

const host = getApiHost(); // 开发服务器下为空串，走 vite 反向代理；mock 模式走远程 Mock 服务
const CODE = {
  LOGIN_TIMEOUT: 1000,
  REQUEST_SUCCESS: 200,
  REQUEST_FOBID: 1001,
};
// 登录异常弹窗处理
let isLogin = true
// 刷新标记
// let refreshing = ref(false)

const instance = axios.create({
  baseURL:  host,
  timeout: 1000,
  withCredentials: false,
});

instance.interceptors.request.use((config) => {
  const TOKEN = sessionStorage.getItem('token');
 // 从sessionStorage获取并解析用户信息
 const userInfoStr = sessionStorage.getItem('userInfo');
 const userInfo = userInfoStr ? JSON.parse(userInfoStr) : {};
  
   // 安全地获取用户信息
 const userName = userInfo.name || '';
 const userGender = userInfo.gender === 0 ? '男' : (userInfo.gender === 1 ? '女' : '');
 const userProvince = userInfo.province || '';
 const userCity = userInfo.city || '';
 // 对可能包含非ASCII字符的值进行编码
 const encodedUserName = encodeURIComponent(userName);
 const encodedUserGender = encodeURIComponent(userGender);
 const encodedUserProvince = encodeURIComponent(userProvince);
 const encodedUserCity = encodeURIComponent(userCity);
  config.headers = {
    "Content-Type": "application/json",
    "authorization": TOKEN,
    "X-User-Name": encodedUserName,
    "X-User-Gender": encodedUserGender,
    "X-User-Province": encodedUserProvince,
    "X-User-City": encodedUserCity,
  }
  return config
});

instance.defaults.timeout = 5000;
async function refreshToken(err){
  // 尝试刷新token
  let success = await tryRefreshToken();
  if(success){
    // refreshing.value = false;
    return instance(err.config);
  }
  // refreshing.value = false;
  ElMessageBox.alert(
    '请先登录！',
    '未登录或登录超时',
    {
      confirmButtonText: '重新登录',
      callback: () => {
        router.push('/login')
      },
    }
  )
  return true;
}
function alertLoginMessage() {
  isLogin = false;
  sessionStorage.removeItem('userInfo');
  sessionStorage.removeItem("token");
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
// const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
instance.interceptors.response.use(
  async (response) => {
    // 1.获取业务状态码
    let code = response.data.code;
    // 2.业务状态码为200，直接返回
    if (code === CODE.REQUEST_SUCCESS) {
      return response.data;
    }

    // 3.业务状态码为401，代表未登录
    if (code === 401 && isLogin) {
      isLogin = false;
      alertLoginMessage();
    }

    return response.data;
/*    // 4.业务状态码为其它，返回异常
    ElMessage({
      message: response.data.msg,
      type: 'error'
    });
    throw new Error(response.data.msg);*/
  },
   async (err) => {
    console.log(err)
    if(err.response.status === 401 && isLogin){
      // 登录异常或超时，刷新token
      return refreshToken(err);
    }
    // refreshing = false;
    return Promise.reject(err);
  },
);

export default instance;
