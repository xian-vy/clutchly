'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

// This will be replaced with actual data from the database
const mockReptiles = [
  {
    id: 1,
    name: "Monty",
    species: "Ball Python",
    morph: "Normal",
    sex: "Male",
    status: "Active",
    hatchDate: "2023-01-15",
  },
];

export function ReptileList() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Species</TableHead>
            <TableHead>Morph</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hatch Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockReptiles.map((reptile) => (
            <TableRow key={reptile.id}>
              <TableCell className="font-medium">{reptile.name}</TableCell>
              <TableCell>{reptile.species}</TableCell>
              <TableCell>{reptile.morph}</TableCell>
              <TableCell>{reptile.sex}</TableCell>
              <TableCell>{reptile.status}</TableCell>
              <TableCell>{reptile.hatchDate}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 