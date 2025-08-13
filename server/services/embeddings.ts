import { hfClient } from "../lib/huggingface";
import dotenv from "dotenv";
dotenv.config();

const HF_MODEL = process.env.HF_EMBEDDING_MODEL ?? "intfloat/multilingual-e5-small";

/** Create embeddings for an array of strings (batch) */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
    // HuggingFace pipeline feature-extraction accepts single text per request.
    // Some models support batch; to keep compatibility, we loop but you can optimize with concurrent requests.
    const results: number[][] = [];
    for (const t of texts) {
        // HF pipeline expects raw text payload (string) for feature-extraction
        const { data } = await hfClient.post(`hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`, JSON.stringify({ inputs: t }));
        // Handle both 1D (single vector) and 2D (multiple vectors) responses
        let vector: number[] = [];
        if (Array.isArray(data)) {
            if (Array.isArray(data[0]) && typeof data[0][0] === "number") {
                // 2D array: [[...], [...], ...] - multiple vectors
                if (data.length === 1) {
                    vector = data[0] as number[];
                } else {
                    // Mean pool across token vectors
                    const dim = data[0].length;
                    const sum = new Array(dim).fill(0);
                    for (const row of data as number[][]) {
                        for (let i = 0; i < dim; i++) sum[i] += row[i];
                    }
                    vector = sum.map((s) => s / (data as number[][]).length);
                }
            } else if (typeof data[0] === "number") {
                // 1D array: [...] - single vector
                vector = data as number[];
            } else {
                throw new Error("Unexpected embedding response shape");
            }
        } else {
            throw new Error("Unexpected embedding response shape");
        }
        results.push(vector);
    }
    return results;
}
