
export interface EIASectorData {
  period: string;
  sectorid: string;
  price: number;
  sales: number;
}

export async function fetchLatestEiaRates(): Promise<
  Record<"RES" | "COM", EIASectorData | null>
> {
  const apiKey = "qrV5dWA6HoBT3XdfgumGgeFgmsm1m4PzUbgZRdqo"; // Or hardcode for local test
  const url = `https://api.eia.gov/v2/electricity/retail-sales/data?api_key=${apiKey}&frequency=monthly&data[]=price&data[]=sales&facets[sectorid][]=RES&facets[sectorid][]=COM&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=10`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch EIA data");
  const json = await res.json();

  // Find latest for each sector
  const latest: Record<"RES" | "COM", EIASectorData | null> = {
    RES: null,
    COM: null,
  };
  for (const row of json.response.data as Array<{
    period: string;
    sectorid: "RES" | "COM";
    price: number;
    sales: number;
  }>) {
    const { sectorid } = row;
    if ((sectorid === "RES" || sectorid === "COM") && !latest[sectorid]) {
      latest[sectorid] = {
        period: row.period,
        sectorid,
        price: row.price,
        sales: row.sales,
      };
    }
  }
  return latest;
}
