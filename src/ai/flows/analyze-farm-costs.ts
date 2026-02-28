'use server';
/**
 * @fileOverview This file implements an AI flow for analyzing farm cost data.
 * It now includes community benchmarking for competitive analysis.
 *
 * - analyzeFarmCosts - A function that triggers the AI cost analysis.
 * - AnalyzeFarmCostsInput - The input type for the analyzeFarmCosts function.
 * - AnalyzeFarmCostsOutput - The return type for the analyzeFarmCosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LivestockPurchaseSchema = z.object({
  purchaseDate: z.string().describe('Date of purchase (YYYY-MM-DD format).'),
  villageName: z.string().describe('Name of the village where the animal was purchased.'),
  farmerName: z.string().describe('Name of the farmer from whom the animal was purchased.'),
  animalCount: z.number().int().describe('Number of animals purchased.'),
  purchasePrice: z.number().describe('Total purchase price for the animals.'),
  transportCost: z.number().optional().describe('Cost of transporting the animals.'),
  amountPaid: z.number().describe('Amount paid at the time of purchase.'),
  dueAmount: z.number().describe('Calculated due amount for the purchase.'),
  payingTimePeriod: z.string().optional().describe('Agreed payment period.'),
});

const MedicineExpenseSchema = z.object({
  shopName: z.string().describe('Name of the medicine shop.'),
  date: z.string().describe('Date of medicine purchase (YYYY-MM-DD format).'),
  description: z.string().optional().describe('A description of the medicine or expense.'),
  costOfMedicines: z.number().describe('Cost of the medicines.'),
  totalAmountSpent: z.number().describe('Total amount spent including other charges.'),
  outstandingDues: z.number().describe('Any outstanding dues for this medicine purchase.'),
});

const FeedCostSchema = z.object({
  feedType: z.string().describe('Type of feed (e.g., TMR, silage, groundnut, other).'),
  cost: z.number().describe('Cost of this specific feed type.'),
  date: z.string().describe('Date of feed purchase (YYYY-MM-DD format).'),
  quantity: z.number().describe('Quantity of feed purchased.'),
});

const LaborCostSchema = z.object({
  employeeName: z.string().describe('Name of the employee.'),
  date: z.string().describe('Date of employee expense (YYYY-MM-DD format).'),
  wages: z.number().describe('Wages per employee.'),
  numberOfLaborers: z.number().int().describe('Number of employees.'),
  advancePayments: z.number().describe('Advance payments made to employees.'),
  foodCosts: z.number().describe('Cost of food provided to employees.'),
  fuelCosts: z.number().describe('Cost of fuel for transport related to employees.'),
  totalLaborCosts: z.number().describe('Total calculated employee costs for this entry.'),
});

const FarmExpenseSchema = z.object({
  expenseDate: z.string().describe('Date of expense (YYYY-MM-DD format).'),
  description: z.string().describe('Description of the expense.'),
  amount: z.number().describe('Amount of the expense.'),
});

const CommunityAveragesSchema = z.object({
  avgPurchasePricePerAnimal: z.number().optional().describe('The average price paid for sheep in the community.'),
  avgSalePricePerAnimal: z.number().optional().describe('The average price sheep are sold for in the community.'),
  totalMarketVolume: z.number().optional().describe('Total number of animals currently in the marketplace.'),
});

const AnalyzeFarmCostsInputSchema = z.object({
  livestockPurchases: z.array(LivestockPurchaseSchema).describe('List of livestock purchase records.'),
  medicineExpenses: z.array(MedicineExpenseSchema).describe('List of medicine expense records.'),
  feedCosts: z.array(FeedCostSchema).describe('List of animal feed cost records.'),
  laborCosts: z.array(LaborCostSchema).describe('List of employee cost records.'),
  farmExpenses: z.array(FarmExpenseSchema).describe('List of general farm expense records.'),
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

Farm Cost Data:

{{#if livestockPurchases}}
## Livestock Purchases:
{{#each livestockPurchases}}
- Date: {{{this.purchaseDate}}}, Sheep: {{{this.animalCount}}}, Price: {{{this.purchasePrice}}}
{{/each}}
{{/if}}

{{#if communityAverages}}
## Community Benchmarks (Regional Data):
- Avg Market Purchase Price: ₹{{{communityAverages.avgPurchasePricePerAnimal}}}
- Avg Market Sale Price: ₹{{{communityAverages.avgSalePricePerAnimal}}}
- Community Listing Volume: {{{communityAverages.totalMarketVolume}}} animals
{{/if}}

{{#if medicineExpenses}}
## Medicine:
{{#each medicineExpenses}}
- Cost: {{{this.totalAmountSpent}}}, Description: {{{this.description}}}
{{/each}}
{{/if}}

{{#if feedCosts}}
## Feed:
{{#each feedCosts}}
- Type: {{{this.feedType}}}, Cost: {{{this.cost}}}
{{/each}}
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