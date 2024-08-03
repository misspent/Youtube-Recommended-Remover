// ==UserScript==
// @name         I'm not interested in this fucking YouTube video!
// @version      2.0
// @description  Actions menu shortcuts: hover over a video and press one of the keybinds, and it'll do that action. This is also very organized, so it should be easy to add your own/ modifications if you want more control.
// @namespace    0x7FFFFFFFFFFFFFFF & Misspent
// @icon         https://i.imgur.com/vXIK1WF.png
// @match        *://www.youtube.com/*
// @run-at       document-body
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js
// ==/UserScript==


(function() {
    'use strict';

    const checkInterval = 1000; // Reduced interval for faster checks (in milliseconds)
    const hoverDelay = 50; // Delay before clicking the action buttons
    const debounceTime = 100; // Debounce time for hover events

    let checkedFlags = {
        home: false,
        watch: false,
        subscriptions: false,
        playlist: false
    };

    const pageSelectors = {
        home: {
            cellSelector: "ytd-rich-item-renderer.ytd-rich-grid-renderer.style-scope:not(.Not-Interested)",
            itemSelector: "ytd-rich-item-renderer"
        },
        watch: {
            cellSelector: "ytd-compact-video-renderer.style-scope.ytd-item-section-renderer:not(.Not-Interested)",
            itemSelector: "ytd-compact-video-renderer"
        },
        subscriptions: {
            cellSelector: "ytd-rich-item-renderer.ytd-rich-grid-renderer.style-scope:not(.Not-Interested)",
            itemSelector: "ytd-rich-item-renderer"
        },
        playlist: {
            cellSelector: "ytd-playlist-video-renderer.style-scope.ytd-playlist-video-list-renderer:not(.Not-Interested)",
            itemSelector: "ytd-playlist-video-renderer"
        }
    };

    const actions = {
        home: {
            shiftKey: 'Not interested',
            altKey: "Don't recommend channel"
        },
        watch: {
            shiftKey: 'Not interested',
            altKey: "Don't recommend channel"
        },
        subscriptions: {
            shiftKey: 'Hide',
            altKey: "Don't recommend channel"
        },
        playlist: {
            shiftKey: 'Remove from',
            altKey: "Move to top"
        }
    };

    function setupHoverHandlers(pageType, cellSelector, itemSelector) {
        $(cellSelector).each(function() {
            const cell = $(this);
            const hoverElement = pageType === 'playlist' ? cell : cell.find("ytd-thumbnail");

            hoverElement.hover(debounce(function(e) {
                Object.keys(actions[pageType]).forEach(key => {
                    if (e[key]) {
                        triggerAction(cell, itemSelector, actions[pageType][key]);
                    }
                });
            }, debounceTime));
        }).addClass("Not-Interested");
    }

    function triggerAction(cell, itemSelector, actionText) {
        try {
            const button = cell.closest(itemSelector).find("button.style-scope.yt-icon-button");
            if (button.length) {
                button.click();
                setTimeout(function() {
                    // Use a case-insensitive regular expression that ignores apostrophes
                    const actionRegex = new RegExp(actionText.replace(/'/g, "[''']?"), 'i');
                    const actionButton = $('yt-formatted-string').filter(function() {
                        return actionRegex.test($(this).text());
                    });
                    if (actionButton.length) {
                        actionButton.click();
                    } else {
                        console.error(`Action button "${actionText}" not found.`);
                    }
                }, hoverDelay);
            } else {
                console.error("Button not found.");
            }
        } catch (error) {
            console.error("Error in triggerAction: ", error);
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function checkCells(pageType) {
        const { cellSelector, itemSelector } = pageSelectors[pageType];
        const cells = $(cellSelector);
        if (cells.length === 0) {
            if (!checkedFlags[pageType]) {
                console.log(`Can't find any cells to check on ${pageType} page`);
                checkedFlags[pageType] = true;
            }
        } else {
            console.log(`Found ${cells.length} cells on ${pageType} page`);
            setupHoverHandlers(pageType, cells, itemSelector);
            checkedFlags[pageType] = false; // Reset the flag when cells are found
        }
    }

    function detectPage() {
        if (/youtube\.com\/?$/.test(location.href)) {
            return 'home';
        } else if (/youtube\.com\/watch/.test(location.href)) {
            return 'watch';
        } else if (/youtube\.com\/feed\/subscriptions/.test(location.href)) {
            return 'subscriptions';
        } else if (/youtube\.com\/playlist/.test(location.href)) {
            return 'playlist';
        } else {
            return null;
        }
    }

    function init() {
        setInterval(function() {
            const currentPage = detectPage();
            if (currentPage) {
                checkCells(currentPage);
            }
        }, checkInterval);
    }

    $(document).ready(init);
})();









/* Old:


(function() {
    'use strict';
    if (/youtube\.com\//.test(location.href)) {
        console.log("Youtube home page detected!");

        setInterval((function () {
            let cells = $("ytd-rich-item-renderer.style-scope.ytd-rich-grid-row:not(.fucked)");
            if(cells.length == 0) {
                return; // stop the function if there are no cells to check
            }
            cells.each(function(){
                let cell = $(this);
                let temp = cell.find("#thumbnail");
                temp.hover(function(e){
                    if(e.shiftKey) { // Do not recommened in home page section v2
                        $(this).closest("ytd-rich-item-renderer").find("button.style-scope.yt-icon-button").click();
                        setTimeout(function(){
                            $("yt-formatted-string:contains('Recommend less like this')").click();
                        }, 50);
                    }
                    if(e.shiftKey) { // Do not recommened in home page section v1
                        $(this).closest("ytd-rich-item-renderer").find("button.style-scope.yt-icon-button").click();
                        setTimeout(function(){
                            $("yt-formatted-string:contains('Not interested')").click();
                        }, 50);
                    }
                    if(e.shiftKey) {// Hides video in subscriptions section
                        $(this).closest("ytd-rich-item-renderer").find("button.style-scope.yt-icon-button").click();
                        setTimeout(function(){
                            $("yt-formatted-string:contains('Hide')").click();
                        }, 50);
                    }
                    else if(e.altKey) { // Stops all videos from that channel getting onto your homepage
                        $(this).closest("ytd-rich-item-renderer").find("button.style-scope.yt-icon-button").click();
                        setTimeout(function(){
                            $(`yt-formatted-string:contains("Don't recommend channel")`).click();
                        }, 50);
                    }
                });
            });
            cells.addClass("fucked");
        }), 2000);
    }
})();


*/
