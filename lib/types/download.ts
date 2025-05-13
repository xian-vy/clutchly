export interface Logs {
    id: number
    backup_type: string
    created_at: string
    data_size: number
    status: 'success' | 'error'
}

export type BackupType = 'reptiles' | 'feeding' | 'health_log_entries' | 'growth_entries' | 'breeding_projects' | 'locations'

export interface BackupConfig {
    id: BackupType
    label: string
    description: string
    fields: {
        key: string
        label: string
        type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object'
    }[]
    filters?: {
        field: string
        label: string
        type: 'select' | 'date' | 'text'
        options?: { value: string; label: string }[]
    }[]
    relationships?: {
        table: string
        fields: string[]
    }[]
}

export const backupConfigs: Record<BackupType, BackupConfig> = {
    reptiles: {
        id: 'reptiles',
        label: 'Reptiles',
        description: 'Your reptile collection data',
        fields: [
            { key: 'name', label: 'Name', type: 'string' },
            { key: 'species.name', label: 'Species', type: 'string' },
            { key: 'species.scientific_name', label: 'Scientific Name', type: 'string' },
            { key: 'morph.name', label: 'Morph', type: 'string' },
            { key: 'sex', label: 'Sex', type: 'string' },
            { key: 'weight', label: 'Weight (g)', type: 'number' },
            { key: 'length', label: 'Length (cm)', type: 'number' },
            { key: 'hatch_date', label: 'Hatch Date', type: 'date' },
            { key: 'acquisition_date', label: 'Acquisition Date', type: 'date' },
            { key: 'status', label: 'Status', type: 'string' },
            { key: 'is_breeder', label: 'Breeder', type: 'boolean' },
            { key: 'produced_by', label: 'Produced By', type: 'boolean' },
            { key: 'retired_breeder', label: 'Retired Breeder', type: 'boolean' },
            { key: 'visual_traits', label: 'Visual Traits', type: 'object' },
            { key: 'het_traits', label: 'Het Traits', type: 'object' },
            { key: 'breeding_line', label: 'Breeding Line', type: 'string' },
            { key: 'generation', label: 'Generation', type: 'number' },
            { key: 'location.name', label: 'Location', type: 'string' },
            { key: 'notes', label: 'Notes', type: 'string' }
        ],
        relationships: [
            { table: 'species', fields: ['name', 'scientific_name'] },
            { table: 'morphs', fields: ['name'] },
            { table: 'locations', fields: ['name'] }
        ],
        filters: [
            {
                field: 'status',
                label: 'Status',
                type: 'select',
                options: [
                    { value: 'active', label: 'Active' },
                    { value: 'sold', label: 'Sold' },
                    { value: 'deceased', label: 'Deceased' }
                ]
            },
            {
                field: 'sex',
                label: 'Sex',
                type: 'select',
                options: [
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'unknown', label: 'Unknown' }
                ]
            },
            {
                field: 'is_breeder',
                label: 'Breeder Status',
                type: 'select',
                options: [
                    { value: 'true', label: 'Breeder' },
                    { value: 'false', label: 'Non-Breeder' }
                ]
            }
        ]
    },
    feeding: {
        id: 'feeding',
        label: 'Feeding Records',
        description: 'Feeding schedules and events',
        fields: [
            { key: 'name', label: 'Schedule Name', type: 'string' },
            { key: 'recurrence', label: 'Recurrence', type: 'string' },
            { key: 'target_type', label: 'Target Type', type: 'string' },
            { key: 'targets', label: 'Targets', type: 'array' },
            { key: 'events', label: 'Events', type: 'array' },
            { key: 'created_at', label: 'Created At', type: 'date' },
            { key: 'last_modified', label: 'Last Modified', type: 'date' }
        ],
        relationships: [
            { table: 'feeding_targets', fields: ['*'] },
            { table: 'feeding_events', fields: ['*'] }
        ],
        filters: [
            {
                field: 'recurrence',
                label: 'Recurrence Type',
                type: 'select',
                options: [
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'custom', label: 'Custom' },
                    { value: 'interval', label: 'Interval' }
                ]
            },
            {
                field: 'target_type',
                label: 'Target Type',
                type: 'select',
                options: [
                    { value: 'room', label: 'Room' },
                    { value: 'rack', label: 'Rack' },
                    { value: 'level', label: 'Level' },
                    { value: 'location', label: 'Location' },
                    { value: 'reptile', label: 'Reptile' }
                ]
            }
        ]
    },
    health_log_entries: {
        id: 'health_log_entries',
        label: 'Health Records',
        description: 'Health checkups and medical history',
        fields: [
            { key: 'reptile.name', label: 'Reptile', type: 'string' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'category.label', label: 'Category', type: 'string' },
            { key: 'subcategory.label', label: 'Subcategory', type: 'string' },
            { key: 'type.label', label: 'Type', type: 'string' },
            { key: 'custom_type_label', label: 'Custom Type', type: 'string' },
            { key: 'severity', label: 'Severity', type: 'string' },
            { key: 'resolved', label: 'Resolved', type: 'boolean' },
            { key: 'notes', label: 'Notes', type: 'string' },
            { key: 'attachments', label: 'Attachments', type: 'array' },
            { key: 'created_at', label: 'Created At', type: 'date' }
        ],
        relationships: [
            { table: 'reptiles', fields: ['name'] },
            { table: 'health_log_categories', fields: ['label'] },
            { table: 'health_log_subcategories', fields: ['label'] },
            { table: 'health_log_types', fields: ['label'] }
        ],
        filters: [
            {
                field: 'severity',
                label: 'Severity',
                type: 'select',
                options: [
                    { value: 'low', label: 'Low' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'high', label: 'High' }
                ]
            },
            {
                field: 'resolved',
                label: 'Status',
                type: 'select',
                options: [
                    { value: 'true', label: 'Resolved' },
                    { value: 'false', label: 'Unresolved' }
                ]
            }
        ]
    },
    growth_entries: {
        id: 'growth_entries',
        label: 'Growth Records',
        description: 'Weight and length measurements',
        fields: [
            { key: 'reptile.name', label: 'Reptile', type: 'string' },
            { key: 'measurement_type', label: 'Type', type: 'string' },
            { key: 'value', label: 'Value', type: 'number' },
            { key: 'unit', label: 'Unit', type: 'string' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'notes', label: 'Notes', type: 'string' },
            { key: 'created_at', label: 'Created At', type: 'date' }
        ],
        relationships: [
            { table: 'reptiles', fields: ['name'] }
        ],
        filters: [
            {
                field: 'measurement_type',
                label: 'Measurement Type',
                type: 'select',
                options: [
                    { value: 'weight', label: 'Weight' },
                    { value: 'length', label: 'Length' }
                ]
            }
        ]
    },
    breeding_projects: {
        id: 'breeding_projects',
        label: 'Breeding Records',
        description: 'Breeding projects and outcomes',
        fields: [
            { key: 'name', label: 'Project Name', type: 'string' },
            { key: 'male.name', label: 'Male', type: 'string' },
            { key: 'female.name', label: 'Female', type: 'string' },
            { key: 'species.name', label: 'Species', type: 'string' },
            { key: 'status', label: 'Status', type: 'string' },
            { key: 'start_date', label: 'Start Date', type: 'date' },
            { key: 'end_date', label: 'End Date', type: 'date' },
            { key: 'expected_hatch_date', label: 'Expected Hatch Date', type: 'date' },
            { key: 'clutches', label: 'Clutches', type: 'array' },
            { key: 'notes', label: 'Notes', type: 'string' },
            { key: 'created_at', label: 'Created At', type: 'date' }
        ],
        relationships: [
            { table: 'reptiles!male_id(name)', fields: ['name'] },
            { table: 'reptiles!female_id(name)', fields: ['name'] },
            { table: 'species', fields: ['name'] },
            { table: 'clutches', fields: ['*'] }
        ],
        filters: [
            {
                field: 'status',
                label: 'Status',
                type: 'select',
                options: [
                    { value: 'active', label: 'Active' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'failed', label: 'Failed' },
                    { value: 'planned', label: 'Planned' }
                ]
            }
        ]
    },
    locations: {
        id: 'locations',
        label: 'Locations',
        description: 'Your location setup',
        fields: [
            { key: 'name', label: 'Name', type: 'string' },
            { key: 'type', label: 'Type', type: 'string' },
            { key: 'parent.name', label: 'Parent Location', type: 'string' },
            { key: 'reptiles', label: 'Reptiles', type: 'array' },
            { key: 'created_at', label: 'Created At', type: 'date' },
            { key: 'last_modified', label: 'Last Modified', type: 'date' }
        ],
        relationships: [
            { table: 'locations!parent_id(name)', fields: ['name'] },
            { table: 'reptiles', fields: ['name'] }
        ],
        filters: [
            {
                field: 'type',
                label: 'Location Type',
                type: 'select',
                options: [
                    { value: 'room', label: 'Room' },
                    { value: 'rack', label: 'Rack' },
                    { value: 'enclosure', label: 'Enclosure' }
                ]
            }
        ]
    }
}

export const backupTypes = Object.values(backupConfigs)
  