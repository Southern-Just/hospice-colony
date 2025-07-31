"use client"

import {
    LayoutDashboardIcon,
    HospitalIcon,
    BedIcon,
    BarChart3Icon,
    SettingsIcon,
    BellIcon
} from "lucide-react";
import {Analytics} from "@/components/Analytics";
import {BedArrangement} from "@/components/BedArrangement";
import {HospitalPartners} from "@/components/HospitalPartners";
import {Dashboard} from "@/components/Dashboard";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {useState} from "react";

export default function App() {
    const [activeTab, setActiveTab] = useState("dashboard");

    // Mock data for dashboard
    const dashboardData = {
        totalBeds: 610,
        availableBeds: 106,
        occupiedBeds: 504,
        partneredHospitals: 5
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-ring rounded-lg flex items-center justify-center">
                                    <HospitalIcon className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <span className="text-xl font-bold text-ring">Hospice Colony</span>
                            </div>
                            <Badge variant="outline" className="hidden md:flex">
                                sajoh, algorithm 001
                            </Badge>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button variant="outline" size="sm">
                                <BellIcon className="w-4 h-4 mr-1" />
                                Alerts
                            </Button>
                            <Button variant="outline" size="sm">
                                <SettingsIcon className="w-4 h-4 mr-1" />
                                Settings
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex">
                        <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                            <LayoutDashboardIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </TabsTrigger>
                        <TabsTrigger value="partners" className="flex items-center space-x-2">
                            <HospitalIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Partners</span>
                        </TabsTrigger>
                        <TabsTrigger value="beds" className="flex items-center space-x-2">
                            <BedIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Bed Layout</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center space-x-2">
                            <BarChart3Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">Analytics</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-6">
                        <Dashboard {...dashboardData} />
                    </TabsContent>

                    <TabsContent value="partners" className="space-y-6">
                        <HospitalPartners />
                    </TabsContent>

                    <TabsContent value="beds" className="space-y-6">
                        <BedArrangement />
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <Analytics />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Footer */}
            <footer className="border-t bg-card mt-16">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <p className="text-sm text-muted-foreground">
                            © 2025 Hospice Colony. Powered by advanced swarm algorithms for optimal healthcare resource
                            allocation.

                        </p>
                         <p className="text-sm text-muted-foreground"> southern Just</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>System Status: Active</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
        </div>
</footer>
        </div>
    );
}