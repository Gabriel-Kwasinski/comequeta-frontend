/**
 * Neighbour profile data layer (SCRUM-7 / US05).
 *
 * Resolves a neighbour picked from the map to a REAL registered account
 * (via `GET /users`), so the name shown on the profile — and carried into the
 * chat — matches the real user. Bio/avatar are still placeholders until the
 * backend stores richer profile data.
 */
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../ChatPage/chatApi";

export interface NeighborProfile {
	id: number;
	name: string;
	bio: string;
	avatarUrl: string;
	distance: string;
}

export interface UseNeighborProfileResult {
	profile?: NeighborProfile;
	isLoading: boolean;
	isError: boolean;
}

export function useNeighborProfile(id: number): UseNeighborProfileResult {
	const isValidId = !Number.isNaN(id);
	const { data, isLoading, isError } = useQuery({
		queryKey: ["users"],
		queryFn: getUsers,
		enabled: isValidId,
	});

	if (!isValidId) {
		return { profile: undefined, isLoading: false, isError: true };
	}

	const match = data?.find((u) => u.id === id);
	const profile: NeighborProfile | undefined = match
		? {
				id,
				name: match.name,
				bio: "Este vizinho ainda não preencheu uma descrição.",
				avatarUrl: ``,
				distance: "Por perto",
			}
		: undefined;

	return {
		profile,
		isLoading,
		// A fetch failure, or the data loaded but there is no such user.
		isError: isError || (!isLoading && data !== undefined && !match),
	};
}
