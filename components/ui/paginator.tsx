import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { PaginatorPageLinks } from "./paginator-page-links";

type PaginatorProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  showPreviousNext: boolean;
}

export default function Paginator({
  currentPage,
  totalPages,
  onPageChange,
  showPreviousNext,
}: PaginatorProps) {

  return (
    <Pagination>
      <PaginationContent>
        {showPreviousNext && totalPages ? (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              className={`${currentPage - 1 < 1 ? "pointer-events-none !bg-transparent !rounded-sm text-gray-300" : ""}`}
            />
          </PaginationItem>
        ) : null}
        {PaginatorPageLinks(currentPage, totalPages, onPageChange)}
        {showPreviousNext && totalPages ? (
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              className={`${currentPage  > totalPages - 1? "pointer-events-none !bg-transparent !rounded-sm text-gray-300" : ""}`}
            />
          </PaginationItem>
        ): null}
      </PaginationContent>
    </Pagination>
  )
}