<template>
  <div :class="['max-w-full mb-3', outerClass]">
    <div
      class="relative formkit-inner bg-neutral-100 formkit-disabled:bg-neutral-200 formkit-disabled:cursor-not-allowed formkit-disabled:pointer-events-none [&>label:first-child>svg]:focus-within:fill-primary-500 flex items-center ring-1 ring-neutral-200 focus-within:ring-primary-500 focus-within:ring-1 [&>label:first-child]:focus-within:text-primary-500 rounded-lg"
      :class="[
        {
          '!ring-red-500': isFocused && modelValue && !IBAN.isValid(modelValue),
          '!ring-green-500':
            isFocused && modelValue && IBAN.isValid(modelValue),
        },
      ]"
      data-floating-label="true"
      :data-suffix-icon="suffixIconComputed && 'true'"
    >
      <input
        :value="modelValue"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement)?.value)
        "
        :id="name"
        v-maska:[iban]
        data-maska-eager
        :data-complete="Boolean(modelValue)"
        class="formkit-input appearance-none bg-transparent focus:outline-none focus:ring-0 focus:shadow-none font-medium rounded-lg autofill:shadow-autofill focus:autofill:shadow-autofill autofill:ring-1 ring-blue-200 w-full px-4 py-3 border-none text-base text-neutral-700 placeholder-neutral-400"
        :placeholder="ibanMask.example"
        @focus="isFocused = true"
        @blur="
          () => {
            isFocused = false;
            $emit('blur');
          }
        "
      />
      <label
        class="absolute formkit-label -mt-1"
        :data-has-value="Boolean(modelValue)"
        >{{
          modelValue?.length >= 2 &&
          modelValue?.length !== ibanMask.example?.length &&
          !valid
            ? ibanMask.humanMask
            : label
        }}</label
      >
      <label
        v-if="
          ((isFocused || !valid) && suffixIconComputed) ||
          (touched && !modelValue)
        "
        :class="[
          'formkit-suffix-icon w-10 pr-2 -ml-3 flex self-stretch grow-0 shrink-0 [&>svg]:w-full [&>svg]:max-w-[1em] [&>svg]:max-h-[1em] [&>svg]:m-auto [&>svg]:fill-neutral-400 formkit-icon',
        ]"
        :for="name"
        :title="
          valid
            ? 'Diese IBAN scheint korrekt zu sein'
            : 'Irgendetwas stimmt nicht mit deiner IBAN'
        "
        ><FontAwesomeIcon
          :icon="
            valid
              ? 'check-circle'
              : touched && !modelValue
              ? 'triangle-exclamation'
              : 'circle-xmark'
          "
          :class="
            valid
              ? 'text-green-500'
              : touched && !modelValue
              ? 'text-yellow-500'
              : 'text-red-500'
          "
      /></label>
    </div>
    <div
      v-if="help"
      class="formkit-help mt-1 text-xs text-neutral-500 leading-tight"
    >
      {{ help }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { vMaska } from "maska";
import IBAN from "iban";
const props = defineProps<{
  modelValue: string;
  name: string;
  label: string;
  outerClass?: string;
  help?: string;
  touched?: boolean;
}>();
const { iban } = useMask();
const isFocused = ref(false);
const valid = computed(() => IBAN.isValid(props.modelValue));
const ibanMask = computed(() => getIbanMask(props.modelValue));
const suffixIconComputed = computed(() => {
  const { countryInString, example } = ibanMask.value;
  return props.modelValue?.length === example?.length ||
    (props.modelValue?.length >= 2 && !countryInString);
});
</script>
