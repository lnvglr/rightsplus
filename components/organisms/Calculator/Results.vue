<template>
  <div class="flex flex-col gap-5">
    <h1 class="text-3xl font-bold">Du hast Anspruch auf Entschädigung!</h1>
    <FlightResult :flight="$state.claims?.selectedFlight" />
    <NavigationButtons @previous="$emit('back')" @next="$emit('submit')" />
    <pre>{{ $state.claims }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Button from "@/components/molecules/Button.vue";
import ButtonBack from "@/components/molecules/ButtonBack.vue";
import { getAirportDistance } from "@/utils";
import { Flight } from "@/types";
import { isEuMember } from "is-eu-member";
import FlightResult from "./FlightResult.vue";
import NavigationButtons from "./NavigationButtons.vue";

export default defineComponent({
  components: {
    Button,
    ButtonBack,
    FlightResult,
    NavigationButtons
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      value: null,
      options: [
        { value: "onTime", label: "Pünktlich" },
        { value: "delayed", label: "Verspätet" },
        { value: "cancelled", label: "Gestrichen / Umgebucht" },
        { value: "boardingDenied", label: "Boarding untersagt" },
        { value: "reRouted", label: "Umgeleitet" },
        { value: "returned", label: "Umgekehrt" },
      ],
    };
  },
  methods: {
    isEuMember,
    getAirportDistance,
    submitHandler() {
      this.$emit("submit");
      return;
    },
  },
});
</script>
<style scoped>
.double {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.triple {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
