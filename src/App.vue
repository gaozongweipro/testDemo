<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TimeRangeSelector from './components/TimeRangeSelector.vue'

function handleTimeRangeChange({ start, end }) {
  console.log(`Selected time range: ${start} - ${end}`)
}
</script>

<template>
  <!-- <TimeRangeSelector 
    :min-time="0"
    :max-time="24"
    :step="0.5"
    @range-change="handleTimeRangeChange"
  /> -->
  <HelloWorld msg="Hello World" />
</template>

<style scoped></style>
