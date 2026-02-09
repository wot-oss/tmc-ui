import type { LoaderFunctionArgs } from "react-router-dom";
import { getDeploymentType } from "../utils/deployment";
import { fetchApiDataInventory } from "./apiData";
import { fetchLocalDataInventory } from "./localData";

export async function dataLoader({ request }: LoaderFunctionArgs) {
  const deploymentType = getDeploymentType(import.meta.env.BASE_URL);

  switch (deploymentType) {
    case "SERVER_AVAILABLE": {
      __DEBUG__
        ? console.warn("Fetching inventory from local backend server...")
        : null;
      const inventory = await fetchApiDataInventory(__API_BASE__, request);
      return { deploymentType, inventory };
    }

    case "TYPE_TMC-UI-CATALOG": {
      __DEBUG__
        ? console.warn(
            "Fetching inventory from a repository that contains a catalog..."
          )
        : null;
      const inventory = await fetchLocalDataInventory(import.meta.env.BASE_URL);
      return { deploymentType, inventory };
    }
    case "TYPE_CATALOG-TMC-UI": {
      console.warn(
        "Fetching inventory from local files in a catalog repository..."
      );
      return { deploymentType, inventory: [] };
    }
  }
}
