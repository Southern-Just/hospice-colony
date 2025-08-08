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
import { Bed } from '@/types';

const getBedColor = (status: Bed['status']) => {
  switch (status) {
    case 'available': return 'bg-green-500';
    case 'occupied': return 'bg-red-500';
    case 'maintenance': return 'bg-yellow-500';
    case 'reserved': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

export function BedArrangement() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Fetch beds from DB on mount
  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const res = await fetch('/api/beds');
        if (!res.ok) {
          console.error('Failed to fetch beds:', await res.text());
          return;
        }
        const data = await res.json();
        setBeds(data);
      } catch (err) {
        console.error('Error fetching beds:', err);
      }
    };
    fetchBeds();
  }, []);

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

    try {
      // Request server-side optimization. We send the current beds so server can validate.
      const res = await fetch('/api/bed-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beds })
      });

      if (!res.ok) {
        console.error('Optimization failed:', await res.text());
        setIsOptimizing(false);
        return;
      }

      const optimizedBeds: Bed[] = await res.json();

      // Update state with server-provided optimized layout (assumes server returns positions)
      setBeds(optimizedBeds);

      // Persist optimized beds to DB
      const persistRes = await fetch('/api/beds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizedBeds)
      });

      if (!persistRes.ok) {
        console.error('Failed to save optimized beds:', await persistRes.text());
      }
    } catch (err) {
      console.error('Error during optimization flow:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bed Arrangement</h2>
            <p className="text-muted-foreground">AI-powered bed allocation using swarm algorithms</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-40">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Surgery">Surgery</SelectItem>
                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
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
                      <div className={`w-3 h-3 rounded ${getBedColor(status)}`}></div>
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
