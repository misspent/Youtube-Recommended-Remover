// ==UserScript==
// @name           [M] Context Menu (Shift & Alt key)
// @version        4.6
// @description    Actions menu shortcuts: hover over a video and press one of the keybinds, and it'll do that action. This is also very organized, so it should be easy to add your own/ modifications if you want more control. | I'm not interested in this fucking YouTube video!
// @author         Misspent & OpenAI
// @namespace      https://chatgpt.com
// @icon           https://i.imgur.com/vXIK1WF.png

// @include        https://www.youtube.com/*

// @exclude        http*://*.youtube.com/*.xml*
// @exclude        http*://*.youtube.com/error*
// @exclude        http*://music.youtube.com/*
// @exclude        http*://accounts.youtube.com/*
// @exclude        http*://studio.youtube.com/*
// @exclude        http*://*.youtube.com/redirect?*
// @exclude        http*://*.youtubetranscript.com/*

// @run-at        document-body
// @require       https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js
// ==/UserScript==


(function() {
    'use strict';

    const CONFIG = {
        checkInterval: 100, // ms to check for new cells
        debounceDelay: 100, // ms before hover action
        actionDelay: 150, // ms before clicking action
        pageConfigs: {
            home: {
                cellSelector: 'ytd-rich-item-renderer:not(.not-interested)',
                actions: { shiftKey: 'Not interested', altKey: 'Don\'t recommend channel' }
            },
            watch: {
                cellSelector: 'ytd-compact-video-renderer:not(.not-interested)',
                actions: { shiftKey: 'Not interested', altKey: 'Don\'t recommend channel' }
            },
            subscriptions: {
                cellSelector: 'ytd-rich-item-renderer:not(.not-interested)',
                actions: { shiftKey: 'Hide', altKey: 'Don\'t recommend channel' }
            },
            playlist: {
                cellSelector: 'ytd-playlist-video-renderer:not(.not-interested)',
                actions: { shiftKey: 'Remove from', altKey: 'Move to top' }
            }
        }
    };

    // Utility to debounce functions for performance
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Determine current page type based on URL using simple matching
    const getPageType = () => {
        const url = window.location.href;
        if (/youtube\.com\/?$/.test(url)) return 'home';
        if (/youtube\.com\/watch/.test(url)) return 'watch';
        if (/youtube\.com\/feed\/subscriptions/.test(url)) return 'subscriptions';
        if (/youtube\.com\/playlist/.test(url)) return 'playlist';
        return null;
    };

    // Dispatch event to an element if it's found
    const dispatchEventToElement = (element, eventName) => {
        if (!element) return console.warn(`Element for action not found: ${eventName}`);
        element.dispatchEvent(new Event(eventName, { bubbles: true }));
    };

    // Trigger a specified action for the given cell
    const triggerAction = (cell, actionText) => {
        const menuButton = cell.querySelector('button[aria-label="More actions"]') || cell.querySelector('yt-icon-button');
        if (!menuButton) return console.warn('Menu button not found for cell:', cell);

        // Trigger click on the menu button
        dispatchEventToElement(menuButton, 'click');

        // Wait for the menu to show and then click on the action item
        setTimeout(() => {
            const actionItems = document.querySelectorAll('yt-list-item-view-model > .yt-list-item-view-model-wiz__container--in-popup');
            const targetAction = Array.from(actionItems).find(item =>
                new RegExp(actionText, 'i').test(item.textContent)
            );

            if (targetAction) {
                dispatchEventToElement(targetAction, 'click');
            } else {
                console.warn(`Action "${actionText}" not found for cell:`, cell);
            }
        }, CONFIG.actionDelay);
    };

    // Apply hover handlers to the video cells
    const applyHoverHandlers = (cells, actions) => {
        cells.forEach(cell => {
            if (cell.classList.contains('not-interested')) return;

            const thumbnail = cell.querySelector('yt-thumbnail-view-model');
            if (!thumbnail) return;

            const debouncedHover = debounce(event => {
                // Trigger the right action based on the key pressed
                for (const [key, action] of Object.entries(actions)) {
                    if (event[key]) {
                        triggerAction(cell, action);
                        break;
                    }
                }
            }, CONFIG.debounceDelay);

            thumbnail.addEventListener('mouseenter', debouncedHover);
            cell.classList.add('not-interested'); // Mark the cell as processed
        });
    };

    // Scan and process cells on the current page based on page type
    const scanPageCells = (pageType) => {
        const { cellSelector, actions } = CONFIG.pageConfigs[pageType];
        const cells = document.querySelectorAll(cellSelector);

        if (cells.length > 0) {
            console.log(`Found ${cells.length} cells on ${pageType} page.`);
            applyHoverHandlers(cells, actions);
        } else {
            console.log(`No actionable cells found on ${pageType} page.`);
        }
    };

    // Setup a MutationObserver for dynamic content and periodic check
    const init = () => {
        // MutationObserver for detecting dynamic content load
        const observer = new MutationObserver(() => {
            const pageType = getPageType();
            if (pageType) scanPageCells(pageType);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial scan on page load
        const pageType = getPageType();
        if (pageType) scanPageCells(pageType);

        // Periodic check fallback to catch dynamic changes
        setInterval(() => {
            const pageType = getPageType();
            if (pageType) scanPageCells(pageType);
        }, CONFIG.checkInterval);
    };

    // Initialize the script when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
