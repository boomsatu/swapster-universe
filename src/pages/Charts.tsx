
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TOKENS } from "@/lib/constants";

// Mock price data
const generatePriceData = (days: number, volatility: number = 0.05) => {
  const startPrice = 1800 + Math.random() * 200;
  const data = [];
  let currentPrice = startPrice;
  
  for (let i = 0; i < days; i++) {
    // Create some random movement
    const change = currentPrice * (Math.random() * volatility * 2 - volatility);
    currentPrice += change;
    
    // Ensure price doesn't go below 0
    currentPrice = Math.max(currentPrice, 10);
    
    // Create a date for this data point
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: currentPrice.toFixed(2),
      volume: Math.floor(Math.random() * 100000 + 50000),
    });
  }
  
  return data;
};

const priceData = {
  '24h': generatePriceData(24, 0.01),
  '7d': generatePriceData(7),
  '30d': generatePriceData(30),
  '90d': generatePriceData(90, 0.07),
};

const Charts = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedToken, setSelectedToken] = useState(TOKENS[0].symbol);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24 mb-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl animate-fade-in">
          <h1 className="text-3xl font-bold mb-6">Price Charts</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={selectedToken} onValueChange={(value) => setSelectedToken(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center">
                      <img 
                        src={token.logoURI} 
                        alt={token.name} 
                        className="w-5 h-5 mr-2 rounded-full"
                      />
                      {token.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="price" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="price">Price</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
              <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="price" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xl">
                    {selectedToken} Price
                  </CardTitle>
                  <Tabs 
                    value={timeframe} 
                    onValueChange={(v) => setTimeframe(v as any)}
                    className="w-auto"
                  >
                    <TabsList className="h-8">
                      <TabsTrigger value="24h" className="text-xs px-2 py-1">24H</TabsTrigger>
                      <TabsTrigger value="7d" className="text-xs px-2 py-1">7D</TabsTrigger>
                      <TabsTrigger value="30d" className="text-xs px-2 py-1">30D</TabsTrigger>
                      <TabsTrigger value="90d" className="text-xs px-2 py-1">90D</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={priceData[timeframe]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: 'rgba(17, 24, 39, 0.8)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          labelStyle={{ color: 'white' }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                          name={`${selectedToken} Price ($)`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={priceData[timeframe]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: 'rgba(17, 24, 39, 0.8)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          labelStyle={{ color: 'white' }}
                        />
                        <Legend />
                        <Bar
                          dataKey="volume"
                          fill="hsl(var(--accent))"
                          name="Trading Volume ($)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="volume" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Trading Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Volume data coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="liquidity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Liquidity Depth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Liquidity data coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Charts;
