export interface R<T> {
  code: number
  msg: string
  requestId: string
  data: T
}

export enum BizCode {
  SUCC = 200,
  UNAUTH = 401,
}

export interface PageQuery {
  pageNo: number
  pageSize: number
  [k: string]: any
}

export interface PageVO<T> {
  records: T[]
  total: number
  pages?: number
}
