<template>
  <div class="container mx-auto">
    <div
      class="mb-4 w-max ml-auto"
      v-tooltip.bottom="{
        text: 'something that is a bit longer',
        transition: 'fade'
      }"
    >
      hover me
    </div>
    <div class="mb-4 w-max" v-tooltip.right="'something that is a bit longer'">
      hover me loll
    </div>
    <div class="mb-4 w-max mx-auto" v-tooltip.bottom="'something that is a bit longer'">
      hover me
    </div>
    <div class="mb-4 w-max" v-tooltip.bottom="'something that is a bit longer'">
      hover me
    </div>
  </div>

  <div class="absolute bottom-0 w-full">
    <div class="test flex justify-between">
      <div v-tooltip.left="'hello'">hello</div>
      <div v-tooltip.right="'hello'">hello</div>
    </div>
  </div>
</template>

<script setup>
  import { vTooltip } from './directives/tooltip'
</script>

<style>
  .tooltip {
    border-radius: 4px;
    border: 1px solid black;
    background: white;
    position: relative;
  }
</style>