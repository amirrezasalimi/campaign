"use client";

import { useMemo } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { addToast } from "@heroui/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type Campaign from "@/shared/types/campaign/campaign";
import CampaignServices from "@/shared/services/campaign";
import makeUrl from "@/shared/utils/make_url";
import LINKS from "@/shared/constants/links";

export const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  // Treat empty input as missing -> show required. Otherwise coerce and enforce >= 0.
  reward: z
    .preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.coerce
        .number({ error: "Reward is required" })
        .min(0, { message: "Reward must be greater than or equal to 0" })
    )
    .refine((v) => v !== undefined, { message: "Reward is required" }),
  status: z.enum(["active", "inactive", "completed"]),
  endDate: z
    .string()
    .min(1, "End date is required")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
});

export type UpsertCampaignInput = z.infer<typeof schema>;

export const defaultValues: UpsertCampaignInput = {
  title: "",
  description: "",
  reward: 0,
  status: "inactive",
  endDate: "",
};

const useUpsertCampaign = (id?: string) => {
  const router = useRouter();

  const mode = id ? "edit" : "add";

  const { data: fetchedCampaign, isLoading: loading } = useQuery({
    enabled: Boolean(id),
    queryKey: ["campaign", id],
    queryFn: async (): Promise<Campaign | undefined> => {
      const response = await CampaignServices.get(id as string);
      return response?.data?.data;
    },
  });

  const initialValues: UpsertCampaignInput = useMemo(() => {
    if (!fetchedCampaign) return defaultValues;
    return {
      title: fetchedCampaign.title ?? "",
      description: fetchedCampaign.description ?? "",
      reward: Number(fetchedCampaign.reward ?? 0),
      status: fetchedCampaign.status,
      endDate: fetchedCampaign.endDate ? String(fetchedCampaign.endDate) : "",
    };
  }, [fetchedCampaign]);

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (payload: UpsertCampaignInput) => {
      const response = await CampaignServices.add(payload as Campaign);
      return response?.data?.data;
    },
    onSuccess: (createdCampaign) => {
      const createdId = createdCampaign?.id;
      addToast({
        title: "Campaign created",
        description: "The campaign has been created.",
        color: "success",
        variant: "flat",
      });
      if (createdId) {
        router.push(makeUrl(LINKS.CAMPAIGN_DETAIL, { id: createdId }));
      } else {
        router.push(LINKS.CAMPAIGN_LIST);
      }
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({
      id: campaignId,
      payload,
    }: {
      id: string;
      payload: UpsertCampaignInput;
    }) => {
      const response = await CampaignServices.edit(
        campaignId,
        payload as Campaign
      );
      return response?.data?.data;
    },
    onSuccess: (_updated, variables) => {
      addToast({
        title: "Campaign updated",
        description: "Your changes have been saved.",
        color: "success",
        variant: "flat",
      });
      router.push(makeUrl(LINKS.CAMPAIGN_DETAIL, { id: variables.id }));
    },
  });

  const submitting = addMutation.isPending || editMutation.isPending;

  const onSubmit = async (formData: UpsertCampaignInput) => {
    if (mode === "edit" && id) {
      await editMutation.mutateAsync({ id, payload: formData });
    } else {
      await addMutation.mutateAsync(formData);
    }
  };

  return {
    mode,
    defaultValues: initialValues,
    validationResolver: zodResolver(schema),
    onSubmit,
    loading,
    submitting,
    needsInitialLoad: Boolean(id),
  };
};

export default useUpsertCampaign;
