/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2008, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

ZmNewTagDialog = function(parent, className) {
	ZmDialog.call(this, {parent:parent, className:className, title:ZmMsg.createNewTag});

	this._setNameField(this._htmlElId+"_name");
	this._setTagColorMenu();
	this._setAccountMenu();
	DBG.timePt("set content");
};

ZmNewTagDialog.prototype = new ZmDialog;
ZmNewTagDialog.prototype.constructor = ZmNewTagDialog;

ZmNewTagDialog.prototype.toString = 
function() {
	return "ZmNewTagDialog";
};

ZmNewTagDialog.prototype.popup =
function(org, account) {
	if (this._accountSelect) {
		var acct = account || appCtxt.getActiveAccount();
		this._accountSelect.setSelectedValue(acct.id);
	}

	ZmDialog.prototype.popup.call(this);
};

ZmNewTagDialog.prototype.cleanup =
function(bPoppedUp) {
	DwtDialog.prototype.cleanup.call(this, bPoppedUp);
	var color = this._getNextColor();
	this._setColorButton(color, ZmOrganizer.COLOR_TEXT[color], ZmTag.COLOR_ICON[color]);
};

ZmNewTagDialog.prototype._colorListener = 
function(ev) {
	var color = ev.item.getData(ZmOperation.MENUITEM_ID);
	this._setColorButton(color, ZmOrganizer.COLOR_TEXT[color], ZmTag.COLOR_ICON[color]);
};

ZmNewTagDialog.prototype._setTagColorMenu =
function() {
	var fieldId = this._htmlElId + "_tagColor";
	this._colorButton = new DwtButton({parent:this, parentElement:fieldId, id:"ZmTagColorMenu"});
	this._colorButton.noMenuBar = true;

	ZmOperation.addColorMenu(this._colorButton);

	var color = ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.TAG];
	this._setColorButton(color, ZmOrganizer.COLOR_TEXT[color], ZmTag.COLOR_ICON[color]);

	this._tagColorListener = new AjxListener(this, this._colorListener);
	var items = this._colorButton.getMenu().getItems();
	for (var i = 0; i < items.length; i++) {
		items[i].addSelectionListener(this._tagColorListener);
	}
};

ZmNewTagDialog.prototype._setAccountMenu =
function() {
	if (!appCtxt.multiAccounts) { return; }

	var fieldId = this._htmlElId + "_account";
	this._accountSelect = new DwtSelect({parent:this, parentElement:fieldId});

	var accounts = appCtxt.accountList.visibleAccounts;
	for (var i = 0; i < accounts.length; i++) {
		var acct = accounts[i];
		if (appCtxt.get(ZmSetting.TAGGING_ENABLED, null, acct)) {
			var o = new DwtSelectOption(acct.id, null, acct.getDisplayName(), null, null, acct.getIcon());
			this._accountSelect.addOption(o);
		}
	}
};

ZmNewTagDialog.prototype._setColorButton =
function(color, text, image) {
	this._colorButton.setData(ZmOperation.MENUITEM_ID, color);
	this._colorButton.setText(text);
	this._colorButton.setImage(image);
};

ZmNewTagDialog.prototype._contentHtml = 
function() {
	return AjxTemplate.expand("share.Dialogs#ZmPromptDialog", {id:this._htmlElId});
};

ZmNewTagDialog.prototype._okButtonListener =
function(ev) {
	var results = this._getTagData();
	if (results) {
		DwtDialog.prototype._buttonListener.call(this, ev, results);
	}
};

ZmNewTagDialog.prototype._getTagData =
function() {
	var acctId = this._accountSelect && this._accountSelect.getValue();
	var account = acctId && appCtxt.accountList.getAccount(acctId);

	// check name for presence and validity
	var name = AjxStringUtil.trim(this._nameField.value);
	var msg = ZmTag.checkName(name);

	// make sure tag doesn't already exist
	var tagTree = appCtxt.getTagTree(account);
	if (!msg && tagTree && tagTree.getByName(name)) {
		msg = ZmMsg.tagNameExists;
	}

	return (msg)
		? this._showError(msg)
		: {name:name, color:this._colorButton.getData(ZmOperation.MENUITEM_ID), accountName:(account && account.name)};
};

ZmNewTagDialog.prototype._enterListener =
function(ev) {
	var results = this._getTagData();
	if (results) {
		this._runEnterCallback(results);
	}
};

ZmNewTagDialog.prototype._getNextColor =
function() {
	var colorUsed = {};
	var tagTree = appCtxt.getTagTree();
	if (!tagTree) {
		return ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.TAG];
	}

	var tags = tagTree.root.children.getArray();
	if (!(tags && tags.length)) {
		return ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.TAG];
	}

	for (var i = 0; i < tags.length; i++) {
		colorUsed[tags[i].color] = true;
	}
	for (var i = 0; i < ZmTagTree.COLOR_LIST.length; i++) {
		var color = ZmTagTree.COLOR_LIST[i];
		if (!colorUsed[color]) {
			return color;
		}
	}

	return ZmOrganizer.DEFAULT_COLOR[ZmOrganizer.TAG];
};

ZmNewTagDialog.prototype._getTabGroupMembers =
function() {
	return [this._nameField, this._colorButton];
};
