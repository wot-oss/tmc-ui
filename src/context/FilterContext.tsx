import React, { createContext, useContext, useState, useEffect } from "react";
import { PROTOCOLS } from "../utils/constants";
import { fetchApiDataFilters } from "../services/apiData";
import { fetchLocalDataFilters } from "../services/localData";

interface FilterContextType {
  repositories: FilterData[];
  manufacturers: FilterData[];
  authors: FilterData[];
  protocols: FilterData[];
  loading: boolean;
  errorFetchData: string | null;
}

interface FilterProviderProps {
  readonly children: React.ReactNode;
  readonly deploymentType: DeploymentType;
  readonly baseUrl: string;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<FilterProviderProps> = ({
  children,
  deploymentType,
}) => {
  const [repositories, setRepositories] = useState<FilterData[]>([]);
  const [manufacturers, setManufacturers] = useState<FilterData[]>([]);
  const [authors, setAuthors] = useState<FilterData[]>([]);
  const [protocols, setProtocols] = useState<FilterData[]>(PROTOCOLS);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorFetchData, setErrorFetchData] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const isAbortError = (err: unknown): boolean =>
      err instanceof DOMException && err.name === "AbortError";

    async function a() {
      let nextAuthors: FilterData[] = [];
      let nextManufacturers: FilterData[] = [];
      let nextProtocols: FilterData[] = [];
      let nextRepositories: FilterData[] = [];

      if (
        deploymentType === "TYPE_TMC-UI-CATALOG" ||
        deploymentType === "TYPE_CATALOG-TMC-UI"
      ) {
        setLoading(true);
        const result = await fetchLocalDataFilters(
          import.meta.env.BASE_URL
        ).catch((err: unknown) => {
          if (!isAbortError(err)) {
            setErrorFetchData(
              err instanceof Error ? err.message : "Unknown error"
            );
            setLoading(false);
            console.error("Error fetching local filters:", err);
          }
        });
        if (result) {
          ({ nextProtocols, nextManufacturers, nextAuthors, nextRepositories } =
            result);
        }
        setLoading(false);
      } else {
        setLoading(true);
        const result = await fetchApiDataFilters().catch((err: unknown) => {
          if (!isAbortError(err)) {
            setErrorFetchData(
              err instanceof Error ? err.message : "Unknown error"
            );
            setLoading(false);
            console.error("Error fetching filters:", err);
          }
        });
        if (result) {
          ({ nextProtocols, nextManufacturers, nextAuthors, nextRepositories } =
            result);
        }
        setLoading(false);
      }
      setProtocols(nextProtocols);
      setManufacturers(nextManufacturers);
      setAuthors(nextAuthors);
      setRepositories(nextRepositories);
    }
    a();
    return () => controller.abort();
  }, []);

  return (
    <FilterContext.Provider
      value={{
        repositories,
        manufacturers,
        authors,
        protocols,
        loading,
        errorFetchData,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside FilterProvider");
  return ctx;
};
