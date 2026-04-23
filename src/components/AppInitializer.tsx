import { useEffect, type ReactNode } from "react";
import { useAppDispatch } from "@/store/hooks";
import { rehydrateToken } from "@/store/authSlice";
import { getStoredToken } from "@/api/auth";

interface Props {
  children: ReactNode;
}

export default function AppInitializer({ children }: Props) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      dispatch(rehydrateToken(token));
    }
  }, [dispatch]);

  return <>{children}</>;
}