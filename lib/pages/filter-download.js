/**
 * This file is part of AdBlocker Ultimate Browser Extension
 *
 * AdBlocker Ultimate Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * AdBlocker Ultimate Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with AdBlocker Ultimate Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global $, NProgress, contentPage */
$(document).ready(function () {

    NProgress.inc();

    function onLoaded() {
        NProgress.done();
        setTimeout(function () {
            if (window) {
                contentPage.sendMessage({type: 'openThankYouPage'});
            }
        }, 1000);
    }

    function checkRequestFilterReady() {
        contentPage.sendMessage({type: 'checkRequestFilterReady'}, function (response) {
            if (response.ready) {
                onLoaded();
            } else {
                setTimeout(checkRequestFilterReady, 500);
            }
        });
    }

    checkRequestFilterReady();
});
