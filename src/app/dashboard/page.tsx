import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Tractor,
  Syringe,
  Wheat,
  DollarSign,
  Receipt,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Here's a summary of your farm's activities."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Animals"
          value="15"
          icon={Tractor}
          description="Total livestock count"
        />
        <StatCard
          title="Purchase Costs"
          value="₹7,800"
          icon={DollarSign}
          description="Total cost of livestock"
        />
        <StatCard
          title="Medicine Expenses"
          value="₹770"
          icon={Syringe}
          description="Total spent on medicine"
        />
        <StatCard
          title="Feed Costs"
          value="₹2,600"
          icon={Wheat}
          description="Total feed expenditure"
        />
        <StatCard
          title="Labor Costs"
          value="₹4,300"
          icon={Users}
          description="Total labor expenses"
        />
        <StatCard
          title="Total Sales"
          value="₹12,500"
          icon={TrendingUp}
          description="Total revenue from sales"
        />
        <StatCard
          title="Pending Dues"
          value="₹520"
          icon={AlertCircle}
          description="Amount yet to be paid"
        />
        <StatCard
          title="Total Dues"
          value="₹1,200"
          icon={Receipt}
          description="Amount owed to you"
        />
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              A quick look at your most recent sales and purchases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Sale</TableCell>
                  <TableCell>Sold 2 Goats to B. Smith</TableCell>
                  <TableCell className="text-right text-green-600">+₹1,500.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Purchase</TableCell>
                  <TableCell>Bought 5 Sheep from J. Doe</TableCell>
                  <TableCell className="text-right text-red-600">-₹2,800.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Feed</TableCell>
                  <TableCell>Purchased TMR feed</TableCell>
                  <TableCell className="text-right text-red-600">-₹1,200.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Labor</TableCell>
                  <TableCell>Monthly wages for 1 laborer</TableCell>
                  <TableCell className="text-right text-red-600">-₹3,000.00</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Vaccines from Farmacy</TableCell>
                  <TableCell className="text-right text-red-600">-₹320.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
