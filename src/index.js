/*
 * @Author: sam.hongyang
 * @LastEditors: sam.hongyang
 * @Description: lazy load
 * @Date: 2019-03-07 14:05:49
 * @LastEditTime: 2019-03-07 14:07:03
 */
import {
  hasIntersectionObserver,
  setRequestAnimationFrame
} from './utils'

import {
  throttle
} from 'lodash'

export default {
  name: 'TLazyLoad',
  props: {
    // HTML tag or component tag eg: div/t-card
    tag: {
      type: String,
      required: true,
      default: 'div'
    },
    // 图片的地址
    src: {
      type: String,
      required: true
    },
    /**
     * IntersectionObserver root element, default set to window viewport
     */
    rootElement: {
      type: String
    },
    /**
     * 用于控制viewport 距形大小, rootBounds的距形大小，
     * 符合设置margin的形式，单位需要设置‘px’
     */
    rootMargin: {
      type: String,
      default: '0px 0px 0px 0px'
    },
    /**
     * 触发回调函数的值
     */
    threshold: {
      type: [Array, Number],
      default: () => {
        return [0, 0.3, 0.5, 0.7, 1]
      }
    },
    /**
     * InserectionObserver visibility ratio
     */
    ratio: {
      type: Number,
      default: 0.3,
      validator(value) {
        // can't be less or equal to 0 and greater than 1
        return value > 0 && value <= 1
      }
    },
    transitionName: {
      type: String,
      default: 'zoom',
      validator(value) {
        return ['fade', 'zoom'].includes(value)
      }
    }
  },
  render(h) {
    let elementClass = [
      'd-flex',
      'justify-content-center',
      'align-items-center'
    ]

    return h(this.tag, {
      class: elementClass
    }, [
      h('transition', {
        props: {
          name: 'lazy' + this.$_setTransitionName()
        }
      }, [
        this.loaded ?
        this.$slots.default || this.$slots.image // allows for "default" slot
        :
        this.$slots.placeholder
      ])
    ])
  },
  data() {
    return {
      io: null,
      loaded: false,
      error: false,
      lastScrollY: 0,
      scrollTimer: null,
      computedScrollTimer: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$_init()
    })
  },
  methods: {
    $_setTransitionName() {
      return this.transitionName && this.transitionName.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
        return $1.toUpperCase() + $2.toLowerCase()
      })
    },
    // 初始化
    $_init() {
      if (hasIntersectionObserver) {
        let options = {
          threshold: this.threshold,
          root: this.rootElement ? document.querySelector(this.rootElement) : null,
          rootMargin: this.rootMargin
        }
        this.io = new IntersectionObserver((entries) => {
          if (entries[0].intersectionRatio >= this.ratio) {
            setRequestAnimationFrame(() => {
              this.$_load()
            })
          }
        }, options)
        this.io.observe(this.$el)
      } else {
        if ('ontouchstart' in window) {
          window.addEventListener('touchend', (e) => {
            this.$_doTouchEnd()
            if (!this.computedScrollTimer) {
              this.computedScrollTimer = setTimeout(this.$_computedScroll, 200)
            }
          })
        } else {
          // web端使用
          // 如果使用 ‘scroll’ 事件需要用到截流器
          window.addEventListener('scroll', throttle((e) => {
            this.$_doTouchEnd()
            if (!this.computedScrollTimer) {
              this.computedScrollTimer = setTimeout(this.$_computedScroll, 200)
            }
          }, 200))
        }
        // 用于弹性滚动中移动距离触发
        /* window.addEventListener('scroll', () => {
          this.$_doTouchEnd()
        }) */
        /**
         * 经测试， 发现‘ ios’ 中， 存在弹性滚动时， 并不会触发‘ scroll’ 事件
         * 所以我们需要进过‘ hack’ 的模式来触发事件
         * 具体实现方式为， 在触发完‘ touchend’ 事件或者时‘ mouseup’ 事件后， 设定定时器， 没100ms触发一次检验滚动距离
         * 1. 存在滚动，执行一次函数，并保存现在滚动距离
         * 2. 如果不存在滚动，撤除定时器
         */
        if (this.$_computedPosition()) {
          setRequestAnimationFrame(() => {
            this.$_scrollEndLoad()
          })
        }
      }
    },
    $_computedScroll() {
      const rect = this.$el.getBoundingClientRect()
      // 如果该时间内没有发生移动时，我们清空定时器
      if (this.lastScrollY === rect.top || this.loaded) {
        this.computedScrollTimer = null
        this.scrollTimer && clearTimeout(this.scrollTimer)
      } else {
        this.lastScrollY = rect.top
        if (this.$_computedPosition()) {
          setRequestAnimationFrame(() => {
            this.$_scrollEndLoad()
          })
        }
        this.scrollTimer = setTimeout(() => {
          this.$_computedScroll()
        }, 100)
      }
    },
    // 滚动触发事件
    $_doTouchEnd() {
      if (this.loaded) return
      if (this.$_computedPosition()) {
        setRequestAnimationFrame(() => {
          this.$_scrollEndLoad()
        })
      }
    },
    // 相关的load操作
    $_load() {
      // 抛出事件，表示正在加载中
      this.$emit('loading')
      // 保证只需要执行一次
      this.io.disconnect()
      this.io.unobserve(this.$el)
      if (!this.loaded && this.src) {
        let img = new Image()

        img.addEventListener('load', () => {
          this.loaded = true
          this.$emit('loaded')
          clear()
        })

        img.addEventListener('error', (event) => {
          this.error = true
          this.$emit('error', event)
          clear()
        })

        const clear = () => {
          img = null
          this.io = null
        }
        img.src = this.src
      }
    },
    $_cancelObserve() {
      this.io.disconnect()
      this.io.unobserve(this.$el)
      this.io = null
    },
    $_scrollEndLoad() {
      this.$emit('loading')
      if (!this.loaded && this.src) {
        let img = new Image()

        img.addEventListener('load', () => {
          this.loaded = true
          this.$emit('loaded')
          clear()
        })

        img.addEventListener('error', (event) => {
          this.error = true
          this.$emit('error', event)
          clear()
        })

        const clear = () => {
          img = null
        }
        img.src = this.src
      }
    },
    $_computedPosition() {
      const rect = this.$el.getBoundingClientRect()
      let inPosition = false
      /**
       * 都以$el的底部为参照点
       * 1. 底部没有进入可视区域
       * 2. 底部进入可视区域，进入可视区域没有大于0.3
       * 3. 底部进入可视区域， 进入可视区域大于0.3, 进行load
       * 4. 反过来，当从头部进入，进入可视区域大于0.3，也要执行load方法
       */
      if (
        ((rect.bottom >= 0 - rect.height * this.ratio && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + rect.height * this.ratio) ||
          (rect.top >= 0 - rect.height * this.ratio && rect.top <= (window.innerHeight || document.documentElement.clientHeight) + rect.height * this.ratio)) &&
        ((rect.right >= 0 && rect.right <= (window.innerWidth || document.documentElement.clientWidth)) ||
          (rect.left >= 0 && rect.left <= (window.innerWidth || document.documentElement.clientWidth)))
      ) {
        inPosition = true
      }
      return inPosition
    }
  },
  beforeDestroy() {
    this.io && this.$_cancelObserve()
    this.computedScrollTimer = null
    this.scrollTimer = null
  }
}
