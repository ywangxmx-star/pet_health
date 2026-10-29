import { ref, computed, onMounted, onUnmounted, getCurrentInstance, nextTick } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'

let _seq = 0

export function usePager(fetchPage) {
  const list = ref([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const page = ref(1)
  const total = ref(0)
  const endClass = 'pager-end-' + (++_seq)
  const finished = computed(() => list.value.length > 0 && list.value.length >= total.value)
  const moreText = computed(() => {
    if (!list.value.length) return ''
    if (loadingMore.value) return '加载中…'
    if (finished.value) return '没有更多了'
    return '\u00a0'
  })

  let observer = null
  let scrollTargets = []

  async function load(reset = true) {
    if (reset) {
      if (loading.value) return
      page.value = 1
      loading.value = true
    } else {
      if (loading.value || loadingMore.value || finished.value) return
      loadingMore.value = true
      page.value += 1
    }
    try {
      const data = await fetchPage(page.value)
      const rows = Array.isArray(data) ? data : ((data && data.list) || [])
      total.value = Array.isArray(data) ? rows.length : Number((data && data.total) || rows.length)
      list.value = reset ? rows : list.value.concat(rows)
      if (!rows.length) total.value = list.value.length
    } catch (e) {
      if (reset) list.value = []
      else page.value = Math.max(1, page.value - 1)
    } finally {
      loading.value = false
      loadingMore.value = false
      nextTick(() => bindObserver())
    }
  }

  function nearBottom(el) {
    if (!el) return false
    const isWin = el === window || el === document || el === document.documentElement || el === document.body
    if (isWin) {
      const top = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
      const view = window.innerHeight || document.documentElement.clientHeight || 0
      const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
      return height - top - view < 120
    }
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  function onScroll() {
    if (typeof document === 'undefined') return
    const nodes = [
      window,
      document.documentElement,
      document.body,
      document.querySelector('uni-page-wrapper'),
      document.querySelector('uni-page-body'),
      document.querySelector('.uni-page-wrapper'),
      document.querySelector('.uni-page-body')
    ]
    for (const el of nodes) {
      if (nearBottom(el)) {
        load(false)
        return
      }
    }
  }

  function bindObserver() {
    if (observer) {
      try { observer.disconnect() } catch (e) {}
      observer = null
    }
    const inst = getCurrentInstance()
    if (!inst || !inst.proxy) return
    try {
      observer = uni.createIntersectionObserver(inst.proxy, { thresholds: [0, 0.01], observeAll: true })
      observer.relativeToViewport({ bottom: 80 }).observe('.' + endClass, (res) => {
        if (res.intersectionRatio > 0) load(false)
      })
    } catch (e) {}
  }

  function bindScroll() {
    if (typeof window === 'undefined') return
    scrollTargets = [
      window,
      document,
      document.documentElement,
      document.body,
      document.querySelector('uni-page-wrapper'),
      document.querySelector('uni-page-body')
    ].filter(Boolean)
    scrollTargets.forEach((t) => t.addEventListener('scroll', onScroll, { passive: true, capture: true }))
  }

  function unbindScroll() {
    scrollTargets.forEach((t) => {
      try { t.removeEventListener('scroll', onScroll, { capture: true }) } catch (e) {}
    })
    scrollTargets = []
  }

  onReachBottom(() => load(false))
  onMounted(() => {
    bindScroll()
    nextTick(() => bindObserver())
  })
  onUnmounted(() => {
    unbindScroll()
    if (observer) {
      try { observer.disconnect() } catch (e) {}
      observer = null
    }
  })

  return { list, loading, loadingMore, total, finished, moreText, endClass, load }
}
