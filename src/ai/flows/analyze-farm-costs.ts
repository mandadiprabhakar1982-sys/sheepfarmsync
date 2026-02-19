'use server';
/**
 * @fileOverview This file implements an AI flow for analyzing farm cost data.
 *
 * - analyzeFarmCosts - A function that triggers the AI cost analysis.
 * - AnalyzeFarmCostsInput - The input type for the analyzeFarmCosts function.
 * - AnalyzeFarmCostsOutput - The return type for the analyzeFarmCosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LivestockPurchaseSchema = z.object({
  villageName: z.string().describe('Name of the village where the animal was purchased.'),
  farmerName: z.string().describe('Name of the farmer from whom the animal was purchased.'),
  animalCount: z.number().int().describe('Number of animals purchased.'),
  purchasePrice: z.number().describe('Total purchase price for the animals.'),
  amountPaid: z.number().describe('Amount paid at the time of purchase.'),
});

const MedicineExpenseSchema = z.object({
  shopName: z.string().describe('Name of the medicine shop.'),
  date: z.string().describe('Date of medicine purchase (YYYY-MM-DD format).'),
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
  date: z.string().describe('Date of labor expense (YYYY-MM-DD format).'),
  dailyWages: z.number().optional().describe('Daily wage amount paid.'),
  monthlyWages: z.number().optional().describe('Monthly wage amount paid.'),
  numberOfLaborers: z.number().int().describe('Number of laborers.'),
  advancePayments: z.number().describe('Advance payments made to laborers.'),
  foodCosts: z.number().describe('Cost of food provided to laborers.'),
  fuelCosts: z.number().describe('Cost of fuel for transport related to labor.'),
  totalLaborCosts: z.number().describe('Total calculated labor costs for this entry.'),
});

const AnalyzeFarmCostsInputSchema = z.object({
  livestockPurchases: z.array(LivestockPurchaseSchema).describe('List of livestock purchase records.'),
  medicineExpenses: z.array(MedicineExpenseSchema).describe('List of medicine expense records.'),
  feedCosts: z.array(FeedCostSchema).describe('List of animal feed cost records.'),
  laborCosts: z.array(LaborCostSchema).describe('List of labor cost records.'),
});
export type AnalyzeFarmCostsInput = z.infer<typeof AnalyzeFarmCostsInputSchema>;

const AnalyzeFarmCostsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of overall spending patterns.'),
  highExpenditureAreas: z.array(z.string()).describe('List of key areas with high expenditure.'),
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
  prompt: `You are an AI financial analyst specializing in farm management. Your task is to analyze the provided farm cost data and provide insightful observations.

Analyze the following cost data and:
1. Provide a concise summary of the overall spending patterns.
2. Identify key areas of high expenditure.
3. Offer actionable insights and recommendations to optimize costs.

Farm Cost Data:

{{#if livestockPurchases}}
## Livestock Purchases:
{{#each livestockPurchases}}
- Village: {{{this.villageName}}}, Farmer: {{{this.farmerName}}}, Animals: {{{this.animalCount}}}, Purchase Price: {{{this.purchasePrice}}}, Amount Paid: {{{this.amountPaid}}}
{{/each}}
{{else}}
No livestock purchase data available.
{{/if}}

{{#if medicineExpenses}}
## Medicine Expenses:
{{#each medicineExpenses}}
- Shop: {{{this.shopName}}}, Date: {{{this.date}}}, Cost of Medicines: {{{this.costOfMedicines}}}, Total Spent: {{{this.totalAmountSpent}}}, Outstanding Dues: {{{this.outstandingDues}}}
{{/each}}
{{else}}
No medicine expense data available.
{{/if}}

{{#if feedCosts}}
## Feed Costs:
{{#each feedCosts}}
- Type: {{{this.feedType}}}, Cost: {{{this.cost}}}, Date: {{{this.date}}}, Quantity: {{{this.quantity}}}
{{/each}}
{{else}}
No feed cost data available.
{{/if}}

{{#if laborCosts}}
## Labor Costs:
{{#each laborCosts}}
- Date: {{{this.date}}}, Daily Wages: {{{this.dailyWages}}}, Monthly Wages: {{{this.monthlyWages}}}, Laborers: {{{this.numberOfLaborers}}}, Advance Payments: {{{this.advancePayments}}}, Food Costs: {{{this.foodCosts}}}, Fuel Costs: {{{this.fuelCosts}}}, Total: {{{this.totalLaborCosts}}}
{{/each}}
{{else}}
No labor cost data available.
{{/if}}

Based on this data, please provide your analysis and insights following the requested JSON format.`,
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
