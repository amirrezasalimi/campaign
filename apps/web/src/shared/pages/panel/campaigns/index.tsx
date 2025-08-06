"use client";

import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useMemo, useState } from "react";
import useCampaigns from "./hooks/campaigns";
import { CampaignStatus } from "@/shared/types/campaign/campaign";
import { CampaignSortFields } from "@/shared/types/campaign/list-request";
import CampaignFilters from "./components/filters";

import CampaignResult from "./components/result";

const Campaigns = () => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    page,
    limit,
    search,
    status,
    orderBy,
    order,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    setOrderBy,
    setOrder,
    reset,
  } = useCampaigns();

  const [searchInput, setSearchInput] = useState(search ?? "");

  // options
  const statusOptions = useMemo(
    () => [
      { key: CampaignStatus.ACTIVE, label: "Active" },
      { key: CampaignStatus.INACTIVE, label: "Inactive" },
      { key: CampaignStatus.COMPLETED, label: "Completed" },
    ],
    []
  );

  const sortFields = useMemo(
    () => [
      { key: CampaignSortFields.CREATED_AT, label: "Created At" },
      { key: CampaignSortFields.END_DATE, label: "End Date" },
      { key: CampaignSortFields.REWARD, label: "Reward" },
    ],
    []
  );

  const orderOptions = useMemo(
    () => [
      { key: "asc", label: "Ascending" },
      { key: "desc", label: "Descending" },
    ],
    []
  );

  const limits = useMemo(
    () => [
      { key: "10", label: "10" },
      { key: "20", label: "20" },
      { key: "50", label: "50" },
      { key: "100", label: "100" },
    ],
    []
  );

  return (
    <div>
      <h2 className="mb-4 font-semibold text-gray-800 dark:text-gray-200 text-2xl">
        Campaigns
      </h2>
      <Card>
        <CardBody>
          {/* filters */}
          <div className="flex flex-col gap-3">
            <div className="flex md:flex-row flex-col gap-3">
              <CampaignFilters
                search={search}
                status={status}
                setSearch={setSearch}
                setStatus={setStatus}
              />

              <Select
                label="Limit"
                selectedKeys={new Set([String(limit)])}
                onSelectionChange={(keys) => {
                  const first = Number(Array.from(keys as Set<string>)[0]);
                  if (!Number.isNaN(first)) {
                    setLimit(first);
                    setPage(1);
                  }
                }}
                placeholder="Page size"
                variant="bordered"
                className="md:w-36"
                selectionMode="single"
                aria-label="Page size"
              >
                {limits.map((opt) => (
                  <SelectItem key={opt.key}>{opt.label}</SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="flat"
                onPress={() => {
                  setSearchInput("");
                  reset();
                }}
              >
                Reset
              </Button>
              <div className="text-default-500 text-sm">
                Page: {page} • Limit: {limit}
              </div>
            </div>
          </div>

          <div className="mb-4 pb-4 border-gray-200 dark:border-gray-700 border-b"></div>

          {/* content */}
          <CampaignResult
            data={data as any}
            isLoading={isLoading}
            isFetching={isFetching}
            page={page}
            limit={limit}
            setPage={setPage}
            orderBy={
              orderBy === "created_at"
                ? CampaignSortFields.CREATED_AT
                : orderBy === "endDate"
                ? CampaignSortFields.END_DATE
                : orderBy === "reward"
                ? CampaignSortFields.REWARD
                : null
            }
            order={order ?? null}
            setOrderBy={setOrderBy}
            setOrder={setOrder}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default Campaigns;
