"use client";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Spinner,
  Link,
  Chip,
} from "@heroui/react";
import { useParams, useRouter } from "next/navigation";
import useCampaign from "./hooks/campaign";
import LINKS from "@/shared/constants/links";
import makeUrl from "@/shared/utils/make_url";
import { ArrowLeft, Pencil, Trash2, RefreshCw } from "lucide-react";

const Campaign = () => {
  const params = useParams();
  const router = useRouter();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params?.id?.[0]
      : undefined;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    deleteCampaign,
    isDeleting,
  } = useCampaign({ id });

  return (
    <div className="flex justify-center items-center px-4 py-8 w-full min-h-[calc(100vh-8rem)]">
      <Card shadow="sm" className="border border-default-200 w-full max-w-2xl">
        <CardHeader className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="md"
              variant="light"
              onPress={() => router.back()}
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-xl">
              {data?.title || "Campaign"}
            </h3>
          </div>
        </CardHeader>

        <CardBody>
          {isLoading ? (
            <div className="flex justify-center items-center gap-3 min-h-40">
              <Spinner size="lg" />
              <span className="text-default-500">Loading campaign...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 text-danger">
              <RefreshCw className="w-4 h-4" />
              <span>
                Failed to load campaign
                {error instanceof Error ? `: ${error.message}` : ""}
              </span>
              <Button
                size="sm"
                variant="light"
                onPress={() => refetch()}
                isLoading={isRefetching}
                startContent={<RefreshCw className="w-4 h-4" />}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          ) : !data ? (
            <div className="text-default-500">No campaign found.</div>
          ) : (
            <div className="space-y-4">
              {"description" in data && data.description ? (
                <div>
                  <div className="text-default-500 text-sm">Description</div>
                  <div className="text-default-800">{data.description}</div>
                </div>
              ) : null}

              {"status" in data ? (
                <div>
                  <div className="text-default-500 text-sm">Status</div>
                  <div className="text-default-800">
                    <Chip
                      variant="flat"
                      color={
                        String(data.status) === "active"
                          ? "success"
                          : String(data.status) === "inactive"
                          ? "warning"
                          : String(data.status) === "completed"
                          ? "secondary"
                          : "default"
                      }
                      size="sm"
                      className="capitalize"
                    >
                      {String(data.status)}
                    </Chip>
                  </div>
                </div>
              ) : null}

              {"reward" in data ? (
                <div>
                  <div className="text-default-500 text-sm">Reward</div>
                  <div className="text-default-800">
                    {(() => {
                      const v = (data as any).reward as
                        | number
                        | string
                        | undefined
                        | null;
                      if (v === undefined || v === null || v === "") return "-";
                      const num = typeof v === "string" ? Number(v) : v;
                      if (Number.isFinite(num)) {
                        return Intl.NumberFormat(undefined, {
                          style: "decimal",
                          maximumFractionDigits: 2,
                        }).format(Number(num));
                      }
                      return String(v);
                    })()}
                  </div>
                </div>
              ) : null}

              <div>
                <div className="text-default-500 text-sm">End</div>
                <div className="text-default-800">
                  {(() => {
                    const v = data.endDate as string | undefined;
                    if (!v) return "-";
                    const d = new Date(v);
                    return isNaN(d.getTime()) ? v : d.toLocaleString();
                  })()}
                </div>
              </div>
            </div>
          )}
        </CardBody>

        <CardFooter className="justify-between">
          <div></div>
          <div className="flex gap-2">
            <Button
              as={Link}
              href={makeUrl(LINKS.CAMPAIGN_EDIT, { id })}
              size="md"
              variant="solid"
              color="primary"
              isDisabled={!id}
              startContent={<Pencil className="w-4 h-4" />}
            >
              Edit
            </Button>
            <Button
              size="md"
              color="danger"
              variant="flat"
              onPress={() => deleteCampaign()}
              isDisabled={!id}
              isLoading={isDeleting}
              startContent={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Campaign;
