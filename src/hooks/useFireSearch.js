import { useSearch } from "../context/SearchContext";

export function useFireSearch() {
    const {
        setSearchHistoryContainer,
        searchInputData,
        setSearchStarted
    } = useSearch();

    const fireSearch = async (prompt, search_result_id, thread_id) => {
        try {
            if (search_result_id) {
                setSearchHistoryContainer(prev =>
                    prev.map(item =>
                        item.id === search_result_id
                            ? {
                                ...item,
                                prompt: prompt,
                                response: {
                                    ...item.response,
                                    content: [{ text: "Thinking..." }]
                                },
                            }
                            : item
                    )
                );
            } else {
                setSearchHistoryContainer(prev => [
                    ...prev,
                    {
                        id: null,
                        prompt: prompt,
                        response: {
                            content: [{ text: "Thinking..." }]
                        },
                    },
                ]);
            }

            const payload = JSON.stringify({ ...searchInputData, prompt, search_result_id, thread_id });

            const res = await fetch(`${import.meta.env.VITE_API_URL}/search/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: payload,
            });

            if (!res.ok) {
                const errText = await res.text(); // backend may stream error text
                throw new Error(errText);
            }

            // ✅ STREAM HANDLING
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            let first_chunk_captured = false
            let first_chunk = ""
            let extracted_pk = null

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // [INFO] CAPTURING FIRST CHUNK AND EXTRACTING PK
                if (!first_chunk_captured) {
                    first_chunk = chunk
                    first_chunk_captured = true

                    extracted_pk = JSON.parse(first_chunk).search_result_id

                    continue
                }

                fullText += chunk;

                // 🔴 live UI update
                setSearchHistoryContainer(prev =>
                    prev.map(item =>
                        item.id === search_result_id
                            ? {
                                ...item,
                                prompt: prompt,
                                response: {
                                    ...item.response,
                                    content: [{ text: fullText }]
                                },
                            }
                            : item
                    )
                );
            }

            if (!search_result_id) {
                setSearchHistoryContainer(prev => prev.length ? [...prev.slice(0, -1), { ...prev[prev.length - 1], id: extracted_pk }] : prev);
            }

            // ✅ After stream completes
            const finalResponse = {
                content: [{ text: fullText }]
            };

            return finalResponse;
        } catch (err) {
            console.error(err);
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        } finally {
            setSearchStarted(false);
            // setPk(null);
        }
    };

    return fireSearch;
}
