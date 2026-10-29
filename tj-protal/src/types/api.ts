export interface R<T> {
  code: number
  msg: string
  data: T
}

export enum BizCode {
  SUCC = 200,
  UNAUTH = 401,
  FORBID = 1001,
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
