import { defineNuxtPlugin } from "#app";
import PrimeVue from "primevue/config";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional

export default defineNuxtPlugin((nuxtApp) => {
	// nuxtApp.vueApp.use(PrimeVue, { ripple: true });
	// nuxtApp.vueApp.component("DataTable", DataTable);
	// nuxtApp.vueApp.component("Column", Column);
	// nuxtApp.vueApp.component("ColumnGroup", ColumnGroup);
	// nuxtApp.vueApp.component("Row", Row);
});