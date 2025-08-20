'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
  FilterIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

import type { Bed as DbBed, Hospital } from "@/types";
import { initSocket, getSocket, disconnectSocket } from "@/lib/socket";

// ---------- Local types ----------
type BedStatus = DbBed['status'] | 'reserved';
type UIBed = Omit<DbBed, 'status' | 'position'> & {
  status: BedStatus;
  position: { x: number; y: number };
};

// ---------- Utilities ----------
const getBedColor = (status: BedStatus) => {
  switch (status) {
    case 'available': return 'bg-green-500';
    case 'occupied': return 'bg-red-500';
    case 'maintenance': return 'bg-yellow-500';
    case 'reserved': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

// Fallback placement: neat grid inside ~600x400 box with margins
const gridPositioner = (index: number) => {
  const cols = 8;
  const spacingX = 70;
  const spacingY = 70;
  const offsetX = 40;
  const offsetY = 40;
  const x = offsetX + (index % cols) * spacingX;
  const y = offsetY + Math.floor(index / cols) * spacingY;
  return { x, y };
};

const normalizeStatus = (raw: any): BedStatus => {
  const s = String(raw ?? '').toLowerCase();
  if (s === 'available' || s === 'occupied' || s === 'maintenance' || s === 'reserved') return s as BedStatus;
  return 'available';
};

const parsePosition = (pos: any, index: number): { x: number; y: number } => {
  try {
    if (!pos) return gridPositioner(index);
    if (typeof pos === 'string') {
      const parsed = JSON.parse(pos);
      if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed;
    } else if (typeof pos === 'object' && pos !== null && typeof pos.x === 'number' && typeof pos.y === 'number') {
      return pos as { x: number; y: number };
    }
  } catch {
    // fall through
  }
  return gridPositioner(index);
};

// ---------- Component ----------
export function BedArrangement({ hospitalId: propHospitalId }: { hospitalId?: string }) {
  // Hospitals & selection
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(propHospitalId ?? null);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  // Beds & UI
  const [beds, setBeds] = useState<UIBed[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoadingBeds, setIsLoadingBeds] = useState(false);

  // Keep a ref of current hospital to use inside socket handlers safely
  const currentHospitalRef = useRef<string | null>(selectedHospitalId);
  useEffect(() => { currentHospitalRef.current = selectedHospitalId; }, [selectedHospitalId]);

  // ------- Fetch hospitals -------
  const fetchHospitals = useCallback(async () => {
    try {
      setLoadingHospitals(true);
      const res = await fetch('/api/hospitals', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Hospitals fetch failed (${res.status})`);
      const payload = await res.json();

      // Accept either array or { hospitals: [...] }
      const data: any[] = Array.isArray(payload) ? payload : Array.isArray(payload?.hospitals) ? payload.hospitals : [];
      const list: Hospital[] = data.map((h: any) => ({
        id: String(h.id),
        name: h.name,
        location: h.location,
        totalBeds: Number(h.totalBeds ?? h.total_beds ?? 0),
        availableBeds: Number(h.availableBeds ?? h.available_beds ?? 0),
        specialties: Array.isArray(h.specialties) ? h.specialties : [],
        status: (h.status === 'inactive' ? 'inactive' : 'active'),
        phone: String(h.phone ?? ''),
      }));
      setHospitals(list);
    } catch (e) {
      console.error('Error fetching hospitals:', e);
      toast.error('Could not load hospitals.');
      setHospitals([]);
    } finally {
      setLoadingHospitals(false);
    }
  }, []);

  // Keep selected hospital in sync with prop (if provided)
  useEffect(() => {
    if (propHospitalId && propHospitalId !== selectedHospitalId) {
      setSelectedHospitalId(propHospitalId);
    }
  }, [propHospitalId]); // intentionally not depending on selectedHospitalId

  // Set default hospitalId after hospitals load
  useEffect(() => {
    if (!selectedHospitalId && hospitals.length > 0) {
      setSelectedHospitalId(hospitals[0].id);
    }
  }, [hospitals, selectedHospitalId]);

  // ------- Fetch beds for selected hospital -------
  const fetchBeds = useCallback(async (hid: string) => {
    try {
      setIsLoadingBeds(true);
      const res = await fetch(`/api/hospitals/${hid}/beds`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Beds fetch failed (${res.status})`);
      const rows: any[] = await res.json();

      const mapped: UIBed[] = rows.map((r: any, idx: number) => ({
        id: String(r.id),
        bedNumber: r.bedNumber ?? r.bed_number ?? `B-${idx + 1}`,
        ward: r.ward ?? 'General',
        status: normalizeStatus(r.status),
        position: parsePosition(r.position, idx),
        priority: (r.priority === 'high' || r.priority === 'medium' || r.priority === 'low') ? r.priority : 'low',
        // spread any other props you rely on
        hospitalId: r.hospitalId ?? r.hospital_id ?? hid,
        pheromoneLevel: r.pheromoneLevel ?? r.pheromone_level ?? 1.0,
        createdAt: r.createdAt ?? r.created_at ?? null,
        updatedAt: r.updatedAt ?? r.updated_at ?? null,
      }));

      setBeds(mapped);
    } catch (e) {
      console.error('Error fetching beds:', e);
      toast.error('Could not load beds.');
      setBeds([]);
    } finally {
      setIsLoadingBeds(false);
    }
  }, []);

  // ------- Admit patient (uses ward/priority to match your route) -------
  const admitPatient = async (bed: UIBed) => {
    if (!selectedHospitalId) {
      toast.error('No hospital selected.');
      return;
    }

    const prev = beds;
    // optimistic set
    setBeds(beds.map(b => (b.id === bed.id ? { ...b, status: 'occupied' } : b)));

    try {
      const res = await fetch(`/api/hospitals/${selectedHospitalId}/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Your route expects { patientPriority, wardType }
        body: JSON.stringify({ patientPriority: bed.priority ?? 'medium', wardType: bed.ward }),
      });

      if (!res.ok) {
        if (res.status === 401) toast.error('Unauthorized. Please sign in with staff/admin privileges.');
        throw new Error(`Admit failed (${res.status})`);
      }

      // Server will emit realtime update; still refetch as a safety in case others need fresh state
      await fetchBeds(selectedHospitalId);
    } catch (e) {
      console.error('Error admitting patient:', e);
      setBeds(prev); // rollback
      toast.error('Failed to admit patient.');
    }
  };

  // ------- Optimize arrangement -------
  const optimizeArrangement = async () => {
    if (!beds.length || !selectedHospitalId) return;
    setIsOptimizing(true);
    try {
      // First try: REST style route with id in path
      let res = await fetch(`/api/bed-optimization/${selectedHospitalId}`, { method: 'POST' });

      // Fallback: body-based route
      if (!res.ok) {
        res = await fetch(`/api/bed-optimization`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedHospitalId }),
        });
      }

      if (res.ok) {
        const optimized: any[] = await res.json();
        const mapPos = new Map<string, { x: number; y: number }>();
        optimized.forEach((b: any, idx: number) => {
          const pos = parsePosition(b.position, idx);
          mapPos.set(String(b.id ?? b.bedId), pos);
        });
        setBeds(curr =>
          curr.map((b, idx) => ({
            ...b,
            position: mapPos.get(b.id) ?? parsePosition((optimized[idx]?.position) ?? null, idx),
          })),
        );
      } else {
        // Fallback: client-side randomization
        const optimizedLocal = beds.map(bed => ({
          ...bed,
          position: {
            x: Math.floor(Math.random() * 600) + 30,
            y: Math.floor(Math.random() * 400) + 30,
          },
        }));
        setBeds(optimizedLocal);
      }
    } catch (e) {
      console.error('Error optimizing arrangement:', e);
      toast.error('Optimization failed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  // ------- Derived UI state -------
  const wards = useMemo(() => ['all', ...Array.from(new Set(beds.map(b => b.ward)))], [beds]);
  const filteredBeds = useMemo(
    () => (selectedWard === 'all' ? beds : beds.filter(b => b.ward === selectedWard)),
    [beds, selectedWard],
  );
  const statusCounts = useMemo(
    () =>
      beds.reduce((acc, bed) => {
        acc[bed.status] = (acc[bed.status] || 0) + 1;
        return acc;
      }, {} as Record<BedStatus, number>),
    [beds],
  );

  // ------- Effects -------
  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  // Initialize Socket.IO server (Next needs the API route touched once)
  useEffect(() => {
    // Fire and forget; if this 404s locally it’s harmless
    fetch('/api/socket').catch(() => {});
  }, []);

  // Connect socket with JWT and subscribe to room on hospital change
  useEffect(() => {
    const token =
      (typeof window !== 'undefined' && localStorage.getItem('token')) || '';

    if (!token) {
      // You can relax this to allow unauth guests if your server permits
      console.warn('No JWT token found; skipping socket connection.');
      return;
    }

    const socket = initSocket(token);

    const onConnect = () => {
      // noop but useful for debugging
      // console.log('socket connected');
    };
    const onConnectError = (err: any) => {
      console.error('Socket connect error:', err?.message || err);
      toast.error('Realtime connection failed.');
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      // do not disconnect here; we keep a singleton socket for the session
    };
  }, []);

  // Subscribe to the currently selected hospital and listen for updates
  useEffect(() => {
    if (!selectedHospitalId) return;

    // initial fetch
    fetchBeds(selectedHospitalId);

    const socket = getSocket();
    if (!socket) return;

    // join the room for this hospital
    socket.emit('joinHospital', selectedHospitalId);

    // handler for updates
    const onBedsUpdated = async (payload: any) => {
      // If server sends fresh beds, use them; otherwise refetch.
      // We also guard that this update is for the current hospital.
      const hid = String(payload?.hospitalId || selectedHospitalId);
      if (hid !== currentHospitalRef.current) return;

      if (Array.isArray(payload?.beds)) {
        const mapped: UIBed[] = payload.beds.map((r: any, idx: number) => ({
          id: String(r.id),
          bedNumber: r.bedNumber ?? r.bed_number ?? `B-${idx + 1}`,
          ward: r.ward ?? 'General',
          status: normalizeStatus(r.status),
          position: parsePosition(r.position, idx),
          priority: (r.priority === 'high' || r.priority === 'medium' || r.priority === 'low') ? r.priority : 'low',
          hospitalId: r.hospitalId ?? r.hospital_id ?? hid,
          pheromoneLevel: r.pheromoneLevel ?? r.pheromone_level ?? 1.0,
          createdAt: r.createdAt ?? r.created_at ?? null,
          updatedAt: r.updatedAt ?? r.updated_at ?? null,
        }));
        setBeds(mapped);
      } else {
        await fetchBeds(hid);
      }
    };

    socket.on('bedsUpdated', onBedsUpdated);

    // leave room & cleanup when hospital changes/unmounts
    return () => {
      socket.off('bedsUpdated', onBedsUpdated);
      socket.emit('leaveHospital', selectedHospitalId);
    };
  }, [selectedHospitalId, fetchBeds]);

  // ------- Render -------
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bed Arrangement</h2>
          <p className="text-muted-foreground">AI-powered bed allocation using swarm algorithms</p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row items-center sm:space-x-3">

          {/* Hospital selector */}
          <div className="w-56">
            {loadingHospitals ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading hospitals...
              </div>
            ) : hospitals.length === 0 ? (
              <Select disabled value="">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No hospitals" />
                </SelectTrigger>
              </Select>
            ) : (
              <Select
                value={selectedHospitalId ?? ''}
                onValueChange={(val) => setSelectedHospitalId(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map(h => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Ward filter */}
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

          {/* Optimize */}
          <Button
            onClick={optimizeArrangement}
            disabled={isOptimizing || beds.length === 0}
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
            {(['available', 'occupied', 'reserved', 'maintenance'] as BedStatus[]).map(status => (
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
                {/* Loading overlay while beds load */}
                {isLoadingBeds && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading beds...
                    </div>
                  </div>
                )}

                <svg width="100%" height="100%" className="absolute inset-0">
                  {filteredBeds.map((bed) => (
                    <g
                      key={bed.id}
                      onClick={() => bed.status === 'available' && admitPatient(bed)}
                      className="select-none"
                    >
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
