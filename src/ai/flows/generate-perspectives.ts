'use server';

/**
 * @fileOverview Generates different political perspectives (left, center, right) on a given news article.
 *
 * - generatePerspectives - A function that generates the perspectives.
 * - GeneratePerspectivesInput - The input type for the generatePerspectives function.
 * - GeneratePerspectivesOutput - The return type for the generatePerspectives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePerspectivesInputSchema = z.object({
  articleContent: z.string().describe('The content of the news article to analyze.'),
});
export type GeneratePerspectivesInput = z.infer<typeof GeneratePerspectivesInputSchema>;

const GeneratePerspectivesOutputSchema = z.object({
  leftPerspective: z.string().describe('How a left-leaning publication would cover the topic.'),
  centerPerspective: z.string().describe('How a center publication would cover the topic.'),
  rightPerspective: z.string().describe('How a right-leaning publication would cover the topic.'),
  overallBias: z.enum(['Left', 'Center-Left', 'Center', 'Center-Right', 'Right']).describe('The overall bias of the article.'),
  confidenceBias: z.number().min(0).max(100).describe('A number from 0 to 100 representing the confidence in the bias classification'),
  factuality: z.enum(['Very High', 'High', 'Mixed', 'Low', 'Very Low']).describe('The factuality level of the article'),
  articleSummary: z.string().describe('A short and strictly neutral summary of the main points of the article')
});
export type GeneratePerspectivesOutput = z.infer<typeof GeneratePerspectivesOutputSchema>;

export async function generatePerspectives(input: GeneratePerspectivesInput): Promise<GeneratePerspectivesOutput> {
  return generatePerspectivesFlow(input);
}

const generatePerspectivesPrompt = ai.definePrompt({
  name: 'generatePerspectivesPrompt',
  input: {schema: GeneratePerspectivesInputSchema},
  output: {schema: GeneratePerspectivesOutputSchema},
  prompt: `You are an advanced news analyst, inspired by Ground News. Your task is to analyze the provided text and decompose its presentation in a neutral and multifaceted way.

Analyze the following text:
---
{{{articleContent}}}
---

Based on the text, provide a response strictly in the following JSON format. Do not include markdown or any text outside the JSON object:

{
  "overallBias": "<Classify the overall bias of the article as 'Left', 'Center-Left', 'Center', 'Center-Right', or 'Right'>",
  "confidenceBias": <A number from 0 to 100 representing the confidence in the bias classification>,
  "factuality": "<Evaluate the level of factuality as 'Very High', 'High', 'Mixed', 'Low', or 'Very Low'>",
  "articleSummary": "<Write a short and strictly neutral summary of the main points of the article.>",
  "leftPerspective": "<Describe how a left-leaning publication would typically cover this topic, highlighting the angles and language they would use.>",
  "centerPerspective": "<Describe how a center publication would typically cover this topic, focusing on a balanced presentation.>",
  "rightPerspective": "<Describe how a right-leaning publication would typically cover this topic, highlighting their preferred angles and framing.>"
}
`,
});

const generatePerspectivesFlow = ai.defineFlow(
  {
    name: 'generatePerspectivesFlow',
    inputSchema: GeneratePerspectivesInputSchema,
    outputSchema: GeneratePerspectivesOutputSchema,
  },
  async input => {
    const {output} = await generatePerspectivesPrompt(input);
    return output!;
  }
);
