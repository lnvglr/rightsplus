<template>
  <div class="relative w-full h-[200px] flex flex-col justify-center" ref="container">
    <canvas
      ref="canvas"
      class="relative border-neutral-300 border-2 border-dashed rounded-lg z-10"
    />
    <div
      class="pointer-events-none absolute inset-0 flex-col items-center justify-center text-center z-20 flex gap-5 h-[70%]"
      v-if="empty"
    >
      <FontAwesomeIcon
        icon="signature"
        class="text-4xl text-neutral-300 shrink-0"
      />
      <span class="text-xs text-neutral-500"
        >Setze hier deine Unterschrift, wie sie in deinem Ausweis
        erscheint.</span
      >
    </div>
    <div class="absolute top-[60%] inset-5 flex items-center flex-col text-sm gap-5">
    <div class="border-t-2 border-neutral-300 w-full" />
    <span v-if="name && empty" class="font-semibold">{{ name }}</span>
  </div>

    <div
      class="absolute top-2 right-2 z-20 flex gap-2"
      :class="{ 'opacity-50 pointer-events-none': empty }"
    >
      <button
        class="hover:bg-neutral-100 hover:text-red-500 h-10 w-10 rounded-full flex gap-2 items-center justify-center"
        @click="clear"
      >
        <FontAwesomeIcon icon="eraser" class="text-base" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SignaturePad from "signature_pad";
const emit = defineEmits<{
  (event: "confirm", data: string): void;
  (event: "update", data: string | undefined): void;
}>();
const props = defineProps<{
  name?: string;
  confirm?: boolean;
  returnFormat?: "svg" | "uri";
}>();
const { send } = useSendMail();
const container = ref<HTMLDivElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const temp = ref<string>()
const signaturePad = ref();
function resizeCanvas() {
  const scale = 2;
  if (!canvas.value || !container.value) return;
  const { width, height } = canvas.value;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;
  const temp = ctx.getImageData(0, 0, width, height);
  if (!temp) return;
  canvas.value.width = container.value?.offsetWidth * scale;
  canvas.value.height = container.value?.offsetHeight * scale;
  ctx.scale(scale * 1.01, scale * 1.05);
  ctx.putImageData(temp, 0, 0);
}
const empty = ref(true);
const clear = () => {
  if (!signaturePad.value) return;
  signaturePad.value.clear();
  empty.value = signaturePad.value.isEmpty();
    temp.value = undefined;
  emit("update", undefined);
};
const getSignature = (uriEncoded = false) => {
  if (!signaturePad.value) return;
  if (signaturePad.value.isEmpty() || !canvas.value) {
    clear();
    return;
  }
  const cropped = cropSignatureCanvasSVG(signaturePad.value.toSVG(), props.returnFormat === "uri");
  if (!cropped) return;
  if (uriEncoded && props.returnFormat === "uri") {
    return encodeURIComponent(cropped);
  }
  return cropped;
};
const handleConfirm = () => {
  const data = getSignature(true);
  if (!data) return;
  emit("confirm", data);
};
onMounted(() => {
  window.addEventListener("resize", resizeCanvas);
  if (!canvas.value) return;
  resizeCanvas();
  signaturePad.value = new SignaturePad(canvas.value, {
    minWidth: 1.5,
    maxWidth: 2,
  });
  signaturePad.value.addEventListener("afterUpdateStroke", () => {
    empty.value = false;
    temp.value = getSignature();
    emit("update", getSignature(true));
  });
});
onUnmounted(() => {
  window.removeEventListener("resize", resizeCanvas);
});
</script>
