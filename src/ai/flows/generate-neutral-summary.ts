'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a neutral summary of a given text.
 *
 * The flow takes text as input and returns a concise, unbiased summary.
 * @module ai/flows/generate-neutral-summary
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the neutral summary flow.
 */
const NeutralSummaryInputSchema = z.object({
  text: z.string().describe('The text to summarize.'),
});
export type NeutralSummaryInput = z.infer<typeof NeutralSummaryInputSchema>;

/**
 * Output schema for the neutral summary flow.
 */
const NeutralSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise, neutral summary of the input text.'),
});
export type NeutralSummaryOutput = z.infer<typeof NeutralSummaryOutputSchema>;

/**
 * Generates a neutral summary of the given text.
 * @param input The input containing the text to summarize.
 * @returns A promise that resolves to the neutral summary.
 */
export async function generateNeutralSummary(input: NeutralSummaryInput): Promise<NeutralSummaryOutput> {
  return generateNeutralSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'neutralSummaryPrompt',
  input: {schema: NeutralSummaryInputSchema},
  output: {schema: NeutralSummaryOutputSchema},
  prompt: `You are an expert news summarizer. Your goal is to provide a short, neutral summary of the given text.\n\nText: {{{text}}}`,
});

const generateNeutralSummaryFlow = ai.defineFlow(
  {
    name: 'generateNeutralSummaryFlow',
    inputSchema: NeutralSummaryInputSchema,
    outputSchema: NeutralSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
