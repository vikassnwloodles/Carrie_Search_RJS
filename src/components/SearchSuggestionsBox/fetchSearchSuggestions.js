export async function fetchSearchSuggestions(query, count){
    const resp = await fetch(`${import.meta.env.VITE_API_URL}/fetch-search-suggestions/?query=${query}&count=${count}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    const respJson = await resp.json()
    return respJson.search_suggestions
}