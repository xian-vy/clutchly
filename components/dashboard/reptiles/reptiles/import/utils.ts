import { ImportPreviewResponse } from "@/app/api/reptiles/import/utils";

export const reorderRowsForParentDependencies = (data: ImportPreviewResponse) => {
    if (!data || !data.rows || data.rows.length === 0) return data;
    
    // Create a map of reptile names (lowercase for case-insensitive matching)
    const nameMap = new Map<string, number>();
    data.rows.forEach((row, index) => {
      if (row.name) {
        nameMap.set(row.name.toString().toLowerCase(), index);
      }
    });
    
    // Create sets to track parents and children
    const parentIndices = new Set<number>();
    const childIndices = new Set<number>();
    
    // Identify all parents and children
    data.rows.forEach((row, index) => {
      if (row.dam_name || row.sire_name) {
        childIndices.add(index);
      }
      
      if (row.name) {
        const nameLower = row.name.toString().toLowerCase();
        // Check if this reptile is referenced as a parent by any other row
        data.rows.forEach((otherRow) => {
          if (otherRow.dam_name?.toString().toLowerCase() === nameLower ||
              otherRow.sire_name?.toString().toLowerCase() === nameLower) {
            parentIndices.add(index);
          }
        });
      }
    });
    
    // Create the new order: parents first, then non-parents
    const reorderedIndices: number[] = [];
    
    // Add all parent indices first
    data.rows.forEach((_, index) => {
      if (parentIndices.has(index)) {
        reorderedIndices.push(index);
      }
    });
    
    // Add all remaining indices
    data.rows.forEach((_, index) => {
      if (!parentIndices.has(index)) {
        reorderedIndices.push(index);
      }
    });
    
    // Reorder rows based on new order
    const reorderedRows = reorderedIndices.map(index => data.rows[index]);
    
    // Create a mapping from old indices to new indices
    const indexMap = new Map<number, number>();
    reorderedIndices.forEach((oldIndex, newIndex) => {
      indexMap.set(oldIndex, newIndex);
    });
    
    // Update validRows and invalidRows with new indices
    const newValidRows = data.validRows.map(oldIndex => indexMap.get(oldIndex) as number);
    
    const newInvalidRows: Record<number, string> = {};
    Object.entries(data.invalidRows).forEach(([oldIndexStr, errorMsg]) => {
      const oldIndex = parseInt(oldIndexStr);
      const newIndex = indexMap.get(oldIndex);
      if (newIndex !== undefined) {
        newInvalidRows[newIndex] = errorMsg;
      }
    });
    
    // Update parent relationships
    const newValidParents: Record<number, { dam?: string; sire?: string }> = {};
    Object.entries(data.parentRelationships.validParents).forEach(([oldIndexStr, parents]) => {
      const oldIndex = parseInt(oldIndexStr);
      const newIndex = indexMap.get(oldIndex);
      if (newIndex !== undefined) {
        newValidParents[newIndex] = parents;
      }
    });
    
    const newInvalidParents: Record<number, { dam?: string; sire?: string; error: string }> = {};
    Object.entries(data.parentRelationships.invalidParents).forEach(([oldIndexStr, parents]) => {
      const oldIndex = parseInt(oldIndexStr);
      const newIndex = indexMap.get(oldIndex);
      if (newIndex !== undefined) {
        newInvalidParents[newIndex] = parents;
      }
    });
    
    // Return updated data with reordered rows
    return {
      ...data,
      rows: reorderedRows,
      validRows: newValidRows,
      invalidRows: newInvalidRows,
      parentRelationships: {
        validParents: newValidParents,
        invalidParents: newInvalidParents
      }
    };
  }