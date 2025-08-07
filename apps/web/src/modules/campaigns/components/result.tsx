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
import { useMemo, useCallback, useEffect, useState } from "react";
import { CampaignStatus } from "@/shared/types/campaign/campaign";
import { CampaignSortFields } from "@/shared/types/campaign/list-request";
import type Campaign from "@/shared/types/campaign/campaign";
import LINKS from "@/shared/constants/links";
import makeUrl from "@/shared/utils/make_url";
import type CampaignListResponse from "@/shared/types/campaign/list-response";
import { Edit, Eye, Trash } from "lucide-react";

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

  // actions
  onRemove?: (id: string) => void;
  removing?: boolean;
  removingId?: string | null;

  // responsive flag
  isMobile?: boolean;
};

import { statusColorMap } from "@/shared/utils/statusColorMap";

type ColumnDef = (
  | { key: "title"; label: "Title" }
  | {
      key: "status";
      label: "Status";
    }
  | { key: "reward"; label: "Reward" }
  | { key: "endDate"; label: "End" }
  | {
      key: "created_at";
      label: "Created";
    }
  | {
      key: "actions";
      label: "Actions";
    }
) & {
  isSortable?: boolean;
  hideOnMobile?: boolean;
};

const columns: ColumnDef[] = [
  { key: "title", label: "Title", hideOnMobile: false },
  { key: "status", label: "Status", hideOnMobile: true },
  { key: "reward", label: "Reward", isSortable: true, hideOnMobile: true },
  { key: "endDate", label: "End", isSortable: true, hideOnMobile: true },
  { key: "created_at", label: "Created", isSortable: true, hideOnMobile: true },
  { key: "actions", label: "Actions", hideOnMobile: false },
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
  onRemove,
  removing,
  removingId,
}: CampaignResultProps) => {
  const items = data?.items ?? [];
  const total = data?.total_pages ?? 0;

  // Internal mobile detection fallback if prop not provided
  const [detectedMobile, setDetectedMobile] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = "(max-width: 768px)";
    const mql = window.matchMedia(query);

    const update = () => setDetectedMobile(mql.matches);
    update();
    mql.addEventListener
      ? mql.addEventListener("change", update)
      : mql.addListener(update);
    return () => {
      mql.removeEventListener
        ? mql.removeEventListener("change", update)
        : mql.removeListener(update);
    };
  }, []);

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
            <TableColumn
              key={col.key}
              allowsSorting={!!col.isSortable}
              className={col.hideOnMobile ? "hidden md:table-cell" : ""}
            >
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
              {/* Title - always visible */}
              <TableCell>{item.title ?? "-"}</TableCell>

              {/* Status */}
              <TableCell className="hidden md:table-cell">
                <Chip
                  size="sm"
                  color={statusColorMap[item.status] ?? "default"}
                  variant="flat"
                  className="capitalize"
                >
                  {String(item.status)}
                </Chip>
              </TableCell>

              {/* Reward */}
              <TableCell className="hidden md:table-cell">
                {item.reward || "-"}
              </TableCell>

              {/* End date */}
              <TableCell className="hidden md:table-cell">
                {formatDate(item.endDate)}
              </TableCell>

              {/* Created at */}
              <TableCell className="hidden md:table-cell">
                {formatDate(item.created_at || "")}
              </TableCell>

              {/* Actions */}
              <TableCell>
                <div className="flex gap-2">
                  {/* Mobile (icons only) */}
                  <div className="md:hidden flex gap-2">
                    <Button
                      as={Link}
                      size="sm"
                      isIconOnly
                      variant="light"
                      color="primary"
                      href={makeUrl(LINKS.CAMPAIGN_DETAIL, { id: item.id })}
                      aria-label="View"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      as={Link}
                      size="sm"
                      isIconOnly
                      variant="light"
                      color="warning"
                      href={makeUrl(LINKS.CAMPAIGN_EDIT, { id: item.id })}
                      aria-label="Edit"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      color="danger"
                      isDisabled={!!removing}
                      isLoading={removing && removingId === item.id}
                      onPress={() => {
                        if (!onRemove) return;
                        if (typeof window !== "undefined") {
                          const ok = window.confirm("Remove this campaign?");
                          if (!ok) return;
                        }
                        onRemove(String(item.id));
                      }}
                      aria-label="Delete"
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>

                  {/* Desktop (labels) */}
                  <div className="hidden md:flex gap-2">
                    <Button
                      as={Link}
                      size="sm"
                      variant="flat"
                      color="primary"
                      href={makeUrl(LINKS.CAMPAIGN_DETAIL, { id: item.id })}
                      startContent={<Eye className="size-4" />}
                    >
                      View
                    </Button>
                    <Button
                      as={Link}
                      size="sm"
                      variant="flat"
                      color="warning"
                      href={makeUrl(LINKS.CAMPAIGN_EDIT, { id: item.id })}
                      startContent={<Edit className="size-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      isDisabled={!!removing}
                      isLoading={removing && removingId === item.id}
                      onPress={() => {
                        if (!onRemove) return;
                        if (typeof window !== "undefined") {
                          const ok = window.confirm("Remove this campaign?");
                          if (!ok) return;
                        }
                        onRemove(String(item.id));
                      }}
                      startContent={<Trash className="size-4" />}
                    >
                      Delete
                    </Button>
                  </div>
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
