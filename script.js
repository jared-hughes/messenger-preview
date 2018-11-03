/* CONFIG ******************/
let isFromViewer = true;
// opacity of the preview element
let previewOpacity = 0.7;
// change minDelay to restrict refresh rate
let minDelay = 0;
/* End Config **************/

let changeable = true;
let pendingChanges = false;
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
	require("ReactDOM").render(e, element);
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
  let text = getInputElement().innerText;
  // sometimes .innerText just gives whitespace and would give a blank bubble
  if (text.match(/^\s*$/)) {
    return "";
  }
  return text;
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

function getAuthor() {
  // being accurate allows for the right profile image when isFromViewer = false
	return "fbid:0";
}

function getThreadID() {
  // allows for the three dots/more options menu per message
	return "fbid:0";
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
	if (!previewElement || previewElement.clientHeight == 0) {
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
	};
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
