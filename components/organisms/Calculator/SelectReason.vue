<template>
  <div class="flex flex-col gap-5">
    <h1 class="text-3xl font-bold">Welches Problem ist aufgetreten?</h1>
    <div class="flex gap-4 [&>.formkit-outer]:w-full [&_.formkit-inner]:max-w-full">
      <FormKit
        type="select"
        label="Gib den tatächlichen Flugstatus an"
        placeholder="Flugstatus wählen"
        name="reason"
        v-model="modelValue.reason"
        :options="options"
        select-icon="angle-down"
      />
      <FormKit
        v-if="modelValue.reason === 'delayed'"
        type="datetime-local"
        v-model="modelValue.actualArrivalTime"
        label="Tatsächliche Ankunftszeit"
        help="Relevant ist hier, wann die Türen offiziell geöffnet wurden."
        validation="required"
        validation-visibility="live"
      />
    </div>
    <NavigationButtons @previous="$emit('back')" @next="$emit('submit')"
     />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavigationButtons from "./NavigationButtons.vue";

export default defineComponent({
  components: {
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
