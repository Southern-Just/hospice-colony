import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BedIcon, RefreshCwIcon, ZapIcon, FilterIcon } from "lucide-react";

interface Bed {
    id: string;
    status: 'available' | 'occupied' | 'maintenance' | 'reserved';
    ward: string;
    bedNumber: string;
    priority: 'low' | 'medium' | 'high';
    position: { x: number; y: number };
}

const generateBeds = (): Bed[] => {
    const wards = ['ICU', 'Emergency', 'General', 'Surgery', 'Pediatrics'];
    const statuses: Bed['status'][] = ['available', 'occupied', 'maintenance', 'reserved'];
    const priorities: Bed['priority'][] = ['low', 'medium', 'high'];

    return Array.from({ length: 48 }, (_, index) => ({
        id: `bed-${index + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        ward: wards[Math.floor(Math.random() * wards.length)],
        bedNumber: `${String.fromCharCode(65 + Math.floor(index / 8))}${(index % 8) + 1}`,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        position: {
            x: (index % 8) * 100 + 50,
            y: Math.floor(index / 8) * 80 + 50
        }
    }));
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

export function BedArrangement() {
    const [beds, setBeds] = useState<Bed[]>(generateBeds());
    const [selectedWard, setSelectedWard] = useState<string>('all');
    const [isOptimizing, setIsOptimizing] = useState(false);

    const filteredBeds = selectedWard === 'all'
        ? beds
        : beds.filter(bed => bed.ward === selectedWard);

    const optimizeArrangement = () => {
        setIsOptimizing(true);

        // Simulate swarm algorithm optimization
        setTimeout(() => {
            setBeds(prev => prev.map(bed => ({
                ...bed,
                position: {
                    x: Math.random() * 750 + 25,
                    y: Math.random() * 450 + 25
                }
            })));
            setIsOptimizing(false);
        }, 2000);
    };

    const statusCounts = beds.reduce((acc, bed) => {
        acc[bed.status] = (acc[bed.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded bg-green-500"></div>
                                <span className="text-sm">Available</span>
                            </div>
                            <Badge variant="outline">{statusCounts.available || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded bg-red-500"></div>
                                <span className="text-sm">Occupied</span>
                            </div>
                            <Badge variant="outline">{statusCounts.occupied || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded bg-blue-500"></div>
                                <span className="text-sm">Reserved</span>
                            </div>
                            <Badge variant="outline">{statusCounts.reserved || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                                <span className="text-sm">Maintenance</span>
                            </div>
                            <Badge variant="outline">{statusCounts.maintenance || 0}</Badge>
                        </div>
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
                                                className={`${getBedColor(bed.status)} transition-all duration-500 hover:r-16 cursor-pointer`}
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