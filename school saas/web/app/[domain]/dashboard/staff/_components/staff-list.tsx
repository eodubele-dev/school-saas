'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Shield, Mail, User, FileSignature } from "lucide-react"

interface StaffListProps {
    data: any[]
}

export function StaffList({ data }: StaffListProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-lg">
                <div className="h-12 w-12 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-white">No staff members found</h3>
                <p className="text-slate-400 mt-2">Add your first staff member to get started.</p>
            </div>
        )
    }

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-xl text-white">Staff Directory</CardTitle>
                <CardDescription className="text-slate-400">
                    Manage your school's staff members and permissions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-900/50">
                            <TableHead className="text-slate-400">Name</TableHead>
                            <TableHead className="text-slate-400">Role</TableHead>
                            <TableHead className="text-slate-400">Designation</TableHead>
                            <TableHead className="text-slate-400">Joined</TableHead>
                            <TableHead className="text-slate-400">Signature</TableHead>
                            <TableHead className="text-slate-400 text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((staff) => (
                            <TableRow key={staff.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-slate-700">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.full_name}`} />
                                            <AvatarFallback className="bg-slate-800 text-slate-300">
                                                {staff.full_name?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-white">{staff.full_name}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {staff.email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize">
                                            {staff.role}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-slate-300">
                                        {staff.staff_permissions?.[0]?.designation || "N/A"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-slate-400 text-sm">
                                        {format(new Date(staff.created_at), "MMM d, yyyy")}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {staff.staff_permissions?.[0]?.signature_url ? (
                                        < Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 gap-1">
                                            <FileSignature className="h-3 w-3" />
                                            Signed
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-slate-800 text-slate-500 border-slate-700">
                                            Pending
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end">
                                        <Shield className={`h-4 w-4 ${staff.role === 'admin' ? 'text-amber-400' : 'text-slate-600'}`} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
