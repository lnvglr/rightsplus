<template>
  <div class="flex flex-col gap-3">
    <input
      ref="input"
      :id="id"
      type="file"
      @change="$emit('update:modelValue', handleChange($event))"
      v-bind="$attrs"
      class="opacity-0 pointer-events-none absolute"
      :multiple="multiple"
    />

    <div
      class="font-medium flex items-center rounded-lg ring-neutral-200 bg-neutral-100 gap-3 p-3 pr-5"
      v-if="files"
      v-for="(file, i) in files"
      :key="file.name"
    >
      <div class="w-12 sm:w-16" v-if="preview?.[i] && !errors[i]">
        <img
          :src="preview[i]"
          @load="errors[i] = false"
          @error="errors[i] = true"
          class="max-w-10 sm:max-w-14 max-h-10 object-contain rounded shrink-0 overflow-hidden"
        />
      </div>
      <FontAwesomeIcon
        v-else
        :icon="'file'"
        class="text-neutral-300 text-3xl"
      />
      <div class="flex flex-col">
        <Truncate class="text-sm flex">{{ file.name }}</Truncate
        ><span class="text-neutral-500 text-xs">{{
          formatFileSize(file.size)
        }}</span>
      </div>
      <button
        @click="files?.splice(i, 1)"
        class="text-neutral-500 hover:text-red-500 ml-auto"
      >
        <FontAwesomeIcon icon="times" />
      </button>
    </div>
    <label
      class="rounded-lg ring-neutral-200 bg-neutral-100 hover:bg-neutral-50 flex items-center justify-center min-h-40 cursor-pointer ring-1 focus-within:ring-primary-500 gap-5 leading-none px-5 h-14"
      :for="id"
    >
      <div class="flex flex-col gap-2 w-full items-center">
        <FontAwesomeIcon
          :icon="icon || 'file-arrow-up'"
          class="text-neutral-300 text-4xl"
        />
        <span class="text-neutral-500 text-sm">{{ label || "Upload" }}</span>
      </div>
    </label>
  </div>
</template>
<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const input = ref<HTMLInputElement>();
const id = `file-${uuid()}`;

const props = defineProps<{
  name?: string;
  label?: string;
  icon?: string;
  multiple?: boolean;
}>();
const files = defineModel<File | File[]>();
const errors = ref<boolean[]>([]);

const preview = ref<string[]>();
const generatePreview = (files: File[]) => {
  try {
    preview.value = files.map(URL.createObjectURL);
  } catch (e) {
    errors.value = Array(files.length).fill(true);
  }
};
onMounted(() => {
  if (files.value) return generatePreview(Array.isArray(files.value) ? files.value : [files.value]);
});
const handleChange = (e: Event) => {
  console.log(e)
  errors.value = [];
  const { files: fileList } = (e.target as typeof input.value) || {};
  const files = Array.from(fileList || []);
  generatePreview(files);
  if (props.multiple) return files;
  if (files?.length) return files[0];
  return files;
};
</script>
