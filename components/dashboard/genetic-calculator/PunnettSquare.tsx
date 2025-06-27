import React from 'react'
import type { PunnettSquare } from '@/lib/types/genetic-calculator'

interface PunnettSquareProps {
  punnettSquare: PunnettSquare
}

export const PunnettSquareComponent: React.FC<PunnettSquareProps> = ({ punnettSquare }) => {
  if (!punnettSquare || !punnettSquare.headers || !punnettSquare.rows) {
    return <div>No Punnett square data available.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[350px] border border-border rounded text-xs sm:text-sm bg-card/80">
        <thead>
          <tr>
            <th className="border border-border px-2 py-1 bg-muted/60"></th>
            {punnettSquare.headers.map((header, idx) => (
              <th key={idx} className="border border-border px-2 py-1 bg-muted/60 font-semibold text-center">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {punnettSquare.rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <th className="border border-border px-2 py-1 bg-muted/60 font-semibold text-center">{row.label}</th>
              {row.cells.map((cell, cellIdx) => (
                <td key={cellIdx} className="border border-border px-2 py-1 text-center align-top">
                  <div className="font-medium">{cell.genotype}</div>
                  <div className="text-xs text-muted-foreground">{cell.phenotype}</div>
                  <div className="text-xs mt-1">
                    <span className="inline-block rounded bg-primary/10 px-1 py-0.5 text-primary font-semibold">
                      {(cell.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  {cell.description && (
                    <div className="mt-1 text-[10px] text-muted-foreground italic">{cell.description}</div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 