export interface Logs {
    id: number
    backup_type: string
    created_at: string
    data_size: number
    status: 'success' | 'error'
}

export type BackupType = 'reptiles' | 'feeding' | 'health' | 'growth' | 'breeding' | 'locations'

export interface BackupConfig {
    id: BackupType
    label: string
    description: string
    fields: {
        key: string
        label: string
        type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object'
        format?: (value: string) => string
    }[]
    filters?: {
        field: string
        label: string
        type: 'select' | 'date' | 'text'
        options?: { value: string; label: string }[]
    }[]
}

export const backupConfigs: Record<BackupType, BackupConfig> = {
    reptiles: {
        id: 'reptiles',
        label: 'Reptiles',
        description: 'Your reptile collection data',
        fields: [
            { key: 'name', label: 'Name', type: 'string' },
            { key: 'species_id', label: 'Species', type: 'string' },
            { key: 'morph_id', label: 'Morph', type: 'string' },
            { key: 'sex', label: 'Sex', type: 'string' },
            { key: 'weight', label: 'Weight', type: 'number' },
            { key: 'length', label: 'Length', type: 'number' },
            { key: 'hatch_date', label: 'Hatch Date', type: 'date' },
            { key: 'acquisition_date', label: 'Acquisition Date', type: 'date' },
            { key: 'status', label: 'Status', type: 'string' },
            { key: 'is_breeder', label: 'Breeder', type: 'boolean' },
            { key: 'notes', label: 'Notes', type: 'string' }
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
            { key: 'name', label: 'Name', type: 'string' },
            { key: 'recurrence', label: 'Recurrence', type: 'string' },
            { key: 'target_type', label: 'Target Type', type: 'string' },
            { key: 'created_at', label: 'Created At', type: 'date' },
            { key: 'last_modified', label: 'Last Modified', type: 'date' }
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
    health: {
        id: 'health',
        label: 'Health Records',
        description: 'Health checkups and medical history',
        fields: [
            { key: 'type', label: 'Type', type: 'string' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'notes', label: 'Notes', type: 'string' },
            { key: 'created_at', label: 'Created At', type: 'date' }
        ],
        filters: [
            {
                field: 'type',
                label: 'Record Type',
                type: 'select',
                options: [
                    { value: 'checkup', label: 'Checkup' },
                    { value: 'treatment', label: 'Treatment' },
                    { value: 'surgery', label: 'Surgery' },
                    { value: 'medication', label: 'Medication' }
                ]
            }
        ]
    },
    growth: {
        id: 'growth',
        label: 'Growth Records',
        description: 'Weight and length measurements',
        fields: [
            { key: 'measurement_type', label: 'Type', type: 'string' },
            { key: 'value', label: 'Value', type: 'number' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'created_at', label: 'Created At', type: 'date' }
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
    breeding: {
        id: 'breeding',
        label: 'Breeding Records',
        description: 'Breeding projects and outcomes',
        fields: [
            { key: 'status', label: 'Status', type: 'string' },
            { key: 'start_date', label: 'Start Date', type: 'date' },
            { key: 'end_date', label: 'End Date', type: 'date' },
            { key: 'notes', label: 'Notes', type: 'string' },
            { key: 'created_at', label: 'Created At', type: 'date' }
        ],
        filters: [
            {
                field: 'status',
                label: 'Status',
                type: 'select',
                options: [
                    { value: 'planned', label: 'Planned' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' }
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
            { key: 'created_at', label: 'Created At', type: 'date' },
            { key: 'last_modified', label: 'Last Modified', type: 'date' }
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
  