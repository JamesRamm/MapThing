/**
* MapThing DOM utilities
*
* Copyright (c) 2016 James Ramm
*/

const $ = jQuery = require('jQuery');
require('../vendors/jquery-ui-1.12.0.custom/jquery-ui.min.js');

const {dialog} = require('electron').remote;
require('bootstrap');
const bootbox = require('bootbox');
require("bootstrap-switch");
require('bootstrap-modal');
const Handlebars = require("handlebars/runtime");
require('./templates.js');
var mapCtrl = require('./map_control.js');
// Strange looking require path due to: https://github.com/plotly/plotly.js/issues/891
const Plotly = require('plotly.js/dist/plotly.js');

MTContainer = function()
{
    this._elements = [];
};


/**
 * Add a panel to the sidenav
 *
 * @example
 * sidenav.addPanel({
       title: 'My Awesome Panel'
 *     id: 'sb-awesome-panel',
 *     tab: '<i class="fa fa-fort-awesome"></i>',
 *     pane: someDomNode.innerHTML,
 *     position: 'bottom'
 * });
 *
 * @param {Object} [data] contains the data for the new Panel:
 * @param {String} [data.title] the title for the new panel
 * @param {String} [data.id] the ID for the new Panel, must be unique for the whole page
 * @param {HTMLString} {DOMnode} [data.content] content of the panel, as HTMLstring or DOM node
 * @param {String} [data.position='top'] where the tab will appear:
 *                                       on the top or the bottom of the sidenav. 'top' or 'bottom'
 * @param {HTMLString} {DOMnode} [data.tab]  content of the tab item, as HTMLstring or DOM node
 */
MTContainer.prototype.sidenavPanel = function(data)
{
    this._elements.push(data.id+"-panel");
    this._elements.push(data.id);

    data.pane = data.content
    data.title = data.title +'<div class="sidenav-close"><i class="fa fa-caret-left"></i></div>'
    MTDom._addsidenavPanel(data);
};

/**
 * Create a dialog. The dialog can be shown by calling `dialog("open")` on the returned element,
 * e.g.:
 *    var dialog  = pluginGui.dialog(data);
 *    dialog.dialog("open");
 *
 *  @param {bool} [data.modal] If true, the dialog will be modal
 *  @param {string} [data.id] Id of the modal
 *  @param {string} [data.title] Title of the modal window
 *  @param {HTMLString} {DOMNode} [data.content] Content of the modal body
 */
MTContainer.prototype.dialog = function(data)
{
    // Check the modal doesnt already exist on the DOM and remove if so
    $("#"+data.id).remove();    

    var dlg = $('<div />').attr('id', data.id);

    dlg.innerHtml = data.content;

    // Make it a dialog
    dlg.dialog({
        autoOpen: false,
        modal: data.modal,
        show: true,
        title: data.title

    });

    // Record the modal id in the elements to remove on plugin exit
    this._elements.push(data.id);
    return dlg;
};

/**
 * Create a chart dialog. The dialog can be shown by calling `dialog("open")` on the return element,
 * e.g.:
 *    var mymodal  = container.chartDialog(data);
 *    mymodal.dialog("open");
 *
 *  @param {bool} [data.modal] If true, the dialog will be modal
 *  @param {string} [data.id] Id of the modal
 *  @param {string} [data.title] Title of the modal window
 *  @param {object} [data.chartData] Chart data
 * @param {object} [data.chartLayout] Chart layout
 */
MTContainer.prototype.chartDialog = function(data)
{
    var chartId = data.id+"-chart";
    data.body = "<div id='"+chartId+"'></div>";
    var mod = this.modal(data);

    Plotly.newPlot(chartId, data.chartData, data.chartLayout, {showLink: false, displaylogo: false});
    return mod;

};

MTContainer.prototype.close = function()
{
    for (var i = 0; i < this._elements.length; i++)
    {
        $('#'+this._elements[i]).remove();
    }
};

MTDom = {
    showMessage: function(msg, title){
        bootbox.dialog({ message: msg,
                         title: title,
                         buttons: {main: {label: "Ok",
                               className: "btn-primary"}}
                       });
    },

    _makesidenavPanel: function(title, id)
    {
        var panel = $("<div>", {
                                class: "sidenav-pane",
                                id: id
                              });

        var header = $("<h1>",
                        {
                           class: "sidenav-header",
                           html: title+' <div class="sidenav-close"><i class="fa fa-caret-left"></i></div>'
                        });

        panel.append(header);
        return panel;

    },

    _addsidenavPanel: function(data){
        mapCtrl.getMapCtrl().sidenav.addPanel(data);
    },

    hidesidenav: function(){
        $('#sidenav').hide();
    },

    showsidenav: function(){
        $('#sidenav').show();
    },

    prepareMapForPrint: function(){
        this.hidesidenav();
        var mc = mapCtrl.getMapCtrl();
        mc.zoomControl.remove();
        mc.searchControl.remove();
    },

    resetMapAfterPrint: function(){
        this.showsidenav();
        var mc = MTgetMap();
        mc.zoomControl.addTo(mc._map);
        mc.searchControl.addTo(mc._map);
    },

    showLoading: function(selector){
        $(selector).LoadingOverlay("show");
    },

    hideLoading: function(selector){
        $(selector).LoadingOverlay("hide");
    },

    /**
    * Adds a button to the 'plugin' sidenav with the name of this plugin
    */
    addPluginLauncher: function(pluginName, setupFunc, description){
        // Create an id for the launcher button
        var id = pluginName + 'launch';

        // Create the button
        var button = $('<input/>').attr({ type: 'checkbox', id: id, name: id, "data-label-text":pluginName})
        $("#plugin-launchers").append(button);

        $("#"+id).bootstrapSwitch();
        $("#"+id).on('switchChange.bootstrapSwitch', function(event, state){setupFunc(state);});
        $(".bootstrap-switch-id-"+id).tooltip({
                           placement: 'right',
                           title: description
                       });
    },

    addFileOpenForm: function(id, callback)
    {
        var btnId = id+'-open-file-btn';
        var spanId = id+'-file-path-span';
        // form for file input
        var form = $('<form/>', {
              class: 'csv-form'
          });

        // The form group div contains the file browser button
        var fgrp = $('<div/>', {class: 'form-group'});
        var label = $('<label/>', {for: btnId, text: 'Load file'});
        var input = $('<div/>', {class: 'input-group'});
        var brwsSpan = $('<span/>', {class: 'input-group-btn'});
        var brwsBtn = $('<button/>', {class: 'btn btn-default',
                        type: 'button',
                        id: btnId,
                        text: 'Browse...',
                        click: function(){
                            dialog.showOpenDialog({properties: ['openFile']}, callback);
                        }});

        var pthSpan = $('<span/>', {class: 'form-control',
                                    id: spanId});

        brwsSpan.append(brwsBtn);
        input.append(brwsSpan);
        input.append(pthSpan);
        fgrp.append(label);
        fgrp.append(input);
        form.append(fgrp);

        return form;


    },

    /*
    * Open a file browser dialog when the given buttinId is clicked
    */
    addFileOpenHandler: function(buttonId, callback){
        $('#'+buttonId).click(function(){
            // TODO - complete!
            dialog.showOpenDialog({properties: ['openFile']}, callback);

        });

    }
};

module.exports.MTDom = MTDom;
module.exports.MTContainer = MTContainer;
