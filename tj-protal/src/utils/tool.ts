export const upperAlpha = (num: number, type?: number): string => {
  let str = ''
  const n: number = type && type == 0 ? num : num - 1
  switch (n) {
    case 0:
      str = 'A'
      break
    case 1:
      str = 'B'
      break
    case 2:
      str = 'C'
      break
    case 3:
      str = 'D'
      break
    case 4:
      str = 'E'
      break
  }
  return str
}

export const timeFormat = (time: number | string): string => {
  let second: number | string = parseInt(String(time))
  let minute: number | string = '00'
  let hour: number | string = '00'

  if (second > 60) {
    minute = parseInt(String(second / 60))
    second = parseInt(String(second % 60))
    if (minute > 60) {
      hour = parseInt(String(minute / 60))
      minute = parseInt(String(minute % 60))
    }
  }
  return `${hour} : ${minute} : ${second}`
}

export const amountConversion = (item?: number | string): string => {
  let amount = '0'
  if (item) {
    amount = (Number(item) / 100).toFixed(2)
  }
  return amount
}
