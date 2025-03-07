
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

// Mock transaction data
const mockTransactions = [
  {
    id: "0x1234...5678",
    type: "Swap",
    from: "ETH",
    to: "USDT",
    amount: "0.5 ETH",
    value: "$900.00",
    time: "2 mins ago",
    status: "completed",
  },
  {
    id: "0x8765...4321",
    type: "Add Liquidity",
    from: "ETH",
    to: "USDC",
    amount: "0.25 ETH",
    value: "$450.00",
    time: "15 mins ago",
    status: "completed",
  },
  {
    id: "0x9876...2345",
    type: "Remove Liquidity",
    from: "ETH/DAI",
    to: "ETH, DAI",
    amount: "0.15 ETH",
    value: "$270.00",
    time: "1 hour ago",
    status: "completed",
  },
];

export function TransactionHistory() {
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-xl">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {mockTransactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead className="hidden md:table-cell">Amount</TableHead>
                <TableHead className="hidden md:table-cell">Time</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.type}</TableCell>
                  <TableCell>
                    {tx.from} → {tx.to}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{tx.amount}</TableCell>
                  <TableCell className="hidden md:table-cell">{tx.time}</TableCell>
                  <TableCell className="text-right">
                    <a
                      href={`https://etherscan.io/tx/${tx.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      {tx.status === "completed" ? "View" : "Pending"}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No transactions yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
