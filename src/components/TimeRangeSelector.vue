<template>
  <div class="time-selector-container" :class="{ 'is-mobile': isMobile }">
    <div class="time-scale" ref="timeScale" @scroll="handleScaleScroll">
      <div class="time-labels">
        <div v-for="time in timeList" 
             :key="time.value" 
             class="time-label"
             :class="{ 
               'start-time': isStartTime(time.value),
               'end-time': isEndTime(time.value)
             }">
          {{ time.label }}
        </div>
      </div>
    </div>
    <div class="time-blocks" 
         ref="container"
         @scroll="handleBlocksScroll">
      <div class="blocks-container">
        <div v-for="time in timeList" 
             :key="time.value"
             class="time-block"
             @mousedown="handleBlockClick($event, time.value)"
             @touchstart="handleBlockClick($event, time.value)">
        </div>
        <div class="selection-range"
             :style="rangeStyle"
             @mousedown.stop="handleRangeMouseDown"
             @touchstart.stop="handleRangeMouseDown">
          <div class="range-time">
            {{ formatTimeRange }}
          </div>
          <div class="handle start"
               @mousedown.stop="handleHandleMouseDown('start')"
               @touchstart.stop="handleHandleMouseDown('start')">
            <div class="handle-icon"></div>
          </div>
          <div class="handle end"
               @mousedown.stop="handleHandleMouseDown('end')"
               @touchstart.stop="handleHandleMouseDown('end')">
            <div class="handle-icon"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  minTime: { type: Number, default: 0 },
  maxTime: { type: Number, default: 24 },
  step: { type: Number, default: 0.5 }
})

const emit = defineEmits(['range-change'])

const container = ref(null)
const timeScale = ref(null)
const startValue = ref(17.5)
const endValue = ref(17.75)
const isDragging = ref(false)
const activeHandle = ref(null)
const dragStartY = ref(0)
const dragStartRange = ref({ start: 0, end: 0 })

const timeList = computed(() => {
  const list = []
  for (let i = props.minTime; i <= props.maxTime; i += props.step) {
    list.push({
      value: i,
      label: formatTime(i)
    })
  }
  return list
})

const formatTimeRange = computed(() => {
  return `${formatTime(startValue.value)} - ${formatTime(endValue.value)}`
})

function formatTime(value) {
  const hours = Math.floor(value)
  const minutes = Math.round((value - hours) * 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

function isTimeSelected(time) {
  return time >= startValue.value && time <= endValue.value
}

function isStartTime(time) {
  return Math.abs(time - startValue.value) < 0.001
}

function isEndTime(time) {
  return Math.abs(time - endValue.value) < 0.001
}

function getTimeFromY(y) {
  const rect = container.value.getBoundingClientRect()
  const blockHeight = rect.height / timeList.value.length
  const index = Math.floor(y / blockHeight)
  return props.minTime + (index * props.step)
}

const isMobile = ref(false)

onMounted(() => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
})

function checkDevice() {
  isMobile.value = window.innerWidth <= 768
}

function handleBlockClick(event, time) {
  event.preventDefault()
  if (!isDragging.value) {
    const rect = container.value.getBoundingClientRect()
    const clientY = event.type === 'touchstart' ? 
      event.touches[0].clientY : 
      event.clientY
    const relativeY = clientY - rect.top
    const blockHeight = rect.height / timeList.value.length
    const clickedIndex = Math.floor(relativeY / blockHeight)
    const clickedTime = props.minTime + (clickedIndex * props.step)
    
    startValue.value = clickedTime
    endValue.value = clickedTime + props.step
    emit('range-change', { start: startValue.value, end: endValue.value })
  }
}

function handleRangeMouseDown(event) {
  if (event.target.closest('.handle')) return
  
  event.preventDefault()
  isDragging.value = true
  activeHandle.value = 'range'
  
  dragStartY.value = event.clientY
  dragStartRange.value = {
    start: startValue.value,
    end: endValue.value
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
}

function handleHandleMouseDown(handle) {
  isDragging.value = true
  activeHandle.value = handle
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
}

function handleMove(event) {
  if (!isDragging.value) return

  const rect = container.value.getBoundingClientRect()
  const mouseY = event.clientY - rect.top
  const newTime = getTimeFromY(mouseY)

  if (activeHandle.value === 'range') {
    const deltaY = event.clientY - dragStartY.value
    const deltaTime = (deltaY / rect.height) * (props.maxTime - props.minTime)
    
    let newStart = dragStartRange.value.start + deltaTime
    let newEnd = dragStartRange.value.end + deltaTime
    
    // 确保不超出边界
    if (newStart < props.minTime) {
      newStart = props.minTime
      newEnd = newStart + (dragStartRange.value.end - dragStartRange.value.start)
    }
    if (newEnd > props.maxTime) {
      newEnd = props.maxTime
      newStart = newEnd - (dragStartRange.value.end - dragStartRange.value.start)
    }
    
    startValue.value = Math.round(newStart / props.step) * props.step
    endValue.value = Math.round(newEnd / props.step) * props.step
  } else {
    if (activeHandle.value === 'start') {
      startValue.value = Math.min(Math.max(props.minTime, Math.round(newTime / props.step) * props.step), endValue.value - props.step)
    } else {
      endValue.value = Math.max(Math.min(props.maxTime, Math.round(newTime / props.step) * props.step), startValue.value + props.step)
    }
  }
  
  emit('range-change', { start: startValue.value, end: endValue.value })
}

function handleEnd() {
  isDragging.value = false
  activeHandle.value = null
  document.removeEventListener('mousemove', handleMove)
  document.removeEventListener('mouseup', handleEnd)
}

function handleScaleScroll(event) {
  if (container.value) {
    container.value.scrollTop = event.target.scrollTop
  }
}

function handleBlocksScroll(event) {
  if (timeScale.value) {
    timeScale.value.scrollTop = event.target.scrollTop
  }
}

const rangeStyle = computed(() => {
  const totalHeight = container.value?.clientHeight || 0
  const itemHeight = totalHeight / timeList.value.length
  const startIndex = (startValue.value - props.minTime) / props.step
  const endIndex = (endValue.value - props.minTime) / props.step
  
  return {
    top: `${startIndex * itemHeight}px`,
    height: `${(endIndex - startIndex) * itemHeight}px`
  }
})
</script>

<style scoped>
.time-selector-container {
  display: flex;
  width: 240px; /* PC 默认宽度 */
  height: 360px; /* PC 默认高度 */
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.time-selector-container.is-mobile {
  width: 100%; /* 移动端全宽 */
  max-width: 320px; /* 移动端最大宽度 */
  height: 320px; /* 移动端高度 */
}

.time-scale {
  width: 60px; /* 减小时间刻度宽度 */
  height: 100%;
  border-right: 1px solid #e0e0e0;
  background: #f5f5f5;
  overflow: hidden;
}

.is-mobile .time-scale {
  width: 50px; /* 移动端更窄的时间刻度 */
}

.time-labels {
  height: 100%;
  overflow-y: scroll;
  margin-right: -20px;
  padding-right: 20px;
}

.time-label {
  height: 24px; /* 减小每个时间块的高度 */
  line-height: 24px;
  padding: 0 6px;
  font-size: 12px;
  color: #666;
  text-align: right;
  transition: all 0.3s;
}

.is-mobile .time-label {
  height: 20px; /* 移动端更小的时间块高度 */
  line-height: 20px;
  font-size: 11px;
}

.time-blocks {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.blocks-container {
  height: 100%;
  overflow-y: scroll;
  margin-right: -20px;
  padding-right: 20px;
  position: relative;
}

.time-block {
  height: 24px; /* 与时间标签高度一致 */
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.is-mobile .time-block {
  height: 20px; /* 移动端时间块高度 */
}

.time-block:hover {
  background-color: rgba(66, 184, 131, 0.05);
}

.selection-range {
  position: absolute;
  left: 0;
  right: 20px;
  background-color: #42b883;
  border: 1px solid #42b883;
  pointer-events: all;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2; /* 确保选中框在最上层 */
}

.range-time {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  pointer-events: none;
}

.is-mobile .range-time {
  font-size: 11px;
}

.handle {
  position: absolute;
  left: 0;
  right: 0;
  height: 12px; /* 减小手柄高度 */
  cursor: ns-resize;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  z-index: 3;
}

.handle.start {
  top: -6px;
}

.handle.end {
  bottom: -6px;
}

.handle-icon {
  width: 16px;
  height: 3px;
  background-color: #42b883;
  border-radius: 2px;
}

.is-mobile .handle-icon {
  width: 14px;
  height: 2px;
}

/* 移动端触摸优化 */
@media (max-width: 768px) {
  .handle {
    height: 16px; /* 移动端更大的手柄区域 */
  }
  
  .handle.start {
    top: -8px;
  }
  
  .handle.end {
    bottom: -8px;
  }
  
  .time-block {
    min-height: 30px; /* 确保移动端有足够的触摸区域 */
  }
}

/* 禁用选中背景色 */
.time-block.selected {
  background-color: transparent !important;
}

/* 优化滚动体验 */
.time-scale,
.time-blocks {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
</style>