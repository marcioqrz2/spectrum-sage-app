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
  leftPerspective: z.string().describe('Como uma publicação de esquerda cobriria o tópico.'),
  centerPerspective: z.string().describe('Como uma publicação de centro cobriria o tópico.'),
  rightPerspective: z.string().describe('Como uma publicação de direita cobriria o tópico.'),
  overallBias: z.enum(['Esquerda', 'Centro-Esquerda', 'Centro', 'Centro-Direita', 'Direita']).describe('O viés geral do artigo.'),
  confidenceBias: z.number().min(0).max(100).describe('Um número de 0 a 100 representando a confiança na classificação do viés'),
  factuality: z.enum(['Muito Alta', 'Alta', 'Mista', 'Baixa', 'Muito Baixa']).describe('O nível de factualidade do artigo'),
  articleSummary: z.string().describe('Um resumo curto e estritamente neutro dos pontos principais do artigo')
});
export type GeneratePerspectivesOutput = z.infer<typeof GeneratePerspectivesOutputSchema>;

export async function generatePerspectives(input: GeneratePerspectivesInput): Promise<GeneratePerspectivesOutput> {
  return generatePerspectivesFlow(input);
}

const generatePerspectivesPrompt = ai.definePrompt({
  name: 'generatePerspectivesPrompt',
  input: {schema: GeneratePerspectivesInputSchema},
  output: {schema: GeneratePerspectivesOutputSchema},
  prompt: `Você é um analista de notícias avançado, inspirado no Ground News. Sua tarefa é analisar o texto fornecido e decompor sua apresentação de forma neutra e multifacetada.

Analise o seguinte texto:
---
{{{articleContent}}}
---

Com base no texto, forneça uma resposta estritamente no seguinte formato JSON. Não inclua markdown ou qualquer texto fora do objeto JSON:

{
  "overallBias": "<Classifique o viés geral do artigo como 'Esquerda', 'Centro-Esquerda', 'Centro', 'Centro-Direita' ou 'Direita'>",
  "confidenceBias": <Um número de 0 a 100 representando a confiança na classificação de viés>,
  "factuality": "<Avalie o nível de factualidade como 'Muito Alta', 'Alta', 'Mista', 'Baixa' ou 'Muito Baixa'>",
  "articleSummary": "<Escreva um resumo curto e estritamente neutro dos pontos principais do artigo.>",
  "leftPerspective": "<Descreva como uma publicação de esquerda normalmente cobriria este tópico, destacando os ângulos e a linguagem que usariam.>",
  "centerPerspective": "<Descreva como uma publicação de centro normalmente cobriria este tópico, focando em uma apresentação equilibrada.>",
  "rightPerspective": "<Descreva como uma publicação de direita normalmente cobriria este tópico, destacando seus ângulos e enquadramentos preferidos.>"
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
