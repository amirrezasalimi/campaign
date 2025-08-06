"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Chip,
  Pagination,
  Button,
  Link,
} from "@heroui/react";
import { useMemo, useCallback } from "react";
import { CampaignStatus } from "@/shared/types/campaign/campaign";
import { CampaignSortFields } from "@/shared/types/campaign/list-request";
import type Campaign from "@/shared/types/campaign/campaign";
import LINKS from "@/shared/constants/links";
import makeUrl from "@/shared/utils/make_url";
import type CampaignListResponse from "@/shared/types/campaign/list-response";

type Order = "asc" | "desc";

type CampaignResultProps = {
  data?: CampaignListResponse;
  isLoading?: boolean;
  isFetching?: boolean;

  // pagination
  page: number;
  limit: number;
  setPage: (page: number) => void;

  // sorting
  orderBy?: CampaignSortFields | null;
  order?: Order | null;
  setOrderBy: (field: CampaignSortFields) => void;
  setOrder: (order: Order) => void;
};

const statusColorMap: Record<
  CampaignStatus,
  "success" | "danger" | "warning" | "default"
> = {
  [CampaignStatus.ACTIVE]: "success",
  [CampaignStatus.INACTIVE]: "default",
  [CampaignStatus.COMPLETED]: "warning",
};

type ColumnDef =
  | { key: "title"; label: "Title"; isSortable?: false }
  | { key: "status"; label: "Status"; isSortable?: false }
  | { key: "reward"; label: "Reward"; isSortable: true }
  | { key: "endDate"; label: "End"; isSortable: true }
  | { key: "created_at"; label: "Created"; isSortable: true }
  | { key: "actions"; label: "Actions"; isSortable?: false };

const columns: ColumnDef[] = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "reward", label: "Reward", isSortable: true },
  { key: "endDate", label: "End", isSortable: true },
  { key: "created_at", label: "Created", isSortable: true },
  { key: "actions", label: "Actions" },
] as const;

const uiToApiSort = {
  reward: CampaignSortFields.REWARD,
  endDate: CampaignSortFields.END_DATE,
  created_at: CampaignSortFields.CREATED_AT,
} as const;

const apiToUiSort = {
  [CampaignSortFields.REWARD]: "reward",
  [CampaignSortFields.END_DATE]: "endDate",
  [CampaignSortFields.CREATED_AT]: "created_at",
} as const;

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}

const CampaignResult = ({
  data,
  isLoading,
  isFetching,
  page,
  setPage,
  orderBy,
  order,
  setOrderBy,
  setOrder,
}: CampaignResultProps) => {
  const items = data?.items ?? [];
  const total = data?.total_pages ?? 0;

  const sortDescriptor = useMemo(() => {
    const column =
      orderBy && (apiToUiSort as Record<string, string>)[orderBy]
        ? (apiToUiSort as Record<string, string>)[orderBy]
        : undefined;
    return column && order
      ? ({ column, direction: order } as { column: string; direction: Order })
      : undefined;
  }, [orderBy, order]);

  const handleSortChange = useCallback(
    (descriptor: {
      column: React.Key;
      direction: "ascending" | "descending";
    }) => {
      const col = String(descriptor.column);
      const nextField = (
        uiToApiSort as Record<string, CampaignSortFields | undefined>
      )[col];
      if (!nextField) return;

      setOrderBy(nextField);
      setOrder(descriptor.direction === "ascending" ? "asc" : "desc");
      setPage(1);
    },
    [setOrderBy, setOrder, setPage]
  );

  const loadingState = isLoading ? "loading" : "idle";
  const showSpinner = isLoading || isFetching;

  return (
    <div className="flex flex-col gap-4">
      <Table
        aria-label="Campaigns table"
        sortDescriptor={
          sortDescriptor
            ? {
                column: sortDescriptor.column,
                direction:
                  sortDescriptor.direction === "asc"
                    ? "ascending"
                    : "descending",
              }
            : undefined
        }
        onSortChange={handleSortChange}
        removeWrapper
        bottomContent={
          <div className="flex justify-between items-center mt-4">
            <div className="text-default-500 text-sm">
              Total Pages: {total.toLocaleString()}
              {showSpinner ? " • Updating…" : ""}
            </div>
            <Pagination
              page={page}
              total={total}
              onChange={setPage}
              showControls
              size="sm"
              classNames={{ cursor: "bg-primary text-primary-foreground" }}
              aria-label="Pagination"
            />
          </div>
        }
      >
        <TableHeader>
          {columns.map((col) => (
            <TableColumn key={col.key} allowsSorting={!!col.isSortable}>
              {col.label}
            </TableColumn>
          ))}
        </TableHeader>

        <TableBody
          items={items}
          loadingState={loadingState}
          emptyContent={isLoading ? null : "No campaigns found"}
          loadingContent={
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Loading campaigns…</span>
            </div>
          }
        >
          {(item: Campaign) => (
            <TableRow key={item.id}>
              <TableCell>{item.title ?? "-"}</TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  color={statusColorMap[item.status] ?? "default"}
                  variant="flat"
                >
                  {String(item.status).toLowerCase()}
                </Chip>
              </TableCell>
              <TableCell>{item.reward || "-"}</TableCell>
              <TableCell>{formatDate(item.endDate)}</TableCell>
              <TableCell>{formatDate(item.created_at || "")}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    as={Link}
                    size="sm"
                    variant="flat"
                    href={makeUrl(LINKS.CAMPAIGN_DETAIL, { id: item.id })}
                  >
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignResult;
