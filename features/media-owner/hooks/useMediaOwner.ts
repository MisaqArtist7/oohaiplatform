import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyStructures, submitMediaOwnerRequestApi } from "../api/media-owner.api";
import { MediaOwnerRequestFormValues } from "../schemas/media-owner.schema";

export const mediaOwnerQueryKeys = {
  all: ["media-owner"] as const,
  structures: ["media-owner", "structures"] as const,
  requests: ["media-owner", "requests"] as const,
};

export function useMyStructuresQuery() {
  return useQuery({
    queryKey: mediaOwnerQueryKeys.structures,
    queryFn: fetchMyStructures,
  });
}

export function useSubmitMediaOwnerRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MediaOwnerRequestFormValues) => submitMediaOwnerRequestApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaOwnerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "media-owner-requests"] });
    },
  });
}
