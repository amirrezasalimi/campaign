"use client";

import {
  Card,
  CardBody,
  Button,
  Select,
  SelectItem,
  Link,
} from "@heroui/react";
import { useMemo } from "react";
import useCampaigns from "./hooks/campaigns";
import { CampaignSortFields } from "@/shared/types/campaign/list-request";
import CampaignFilters from "./components/filters";
import { PlusIcon } from "lucide-react";
import CampaignResult from "./components/result";
import LINKS from "@/shared/constants/links";

const Campaigns = () => {
  const {
    data,
    isLoading,
    isFetching,
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
    // remove actions
    remove,
    removing,
    removingId,
  } = useCampaigns();

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

            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <Button
                  variant="flat"
                  onPress={() => {
                    reset();
                  }}
                >
                  Reset
                </Button>
                <div className="hidden md:block text-default-500 text-sm">
                  Page: {page} • Limit: {limit}
                </div>
              </div>
              <Button
                as={Link}
                href={LINKS.ADD_CAMPAIGN}
                variant="solid"
                color="primary"
                className="w-fit"
                startContent={<PlusIcon className="w-4 h-4" />}
              >
                Add Campaign
              </Button>
            </div>
          </div>

          <div className="mb-4 pb-4 border-gray-200 dark:border-gray-700 border-b"></div>

          {/* content */}
          <CampaignResult
            data={data}
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
            order={order}
            setOrderBy={setOrderBy}
            setOrder={setOrder}
            onRemove={remove}
            removing={removing}
            removingId={removingId}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default Campaigns;
