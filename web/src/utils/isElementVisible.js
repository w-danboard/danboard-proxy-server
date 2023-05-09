// @fixme：由于元素是否存在的情形过多，目前只判断元素是否存在html中
export default function isElementVisible (el) {
  return document.body.contains(el)
}
