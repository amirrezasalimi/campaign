import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import CampaignServices from "@/shared/services/campaign";
import type { CampaignStatus } from "@/shared/types/campaign/campaign";
import { addToast } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const useCampaigns = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // internal states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<"asc" | "desc" | undefined>(undefined);

  // synchronization guards
  const hydratedRef = useRef(false);
  const lastAppliedQueryRef = useRef<string>("");

  // helpers to map between URLSearchParams and state
  const readFromSearchParams = (sp: URLSearchParams) => {
    const urlPage = sp.get("page");
    const urlLimit = sp.get("limit");
    const urlTitle = sp.get("title") ?? sp.get("q");
    const urlStatus = sp.get("status");
    const urlSortKey = sp.get("sort_key");
    const urlSortType = sp.get("sort_type") as "asc" | "desc" | null;

    // Treat "all" as no filter (undefined)
    const normalizedStatus =
      urlStatus && urlStatus.toLowerCase() === "all"
        ? undefined
        : urlStatus ?? undefined;

    return {
      page: urlPage ? Math.max(1, parseInt(urlPage, 10) || 1) : 1,
      limit: urlLimit ? Math.max(1, parseInt(urlLimit, 10) || 10) : 10,
      search: urlTitle ?? "",
      status: normalizedStatus,
      orderBy: urlSortKey ?? undefined,
      order:
        urlSortType === "asc" || urlSortType === "desc"
          ? urlSortType
          : undefined,
    } as const;
  };

  const writeToSearchParams = () => {
    const sp = new URLSearchParams();
    if (page && page !== 1) sp.set("page", String(page));
    if (limit && limit !== 10) sp.set("limit", String(limit));
    if (search) sp.set("title", search);
    // Skip writing status if it's "all" (no filter) or undefined/empty
    if (status && status.toLowerCase() !== "all") sp.set("status", status);
    if (orderBy) sp.set("sort_key", orderBy);
    if (order) sp.set("sort_type", order);
    return sp.toString();
  };
  const [forceRender, setForceRender] = useState(0);

  // hydrate from URL ONCE on mount (snapshot initial search params)
  useEffect(() => {
    if (hydratedRef.current) return;

    const initial = new URLSearchParams(searchParams?.toString() ?? "");
    const parsed = readFromSearchParams(initial);

    setPage(parsed.page);
    setLimit(parsed.limit);
    setSearch(parsed.search);
    setStatus(parsed.status);
    setOrderBy(parsed.orderBy);
    setOrder(parsed.order);

    lastAppliedQueryRef.current = initial.toString();
    hydratedRef.current = true;
    setForceRender((prev) => prev + 1); // trigger re-render after hydration
  }, []); // run once

  const params = useMemo(
    () => ({
      page,
      limit,
      title: search || undefined,
      // Treat "all" as no status filter for API as well
      status:
        status && status.toLowerCase() !== "all"
          ? (status as CampaignStatus)
          : undefined,
      sort_key: orderBy,
      sort_type: order,
    }),
    [page, limit, search, status, orderBy, order]
  );

  // keep internal state in sync when URL search params change externally (e.g., shallow routing)
  useEffect(() => {
    if (!hydratedRef.current) return;

    const current = new URLSearchParams(searchParams?.toString() ?? "");
    const currentQuery = current.toString();

    // Only pull from URL if it differs from the last query we applied ourselves
    if (currentQuery !== lastAppliedQueryRef.current) {
      const parsed = readFromSearchParams(current);

      // if nothing actually changes, avoid setState to prevent useless renders
      setPage((prevPage) =>
        prevPage !== parsed.page ? parsed.page : prevPage
      );
      setLimit((previousLimit) =>
        previousLimit !== parsed.limit ? parsed.limit : previousLimit
      );
      setSearch((previousSearch) =>
        previousSearch !== parsed.search ? parsed.search : previousSearch
      );
      setStatus((previousStatus) =>
        previousStatus !== parsed.status ? parsed.status : previousStatus
      );
      setOrderBy((previousOrderBy) =>
        previousOrderBy !== parsed.orderBy ? parsed.orderBy : previousOrderBy
      );
      setOrder((previousOrder) =>
        previousOrder !== parsed.order ? parsed.order : previousOrder
      );

      lastAppliedQueryRef.current = currentQuery;
    }
  }, [searchParams]);

  // push state to URL when filters change (after hydration)
  useEffect(() => {
    if (!hydratedRef.current) return;

    const newQuery = writeToSearchParams();

    if (newQuery !== lastAppliedQueryRef.current) {
      router.replace(newQuery ? `${pathname}?${newQuery}` : `${pathname}`);
      lastAppliedQueryRef.current = newQuery;
    }
  }, [page, limit, search, status, orderBy, order, pathname]);

  const query = useQuery({
    queryKey: ["campaigns", params],
    queryFn: async () => {
      const res = await CampaignServices.list(params);
      return res.data?.data;
    },
    // Prevent initial double-fetch: wait until URL params are hydrated/applied
    enabled: hydratedRef.current,
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

    lastAppliedQueryRef.current = "";
    if (pathname) router.replace(pathname);
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
