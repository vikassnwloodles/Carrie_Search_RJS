// src/utils/structuredData.js

export function structuredData(rawText, citationsMetadata) {
    // Remove <think> blocks
    rawText = rawText.replace(/<think>.*?<\/think>/gs, '');

    // Normalize LaTeX-style brackets
    rawText = rawText.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_, expr) => `\\[${expr}\\]`);

    const lines = rawText.split('\n');

    let htmlBuilder = [];
    let inList = false;
    let inTable = false;
    let inCodeBlock = false;
    let currentTableLines = [];
    let currentCodeLines = [];
    let codeLang = '';

    /* ---------------- Inline helpers ---------------- */

    function handleInlineCode(text) {
        // Convert single inline backticks to <code>
        // Example: `<input />` → <code>&lt;input /&gt;</code>
        return text.replace(/`([^`]+)`/g, (_, code) => {
            const escaped = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            return `<code class="bg-gray-100 px-1 rounded text-sm font-mono">${escaped}</code>`;
        });
    }

    function processInlineFormatting(text) {
        return handleInlineCode(parseItalic(parsebold(text)));
    }

    function closeOpenBlocks() {
        if (inList) {
            htmlBuilder.push('</ul>');
            inList = false;
        }
        if (inTable) {
            htmlBuilder.push(buildTable(currentTableLines, citationsMetadata));
            currentTableLines = [];
            inTable = false;
        }
    }

    function handleHeading(level, text) {
        closeOpenBlocks();

        const headingClasses = {
            1: 'text-3xl font-bold mt-6 mb-3',
            2: 'text-2xl font-semibold mt-4 mb-2',
            3: 'text-xl font-semibold mt-4 mb-2',
            4: 'text-lg font-semibold mt-3 mb-1.5',
            5: 'text-base font-semibold mt-2 mb-1',
            6: 'text-sm font-semibold mt-1 mb-0.5'
        };

        htmlBuilder.push(
            `<h${level} class="${headingClasses[level]}">
                ${processInlineFormatting(text)}
            </h${level}>`
        );
    }

    /* ---------------- Main parsing loop ---------------- */

    lines.forEach(line => {
        const trimmedLine = line.trim();

        // Horizontal rule
        if (trimmedLine === '---') {
            closeOpenBlocks();
            htmlBuilder.push('<hr class="my-6 border-t border-gray-300">');
            return;
        }

        // Code block start / end
        if (trimmedLine.startsWith('```')) {
            if (inCodeBlock) {
                htmlBuilder.push(
                    `<pre class="bg-gray-800 text-white p-4 rounded-md overflow-x-auto my-2">
                        <code class="language-${codeLang}">
${currentCodeLines.join('\n')}
                        </code>
                     </pre>`
                );
                currentCodeLines = [];
                inCodeBlock = false;
                codeLang = '';
            } else {
                closeOpenBlocks();
                inCodeBlock = true;
                codeLang = trimmedLine.substring(3).trim() || 'plaintext';
            }
            return;
        }

        if (inCodeBlock) {
            currentCodeLines.push(line);
            return;
        }

        // Empty line
        if (!trimmedLine) {
            closeOpenBlocks();
            return;
        }

        // Headings
        const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
            handleHeading(headingMatch[1].length, headingMatch[2]);
            return;
        }

        // List items
        if (trimmedLine.startsWith('- ')) {
            if (!inList) {
                closeOpenBlocks();
                htmlBuilder.push('<ul class="list-disc list-inside ml-4 my-2">');
                inList = true;
            }

            const [mainText, citationsHtml] =
                getMainTextAndCitationsHtml(trimmedLine, citationsMetadata);

            htmlBuilder.push(
                `<li class="text-gray-700">
                    ${processInlineFormatting(mainText.substring(2))}
                    ${citationsHtml}
                 </li>`
            );
            return;
        }

        // Table rows
        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
            currentTableLines.push(trimmedLine);
            inTable = true;
            return;
        }

        // Paragraphs
        const [mainText, citationsHtml] =
            getMainTextAndCitationsHtml(trimmedLine, citationsMetadata);

        htmlBuilder.push(
            `<p class="text-gray-700 leading-relaxed my-2">
                ${processInlineFormatting(mainText)}
                ${citationsHtml}
             </p>`
        );
    });

    // Close any remaining open blocks
    closeOpenBlocks();

    let content = htmlBuilder.join('');

    // Wrap tables for horizontal scrolling
    content = content.replace(/<table([\s\S]*?)<\/table>/g, match =>
        `<div class="overflow-x-auto w-full my-4 rounded-md border border-gray-200">${match}</div>`
    );

    // Render math safely
    const container = document.createElement('div');
    container.innerHTML = content;

    renderMathInElement(container, {
        delimiters: [
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
    });

    return container.innerHTML;
}


// Utility: safely extract domain from URL
function getDomain(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return '';
    }
}

// Function to generate the citation badge HTML
function getCitationHtml(citationsMetadata) {
    if (!citationsMetadata || citationsMetadata.length === 0) return '';

    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);

    // Attach hover handlers after rendering
    setTimeout(() => {
        attachEventHandlers(uniqueId);
    }, 0);

    citationsMetadata = citationsMetadata.filter(
    ((seen) => item => !seen.has(item.site_url) && seen.add(item.site_url))(new Set())
    );

    const firstCitation = citationsMetadata[0];
    const remainingCount = citationsMetadata.length - 1;
    const remainingText = remainingCount > 0 ? ` +${remainingCount}` : '';

    // Build tooltip items
    const sourceItemsHtml = citationsMetadata.map(cit => {
        const domain = getDomain(cit.site_url);

        return `
        <a href="${cit.site_url}" target="_blank" rel="noopener noreferrer"
           class="flex items-start gap-3 p-2 rounded hover:bg-gray-100">
            
            <img
                src="https://www.google.com/s2/favicons?domain=${domain}&sz=16"
                class="w-4 h-4 flex-shrink-0 rounded"
                alt=""
                onerror="this.outerHTML='<i class=&quot;fa-solid fa-globe w-4 h-4 text-gray-400 flex-shrink-0&quot;></i>'"
            />

            <div class="flex-1 truncate">
                <div class="text-sm font-sans truncate">${cit.title}</div>
                <div class="text-xs font-mono text-gray-500 truncate">${cit.domain_short}</div>
            </div>
        </a>`;
    }).join('');

    return `
<span id="citation-wrapper-${uniqueId}" class="relative inline-block">
    
    <!-- Citation badge -->
    <a 
        href="${firstCitation.site_url}"
        target="_blank"
        rel="nofollow noopener"
        aria-label="${firstCitation.title}"
        class="inline-flex items-center ml-1 no-underline hover:no-underline"
    >
        <span
            id="citation-badge-${uniqueId}"
            class="text-xs rounded-full px-2 py-[0.1875rem] font-mono tabular-nums 
                   text-gray-600 bg-gray-100 border border-gray-300 
                   hover:bg-blue-600 hover:text-white cursor-pointer transition-colors duration-200">
            ${firstCitation.domain_short}${remainingText}
        </span>
    </a>

    <!-- Tooltip -->
    <div
        id="citation-tooltip-${uniqueId}"
        class="absolute left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg
               opacity-0 invisible transition-opacity duration-200 z-10">
        <div class="px-3 py-2 space-y-2 max-h-60 overflow-y-auto">
            ${sourceItemsHtml}
        </div>
    </div>

</span>
`;
}


function getMainTextAndCitationsHtml(trimmedLine, citationsMetadata) {
    // EXTRACT CITATION NUMBERS SUCH AS 1, 2... FROM `trimmedLine`
    let citationNumbers = (trimmedLine.match(/\[(\d+)\]/g) || []).map(c => parseInt(c.replace(/\[|\]/g, ""), 10));
    // REMOVE THE [n] MARKERS FROM THE MAIN TEXT
    const mainText = trimmedLine.replace(/\[\d+\]/g, "").trim();
    let citationsHtml = "";
    if (citationNumbers.length > 0) {
        // FILTER OUT CITATIONS METADATA BASE ON EXTRACTED CITATION NUMBERS
        const citationsMetadataFiltered = citationNumbers.map(number => citationsMetadata[number - 1])
        // citationsHtml = getCitationHtml(citationsMetadataFiltered)
        citationsHtml = ""
    }
    return [mainText, citationsHtml];
}


function parseItalic(text) {
    return text.replace(/\*(.*?)\*/g, '<em>$1</em>');
}


function parsebold(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}


// function attachEventHandlers(uniqueId) {
    // let hideTimeout; // store timeout ID
    // const $badge = $(`#citation-badge-${uniqueId}`);
    // const $anchor = $badge.find('a');
    // const citationBadgeWidth = $anchor.outerWidth()
    // const citationTooltipWidth = 320

    // const $tooltip = $(`#citation-tooltip-${uniqueId}`);


    // // Show tooltip when hovering badge OR tooltip itself
    // // $badge.add($tooltip).hover(
    // //     function () {
    // $(document).on("mouseenter", `#citation-badge-${uniqueId}, #citation-tooltip-${uniqueId}`, function () {
    //     const badgeOffset = $badge.offset().left;       // left relative to document
    //     const $badgeAncestor = $badge.closest('[id^="response-text-"]:not([id^="response-text-inner-"])')
    //     const ancestorOffset = $badgeAncestor.offset().left; // left relative to document
    //     const badgeRelativeLeft = badgeOffset - ancestorOffset;
    //     let requiredShiftFromLeft = badgeRelativeLeft - ((citationTooltipWidth / 2) - (citationBadgeWidth / 2))

    //     // prevent tooltip from going past the left edge
    //     requiredShiftFromLeft = requiredShiftFromLeft >= 0 ? requiredShiftFromLeft : 0;

    //     // prevent tooltip from going past the right edge
    //     const badgeParentContainerWidth = $badgeAncestor.outerWidth(); // parent container of the badge
    //     if ((requiredShiftFromLeft + citationTooltipWidth) > badgeParentContainerWidth) {
    //         requiredShiftFromLeft = (badgeParentContainerWidth - citationTooltipWidth)
    //     }

    //     $tooltip.css({
    //         // left: `${badgeOffset.left-tooltipOffset.left}px`,
    //         left: `${requiredShiftFromLeft}px`
    //     })

    //     clearTimeout(hideTimeout);
    //     $tooltip.removeClass("opacity-0 invisible").addClass("opacity-100 visible");
    // }).on("mouseleave", `#citation-badge-${uniqueId}, #citation-tooltip-${uniqueId}`, function () {
    //     hideTimeout = setTimeout(() => {
    //         $tooltip.removeClass("opacity-100 visible").addClass("opacity-0 invisible");
    //     }, 100);
    // })
// }
function attachEventHandlers(uniqueId) {
    const badge = document.getElementById(`citation-badge-${uniqueId}`);
    const tooltip = document.getElementById(`citation-tooltip-${uniqueId}`);
    const wrapper = document.getElementById(`citation-wrapper-${uniqueId}`);

    if (!badge || !tooltip || !wrapper) return;

    let hideTimeout;

    const showTooltip = () => {
        clearTimeout(hideTimeout);
        tooltip.classList.remove('opacity-0', 'invisible');
        tooltip.classList.add('opacity-100', 'visible');
    };

    const hideTooltip = () => {
        hideTimeout = setTimeout(() => {
            tooltip.classList.add('opacity-0', 'invisible');
            tooltip.classList.remove('opacity-100', 'visible');
        }, 100); // small delay prevents flicker
    };

    badge.addEventListener('mouseenter', showTooltip);
    badge.addEventListener('mouseleave', hideTooltip);

    tooltip.addEventListener('mouseenter', showTooltip);
    tooltip.addEventListener('mouseleave', hideTooltip);
}



function removeFootnotes(text) {
    return text.replace(/\s*\[\d+\](\[\d+\])*\s*$/, '').trim();
}


function buildTable(rows, citationsMetadata) {
    if (rows.length < 2) {
        return '';
    }

    // --- Inline code handler (same logic as structuredData) ---
    function handleInlineCode(text) {
        return text.replace(/`([^`]+)`/g, (_, code) => {
            const escaped = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            return `<code class="bg-gray-100 px-1 rounded text-sm font-mono">${escaped}</code>`;
        });
    }

    function processInlineFormatting(text) {
        return handleInlineCode(parseItalic(parsebold(removeFootnotes(text))));
    }

    let tableHtml =
        '<table class="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">';

    const headerRow = rows[0];
    const dataRows = rows.slice(2);

    /* ----------- HEADER ----------- */

    tableHtml += '<thead class="bg-gray-50"><tr>';
    const headerCells = headerRow.substring(1, headerRow.length - 1).split('|');

    headerCells.forEach(cellContent => {
        tableHtml +=
            '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">' +
            processInlineFormatting(cellContent) +
            '</th>';
    });

    tableHtml += '</tr></thead>';

    /* ----------- BODY ----------- */

    tableHtml += '<tbody class="bg-white divide-y divide-gray-200">';

    dataRows.forEach(rowStr => {
        tableHtml += '<tr>';
        const cells = rowStr.substring(1, rowStr.length - 1).split('|');

        cells.forEach(cellContent => {
            const [mainText, citationsHtml] =
                getMainTextAndCitationsHtml(cellContent, citationsMetadata);

            tableHtml +=
                '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">' +
                processInlineFormatting(mainText) +
                citationsHtml +
                '</td>';
        });

        tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';

    return tableHtml;
}
