"use client";

import { Input, Select, SelectItem } from "@heroui/react";
import { useMemo, useState } from "react";
import { CampaignStatus } from "@/shared/types/campaign/campaign";

type Props = {
  search: string | undefined;
  status: string | undefined;
  setSearch: (v: string) => void;
  setStatus: (v: string | undefined) => void;
};

const CampaignFilters = ({ search, status, setSearch, setStatus }: Props) => {
  const [searchInput, setSearchInput] = useState(search ?? "");

  // status options preserved from index.tsx
  const statusOptions = useMemo(
    () => [
      { key: "all", label: "All" },
      { key: CampaignStatus.ACTIVE, label: "Active" },
      { key: CampaignStatus.INACTIVE, label: "Inactive" },
      { key: CampaignStatus.COMPLETED, label: "Completed" },
    ],
    []
  );

  return (
    <>
      <Input
        label="Search"
        placeholder="Search campaigns..."
        value={searchInput}
        onValueChange={(val) => setSearchInput(val)}
        onBlur={() => setSearch(searchInput)}
        onKeyDown={(e) => {
          if (e.key === "Enter") setSearch(searchInput);
        }}
        variant="bordered"
        isClearable
        onClear={() => {
          setSearchInput("");
          setSearch("");
        }}
        className="md:flex-1"
      />

      <Select
        label="Status"
        selectedKeys={status ? new Set([status]) : new Set([])}
        onSelectionChange={(keys) => {
          const first = Array.from(keys as Set<string>)[0];
          setStatus(first ?? undefined);
        }}
        placeholder="All"
        variant="bordered"
        className="md:w-56"
        selectionMode="single"
        aria-label="Status filter"
      >
        {statusOptions.map((opt) => (
          <SelectItem key={opt.key}>{opt.label}</SelectItem>
        ))}
      </Select>
    </>
  );
};

export default CampaignFilters;
