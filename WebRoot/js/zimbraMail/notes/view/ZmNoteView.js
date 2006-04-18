/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

function ZmNoteView(parent, appCtxt, controller) {
	DwtComposite.call(this, parent, "ZmNoteView", DwtControl.ABSOLUTE_STYLE);
	
	this._appCtxt = appCtxt;
	this._controller = controller;

	this._createHtml();	
	this._setMouseEventHdlrs(); // needed by object manager
	
	this._commentRe = /<!--.*?-->/g;
	this._transclusionRe = /(?=^|[^\\])\{\{\s*(.+?)\s*(?:\|\s*(.*?))?\s*\}\}/g;
	
}
ZmNoteView.prototype = new DwtComposite;
ZmNoteView.prototype.constructor = ZmNoteView;

ZmNoteView.prototype.toString =
function() {
	return "ZmNoteView";
};

// Data

ZmNoteView.prototype._appCtxt;
ZmNoteView.prototype._controller;

// Public methods

ZmNoteView.prototype.getController =
function() {
	return this._controller;
};

ZmNoteView.prototype.set =
function(note) {
	var element = this.getHtmlElement();
	if (!note) {
		element.innerHTML = "";
		return;
	}

	var cache = this._controller._app.getNoteCache();
	var chrome = cache.getNoteByName(note.folderId, ZmNotebook.PAGE_CHROME, true);
	var chromeContent = chrome.getContent();

	var content = chromeContent;
	if (note.name != ZmNotebook.PAGE_CHROME) {
		var pageContent = note.getContent();
		content = chromeContent.replace(/\{\{CONTENT\}\}/ig, pageContent);
	}
	content = ZmWikletProcessor.process(this._appCtxt, note, content);

	element.innerHTML = content;
	this._findObjects(element);
};

ZmNoteView.prototype.getTitle =
function() {
	var note = this.getSelection();
	return AjxStringUtil.xmlDecode(note.name);
};
ZmNoteView.prototype.getContent =
function() {
	return this.getHtmlElement().innerHTML;
};

ZmNoteView.prototype.getSelection =
function() {
	return this._controller.getNote();
};


ZmNoteView.prototype.addSelectionListener = function(listener) { /*TODO*/ };
ZmNoteView.prototype.addActionListener = function(listener) { /*TODO*/ };

// Protected methods

ZmNoteView.prototype._createHtml = function() {
	var element = this.getHtmlElement();
	Dwt.setScrollStyle(element, Dwt.SCROLL);
};

ZmNoteView.prototype._findObjects = function(element) {
	if (!this._objectMgr) {
		this._objectMgr = new ZmObjectManager(this, this._appCtxt);
		var handler = new ZmNoteKeywordObjectHandler(this._appCtxt);
		this._objectMgr.addHandler(handler, ZmNoteKeywordObjectHandler.TYPE, 20);
		this._objectMgr.sortHandlers();
	}
	this._objectMgr.reset();
	this._objectMgr.processHtmlNode(element, true);
};
