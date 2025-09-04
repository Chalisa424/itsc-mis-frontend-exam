<template>
    <!-- ครอบทุกอย่างไว้ใน label ทำให้ คลิกพื้นที่ไหนก็สั่ง toggle ได้ -->
  <label
    :class="[
      'inline-flex items-center select-none',
      disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
    ]"
  >
   <input
      type="checkbox"
      class="sr-only peer"
      :checked="modelValue"
      :disabled="disabled"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="ariaLabel || label"
      @change="onChange"  
    />
    <!-- @change="onChange" → เมื่อ กด Space แล้ว checkbox เปลี่ยนค่า เรียกฟังก์ชันเพื่อ emit ค่าใหม่ -->
    <!-- “ราง” ของสวิตช์ และเราใช้ pseudo-element after: ให้เป็น “ปุ่มกลม” (thumb) -->
     <div
          class="relative w-11 h-6 bg-gray-200 rounded-full transition-colors
                 peer-checked:bg-blue-600
                 after:content-[''] after:absolute after:top-0.5 after:left-0.5
                 after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow
                 after:transition-transform peer-checked:after:translate-x-5
                 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400/70"
                 >
    </div>
   
    <span v-if="$slots.default || label" class="ml-2 text-sm text-gray-600">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">


const props = defineProps<{
  modelValue: boolean //ค่าเปิด/ปิด ที่จะผูก v-model
  label?: string
  ariaLabel?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'change', v: boolean): void
}>()

function onChange(e: Event) {
  const v = (e.target as HTMLInputElement).checked
  emit('update:modelValue', v)
  emit('change', v)
}
</script>
