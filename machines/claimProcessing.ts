import type { Machine } from "~/composables/useMachine";
import type { CaseStatus, RowClaimExtended } from "~/types";

// import { createMachine } from 'xstate'

// const machine = createMachine({

// })
export default {
  id: "claimProcessing",
  initial: "dataReceived",
  loading: "loading",
  guards: {
    acceptClaim: ({ context, methods }) => {
      return true
    },
  },
  actions: {
    setHistory: ({ states, target }) => {
      console.log('setHistory', target, states.value)
      states.value = target ? [target] : []
      return states.value
    },
    go: ({ states, machine, target }) => {
      states.value.push(target || machine.initial)
    },
    back: ({ states, machine }) => {
      try {
        states.value?.pop();
      } catch (error) {
        states.value = [machine.initial]
      }
    },
    reset: ({ states, machine }) => {
      states.value = [machine.initial]
    },
  },
  states: {
    dataReceived: {
      on: {
        accept: {
          guard: "acceptClaim",
          target: "awaitInitialAirlineResponse",
        },
        reject: {
          target: "rejected",
        },
      },
    },
    awaitInitialAirlineResponse: {
      on: {
        accept: {
          target: "awaitAirlinePayment",
        },
        reject: [
          {
            target: "awaitInitialAirlineResponse",
            guard: "insistToNegotiate"
          },
          {
            target: "airlineRejected"
          }
        ]
      }
    },
    airlineRejected: {
      on: {
        engageLawyer: {
          target: "awaitLawyerResponse",
        },
      }
    },
    awaitLawyerResponse: {
      on: {
        accept: {
          target: "awaitAirlinePayment",
          actions: ["sendAirlineAcceptPaymentAfterLawyer"],
        },
        reject: {
          target: "airlineRejectedAfterLawyer",
          actions: "rejectCase",
        },
      },
    },
    airlineRejectedAfterLawyer: {
      on: {
        withdraw: {
          target: "caseWithdrawn",
        },
        fileLawsuit: {
          target: "awaitCourtDecision",
        }
      }
    },
    awaitCourtDecision: {
      on: {
        win: {
          target: "awaitAirlinePayment",
          actions: "sendAirlineAcceptPaymentAfterCourt",
        },
        lose: {
          target: "caseLost",
        }
      }
    },
    awaitAirlinePayment: {
      on: {
        receivePayment: {
          target: "receivePayment",
        },
      },
    },
    receivePayment: {
      on: {
        payout: {
          target: "completed",
        }
      }
    },
    rejected: {
      type: 'final'
    },
    caseWithdrawn: {
      type: "final"
    },
    caseLost: {
      type: "final"
    },
    completed: {
      type: "final"
    }
  }
} as Machine<CaseStatus, RowClaimExtended>;
