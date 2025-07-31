import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { HospitalIcon, MapPinIcon, BedIcon, PhoneIcon } from "lucide-react";

interface Hospital {
    id: string;
    name: string;
    location: string;
    totalBeds: number;
    availableBeds: number;
    specialties: string[];
    status: 'active' | 'inactive';
    phone: string;
}

const mockHospitals: Hospital[] = [
    {
        id: '1',
        name: 'Central Medical Center',
        location: 'Downtown District',
        totalBeds: 150,
        availableBeds: 23,
        specialties: ['Emergency', 'ICU', 'Surgery'],
        status: 'active',
        phone: '+1 (555) 123-4567'
    },
    {
        id: '2',
        name: 'St. Mary\'s General Hospital',
        location: 'West Side',
        totalBeds: 200,
        availableBeds: 45,
        specialties: ['Cardiology', 'Neurology', 'Pediatrics'],
        status: 'active',
        phone: '+1 (555) 234-5678'
    },
    {
        id: '3',
        name: 'Regional Trauma Center',
        location: 'North Hills',
        totalBeds: 120,
        availableBeds: 8,
        specialties: ['Trauma', 'Emergency', 'Orthopedics'],
        status: 'active',
        phone: '+1 (555) 345-6789'
    },
    {
        id: '4',
        name: 'Community Health Hospital',
        location: 'South Valley',
        totalBeds: 80,
        availableBeds: 12,
        specialties: ['General Medicine', 'Maternity'],
        status: 'active',
        phone: '+1 (555) 456-7890'
    },
    {
        id: '5',
        name: 'Metro Emergency Center',
        location: 'East District',
        totalBeds: 60,
        availableBeds: 18,
        specialties: ['Emergency', 'Urgent Care'],
        status: 'active',
        phone: '+1 (555) 567-8901'
    }
];

export function HospitalPartners() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Partner Hospitals</h2>
                    <p className="text-muted-foreground">Hospitals collaborating with Hospice Colony</p>
                </div>
                <Button>Add New Partner</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockHospitals.map((hospital) => (
                    <Card key={hospital.id} className="relative">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <HospitalIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{hospital.name}</CardTitle>
                                        <CardDescription className="flex items-center space-x-1">
                                            <MapPinIcon className="h-3 w-3" />
                                            <span>{hospital.location}</span>
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant={hospital.status === 'active' ? 'default' : 'secondary'}>
                                    {hospital.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Total Beds</p>
                                    <div className="flex items-center space-x-2">
                                        <BedIcon className="h-4 w-4" />
                                        <span className="font-semibold">{hospital.totalBeds}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Available</p>
                                    <div className="flex items-center space-x-2">
                                        <BedIcon className="h-4 w-4 text-green-600" />
                                        <span className="font-semibold text-green-600">{hospital.availableBeds}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Specialties</p>
                                <div className="flex flex-wrap gap-1">
                                    {hospital.specialties.map((specialty) => (
                                        <Badge key={specialty} variant="outline" className="text-xs">
                                            {specialty}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                    <PhoneIcon className="h-3 w-3" />
                                    <span>{hospital.phone}</span>
                                </div>
                                <Button variant="outline" size="sm">
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}