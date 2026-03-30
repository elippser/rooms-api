import logger from "../utils/logger";

export interface CoreProperty {
  propertyId: string;
  companyId: string;
  name: string;
  type: string;
}

const isDev = process.env.NODE_ENV !== "production";

const getCoreApiUrl = (): string => {
  const url = process.env.CORE_API_URL;
  if (!url) throw new Error("CORE_API_URL is not defined");
  return url;
};

/**
 * Verifica que la propiedad exista en el PMS core.
 * En desarrollo se salta la verificación para funcionar standalone
 * (CORE_API_URL suele apuntar a sí misma o el PMS puede no estar corriendo).
 */
export const verifyProperty = async (
  propertyId: string,
  companyId: string,
  token: string
): Promise<boolean> => {
  if (isDev) {
    logger.info("verifyProperty skipped (dev mode)", { propertyId, companyId });
    return true;
  }

  try {
    const res = await fetch(
      `${getCoreApiUrl()}/api/v1/properties/${propertyId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return false;

    const data = (await res.json()) as { companyId?: string };
    return data.companyId === companyId;
  } catch (error) {
    logger.error("coreClient.verifyProperty failed", { propertyId, error });
    return false;
  }
};

export const getProperty = async (
  propertyId: string,
  token: string
): Promise<CoreProperty> => {
  const res = await fetch(
    `${getCoreApiUrl()}/api/v1/properties/${propertyId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error(
      `Core API returned ${res.status} for property ${propertyId}`
    );
  }

  return res.json() as Promise<CoreProperty>;
};
