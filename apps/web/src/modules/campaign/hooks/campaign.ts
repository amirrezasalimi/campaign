import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import type Campaign from "@/shared/types/campaign/campaign";
import CampaignServices from "@/shared/services/campaign";
import LINKS from "@/shared/constants/links";

type Options = {
  id: string | undefined;
};

type UseCampaign = {
  data: Campaign | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  isRefetching: boolean;
  deleteCampaign: () => void;
  isDeleting: boolean;
};

const useCampaign = ({ id }: Options): UseCampaign => {
  const router = useRouter();

  const query = useQuery<Campaign>({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const res = await CampaignServices.get(id as string);
      return res.data.data as Campaign;
    },
  });

  const { mutate: deleteCampaign, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      await CampaignServices.delete(id as string);
    },
    onSuccess: async () => {
      router.push(LINKS.CAMPAIGN_LIST);
      addToast({
        title: "Campaign deleted successfully",
        color: "success",
      });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    deleteCampaign,
    isDeleting,
  };
};

export default useCampaign;
