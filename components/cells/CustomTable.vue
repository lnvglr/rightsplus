<template>
  <DataTable
    :value="data"
    removableSort
    :pt="{
      wrapper: { class: 'rounded-xl' },
      bodyCell: { class: 'leading-none' },
      paginator: { bottom: { class: 'border-b-0' } },
    }"
    paginator
    :rows="10"
    v-model:selection="selectedRow"
    selectionMode="multiple"
    @rowSelect="rowSelect"
    @rowUnselect="rowUnselect"
    sortField="created_at"
    :sortOrder="-1"
  >
    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
    <Column field="caseId" header="#" />
    <Column field="booking_number" header="Buchung" sortable />
    <Column field="airport_departure" header="Ab" sortable />
    <Column field="airport_arrival" header="An" sortable />
    <Column header="Flug" field="flight" sortable sortField="flight.number">
      <template #body="{ data }">
        <div class="flex items-center gap-2">
          <img
            :alt="data.flight.airline"
            :src="data.flight.logo"
            class="rounded-full w-5 h-5 border border-neutral-200 shrink-0"
          />
          <span>{{ data.flight.number }}</span>
        </div>
      </template>
    </Column>
    <Column header="Status" field="status" sortable sortField="status">
      <template #body="{ data }">
        <span
          class="text-xs font-medium p-1 rounded"
          :class="getStatus(data.status, data.delay).class"
          >{{ getStatus(data.status, data.delay).text }}</span
        >
      </template>
    </Column>
    <Column header="Verspätung" field="delay" sortable sortField="delay">
      <template #body="{ data }">
        <span
          class="text-xs font-medium"
          :class="
            getStatus(data.status, data.delay).value === 'delayed'
              ? 'text-red-500'
              : ''
          "
          >{{ getDuration(data.delay) }}</span
        >
      </template>
    </Column>
    <Column
      header="Erstellt"
      field="created_at"
      sortable
      sortField="created_at"
    >
      <template #body="{ data }">
        {{
          new Date(data.created_at).toLocaleString({
            dateStyle: "short",
            timeStyle: "short",
          })
        }}
      </template>
    </Column>
    <Column header="Aktion">
      <template #body="{ data }">
        <div class="flex gap-2 font-medium">
          <button
            @click="sendEmail(data)"
            class="text-neutral-600 bg-neutral-100 hover:bg-green-500 hover:text-white p-2 rounded"
          >
            {{ data.client_email }}
          </button>
          <!-- <button
          @click="initiatePayout(data.client_email)"
          class="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
        >
          Payout
        </button> -->
        </div>
      </template>
    </Column>
  </DataTable>
  <Popup
    :open="!!selectedRow && clickedRow"
    @closeOutside="clickedRow = false"
    @close="clickedRow = false"
    class="p-12"
    :title="`${selectedRow?.[0]?.airport_departure} → ${selectedRow?.[0]?.airport_arrival}`"
    ><template #pretitle>
      <span
        class="text-xs font-medium p-1 rounded"
        :class="
          getStatus(selectedRow?.[0]?.status, selectedRow?.[0]?.delay).class
        "
        >{{
          getStatus(selectedRow?.[0]?.status, selectedRow?.[0]?.delay).text
        }}</span
      > </template
    ><span class="text-base mb-5 flex gap-1"
      ><span class="text-gray-500">Name</span
      ><span class="font-bold">{{ selectedRow?.[0].client_name }}</span></span
    >
    <div class="flex items-center gap-2">
      <img
        :alt="selectedRow?.[0]?.flight.airline"
        :src="selectedRow?.[0]?.flight.logo"
        class="rounded-full w-10 h-10 border border-neutral-200"
      />
      <span>{{ selectedRow?.[0]?.flight.number }}</span>
    </div>

    <span v-if="selectedRow?.[0].item.flights.codeshared"
      >Durchgeführt von
      {{
        JSON.parse(selectedRow?.[0].item.flights.codeshared || "").airline?.name
      }}</span
    >
  </Popup>
</template>

<script setup lang="ts">
import { useStatusEmail } from '~/composables/statusEmail';

const props = defineProps<{
  data: any[];
}>();
const { t, locale } = useI18n();

const getStatus = (status: string, delay: string) => {
  const newStatus =
    status === "cancelled" || parseInt(delay, 10) < 180 ? status : "delayed";

  const classes = {
    cancelled: "bg-red-100 text-red-600",
    delayed: "bg-yellow-100 text-yellow-700",
    landed: "bg-green-100 text-green-600",
  }[newStatus];

  return {
    class: classes,
    text: t(newStatus),
    value: newStatus,
  };
};
const selectedRow = ref(null);
const clickedRow = ref(false);
const rowSelect = (e) => {
  console.log(e);
  if (e.type === "row") clickedRow.value = true;
};
const rowUnselect = (e) => {
  clickedRow.value = false;
};

async function initiatePayout(email: string) {
  console.log("initialing payout for", email);
  try {
    const response = await fetch("/api/payouts", {
      method: "POST",
      headers: useRequestHeaders(["cookie"]),
      body: JSON.stringify({
        amount: 10,
        currency: "usd",
        email,
      }),
    });

    if (response.ok) {
      console.log(response); // Handle the response from the server
      // const data = await response.json();
      // console.log(data); // Handle the response from the server
    } else {
      console.log(response);
      throw new Error("Payout request failed");
    }
  } catch (error) {
    console.error(error); // Handle the error
  }
}

const { send } = useSendMail();
const statusEmail = useStatusEmail()
const sendEmail = async (to: any) => {
  const [passenger] = to.item.client.passengers;
  const [departure, arrival] = await getCities(
    [to.item.flights.airport_departure, to.item.flights.airport_arrival],
    locale.value
  );
  const data = {
    name: [passenger?.firstName, passenger?.lastName].join(" "),
    firstName: passenger?.firstName,
    address: passenger?.address.street,
    postalCode: passenger?.address.postalCode,
    city: passenger?.address.city,
    flightNumber: to.item.flight_number,
    flightDate: to.item.flights.scheduled_arrival,
    departure: `${departure} (${to.item.flights.airport_departure})`,
    arrival: `${arrival} (${to.item.flights.airport_arrival})`,
    date: new Date().toISOString(),
    claimId: formatClaimId(to.item.id, false),
    bookingNumber: to.item.booking_number,
    status: "paymentProcessed",
    ...statusEmail('paymentProcessed', { name: passenger?.firstName, reimbursment: 300, }),
  };
  console.log(data);

  try {
    send({
      to: to.client_email,
      subject: "Deine Anfrage wurde erfolgreich eingereicht",
      template: "Status.vue",
      // template: "AssignmentLetter.vue",
      pdf: {
        template: "assignmentLetter",
        fileName: [t("assignmentLetter"), passenger?.lastName || "test"].join(
          "-"
        ),
      },
      data,
    }).then((e) => e.json().then(console.log));
  } catch (error) {
    console.error(error);
  }
};
</script>
<style>
th {
  font-size: 0.875rem;
}
td {
  line-height: 1;
  font-size: 0.875rem;
}
</style>
