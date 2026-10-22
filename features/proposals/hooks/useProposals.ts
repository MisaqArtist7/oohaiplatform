import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProposals, createProposalApi } from "../api/proposals.api";
import { ProposalFormValues } from "../schemas/proposal.schema";

export const proposalQueryKeys = {
  all: ["proposals"] as const,
  list: ["proposals", "list"] as const,
};

export function useProposalsQuery() {
  return useQuery({
    queryKey: proposalQueryKeys.list,
    queryFn: fetchProposals,
  });
}

export function useCreateProposalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProposalFormValues) => createProposalApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proposalQueryKeys.all });
    },
  });
}
