import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)+/g, "");
}

function randomSuffix() {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
	let output = "";
	for (let i = 0; i < 6; i += 1) {
		output += charset[Math.floor(Math.random() * charset.length)];
	}
	return output;
}

export async function POST(request: NextRequest) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}
		if (!file.type.startsWith("image/")) {
			return NextResponse.json(
				{ error: "Unsupported file type" },
				{ status: 400 },
			);
		}
		if (file.size > MAX_UPLOAD_BYTES) {
			return NextResponse.json(
				{ error: "File too large", maxBytes: MAX_UPLOAD_BYTES },
				{ status: 413 },
			);
		}

		const mealTitle = (formData.get("title") as string | null) ?? "meal";
		const buffer = Buffer.from(await file.arrayBuffer());

		const pipeline = sharp(buffer)
			.resize({
				width: 1200,
				height: 900,
				fit: "inside",
				withoutEnlargement: true,
			})
			.webp({ quality: 75, effort: 6, smartSubsample: true });

		const processedImageBuffer = await pipeline.toBuffer();

		const apiKey = process.env.PIC_IN_TH_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "Server configuration error: Missing API Key" },
				{ status: 500 },
			);
		}

		const uploadFormData = new FormData();
		const mimeType = "image/webp";
		const safeTitle = slugify(mealTitle) || "meal";
		const title = `${safeTitle}-${randomSuffix()}`;
		const filename = `${title}.webp`;
		const blob = new Blob([new Uint8Array(processedImageBuffer)], {
			type: mimeType,
		});
		uploadFormData.append("source", blob, filename);
		uploadFormData.append("title", title);

		const response = await fetch("https://pic.in.th/api/1/upload", {
			method: "POST",
			headers: {
				"X-API-Key": apiKey,
			},
			body: uploadFormData,
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Upload failed:", errorText);
			return NextResponse.json(
				{ error: "Upload to pic.in.th failed", details: errorText },
				{ status: 502 },
			);
		}

		const result = await response.json();
		const imageUrl = result.image?.url || result.url;
		if (!imageUrl) {
			console.error("Unexpected response structure:", result);
			return NextResponse.json(
				{ error: "Failed to parse upload response" },
				{ status: 502 },
			);
		}

		return NextResponse.json({ url: imageUrl });
	} catch (error) {
		console.error("Processing error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
