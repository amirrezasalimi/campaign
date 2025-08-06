import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import CampaignServices from "@/shared/services/campaign";
import type { CampaignStatus } from "@/shared/types/campaign/campaign";

const useCampaigns = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<"asc" | "desc" | undefined>(undefined);

  const params = useMemo(
    () => ({
      page,
      limit,
      title: search || undefined,
      status: status as CampaignStatus | undefined,
      sort_key: orderBy,
      sort_type: order,
      order,
    }),
    [page, limit, search, status, orderBy, order]
  );

  const query = useQuery({
    queryKey: ["campaigns", params],
    queryFn: async () => {
      const res = await CampaignServices.list(params);
      return res.data?.data;
    },
  });

  // helpers for pagination
  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const reset = () => {
    setPage(1);
    setLimit(10);
    setSearch("");
    setStatus(undefined);
    setOrderBy(undefined);
    setOrder(undefined);
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    total_pages: query.data?.total_pages || 0,

    // filters
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
    // pagination
    nextPage,
    prevPage,
    reset,
  };
};

export default useCampaigns;
