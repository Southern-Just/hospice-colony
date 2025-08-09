'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import {
  RefreshCwIcon,
  ZapIcon,
  FilterIcon
} from "lucide-react";

// Bed type
type Bed = {
  id: number;
  bedNumber: string;
  ward: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  position: { x: number; y: number };
};

const getBedColor = (status: Bed['status']) => {
  switch (status) {
    case 'available': return 'bg-green-500';
    case 'occupied': return 'bg-red-500';
    case 'maintenance': return 'bg-yellow-500';
    case 'reserved': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

// Mock beds
const mockBeds: Bed[] = [
  { id: 1, bedNumber: 'B1', ward: 'ICU', status: 'available', position: { x: 50, y: 60 } },
  { id: 2, bedNumber: 'B2', ward: 'ICU', status: 'occupied', position: { x: 120, y: 80 } },
  { id: 3, bedNumber: 'B3', ward: 'Emergency', status: 'maintenance', position: { x: 200, y: 150 } },
  { id: 4, bedNumber: 'B4', ward: 'Emergency', status: 'reserved', position: { x: 280, y: 200 } },
  { id: 5, bedNumber: 'B5', ward: 'General', status: 'available', position: { x: 360, y: 100 } },
  { id: 6, bedNumber: 'B6', ward: 'General', status: 'occupied', position: { x: 420, y: 250 } },
  { id: 7, bedNumber: 'B7', ward: 'Pediatrics', status: 'available', position: { x: 500, y: 180 } },
  { id: 8, bedNumber: 'B8', ward: 'Surgery', status: 'reserved', position: { x: 580, y: 300 } }
];

export function BedArrangement() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Load mock data on mount
  useEffect(() => {
    setBeds(mockBeds);
  }, []);

  const wards = ['all', ...Array.from(new Set(beds.map(b => b.ward)))];

  const filteredBeds = selectedWard === 'all'
      ? beds
      : beds.filter(bed => bed.ward === selectedWard);

  const statusCounts = beds.reduce((acc, bed) => {
    acc[bed.status] = (acc[bed.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const optimizeArrangement = async () => {
    if (beds.length === 0) return;
    setIsOptimizing(true);

    // Fake optimization: randomize positions
    setTimeout(() => {
      const optimized = beds.map(bed => ({
        ...bed,
        position: {
          x: Math.floor(Math.random() * 600) + 30,
          y: Math.floor(Math.random() * 400) + 30
        }
      }));
      setBeds(optimized);
      setIsOptimizing(false);
    }, 1500);
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bed Arrangement</h2>
            <p className="text-muted-foreground">AI-powered bed allocation using swarm algorithms</p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row items-center space-x-3">
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-40">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by ward" />
              </SelectTrigger>
              <SelectContent>
                {wards.map(ward => (
                    <SelectItem key={ward} value={ward}>
                      {ward === 'all' ? 'All Wards' : ward}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
                onClick={optimizeArrangement}
                disabled={isOptimizing}
                className="min-w-[140px]"
            >
              {isOptimizing ? (
                  <>
                    <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
              ) : (
                  <>
                    <ZapIcon className="h-4 w-4 mr-2" />
                    Optimize Layout
                  </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Status Legend */}
          <div className="space-y-3">
            <h3 className="font-semibold">Bed Status</h3>
            <div className="space-y-2">
              {(['available', 'occupied', 'reserved', 'maintenance'] as Bed['status'][]).map(status => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${getBedColor(status)}`} />
                      <span className="text-sm capitalize">{status}</span>
                    </div>
                    <Badge variant="outline">{statusCounts[status] || 0}</Badge>
                  </div>
              ))}
            </div>
          </div>

          {/* Bed Visualization */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Floor Plan</CardTitle>
                <CardDescription>
                  Interactive bed layout optimized by swarm intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-50 rounded-lg" style={{ height: '500px', width: '100%' }}>
                  <svg width="100%" height="100%" className="absolute inset-0">
                    {filteredBeds.map((bed) => (
                        <g key={bed.id}>
                          <circle
                              cx={bed.position.x}
                              cy={bed.position.y}
                              r="12"
                              className={`${getBedColor(bed.status)} transition-all duration-500 cursor-pointer`}
                              stroke="white"
                              strokeWidth="2"
                          />
                          <text
                              x={bed.position.x}
                              y={bed.position.y + 25}
                              textAnchor="middle"
                              className="text-xs fill-gray-600 font-medium"
                          >
                            {bed.bedNumber}
                          </text>
                        </g>
                    ))}
                  </svg>

                  {isOptimizing && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
                          <RefreshCwIcon className="h-5 w-5 animate-spin text-primary" />
                          <span className="font-medium">Swarm algorithm optimizing bed allocation...</span>
                        </div>
                      </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
