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

/**
 * Global stats
 */
adguard.pageStats = (function (adguard) {

    'use strict';

    var pageStatisticProperty = "page-statistic";

    var userRankProperty        = "user-rank";
    var userRatedProperty       = "user-rated";
    var userShowBadgeAgain      = "user-show-badge";
    var ratePages = {'Firefox': 'https://addons.mozilla.org/en-US/firefox/addon/adblocker-ultimate/reviews/add',
                        'Chrome': 'https://chrome.google.com/webstore/detail/adblocker-ultimate/ohahllgiabjaoigichmmfljhkcfikeof/reviews',
                        'Opera': 'https://addons.opera.com/en/extensions/details/adblock-ultimate#feedback-container'};
    var contributePage = 'https://adblockultimate.net/donate.html';

    var userRanks = [{rank: 0, label: 'newbie', rankAt: 0, logo: 'icons/detailed/logo.png', 'action': '', 'buttonUrl': ''},
                        {rank: 1, label: 'bronze', rankAt: 1000, logo: 'icons/detailed/logo-bronze.png', 'action': 'rate', 'buttonUrl': ''},
                        {rank: 2, label: 'silver', rankAt: 10000, logo: 'icons/detailed/logo-silver.png', 'action': 'rate', 'buttonUrl': ''},
                        {rank: 3, label: 'gold', rankAt: 100000, logo: 'icons/detailed/logo-gold.png', 'action': 'contribute', 'buttonUrl': contributePage}];

    var pageStatsHolder = {
        /**
         * Getter for total page stats (gets it from local storage)
         *
         * @returns {*}
         * @private
         */
        get stats() {
            return adguard.lazyGet(pageStatsHolder, 'stats', function () {
                var stats;
                try {
                    var json = adguard.localStorage.getItem(pageStatisticProperty);
                    if (json) {
                        stats = JSON.parse(json);
                    }
                } catch (ex) {
                    adguard.console.error('Error retrieve page statistic from storage, cause {0}', ex);
                }
                return stats || Object.create(null);
            });
        },

        save: function () {
            if (this.saveTimeoutId) {
                clearTimeout(this.saveTimeoutId);
            }
            this.saveTimeoutId = setTimeout(function () {
                adguard.localStorage.setItem(pageStatisticProperty, JSON.stringify(this.stats));
            }.bind(this), 1000);
        },

        clear: function () {
            adguard.localStorage.removeItem(pageStatisticProperty);
            adguard.lazyGetClear(pageStatsHolder, 'stats');
        }
    };

    var setShowBadgeAgain = function(val){
      adguard.localStorage.setItem(userShowBadgeAgain, !val);
    };

    var getShowBadgeAgain = function(){
      var v = adguard.localStorage.getItem(userShowBadgeAgain);
      if(!v && v != 0){
        v = 1;
      }
      return v;
    };

    var updateUserRank = function(rank){
        adguard.localStorage.setItem(userRankProperty, rank);
        if(getShowBadgeAgain() == 1){
            rank = getUserRank();
            adguard.ui.openUserPromotedPanel(rank);
        }
    };
    var getUserRank = function(){
        var rankN = adguard.localStorage.getItem(userRankProperty) || 0;

        userRanks[1]['buttonUrl'] = ratePages[adguard.prefs.browser];
        userRanks[2]['buttonUrl'] = ratePages[adguard.prefs.browser];
        if(adguard.prefs.browser == 'Safari'){
            userRanks[rankN]['buttonUrl'] = contributePage;
            userRanks[rankN]['action'] = 'contribute';
        }else if(rankN != 3){
            if(didUserRate() > 0){
                userRanks[rankN]['buttonUrl'] = contributePage;
                userRanks[rankN]['action'] = 'contribute';
            }else{
                userRanks[rankN]['buttonUrl'] = ratePages[adguard.prefs.browser];
                userRanks[rankN]['action'] = 'rate';
            }
        }
        return userRanks[rankN];
    };
    var didUserRate = function(){
      return adguard.localStorage.getItem(userRatedProperty) || 0;
    };
    var updateUserRated = function(rated){
      adguard.localStorage.setItem(userRatedProperty, rated);
    };

    /**
     * Total count of blocked requests
     *
     * @returns Count of blocked requests
     */
    var getTotalBlocked = function () {
        var stats = pageStatsHolder.stats;
        if (!stats) {
            return 0;
        }
        return stats.totalBlocked || 0;
    };

    /**
     * Updates total count of blocked requests
     *
     * @param blocked Count of blocked requests
     */
    var updateTotalBlocked = function (blocked) {
        var stats = pageStatsHolder.stats;
        var rank = getUserRank();
        stats.totalBlocked = (stats.totalBlocked || 0) + blocked;
          var newRank = 0;
          for(var i = rank['rank']; i < userRanks.length; i++){
            newRank = i;
            if(stats.totalBlocked < userRanks[i]['rankAt']){
              newRank--;
              break;
            }
          }
          if(newRank > rank['rank'])
            updateUserRank(rank['rank']+1);
        pageStatsHolder.save();
/*
        updateUserRank(0);
        resetStats();
        adguard.localStorage.setItem(userRatedProperty, 0);
        adguard.localStorage.setItem(userShowBadgeAgain, 1);
        */
    };

    /**
     * Resets tab stats
     */
    var resetStats = function () {
        pageStatsHolder.clear();
    };

    return {
        setShowBadgeAgain: setShowBadgeAgain,
        getShowBadgeAgain: getShowBadgeAgain,
        updateUserRank: updateUserRank,
        getUserRank: getUserRank,
        didUserRate: didUserRate,
        updateUserRated: updateUserRated,
        resetStats: resetStats,
        updateTotalBlocked: updateTotalBlocked,
        getTotalBlocked: getTotalBlocked
    };

})(adguard);