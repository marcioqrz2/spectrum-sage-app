'use server';
/**
 * @fileOverview Extracts article text content from a given URL, handling potential CORS issues.
 *
 * - extractArticleTextFromUrl - A function that takes a URL and returns the extracted text content.
 * - ExtractArticleTextFromUrlInput - The input type for the extractArticleTextFromUrl function.
 * - ExtractArticleTextFromUrlOutput - The return type for the extractArticleTextFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Readability} from '@mozilla/readability';
import {JSDOM} from 'jsdom';

const ExtractArticleTextFromUrlInputSchema = z.object({
  url: z.string().describe('The URL of the article to extract text from.'),
});
export type ExtractArticleTextFromUrlInput = z.infer<typeof ExtractArticleTextFromUrlInputSchema>;

const ExtractArticleTextFromUrlOutputSchema = z.object({
  textContent: z.string().describe('The extracted text content from the article.'),
});
export type ExtractArticleTextFromUrlOutput = z.infer<typeof ExtractArticleTextFromUrlOutputSchema>;

export async function extractArticleTextFromUrl(input: ExtractArticleTextFromUrlInput): Promise<ExtractArticleTextFromUrlOutput> {
  return extractArticleTextFromUrlFlow(input);
}

const extractArticleTextFromUrlFlow = ai.defineFlow(
  {
    name: 'extractArticleTextFromUrlFlow',
    inputSchema: ExtractArticleTextFromUrlInputSchema,
    outputSchema: ExtractArticleTextFromUrlOutputSchema,
  },
  async input => {
    const {url} = input;
    // List of proxy configurations to try in sequence
    const proxyConfigs = [
      {
        // Proxy 1: allorigins.win
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        parser: async (response: Response) => {
          const data = await response.json();
          return data.contents;
        },
      },
      {
        // Proxy 2: thingproxy.freeboard.io
        url: `https://thingproxy.freeboard.io/fetch/${url}`,
        parser: async (response: Response) => {
          return await response.text();
        },
      },
    ];

    let articleTextContent: string | null = null;
    for (const proxy of proxyConfigs) {
      try {
        console.log(`Attempting proxy: ${proxy.url}`);
        const response = await fetch(proxy.url);

        if (!response.ok) {
          throw new Error(`Status: ${response.status}`);
        }

        const htmlContent = await proxy.parser(response);

        if (!htmlContent) {
          throw new Error('Empty HTML content.');
        }

        const dom = new JSDOM(htmlContent);
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article || !article.textContent) {
          throw new Error('Failed to extract main text content from the article.');
        }

        articleTextContent = article.textContent;
        break; // If successful, exit the loop
      } catch (error: any) {
        // If a proxy fails, the loop continues to the next one
        console.error(`Proxy ${proxy.url} failed:`, error);
      }
    }

    if (!articleTextContent) {
      throw new Error('Failed to process the link. All proxy services failed.');
    }

    return {textContent: articleTextContent};
  }
);
