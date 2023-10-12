// ==UserScript==
// @name         I'm not interested in this fucking YouTube video!
// @version      2.0
// @description  Removes videos from home page and hides videos from subscriptiion page when you press the allocated keybind
// @namespace    0x7FFFFFFFFFFFFFFF & Misspent
// @icon         https://www.youtube.com/s/desktop/03f86491/img/favicon.ico
// @match        *://www.youtube.com/*
// @run-at       document-end
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js
// ==/UserScript==

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
                let temp = cell.find("ytd-thumbnail");
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
