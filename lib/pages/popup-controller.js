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

/* global $, i18n, popupPage */

/**
 * Controller that manages add-on popup window
 */
var PopupController = function () {
};

PopupController.prototype = {
      createShareLink: function(network, blockedCount)
      {
        var shareURL = "https://adblockultimate.net/";
        var messageMark = {};
        shareLinks = {
        facebook: ["https://www.facebook.com/dialog/feed", {
          app_id: "759703234176582",
          link: shareURL,
          redirect_uri: "https://www.facebook.com/",
          ref: "adcounter",
          name: messageMark,
          actions: JSON.stringify([
            {
              name: 'Download AdBlocker Ultimate',
              link: shareURL
            }
          ])
        }],
        gplus: ["https://plus.google.com/share", {
          url: shareURL
        }],
        twitter: ["https://twitter.com/intent/tweet", {
          text: messageMark,
          url: shareURL,
          via: "AdBlockUltimate"
        }]
      };
        var url = shareLinks[network][0];
        var params = shareLinks[network][1];

        var querystring = [];
        for (var key in params)
        {
          var value = params[key];
          if (value == messageMark){
            if(blockedCount > 0)
              value = 'I blocked '+blockedCount+' ads and trackers thanks to AdBlocker Ultimate.';
            else
              value = 'AdBlocker Ultimate - And all annoying ads are OUT!';
          }
          querystring.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
        }
        return url + "?" + querystring.join("&");
      },
    /**
     * Renders popup using specified model object
     * @param tabInfo
     * @param options
     */
    render: function (tabInfo, options) {
        this.tabInfo = tabInfo;
        this.options = options || {};

        //render
        this._renderPopup(tabInfo);

        // Bind actions
        this._bindActions();
        this._initFeedback();

        this.afterRender();
    },
    /*
    setLogo: function(logo){
        $('#logo').attr('src', logo);
    },
    */
    setBadgeNumberCb: function(state){
        $('#show-iconnumber').attr('aria-checked', state);
    },
    resizePopupWindow: function () {
        var $widjet = $('body>div:not(.hidden)');
        var width = $widjet.outerWidth();
        var height = $widjet.outerHeight();
        popupPage.resizePopup(width, height);
    },  

    afterRender: function () {

    },

    addWhiteListDomain: function (url) {
        popupPage.sendMessage({type: 'addWhiteListDomainPopup', url: url});
    },

    removeWhiteListDomain: function (url) {
        popupPage.sendMessage({type: 'removeWhiteListDomainPopup', url: url});
    },

    changeApplicationFilteringDisabled: function (disabled) {
        popupPage.sendMessage({type: 'changeApplicationFilteringDisabled', disabled: disabled});
    },

    sendFeedback: function (url, topic, comment) {
        popupPage.sendMessage({type: 'sendFeedback', url: url, topic: topic, comment: comment});
    },

    openSiteReportTab: function (url) {
        popupPage.sendMessage({type: 'openSiteReportTab', url: url});
    },

    openSettingsTab: function () {
        popupPage.sendMessage({type: 'openSettingsTab'});
    },
    changeShowPageStatistic: function(show){
        popupPage.sendMessage({type: 'changeShowPageStatistic', show: show});
        //UI.changeShowPageStatistic(show);
    },
    showPageStatistic: function(){
        popupPage.sendMessage({type: 'showPageStatistic'}, function(response){
             if(typeof response != 'undefined'){
                $('#show-iconnumber').attr('aria-checked', response ? 'true':'false'); 
            }
        });
    },
    openAssistantInTab: function () {
        popupPage.sendMessage({type: 'openAssistant'});
    },

    openFilteringLog: function (tabId) {
        popupPage.sendMessage({type: 'openFilteringLog', tabId: tabId});
    },

    resetBlockedAdsCount: function () {
        popupPage.sendMessage({type: 'resetBlockedAdsCount'});
    },
    getUserRank: function(){
        popupPage.sendMessage({type: 'getUserRank'}, function(response){
            if(typeof response != 'undefined'){
                $('#logo').attr('src', response['logo']);
                //this.setLogo(response['logo']);
            }
        });
    },
    openLink: function (url) {
        popupPage.sendMessage({type: 'openTab', url: url});
    },
    formatNumber: function(v) {
        return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },
    _renderPopup: function (tabInfo) {
        this.getUserRank();
        /*
        var rank = this.getUserRank();
        if(rank){
            this.setLogo(rank['logo']);
        }
        */
        $('#stats-page strong').html(this.formatNumber(tabInfo.totalBlockedTab || 0));
        $('#stats-total strong').html(this.formatNumber(tabInfo.totalBlocked || 0));
        $('#donate').on('mouseover', function(){
            $('#heart-image').attr('src', 'skin/heart-icon.png');
        });
        $('#donate').on('mouseout', function(){
            $('#heart-image').attr('src', 'skin/heart-icon-active.png');
        });

        if(tabInfo.documentWhiteListed){
            $('body').addClass('disabled');
        }else{
            $('body').removeClass('disabled');
        }

        if(tabInfo.urlFilteringDisabled){
            $('#enabled').hide();
            $('#stats-page').hide();
            $('#clickhide').hide();
        }else{
            $('#enabled').show();
            $('#stats-page').show();
            if($('body').hasClass('disabled')){
                $('#clickhide').hide();
            }else{
                $('#clickhide').show();
            }
        }
        this.showPageStatistic();

        var parent = $('.widjet-popup');
        parent.empty();

        //top block
        this.siteStatsTemplate = this._getTemplate('page-stats-template');
        this.adguardDetectedMessageTemplate = this._getTemplate('adguard-detected-message-template');
        this.siteFilteringDisabledMessageTemplate = this._getTemplate('site-filtering-disabled-message-template');
        this.siteProtectionDisabledMessageTemplate = this._getTemplate('site-protection-disabled-message-template');

        //middle block
        this.siteFilteringExceptionMessageTemplate = this._getTemplate('site-filtering-exception-message-template');
        this.siteFilteringStateTemplate = this._getTemplate('site-filtering-checkbox-template');

        //actions block
        this.assistantTemplate = this._getTemplate('open-assistant-template');
        this.abuseTemplate = this._getTemplate('open-abuse-template');
        this.siteReportTemplate = this._getTemplate('site-report-template');
        this.settingsTemplate = this._getTemplate('open-settings-template');
        this.protectionDisabledTemplate = this._getTemplate('protection-disabled-template');
        this.protectionEnabledTemplate = this._getTemplate('protection-enabled-template');

        //footer
        this.footerTemplate = this._getTemplate('popup-footer-template');
        this.footerIntegrationTemplate = this._getTemplate('popup-footer-integration-template');

        //render
        this._renderTopMessageBlock(parent, tabInfo);
        this._renderSiteExceptionBlock(parent, tabInfo);
        this._renderFilteringCheckboxBlock(parent, tabInfo);
        this._renderActionsBlock(parent, tabInfo);
        this._renderFooter(parent, tabInfo);
    },

    _getTemplate: function (id) {
        return $('#' + id).children().clone();
    },

    _renderTopMessageBlock: function (parent, tabInfo) {

        function formatNumber(v) {
            return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }

        var template;
        if (tabInfo.adguardDetected) {
            template = this.adguardDetectedMessageTemplate;
            if (tabInfo.adguardProductName) {
                i18n.translateElement(template.children()[0], 'popup_ads_has_been_removed_by_adguard', [tabInfo.adguardProductName]);
            } else {
                i18n.translateElement(template.children()[0], 'popup_ads_has_been_removed');
            }
        } else if (tabInfo.applicationFilteringDisabled) {
            template = this.siteProtectionDisabledMessageTemplate;
        } else if (tabInfo.urlFilteringDisabled) {
            template = this.siteFilteringDisabledMessageTemplate;
        } else if (this.options.showStatsSupported) {
            template = this.siteStatsTemplate;
            var titleBlocked = template.find('.w-popup-filter-title-blocked');
            i18n.translateElement(titleBlocked[0], 'popup_tab_blocked', [formatNumber(tabInfo.totalBlockedTab || 0)]);
            i18n.translateElement(template.find('.w-popup-filter-title-blocked-all')[0], 'popup_tab_blocked_all', [formatNumber(tabInfo.totalBlocked || 0)]);
            if (tabInfo.totalBlocked >= 10000000) {
                titleBlocked.closest('.widjet-popup-filter').addClass('db');
            } else {
                titleBlocked.closest('.widjet-popup-filter').removeClass('db');
            }
        }
        parent.append(template);
    },

    _renderSiteExceptionBlock: function (parent, tabInfo) {

        if (tabInfo.urlFilteringDisabled || tabInfo.applicationFilteringDisabled) {
            return;
        }

        var template;
        if (tabInfo.documentWhiteListed && !tabInfo.userWhiteListed) {
            template = this.siteFilteringExceptionMessageTemplate;
        }

        if (template) {
            parent.append(template);
        }
    },

    _renderFilteringCheckboxBlock: function (parent, tabInfo) {

        if (tabInfo.urlFilteringDisabled || tabInfo.applicationFilteringDisabled) {
            return;
        }

        var template = this.siteFilteringStateTemplate;
        var checkbox = template.find('#siteFilteringDisabledCheckbox');
        if (tabInfo.canAddRemoveRule) {
            if (tabInfo.documentWhiteListed) {
                checkbox.removeAttr('checked');
            } else {
                checkbox.attr('checked', 'checked');
            }
            checkbox.toggleCheckbox();
            parent.append(template);
        }
    },

    _renderActionsBlock: function (parent, tabInfo) {

        var el = $('<nav>', {class: 'widjet-popup-menu'});

        if (!tabInfo.adguardDetected && !tabInfo.urlFilteringDisabled) {
            if (tabInfo.applicationFilteringDisabled) {
                el.append(this.protectionDisabledTemplate);
            } else {
                el.append(this.protectionEnabledTemplate);
            }
        }

        if (!tabInfo.urlFilteringDisabled) {
            el.append(this.assistantTemplate);
            if (tabInfo.applicationFilteringDisabled || tabInfo.documentWhiteListed) {
                //may be show later
                this.assistantTemplate.hide();
            }
        }

        if (!tabInfo.urlFilteringDisabled) {
            el.append(this.abuseTemplate);
        }

        if (!tabInfo.urlFilteringDisabled && !tabInfo.applicationFilteringDisabled) {
            el.append(this.siteReportTemplate);
        }

        if (!tabInfo.adguardDetected) {
            el.append(this.settingsTemplate);
        }

        parent.append(el);
    },

    _renderFooter: function (parent, tabInfo) {
        if (tabInfo.adguardDetected) {
            parent.append(this.footerIntegrationTemplate);
        } else {
            parent.append(this.footerTemplate);
        }
    },

    _bindActions: function () {
        //var parent = $('.widjet-popup');
        var parent = $('body');

        if (this.actionsBind === true) {
            return;
        }
        this.actionsBind = true;

        parent.on('click', '#options', function (e) {
            e.preventDefault();
            self.openSettingsTab();
        });
        parent.on('click', '#clickhide', function (e) {
            e.preventDefault();
            self.openAssistantInTab();
        });
        parent.on('click', '#share-box div', function(){
            url = self.createShareLink($(this).attr('data-social'), self.formatNumber(self.tabInfo.totalBlocked || 0));
            self.openLink(url);
        });
        $('#show-iconnumber').parent().on('click', function(){
            isActive = !($('#show-iconnumber').attr('aria-checked') == 'false');
            $('#show-iconnumber').attr('aria-checked', isActive ? 'false' : 'true');
            console.log('isActive', isActive);
            self.changeShowPageStatistic(!isActive);
        });
        
        var self = this;
        parent.on('click', '.siteReport', function (e) {
            e.preventDefault();
            self.openSiteReportTab(self.tabInfo.url);
            popupPage.closePopup();
        });
        parent.on('click', '.openSettings', function (e) {
            e.preventDefault();
            self.openSettingsTab();
            popupPage.closePopup();
        });
        parent.on('click', '.openAssistant', function (e) {
            e.preventDefault();
            self.openAssistantInTab();
            popupPage.closePopup();
        });
        parent.on('click', '.openFilteringLog', function (e) {
            e.preventDefault();
            self.openFilteringLog();
            popupPage.closePopup();
        });
        parent.on('click', '.resetStats', function (e) {
            e.preventDefault();
            self.resetBlockedAdsCount();
            parent.find('.w-popup-filter-title-blocked-all').text('0');
        });
        parent.on('click', '.openLink', function (e) {
            e.preventDefault();
            self.openLink(e.currentTarget.href);
            popupPage.closePopup();
        });

        //checkbox
        parent.on('change', '#siteFilteringDisabledCheckbox', function () {
            var tabInfo = self.tabInfo;
            var isWhiteListed = !this.checked;
            if (isWhiteListed) {
                self.addWhiteListDomain(tabInfo.url);
            } else {
                self.removeWhiteListDomain(tabInfo.url);
            }
            tabInfo.documentWhiteListed = isWhiteListed;
            tabInfo.userWhiteListed = isWhiteListed;
            if (isWhiteListed) {
                self.assistantTemplate.hide();
            } else {
                self.assistantTemplate.show();
            }
            self.resizePopupWindow();

            if (tabInfo.adguardDetected) {
                popupPage.closePopup();
            }
        });

        parent.on('click', '#enabled', function(){
            $('body').toggleClass('disabled');

            var tabInfo = self.tabInfo;
            var isWhiteListed = $('body').hasClass('disabled');
            if (isWhiteListed) {
                self.addWhiteListDomain(tabInfo.url);
                $('#clickhide').hide();
            } else {
                self.removeWhiteListDomain(tabInfo.url);
                $('#clickhide').show();
            }
            tabInfo.documentWhiteListed = isWhiteListed;
            tabInfo.userWhiteListed = isWhiteListed;
            self.resizePopupWindow();
        });

        parent.on('click', '.collapse', function (e) {
            $(this).parent().toggleClass('collapsed');
            self.resizePopupWindow();
        });

        parent.on('click', '#donate', function(){
            self.openLink('https://adblockultimate.net/donate.html');
        });

        //pause/unpause protection
        parent.on('click', '.changeProtectionState', function (e) {

            e.preventDefault();

            var tabInfo = self.tabInfo;

            var disabled = !tabInfo.applicationFilteringDisabled;
            self.changeApplicationFilteringDisabled(disabled);

            tabInfo.applicationFilteringDisabled = disabled;
            self._renderPopup(tabInfo);
            self.resizePopupWindow();
        });
    },

    _initFeedback: function () {

        if (this.feedbackBind === true) {
            return;
        }
        this.feedbackBind = true;

        var parent = $('.widjet-popup');
        var feedbackModal = $('.modal-feedback');

        var self = this;
        var feedbackErrorMessage = $('#feedbackErrorMessage');

        function sendFeedback() {
            var topic = selectorText.data('abuseOption');
            if (!topic) {
                feedbackErrorMessage.addClass('show');
                return;
            }
            var comment = selectorComment.val();
            self.sendFeedback(self.tabInfo.url, topic, comment);
            closeFeedback();
            selectorComment.val('');
        }

        function closeFeedback() {
            feedbackModal.addClass('hidden');
            parent.removeClass('hidden');
            selectorText.data('abuseOption', '');
            i18n.translateElement(selectorText[0], 'popup_feedback_empty_option');
            feedbackErrorMessage.removeClass('show');
            self.resizePopupWindow();
        }

        parent.on('click', '.openAbuse', function (e) {
            e.preventDefault();
            parent.addClass('hidden');
            feedbackModal.removeClass('hidden');
            self.resizePopupWindow();
        });

        feedbackModal.on('click', '#cancelFeedback', function (e) {
            e.preventDefault();
            closeFeedback();
        });
        feedbackModal.on('click', '#sendFeedback', function (e) {
            e.preventDefault();
            sendFeedback();
        });

        var selectorText = $('.m-feedback-inner-text');
        var selectorDropdown = $('.modal-feedback-dropdown');
        var selectorComment = $('.modal-feedback-message textarea');
        feedbackModal.on('click', '.modal-feedback-inner', function (e) {
            e.preventDefault();
            selectorDropdown.toggleClass('hidden');
            e.stopPropagation();
        });
        //clickoff
        $(document).click(function () {
            selectorDropdown.addClass('hidden');
        });
        feedbackModal.on('click', '.m-feedback-dropdown-item', function (e) {
            e.preventDefault();
            var text = $(this).text();
            selectorText.text(text);
            selectorText.data('abuseOption', $(this).attr('item-data'));
            selectorDropdown.addClass('hidden');
            feedbackErrorMessage.removeClass('show');
        });
    },

    // http://jira.performix.ru/browse/AG-3474
    resizePopupWindowForMacOs: function () {
        var options = this.options;
        if (options.isSafariBrowser || options.isFirefoxBrowser || !options.isMacOs) {
            return;
        }
        setTimeout(function () {
            var block = $(".macoshackresize");
            block.css("padding-top", "23px");
        }, 1000);
    }
};

(function () {

    /**
     * TODO: check the following EDGE issue
     * https://github.com/AdguardTeam/AdguardBrowserExtension/issues/551
     * MS Edge unexpectedly crashes on opening the popup.
     * We do not quite understand the reason for this behavior, but we assume it happens due to code flow execution and changing the DOM.
     * setTimeout allows us to resolve this "race condition".
     */

    var controller = new PopupController();
    controller.afterRender = function () {
        // Add some delay for show popup size properly
        // https://github.com/AdguardTeam/AdguardBrowserExtension/issues/505
        var timeout = controller.options.isSafariBrowser ? 150 : 10;
        setTimeout(function () {
            controller.resizePopupWindow();
            controller.resizePopupWindowForMacOs();
        }, timeout);
    };

    document.addEventListener('resizePopup', function () {
        controller.resizePopupWindow();
    });

    popupPage.sendMessage({type: 'getTabInfoForPopup'}, function (message) {
        $(document).ready(function () {
            controller.render(message.frameInfo, message.options);
        });
    });

})();
