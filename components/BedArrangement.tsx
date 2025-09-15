'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  RefreshCwIcon,
  ZapIcon,
  FilterIcon,
  Loader2,
  DownloadIcon,
} from "lucide-react";
import { toast } from "sonner";

import type { Bed as DbBed, Hospital } from "@/types";
import { runAntColonyOptimization } from "@/lib/aco/aco";

// ---------- Local types ----------
type BedStatus = DbBed['status'] | 'reserved';
type UIBed = Omit<DbBed, 'status' | 'position'> & {
  status: BedStatus;
  position: { x: number; y: number };
};

// ---------- Utilities ----------
const getBedColor = (status: BedStatus) => {
  switch (status) {
    case 'available': return 'fill-green-500';
    case 'occupied': return 'fill-red-500';
    case 'maintenance': return 'fill-yellow-500';
    case 'reserved': return 'fill-blue-500';
    default: return 'fill-gray-400';
  }
};

const gridPositioner = (index: number) => {
  const cols = 8;
  const spacingX = 70;
  const spacingY = 70;
  const offsetX = 50;
  const offsetY = 50;
  return {
    x: offsetX + (index % cols) * spacingX,
    y: offsetY + Math.floor(index / cols) * spacingY,
  };
};

const normalizeStatus = (raw: any): BedStatus => {
  const s = String(raw ?? '').toLowerCase();
  if (['available', 'occupied', 'maintenance', 'reserved'].includes(s)) {
    return s as BedStatus;
  }
  return 'available';
};

const parsePosition = (pos: any, index: number): { x: number; y: number } => {
  try {
    if (!pos) return gridPositioner(index);
    if (typeof pos === 'string') {
      const parsed = JSON.parse(pos);
      if (parsed?.x !== undefined && parsed?.y !== undefined) return parsed;
    } else if (typeof pos === 'object' && pos?.x !== undefined && pos?.y !== undefined) {
      return pos as { x: number; y: number };
    }
  } catch {}
  return gridPositioner(index);
};

// ---------- Component ----------
export function BedArrangement({
  hospitalId: propHospitalId,
  token,
}: {
  hospitalId?: string;
  token?: string | null;
}) {
  // Hospitals
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(
    propHospitalId ?? null,
  );
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  // Beds
  const [beds, setBeds] = useState<UIBed[]>([]);
  const bedsRef = useRef<UIBed[]>([]);
  useEffect(() => { bedsRef.current = beds; }, [beds]);

  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoadingBeds, setIsLoadingBeds] = useState(false);

  // ------- Auth headers -------
  const authHeaders = useCallback(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  // ------- Fetch hospitals -------
  const fetchHospitals = useCallback(async () => {
    try {
      setLoadingHospitals(true);
      const res = await fetch('/api/hospitals', { cache: 'no-store', headers: authHeaders() });
      if (!res.ok) throw new Error();
      const payload: any[] = await res.json();
      setHospitals(payload.map(h => ({
        id: String(h.id),
        name: h.name,
        location: h.location,
        totalBeds: Number(h.totalBeds ?? 0),
        availableBeds: Number(h.availableBeds ?? 0),
        specialties: Array.isArray(h.specialties) ? h.specialties : [],
        status: h.status === 'inactive' ? 'inactive' : 'active',
        phone: String(h.phone ?? ''),
      })));
    } catch {
      toast.error('Could not load hospitals.');
      setHospitals([]);
    } finally { setLoadingHospitals(false); }
  }, [authHeaders]);

  // ------- Fetch beds -------
  const fetchBeds = useCallback(async (hid: string) => {
    try {
      setIsLoadingBeds(true);
      const res = await fetch(`/api/hospitals/${hid}/beds`, { cache: 'no-store', headers: authHeaders() });
      if (!res.ok) throw new Error();
      const rows: any[] = await res.json();
      setBeds(rows.map((r, idx) => ({
        id: String(r.id),
        bedNumber: r.bedNumber ?? `B-${idx + 1}`,
        ward: r.ward ?? 'General',
        status: normalizeStatus(r.status),
        position: parsePosition(r.position, idx),
        priority: ['high','medium','low'].includes(r.priority) ? r.priority : 'low',
        hospitalId: r.hospitalId ?? hid,
      })));
    } catch {
      toast.error('Could not load beds.');
      setBeds([]);
    } finally { setIsLoadingBeds(false); }
  }, [authHeaders]);

  // ------- Admit -------
  const admitPatient = async (bed: UIBed) => {
    if (!selectedHospitalId) return;
    const prev = bedsRef.current;
    setBeds(prev.map(b => b.id === bed.id ? { ...b, status: 'occupied' } : b));
    try {
      const res = await fetch(`/api/hospitals/${selectedHospitalId}/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ patientPriority: bed.priority, wardType: bed.ward }),
      });
      if (!res.ok) throw new Error();
      await fetchBeds(selectedHospitalId);
    } catch {
      setBeds(prev);
      toast.error('Failed to admit patient.');
    }
  };

  // ------- Optimize using ACO -------
  const optimizeArrangement = useCallback(() => {
    if (beds.length === 0) return;
    setIsOptimizing(true);
    try {
      const optimized = runAntColonyOptimization(beds.map(b => ({
        ...b,
        position: b.position,
      })));
      setBeds(optimized.map((b, idx) => ({ ...beds[idx], position: b.position })));
      toast.success('Bed layout optimized.');
    } catch {
      toast.error('Optimization failed.');
    } finally { setIsOptimizing(false); }
  }, [beds]);

  // ------- PDF Export -------
  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Hospital Floor Plan', 20, 20);

    beds.forEach(bed => {
      doc.setFillColor(
        bed.status === 'available' ? 0 : bed.status === 'occupied' ? 255 : 200,
        bed.status === 'available' ? 200 : bed.status === 'occupied' ? 0 : 200,
        0,
      );
      doc.rect(bed.position.x / 3, bed.position.y / 3, 15, 10, 'F');
      doc.text(bed.bedNumber, bed.position.x / 3 + 20, bed.position.y / 3 + 8);
    });

    doc.save('bed-arrangement.pdf');
  };

  // ------- Derived -------
  const wards = useMemo(() => ['all', ...Array.from(new Set(beds.map(b => b.ward)))], [beds]);
  const filteredBeds = useMemo(() => selectedWard === 'all' ? beds : beds.filter(b => b.ward === selectedWard), [beds, selectedWard]);
  const statusCounts = useMemo(() => beds.reduce((acc,b) => { acc[b.status] = (acc[b.status]||0)+1; return acc; }, {} as Record<BedStatus, number>), [beds]);

  // ------- Effects -------
  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);
  useEffect(() => { if (selectedHospitalId) fetchBeds(selectedHospitalId); }, [selectedHospitalId, fetchBeds]);

  // ------- Render -------
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Bed Arrangement</h2>
          <p className="text-muted-foreground">AI-powered bed allocation using swarm algorithms</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Hospital selector */}
          <div className="w-56">
            <Select value={selectedHospitalId ?? ''} onValueChange={setSelectedHospitalId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select hospital" /></SelectTrigger>
              <SelectContent>{hospitals.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* Ward filter */}
          <Select value={selectedWard} onValueChange={setSelectedWard}>
            <SelectTrigger className="w-40"><FilterIcon className="h-4 w-4 mr-2"/><SelectValue placeholder="Filter by ward"/></SelectTrigger>
            <SelectContent>{wards.map(ward => <SelectItem key={ward} value={ward}>{ward==='all'?'All Wards':ward}</SelectItem>)}</SelectContent>
          </Select>

          <Button onClick={optimizeArrangement} disabled={isOptimizing || beds.length===0}>
            {isOptimizing ? <><RefreshCwIcon className="h-4 w-4 mr-2 animate-spin"/>Optimizing...</> : <><ZapIcon className="h-4 w-4 mr-2"/>Optimize Layout</>}
          </Button>

          <Button variant="secondary" onClick={downloadPDF} disabled={beds.length===0}>
            <DownloadIcon className="h-4 w-4 mr-2"/>Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Legend */}
        <div className="space-y-3">
          <h3 className="font-semibold">Bed Status</h3>
          <div className="space-y-2">
            {(['available','occupied','reserved','maintenance'] as BedStatus[]).map(status => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-2"><div className={`w-3 h-3 rounded ${getBedColor(status)}`}/><span className="text-sm capitalize">{status}</span></div>
                <Badge variant="outline">{statusCounts[status]||0}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Floor Plan */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Floor Plan</CardTitle>
              <CardDescription>Grid-based layout with interactive beds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-50 rounded-lg p-4" style={{height:'500px'}}>
                {isLoadingBeds && <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10"><Loader2 className="h-5 w-5 animate-spin mr-2"/>Loading beds...</div>}

                <svg width="100%" height="100%" className="absolute inset-0">
                  {filteredBeds.map(bed => (
                    <g key={bed.id} onClick={()=>bed.status==='available'&&admitPatient(bed)} className="cursor-pointer select-none">
                      <rect x={bed.position.x} y={bed.position.y} width="40" height="25" rx="5" ry="5" className={`${getBedColor(bed.status)} transition-all duration-500`} stroke="white" strokeWidth="2"/>
                      <text x={bed.position.x+20} y={bed.position.y+17} textAnchor="middle" className="text-xs fill-gray-700">{bed.bedNumber}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
