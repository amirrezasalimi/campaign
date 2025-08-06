"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  SelectItem,
  Spinner,
} from "@heroui/react";
import useUpsertCampaign, { schema } from "./hooks/upsert-campaign";
import {
  Form,
  FormDateInput,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/shared/components/form";
import { z } from "zod";
import { useParams } from "next/navigation";

type UpsertCampaignFormData = z.infer<typeof schema>;

const UpsertCampaign = () => {
  const params = useParams();
  const id = params?.id as string | undefined;

  const {
    mode,
    defaultValues,
    validationResolver,
    onSubmit,
    loading,
    submitting,
    needsInitialLoad,
  } = useUpsertCampaign(id);

  const headerText = mode === "edit" ? "Edit Campaign" : "Add Campaign";
  const ctaText = mode === "edit" ? "Update Campaign" : "Create Campaign";

  if (needsInitialLoad && loading) {
    return (
      <div className="flex justify-center items-center p-6 min-h-[50vh]">
        <Spinner size="lg" label="Loading campaign..." />
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader className="font-semibold text-lg">{headerText}</CardHeader>
        <CardBody>
          <Form<UpsertCampaignFormData>
            defaultValues={defaultValues}
            validationSchema={validationResolver}
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
          >
            <FormInput
              name="title"
              label="Title"
              placeholder="Enter campaign title"
              isRequired
            />

            <FormTextarea
              name="description"
              label="Description"
              placeholder="Describe the campaign"
              minRows={3}
            />

            <FormInput
              name="reward"
              type="number"
              label="Reward"
              placeholder="0"
              inputMode="decimal"
              isRequired
            />

            <FormSelect
              name="status"
              label="Status"
              isRequired
              placeholder="Select status"
            >
              <SelectItem key="active">Active</SelectItem>
              <SelectItem key="inactive">Inactive</SelectItem>
              <SelectItem key="completed">Completed</SelectItem>
            </FormSelect>

            <FormDateInput name="endDate" label="End Date" isRequired />

            <CardFooter className="flex flex-col items-stretch gap-2 mt-2 p-0">
              <Button
                color="primary"
                type="submit"
                isLoading={submitting || loading}
                isDisabled={loading}
              >
                {ctaText}
              </Button>
            </CardFooter>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default UpsertCampaign;
