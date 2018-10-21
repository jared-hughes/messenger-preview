/* CONFIG ******************/
let isFromViewer = true;
// opacity of the preview element
let previewOpacity = 0.7;
// change minDelay to restrict refresh rate
let minDelay = 0;
/* End Config **************/

let changeable = true;
let pendingChanges = false;
let timestamp;
let previewElement;

createPreviewElement();
let observer = new MutationObserver(function (mutations) {
	if (getInputElement()) {
		setup();
		observer.disconnect();
	}
});

observer.observe(document, {
	childList: true,
	subtree: true,
	characterData: true
});

// stop typing --> stop reshowing
// typing continuously --> reshow every minDelay ms
function canChangeNow() {
	if (pendingChanges) {
		reShow();
		pendingChanges = false;
	}
	changeable = true;
}

function change() {
	if (changeable) {
		changeable = false;
		reShow();
		setTimeout(canChangeNow, minDelay);
	} else {
		pendingChanges = true;
	}
}

function preview(info, element) {
  let e = require("React").createElement(require("MessengerMessageGroup.react"), {
		author: info.author,
		isFromViewer: isFromViewer,
		messages: require("immutable").List([{
			author: info.author,
			body: info.message,
			message_id: "mid.preview",
			// thread_id necessary for "Show Original" working and "Delete" not crashing the whole page
			thread_id: info.threadid,
			timestamp: info.timestamp
		}]),
		readReceipts: require("immutable").OrderedMap(),
	});
	require("ReactDOM").render(e, element)
}

function insertAfter(newNode, existingNode) {
	existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function createPreviewElement() {
	previewElement = document.createElement("div");
	previewElement.style.opacity = previewOpacity;
}

function getInputElement() {
	return document.querySelector("[aria-label=\"New message\"] [role=combobox]");
}

function getText() {
	return getInputElement().innerText.slice(0, -1);
}

function isAttached(el) {
	if (el.parentNode == document) {
		return true;
	} else if (el.parentNode == null) {
		return false;
	} else {
		return isAttached(el.parentNode);
	}
}

function reflow(element) {
	element.style.display = 'none';
	element.style.display = 'block';
}

function removeElement(element) {
	if (element.parentNode) {
		element.parentNode.removeChild(element);
	}
}

function biggest(elements) {
	// get the longest element, measured by innerHTML
	return Array.from(elements).reduce((a, b) => a.innerHTML.length < b.innerHTML.length ? b : a);
}

function isSelfMessage(message) {
	// if parentNode is document or null, return false
	if (message.parentNode == document || message.parentNode == null) {
		return false;
	} else if (message.getElementsByTagName("h5") !== null) {
		// if message has an h5, then return true iff message.parentNode has only one child
		return message.parentNode.childElementCount === 1;
	} else {
		// otherwise return recurse on parent node
		return isSelfMessage(message.parentNode);
	}
	// the reasoning behind this is that the image specifying sender occurs as a
	// sibling of an element with h5 as a child only if message is sent by someone else
}

function getAuthor() {
	let selfMessage = document.querySelector("[data-tooltip-position=right][attachments]");
	if (selfMessage === null) {
		// tooltip might point up
		for (let message of document.querySelectorAll("[attachments]")) {
			if (isSelfMessage(message)) {
				selfMessage = message;
				break;
			}
		}
	}
	if (selfMessage === null) {
		console.warn("You have not sent any messages in this conversation");
		return "fbid:0";
	} else {
		let participants = selfMessage.getAttribute("participants");
		return participants.match(/fbid:\d+/)[0];
	}
}

function getThreadID() {
	let anyMessage = document.querySelector("[attachments]");
	if (anyMessage === null) {
		console.warn("No one has sent any messages in this conversation");
		return window.location.href.match(/\/([^/]*)$/)[1]; //extract from URL
	} else {
		return anyMessage.getAttribute("threadid");
	}
}

function getMessageList() {
	let messages = document.querySelector("div[aria-label=Messages]");
	return biggest(messages.children);
}

function reShow() {
	let messageList = getMessageList();
	// delete and create to allow for language-specific code formatting
	removeElement(previewElement);
	previewElement = null;
	createPreviewElement();
	insertAfter(previewElement, messageList);

	preview({
		message: getText(),
		author: getAuthor(),
		timestamp: new Date().getTime(),
		threadid: getThreadID(),
		isFromViewer: isFromViewer
	}, previewElement);
	// an empty element messes through margin/padding
	let msg = previewElement.querySelector("[attachments]");
	if (!previewElement || previewElement.clientHeight == 0 || !msg || msg.clientHeight == 0) {
		removeElement(previewElement);
	}
	reflow(previewElement);
}

function setup() {
	let observer = new MutationObserver(change);
	let config = {
		subtree: true,
		// backspace deletes the old and creates a new text entry node
		childList: true,
		// positive typing edits the existing node
		characterData: true
	}
	let targetNode = getInputElement();
	observer.observe(targetNode, config);

	// deal with the input element being replaced when changing users
	let documentObserver = new MutationObserver(function (mutations) {
		if (!isAttached(targetNode)) {
			observer.disconnect();
			if (getInputElement()) {
				documentObserver.disconnect();
				setup();
			}
		}
	});
	documentObserver.observe(document, {
		subtree: true,
		childList: true
	});
}
