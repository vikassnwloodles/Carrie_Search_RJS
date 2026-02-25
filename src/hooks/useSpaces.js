import { useSearch } from "../context/SearchContext";
import { fetchSpacesApi } from "../api/spacesApi";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";

export function useSpaces() {
  const {
    spacesContainer,
    setSpacesContainer,
    fetchedSpaces,
    setFetchedSpaces,
  } = useSearch();

  const { logoutAndNavigate } = useAuthUtils();

  const fetchSpaces = async (forceRefetch = false) => {
    if (fetchedSpaces && !forceRefetch) return;

    try {
      const data = await fetchSpacesApi();

      setSpacesContainer(data);
      setFetchedSpaces(true);

    } catch (err) {
      if (err.status === 401) {
        showCustomToast(
          "Session expired. Please log in again.",
          { type: "warn" }
        );
        logoutAndNavigate();
      } else {
        showCustomToast(
          "Failed to load spaces",
          { type: "error" }
        );
      }
    }
  };

  return {
    spaces: spacesContainer,
    fetchSpaces,
    fetchedSpaces,
  };
}