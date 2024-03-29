import type { ClaimsForm, Database, Flight, FlightsTable } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";


export const useSupabaseFunctions = () => {
	const client = useSupabaseClient<Database>()
	const user = useSupabaseUser()

	const fetchProxy = async (url: string, options?: RequestInit) => {
		console.log('fetchProxy', url, options)
		const { data, error } = await client.functions.invoke("proxy", {
			body: { url, options },
		})
		if (error) {
			throw error;
		}
		return data;
	}

	const userExists = async ({ email }: {
		email: string
	}) => {
		const { data, error } = await client.functions.invoke("user-exists", {
			body: { email },
		})
		if (error) {
			throw error;
		}
		return data as boolean;
	}

	const submitPassenger = async (flight: Flight) => {
		try {
			const { data, error } = await client
				.from("flights")
				.upsert([preparedFlight], { onConflict: "number" })
				.select()
			if (error) throw error
			return data
		} catch (error) {
			throw error
		}
	}

	const handleUploadFile = async (file: File, folder?: string) => {
		if (!file) {
			return "";
		}
		const options = {
			convertSize: 0.5,
			quality: 0.8,
			maxWidth: 1080,
			maxHeight: 1080,
		};

		const resizedFile = await compressImage(file, options);
		const fileExt = resizedFile.name.split(".").pop();
		const fileName = `${uuid()}.${fileExt}`;
		const filePath = [folder, fileName].filter(Boolean).join("/");
		const { data, error } = await client.storage
			.from("client-files")
			.upload(filePath, resizedFile, {
				cacheControl: "3600",
				upsert: false,
			});
		if (error) {
			console.error(error);
			throw error;
		} else {
			console.log(data);
			return data.path;
		}
	};
	const submitFlight = async (flight: Flight) => {
		const preparedFlight = {
			number: flight.flight.iata,
			status: flight.flight_status,
			airline_iata: flight.airline.iata,
			airline: flight.airline.name,
			codeshared: flight.flight.codeshared,
			scheduled_departure: flight.departure.scheduled,
			actual_departure: flight.departure.actual,
			airport_departure: flight.departure.iata,
			scheduled_arrival: flight.arrival.scheduled,
			actual_arrival: flight.arrival.actual,
			delay_arrival: flight.arrival.delay,
			airport_arrival: flight.arrival.iata,
			data: flight,
			// arrival_delay: arrival_delay,
		};
		try {
			const { data, error } = await client
				.from("flights")
				.upsert([preparedFlight], { onConflict: "number" })
				.select()
			if (error) throw error
			return data
		} catch (error) {
			throw error
		}
	}
	const submitClaim = async (claim: ClaimsForm) => {
		const preparedClaim = {
			user_id: user?.value?.id,
			email: claim.client.passengers[0].email,
			flight_number: claim.flight?.flight.iata,
			booking_number: claim.client.bookingNumber,
			client: claim.client,
			disruption: claim.disruption,
		};
		try {
			const { data, error } = await client
				.from("claims")
				.upsert([preparedClaim], { onConflict: "booking_number" })
				.select()
				.single()
			if (error) throw error
			claim.uuid = data.uuid
			return data
		} catch (error) {
			throw error
		}
	}
	return {
		userExists,
		handleUploadFile,
		submitFlight,
		submitClaim,
		fetchProxy
	}
}