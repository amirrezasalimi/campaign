import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import CampaignServices from "@/shared/services/campaign";
import type { CampaignStatus } from "@/shared/types/campaign/campaign";
import { addToast } from "@heroui/react";

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

  // track which id is currently being removed
  const [removingId, setRemovingId] = useState<string | null>(null);

  // delete mutation with optimistic update
  const removeMutation = useMutation({
    mutationFn: CampaignServices.delete,
    onMutate: (id: string) => {
      setRemovingId(id);
    },
    onSuccess() {
      query.refetch();
      addToast({
        title: "Campaign deleted successfully",
        color: "success",
      });
    },
    onSettled() {
      setRemovingId(null);
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

    // remove
    remove: removeMutation.mutate,
    removing: removeMutation.isPending,
    removingId,
  };
};

export default useCampaigns;
