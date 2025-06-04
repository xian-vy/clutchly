'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { APP_NAME } from "@/lib/constants/app";
import { Eye } from "lucide-react";

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger className="text-[0.8rem] 3xl:text-sm text-muted-foreground hover:text-primary transition">
          Help
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold">Welcome to {APP_NAME}</DialogTitle>
        </DialogHeader>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="getting-started">
            <AccordionTrigger>Getting Started</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Create your first reptile organization to start</li>
                <li>Manage your free Website</li>
                <li>You can  import existing data in <strong>Reptiles</strong> page</li>
                <li> When importing, <strong>morphs</strong>, <strong>species</strong> and <strong>relationships</strong> will be created as well</li>
                <li>Set up housing arrangements (rooms, racks)</li>
                <li>Assign reptiles to their respective housings</li>
                <li>Create feeding schedules for efficient management</li>
                <li>Monitor reptile health and growth</li>
                <li>Manage breeding pairs and lineages</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reptile-management">
            <AccordionTrigger>Reptile Management</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Manage reptiles, morphs and species</li>
                <li>Import existing reptile data in csv or excel format, follow import instructions.</li>
                <li>
                  <div className="flex items-center flex-wrap">
                    Select view icon 
                    <span className="inline-flex items-center gap-1 ml-1">
                      <Eye className="w-4 h-4" /> 
                      to view detailed records
                    </span>
                  </div>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="website-management">
            <AccordionTrigger>Website Management</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Add introduction/bio, address and contact details</li>
                <li>List your featured reptiles</li>
                <li>Upload up to 3 images for each reptile</li>
                <li>List up to 30 reptiles</li>
                <li>Share your website link</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="housing-management">
            <AccordionTrigger>Enclosure Management</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Create a hierarchical housing system:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Rooms: Create and name different rooms</li>
                <li>Racks: Add racks within rooms</li>
                <li>Enclosures: Individual housing units</li>
                <li>Assign reptiles to their respective housings</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="feeding-schedule">
            <AccordionTrigger>Feeding Schedule</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Create feeding schedules by:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Room: Schedule entire rooms at once</li>
                <li>Rack: Manage feeding for specific racks</li>
                <li>Specific Reptiles: Schedule by selected reptiles</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="health-tracking">
            <AccordionTrigger>Health & Growth Tracking</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Log weight and length measurements</li>
                <li>Monitor feeding responses</li>
                <li>View growth charts and progress</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shedding-management">
            <AccordionTrigger>Shedding Management</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Record shedding dates</li>
                <li>Create single or multiple shedding records</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="breeding">
            <AccordionTrigger>Breeding Management</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Record breeding pairs and dates</li>
                <li>
                  <div className="flex items-center flex-wrap">
                    Select view icon 
                    <span className="inline-flex items-center gap-1 ml-1">
                      <Eye className="w-4 h-4" /> 
                      to manage <strong>Clutch</strong> and <strong>Hatchlings</strong>
                    </span>
                  </div>
                </li>
                <li>View ancestry and lineage using the pedigree analysis</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}