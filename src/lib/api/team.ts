import { apiService } from "@/lib/api_service";
import { TeamMember, TeamMemberCreate } from "@/types";

export const TeamAPI = {
    getAll: async (): Promise<TeamMember[]> => {
        return apiService.get<TeamMember[]>("/team/");
    },

    create: async (data: TeamMemberCreate): Promise<TeamMember> => {
        return apiService.post<TeamMember>("/team/", data);
    }
};
