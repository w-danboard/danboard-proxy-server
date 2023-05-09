/**
 * @deprecated 不知道出自何处，目前未被引用
 * 提取html内容 如：span style=\"00DB00\">192.168.200.90</span>
 * @param content
 * @returns {*}
 */
export default function extractHtmlContent (content) {
    let extractReg = /<.*?>(.+)<\/.*?>/
    let extractAry = extractReg.exec(content)
    // 匹配不成功 192.168.200.90
    if (!extractAry) {
      return content
    }
    return extractAry[1]
  }