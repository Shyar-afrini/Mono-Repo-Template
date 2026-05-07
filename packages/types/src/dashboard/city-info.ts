import type { City } from "@mono-repo-template/database";

export interface CityInfo extends City {}

export interface CityInfoResponse {
  data: CityInfo;
}

export interface UpdateCityInfoPayload {
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
}
