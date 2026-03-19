
'use server';
/**
 * @fileOverview This file implements an AI flow for analyzing farm cost data.
 * Updated to use the unified master ledger schema (date, totalAmount).
 *
 * - analyzeFarmCosts - A function that triggers the AI cost analysis.
 * - AnalyzeFarmCostsInput - The input type for the analyzeFarmCosts function.
 * - AnalyzeFarmCostsOutput - The return type for the analyzeFarmCosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmExpenseSchema = z.object({
  date: z.string().describe('Date of transaction (YYYY-MM-DD format).'),
  category: z.string().describe('Category of transaction.'),
  subcategory: z.string().describe('Subcategory of transaction.'),
  description: z.string().describe('Description of the expense.'),
  totalAmount: z.number().describe('Total value of the transaction.'),
});

const CommunityAveragesSchema = z.object({
  avgPurchasePricePerAnimal: z.number().optional().describe('The average price paid for sheep in the community.'),
  avgSalePricePerAnimal: z.number().optional().describe('The average price sheep are sold for in the community.'),
  totalMarketVolume: z.number().optional().describe('Total number of animals currently in the marketplace.'),
});

const AnalyzeFarmCostsInputSchema = z.object({
  farmExpenses: z.array(FarmExpenseSchema).describe('List of general farm expense records from the unified ledger.'),
  communityAverages: CommunityAveragesSchema.optional().describe('Aggregated anonymized data from the community marketplace.'),
});
export type AnalyzeFarmCostsInput = z.infer<typeof AnalyzeFarmCostsInputSchema>;

const AnalyzeFarmCostsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of overall spending patterns.'),
  highExpenditureAreas: z.array(z.string()).describe('List of key areas with high expenditure.'),
  communityBenchmarking: z.string().describe('Comparison of the farm performance against community averages.'),
  actionableInsights: z.array(z.string()).describe('Actionable recommendations for cost optimization.'),
});
export type AnalyzeFarmCostsOutput = z.infer<typeof AnalyzeFarmCostsOutputSchema>;

export async function analyzeFarmCosts(input: AnalyzeFarmCostsInput): Promise<AnalyzeFarmCostsOutput> {
  return analyzeFarmCostsFlow(input);
}

const analyzeFarmCostsPrompt = ai.definePrompt({
  name: 'analyzeFarmCostsPrompt',
  input: {schema: AnalyzeFarmCostsInputSchema},
  output: {schema: AnalyzeFarmCostsOutputSchema},
  prompt: `You are an AI financial analyst specializing in farm management and AgTech. Your task is to analyze the provided farm cost data and community benchmarks.

Analyze the following data and:
1. Provide a concise summary of the overall spending patterns.
2. Identify key areas of high expenditure.
3. Compare the farm's performance (purchases and sales) with the community averages provided.
4. Offer actionable insights and recommendations to optimize costs.

Farm Cost Data (Unified Ledger):

{{#if farmExpenses}}
## Unified Transactional Stream:
{{#each farmExpenses}}
- Date: {{{this.date}}}, Category: {{{this.category}}}, Sub: {{{this.subcategory}}}, Desc: {{{this.description}}}, Amount: ₹{{{this.totalAmount}}}
{{/each}}
{{/if}}

{{#if communityAverages}}
## Community Benchmarks (Regional Data):
- Avg Market Purchase Price: ₹{{{communityAverages.avgPurchasePricePerAnimal}}}
- Avg Market Sale Price: ₹{{{communityAverages.avgSalePricePerAnimal}}}
- Community Listing Volume: {{{communityAverages.totalMarketVolume}}} animals
{{/if}}

Based on this data, please provide your analysis, focusing on how the user's costs compare to the community trends.`,
});

const analyzeFarmCostsFlow = ai.defineFlow(
  {
    name: 'analyzeFarmCostsFlow',
    inputSchema: AnalyzeFarmCostsInputSchema,
    outputSchema: AnalyzeFarmCostsOutputSchema,
  },
  async (input) => {
    const {output} = await analyzeFarmCostsPrompt(input);
    return output!;
  }
);
