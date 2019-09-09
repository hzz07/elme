export function commonFormatDate(date, fmt) {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)); // 适应不同长度的年份
  }
  let o = {
    'M+': date.getMonth() + 1, // getMonth从0开始
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getSeconds()
  };
  for (let key in o) {
    if (new RegExp(`(${key})`).test(fmt)) {
      let str = o[key] + '';
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
}

function padLeftZero(str) {   // 动态补0
  return ('00' + str).substr(str.length);
}
