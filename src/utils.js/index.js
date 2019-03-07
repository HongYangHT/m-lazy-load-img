/*
 * @Author: sam.hongyang
 * @LastEditors: sam.hongyang
 * @Description: 功能函数
 * @Date: 2019-03-07 14:06:06
 * @LastEditTime: 2019-03-07 14:06:40
 */
function checkIntersectionObserver() {
  if ('IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
    // Minimal polyfill for Edge 15's lack of `isIntersecting`
    // See: https://github.com/w3c/IntersectionObserver/issues/211
    if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
      Object.defineProperty(window.IntersectionObserverEntry.prototype,
        'isIntersecting', {
          get: function () {
            return this.intersectionRatio > 0
          }
        })
    }
    return true
  }
  return false
}

export const hasIntersectionObserver = checkIntersectionObserver()

/**
 * requestAnimationFrame polyfill 的兼容模式
 */
if (!window.requestAnimationFrame) {
  let lastTime = 0
  let vendors = ['ms', 'moz', 'webkit', 'o']
  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame']
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']
  }

  window.requestAnimationFrame = function (callback) {
    let currTime = new Date().getTime()
    let timeToCall = Math.max(0, 16.7 - (currTime - lastTime))
    let id = window.setTimeout(function () {
      callback(currTime + timeToCall)
    }, timeToCall)
    lastTime = currTime + timeToCall
    return id
  }
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function (id) {
    clearTimeout(id)
  }
}

export function setRequestAnimationFrame(cb) {
  requestAnimationFrame(cb)
}

export function setCancelAnimationFrame(cb) {
  cancelAnimationFrame(cb)
}
