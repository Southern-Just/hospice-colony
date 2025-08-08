"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboardIcon,
  HospitalIcon,
  BedIcon,
  BarChart3Icon,
  SettingsIcon,
  BellIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/auth/UserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dashboard } from "@/components/Dashboard";
import { BedArrangement } from "@/components/BedArrangement";
import { Analytics } from "@/components/Analytics";
import { toast } from "sonner";
import { HospitalPartners } from "@/components/HospitalPartners";

// Simple hook for count-up animation
const useCountUp = (endValue: number, duration = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = endValue / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= endValue) {
        start = endValue;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [endValue, duration]);

  return count;
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalBeds: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    partneredHospitals: 0,
  });

  // we still keep hospitals in state if components later want the array
  const [hospitals, setHospitals] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/hospitals/stats");
        if (!res.ok) {
          const errText = await res.text().catch(() => "unknown");
          throw new Error(`Failed to fetch stats (${res.status}): ${errText}`);
        }

        const data = await res.json();

        // Accept either { stats, hospitals } OR legacy flat stats shape.
        // Prefer pre-computed server stats if present.
        const serverStats =
            data?.stats ??
            (typeof data === "object" && data !== null && ("totalBeds" in data || "availableBeds" in data)
                ? {
                  totalBeds: Number(data.totalBeds ?? 0),
                  availableBeds: Number(data.availableBeds ?? 0),
                  occupiedBeds:
                      Number(data.occupiedBeds ?? 0) ||
                      Number((data.totalBeds ?? 0) - (data.availableBeds ?? 0)),
                  partneredHospitals:
                      Number(data.partneredHospitals ?? data.hospitalCount ?? (Array.isArray(data.hospitals) ? data.hospitals.length : 0)),
                }
                : null);

        if (!serverStats || typeof serverStats !== "object") {
          throw new Error("Missing or invalid 'stats' in response");
        }

        // set stats and hospitals defensively
        setStats({
          totalBeds: Number(serverStats.totalBeds || 0),
          availableBeds: Number(serverStats.availableBeds || 0),
          occupiedBeds: Number(serverStats.occupiedBeds || 0),
          partneredHospitals: Number(serverStats.partneredHospitals || 0),
        });

        // hospitals might be provided alongside stats for other UI use
        setHospitals(Array.isArray(data?.hospitals) ? data.hospitals : []);
      } catch (error) {
        toast.error("Error loading dashboard stats");
        console.error("HomePage fetchStats error:", error);
      }
    };

    fetchStats();
  }, []);

  const animatedTotalBeds = useCountUp(stats.totalBeds, 1200);
  const animatedAvailableBeds = useCountUp(stats.availableBeds, 1200);
  const animatedOccupiedBeds = useCountUp(stats.occupiedBeds, 1200);
  const animatedPartneredHospitals = useCountUp(stats.partneredHospitals, 1200);

  return (
      <div className="min-h-screen healthcare-home-bg">
        <header className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <HospitalIcon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold">Hospice Colony</span>
                </div>
                <Badge variant="outline" className="hidden md:flex">
                  sajoh - Swarm Algorithm 001
                </Badge>
                {user && (
                    <Badge variant="secondary" className="hidden lg:flex">
                      Welcome, {user.firstName}
                    </Badge>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <BellIcon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Alerts</span>
                </Button>
                <Button variant="outline" size="sm">
                  <SettingsIcon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
                <UserProfile />
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
              <Dashboard
                  totalBeds={animatedTotalBeds}
                  availableBeds={animatedAvailableBeds}
                  occupiedBeds={animatedOccupiedBeds}
                  partneredHospitals={animatedPartneredHospitals}
              />
            </TabsContent>

            <TabsContent value="partners" className="space-y-6">
              {/* HospitalPartners component will fetch its own data if needed,
                but we keep hospitals in state here if you want to pass them later */}
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
                © 2025 Hospice Colony. Powered by advanced swarm algorithms for optimal healthcare
                resource allocation.
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>System Status: Active</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {user && (
                    <span>
                  Logged in as: {user.firstName} {user.lastName}
                </span>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}
