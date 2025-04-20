'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger className="text-sm text-muted-foreground hover:text-primary transition">
          Help
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome to Clutchly</DialogTitle>
        </DialogHeader>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="getting-started">
            <AccordionTrigger>Getting Started</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Create your first reptile profile with basic information</li>
                <li>Set up housing arrangements (rooms, racks, containers)</li>
                <li>Assign reptiles to their respective housings</li>
                <li>Create feeding schedules for efficient management</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="housing-management">
            <AccordionTrigger>Housing Management</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Create a hierarchical housing system:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Rooms: Create and name different rooms</li>
                <li>Racks: Add racks within rooms</li>
                <li>Rack Levels: Organize levels within racks</li>
                <li>Containers: Individual housing units</li>
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
                <li>Rack Level: Schedule by rack levels</li>
                <li>Container: Individual feeding schedules</li>
                <li>Track feeding response and refusals</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="health-tracking">
            <AccordionTrigger>Health & Growth Tracking</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Log weight and length measurements</li>
                <li>Record vet visits and treatments</li>
                <li>Track shedding cycles</li>
                <li>Monitor feeding responses</li>
                <li>View growth charts and progress</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="breeding">
            <AccordionTrigger>Breeding Management</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Record breeding pairs and dates</li>
                <li>Track clutch information</li>
                <li>Monitor incubation details</li>
                <li>Manage lineage records</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}