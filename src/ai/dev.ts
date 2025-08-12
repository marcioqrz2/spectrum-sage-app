import { config } from 'dotenv';
config();

import '@/ai/flows/generate-perspectives.ts';
import '@/ai/flows/generate-neutral-summary.ts';
import '@/ai/flows/extract-article-text-from-url.ts';