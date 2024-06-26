<template>
  <div class="flex flex-col gap-5">
    <span
      v-if="!potentialCompensation"
      class="text-sm font-bold leading-tight flex flex-col gap-2"
      >Du hast möglicherweise keinen Anspruch auf Entschädigung.
      <span class="text-xs font-normal">{{ noClaims }}</span>
      <span class="text-xs font-normal"
        >Du kannst jedoch trotzdem mit der Fallprüfung fortfahren.
      </span>
      <button
        class="mt-5 bg-primary-500 hover:bg-primary-600 text-white h-10 rounded-lg text-sm font-medium"
        @click="reset"
      >
        Anderen Flug prüfen
      </button>
    </span>
    <span v-else class="flex flex-col gap-2 font-bold leading-tight"
      ><span
        >Du hast gute Aussichten auf
        <span class="tabular-nums tracking-tighter">{{
          $n(youGet.number, "currency")
        }}</span></span
      ></span
    >
    <div class="flex gap-3 w-full">
      <div
        class="flex items-center gap-3 bg-neutral-100 rounded-lg p-3 grow"
        v-for="{ name, label, value, icon } in resultTiles"
        :key="name"
      >
        <FontAwesomeIcon :icon="icon" fixed-width />
        <div class="flex flex-col gap-1 font-medium">
          <span class="text-sm leading-none text-gray-500">{{ label }}</span>
          <span class="text-base leading-none">{{ value }}</span>
        </div>
      </div>
    </div>
    <!-- <ol class="pl-4 list-decimal text-sm">
			<li><b>Verjährt:</b> {{ status.barred?.label }}</li>
			<li><b>EU:</b> {{ status.europeanUnion?.label }}</li>
      <li><b>Distanz:</b> {{ status.distance?.label }}</li>
      <li><b>Gecancelt:</b> {{ status.cancelled?.label }}</li>
      <li><b>Mindestens 3h Verspätet:</b> {{ status.delayed?.label }}</li>
      <li><b>Außergewöhlicher Umstand:</b> {{ status.extraordinaryCirumstance?.label }}</li>
		</ol> -->
    <!-- <pre>{{ useClaim() }}</pre> -->
  </div>
</template>

<script setup lang="ts">
import gsap from "gsap";
const { t, n } = useI18n();
const status = computed(() => useFlightStatus(useClaim().flight));
const noClaims = computed(() => {
  if (status.value.barred?.value) return "Verjährt";
  if (!status.value.cancelled.value || !status.value.delayed.value)
    return "Weder Verspätung noch Ausfall";
  return false;
});
const potentialCompensation = computed(() => {
  if (!status.value.cancelled.value && status.value.delayed.value < 180)
    return 0;
  const distance = getDistance(useClaim());
  const delay = status.value.delayed.value;
  return compensationByDistance({
    distance,
    delay,
    passengers: useClaim().client.passengers?.length,
  }).youGet;
});
const youGet = reactive({
  number: potentialCompensation.value,
});

const transform = (number: number) => ({
  duration: 0.5,
  ease: "expo",
  number,
});

watch(potentialCompensation, (n) => {
  gsap.to(youGet, transform(n));
});

const resultTiles = computed(() => {
  return [
    {
      name: "distance",
      label: "Distanz",
      value: n(getDistance(useClaim()), "km"),
      icon: "route",
    },
    {
      name: "status",
      label: "Flugstatus",
      value: t(useClaim().disruption.type),
      icon: "triangle-exclamation",
    },
    {
      name: "eu",
      label: "Rechtsraum",
      value: "EU",
      icon: "earth-europe",
    },
  ];
});
</script>
