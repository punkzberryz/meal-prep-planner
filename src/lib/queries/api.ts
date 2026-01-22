type ApiErrorShape = { error?: string };

type ApiJsonOptions = {
	acceptStatuses?: number[];
};

function buildHeaders(init?: RequestInit) {
	const headers = new Headers(init?.headers);
	const body = init?.body;
	const isFormData =
		typeof FormData !== "undefined" && body instanceof FormData;

	if (body && !isFormData && !headers.has("content-type")) {
		headers.set("content-type", "application/json");
	}

	return headers;
}

export async function apiJson<T>(
	input: RequestInfo,
	init?: RequestInit,
	options?: ApiJsonOptions,
): Promise<T> {
	const response = await fetch(input, {
		...init,
		headers: buildHeaders(init),
	});

	let data: unknown = null;
	try {
		data = await response.json();
	} catch {
		data = null;
	}

	if (!response.ok && !options?.acceptStatuses?.includes(response.status)) {
		const message = (data as ApiErrorShape | null)?.error ?? "Request failed.";
		throw new Error(message);
	}

	return data as T;
}
