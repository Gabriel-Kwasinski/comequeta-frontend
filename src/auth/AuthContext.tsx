import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { $api } from "../api/client";
import type { components } from "../api/schema";
import { clearToken, getToken, setToken } from "./tokenStorage";

type User = components["schemas"]["UserRead"];

interface AuthContextValue {
	user?: User;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, name: string, password: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
	const [hasToken, setHasToken] = useState(() => getToken() !== null);
	const queryClient = useQueryClient();

	const meQuery = $api.useQuery(
		"get",
		"/users/me",
		{},
		{ enabled: hasToken, retry: false },
	);

	const loginMutation = $api.useMutation("post", "/auth/login");
	const registerMutation = $api.useMutation("post", "/auth/register");

	useEffect(() => {
		// Token rejected by the API (e.g. expired): drop it from storage.
		// isAuthenticated already derives from meQuery.data, so the UI logs out.
		if (hasToken && meQuery.isError) {
			clearToken();
		}
	}, [hasToken, meQuery.isError]);

	const login = useCallback(
		async (email: string, password: string) => {
			const result = await loginMutation.mutateAsync({
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: { username: email, password, grant_type: "password", scope: "" },
			});
			setToken(result.access_token);
			setHasToken(true);
			await queryClient.invalidateQueries({ queryKey: ["get", "/users/me"] });
		},
		[loginMutation, queryClient],
	);

	const register = useCallback(
		async (email: string, name: string, password: string) => {
			await registerMutation.mutateAsync({ body: { email, name, password } });
			await login(email, password);
		},
		[registerMutation, login],
	);

	const logout = useCallback(() => {
		clearToken();
		setHasToken(false);
		queryClient.removeQueries({ queryKey: ["get", "/users/me"] });
	}, [queryClient]);

	const value: AuthContextValue = {
		user: meQuery.data,
		isAuthenticated: hasToken && !!meQuery.data,
		isLoading: hasToken && meQuery.isPending,
		login,
		register,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
