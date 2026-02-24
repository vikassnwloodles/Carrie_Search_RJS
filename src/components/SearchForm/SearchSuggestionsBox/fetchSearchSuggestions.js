import { fetchWithAuth } from "../../../api/fetchWithAuth"

export async function fetchSearchSuggestions(query, count){
    const resp = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/fetch-search-suggestions/?query=${query}&count=${count}`, {
        method: 'GET',
        headers: {

        }
    })
    const respJson = await resp.json()
    return respJson.search_suggestions
}