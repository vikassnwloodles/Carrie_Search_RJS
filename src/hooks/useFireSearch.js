import { useState } from "react";
import { useSearch } from "../context/SearchContext";
import { showCustomToast } from "../utils/customToast";
import { flushSync } from "react-dom";


export function useFireSearch() {
    const {
        setSearchHistoryContainer,
        searchInputData,
        setSearchInputData,
        setSearchStarted,
        setStreamStarted,
        setThreadsContainer,
        setImageGenerationStarted
    } = useSearch();



    const fireSearch = async (prompt, search_result_id, thread_id, isFirstSearchOfThread, uploadedFiles, selected_text) => {
        prompt = prompt.trim()
        if (!prompt) return

        setSearchStarted(true)
        setSearchInputData(prev => ({ ...prev, search_result_id }))

        let fullText = "";
        let imageUrl = "";

        try {
            if (search_result_id) {
                setSearchHistoryContainer(prev =>
                    prev.map(item =>
                        item.id === search_result_id
                            ? {
                                ...item,
                                _key: crypto.randomUUID(),
                                prompt: prompt,
                                response: {
                                    ...item.response,
                                    content: [{ text: fullText, image_url: imageUrl }]
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
                        _key: crypto.randomUUID(),
                        prompt: prompt,
                        response: {
                            content: [{ text: fullText, image_url: imageUrl }]
                        },
                        uploaded_files: uploadedFiles.map(file => ({
                            file_name: file.name,
                            file_size: file.size,
                            content_type: file.type,
                        })),
                        selected_text: selected_text
                    },
                ]);
            }

            const payload = { ...searchInputData, prompt, search_result_id, thread_id, selected_text }
            const formData = new FormData();
            uploadedFiles.forEach((file) => {
                formData.append("files", file);
            });
            Object.entries(payload).forEach(([key, value]) => {
                if (value === null || value === undefined) return;
                formData.append(key, value);
            });

            const res = await fetch(`${import.meta.env.VITE_API_URL}/search/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const errText = await res.text(); // backend may stream error text
                throw new Error(errText);
            }

            // ✅ STREAM HANDLING
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let first_chunk_captured = false
            let extracted_pk = null
            let is_image_generation = false
            let is_error = false
            let imageData = ""
            let errorData = ""

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk

                // [INFO] CAPTURING FIRST CHUNK AND EXTRACTING PK
                if (!first_chunk_captured) {
                    const idx = buffer.indexOf("\n\n");
                    if (idx !== -1) {
                        const meta = buffer.slice(0, idx);
                        buffer = buffer.slice(idx + 2);

                        const parsed = JSON.parse(meta);
                        extracted_pk = parsed.search_result_id
                        if ("error" in parsed && parsed["error"] === true) {
                            is_error = true
                        } else {
                            is_image_generation = parsed.is_image_generation
                            if (is_image_generation) setImageGenerationStarted(true)
                        }
                        first_chunk_captured = true;
                    }

                    else continue
                }

                if (is_error) {
                    errorData = buffer
                    continue
                } else if (is_image_generation) {
                    imageData = buffer
                    continue
                } else {
                    fullText = buffer
                }

                // if (is_image_generation) {
                //     setIsImageGeneration(true)
                //     flushSync(() => {
                //         setSearchHistoryContainer(prev =>
                //             prev.map(item =>
                //                 item.id === search_result_id
                //                     ? {
                //                         ...item,
                //                         _key: crypto.randomUUID(),
                //                         prompt: prompt,
                //                         response: {
                //                             ...item.response,
                //                             content: [{ text: "", image_url: chunk }]
                //                         },
                //                     }
                //                     : item
                //             )
                //         );
                //     });
                //     break
                // }

                // setStreamStarted(true)

                // fullText += chunk;

                // 🔴 live UI update
                if (fullText.length % 20 === 0) {
                    flushSync(() => {
                        setSearchHistoryContainer(prev =>
                            prev.map(item =>
                                item.id === search_result_id
                                    ? {
                                        ...item,
                                        _key: crypto.randomUUID(),
                                        prompt: prompt,
                                        response: {
                                            ...item.response,
                                            content: [{ text: fullText, image_url: imageUrl }]
                                        },
                                    }
                                    : item
                            )
                        );
                    });
                }
            }

            if (is_error) {
                fullText = errorData
            } else if (is_image_generation) {
                imageData = JSON.parse(imageData)
                if ("error" in imageData) {
                    fullText = imageData["error"]
                } else {
                    imageUrl = imageData["img_url"]
                }
            }

            flushSync(() => {
                setSearchHistoryContainer(prev =>
                    prev.map(item =>
                        item.id === search_result_id
                            ? {
                                ...item,
                                _key: crypto.randomUUID(),
                                prompt: prompt,
                                response: {
                                    ...item.response,
                                    content: [{ text: fullText, image_url: imageUrl }]
                                },
                            }
                            : item
                    )
                );
            });

            // ASSIGN ID(extracted_pk) COMING FROM BACKEND TO THE NEW SEARCH ITEM
            if (!search_result_id) {
                // setSearchHistoryContainer(prev => prev.length ? [...prev.slice(0, -1), { ...prev[prev.length - 1], id: clientKey }] : prev);
                setSearchHistoryContainer(prev => prev.length ? [...prev.slice(0, -1), { ...prev[prev.length - 1], id: extracted_pk }] : prev);
            }

            // INCLUDING THE FIRST SEARCH OF A NEW THREAD IN THE SIDEBAR
            if (isFirstSearchOfThread) {
                setThreadsContainer(prev => ([{
                    id: extracted_pk,
                    prompt: prompt,
                    response: {
                        content: [{ text: fullText, image_url: imageUrl }]
                    },
                    thread_id: thread_id
                }, ...prev]))
            }
        } catch (err) {
            console.error(err);
            showCustomToast({ message: "Something went wrong" }, { type: "error" });
        } finally {
            setSearchStarted(false);
            setStreamStarted(false)
            setImageGenerationStarted(false)
        }
    };

    return fireSearch;
}
