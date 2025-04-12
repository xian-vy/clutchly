'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useResource } from '@/lib/hooks/useResource';
import { Reptile } from '@/lib/types/reptile';
import { getReptiles } from '@/app/api/reptiles/reptiles';
import { 
  CreateHealthLogEntryInput, 
  HealthLogEntry,
  HealthLogCategory,
  HealthLogSubcategory,
  HealthLogType
} from '@/lib/types/health';
import { useHealthStore } from '@/lib/stores/healthStore';
import { Loader2 } from 'lucide-react';

interface HealthLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: (data: CreateHealthLogEntryInput) => void;
  healthLog?: HealthLogEntry;
}

export function HealthLogDialog({
  open,
  onOpenChange,
  onClose,
  onSubmit,
  healthLog,
}: HealthLogDialogProps) {
  const [formData, setFormData] = useState<CreateHealthLogEntryInput>({
    reptile_id: '',
    user_id: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    subcategory_id: '',
    type_id: null,
    custom_type_label: '',
    notes: '',
    severity: 'low',
    resolved: false,
    attachments: [],
  });

  const [isCustomType, setIsCustomType] = useState(false);

  const { 
    categories, 
    subcategories: allSubcategories, 
    types: allTypes, 
    isLoading: isHealthDataLoading,
    getSubcategoriesByCategory,
    getTypesBySubcategory
  } = useHealthStore();

  // Filter subcategories and types based on selected category/subcategory
  const subcategories = formData.category_id 
    ? getSubcategoriesByCategory(formData.category_id)
    : [];
  const types = formData.subcategory_id
    ? getTypesBySubcategory(formData.subcategory_id)
    : [];

  // Use the useResource hook to fetch reptiles
  const { 
    resources: reptiles, 
    isLoading: isReptilesLoading 
  } = useResource<Reptile, any>({
    resourceName: 'Reptile',
    queryKey: ['reptiles'],
    getResources: getReptiles,
    createResource: async () => { throw new Error('Not implemented'); },
    updateResource: async () => { throw new Error('Not implemented'); },
    deleteResource: async () => { throw new Error('Not implemented'); },
  });

  // Initialize form data with health log data if provided
  useEffect(() => {
    if (healthLog) {
      setFormData({
        reptile_id: healthLog.reptile_id,
        user_id: healthLog.user_id,
        date: healthLog.date,
        category_id: healthLog.category_id,
        subcategory_id: healthLog.subcategory_id,
        type_id: healthLog.type_id,
        custom_type_label: healthLog.custom_type_label || '',
        notes: healthLog.notes || '',
        severity: healthLog.severity || 'low',
        resolved: healthLog.resolved,
        attachments: healthLog.attachments,
      });
      setIsCustomType(!healthLog.type_id && !!healthLog.custom_type_label);
    }
  }, [healthLog]);

  // Handle form field changes
  const handleChange = (field: keyof CreateHealthLogEntryInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    handleChange('category_id', categoryId);
    handleChange('subcategory_id', '');
    handleChange('type_id', null);
    handleChange('custom_type_label', '');
    setIsCustomType(false);
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string) => {
    handleChange('subcategory_id', subcategoryId);
    handleChange('type_id', null);
    handleChange('custom_type_label', '');
    setIsCustomType(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{healthLog ? 'Edit Health Log' : 'New Health Log'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reptile">Reptile</Label>
              <Select
                value={formData.reptile_id}
                onValueChange={(value) => handleChange('reptile_id', value)}
                disabled={isReptilesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reptile" />
                </SelectTrigger>
                <SelectContent>
                  {isReptilesLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    reptiles.map((reptile) => (
                      <SelectItem key={reptile.id} value={reptile.id}>
                        {reptile.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={handleCategoryChange}
                disabled={isHealthDataLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {isHealthDataLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    categories.map((category: HealthLogCategory) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select
                value={formData.subcategory_id}
                onValueChange={handleSubcategoryChange}
                disabled={!formData.category_id || isHealthDataLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {isHealthDataLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    subcategories.map((subcategory: HealthLogSubcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={isCustomType ? 'custom' : (formData.type_id || undefined)}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setIsCustomType(true);
                    handleChange('type_id', null);
                  } else {
                    setIsCustomType(false);
                    handleChange('type_id', value);
                  }
                }}
                disabled={!formData.subcategory_id || isHealthDataLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Type</SelectItem>
                  {isHealthDataLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    types.map((type: HealthLogType) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {isCustomType && (
              <div className="space-y-2">
                <Label htmlFor="custom_type_label">Custom Type Label</Label>
                <Input
                  id="custom_type_label"
                  value={formData.custom_type_label}
                  onChange={(e) => handleChange('custom_type_label', e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => handleChange('severity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolved">Status</Label>
              <Select
                value={formData.resolved ? 'resolved' : 'active'}
                onValueChange={(value) => handleChange('resolved', value === 'resolved')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {healthLog ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 