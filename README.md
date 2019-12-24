# Messenger Preview
This *unofficial* extension has been created just for Chrome. I might modify it eventually
to work in other browsers, but I'm just testing in Chrome for now.

## Installation
See the [offering in Chrome webstore](https://chrome.google.com/webstore/detail/messenger-preview/cpimjhhigdjabaeklhlehfaghfeacibn).

## Usage
Write messages as normal. As you type, you should see a light message appear
about where it will appear when you send the message (when it actually sends,
your message might attach to the group above it). Sometimes, the preview
is a bit hidden, requiring you to scroll down within the chat.

As usual in Messenger chats, write

- `*bold*` for **bold**
- `_italics_` for _italics_
- `~strikethrough~` for ~~strikethrough~~
- `\(<math>\)` to display inline math using LaTeX, e.g. `\(\frac{1}{2}\)`
- `\[<math>\]` to display math that takes up the whole message. This may include
scrollbars and is useful for long chunks of math.
- `` `code` `` for `code`
- ```` ```code``` ```` for code that takes up a full message

- for code with syntax highlighting, use
````
```python
def f(a,b):
    return a + b
```
````

If necessary, press <kbd>ctrl</kbd>+<kbd>enter</kbd> to create a newline within
a message.

The math uses a subset of KaTeX, which is itself a subset of LaTeX. See the
[Katex Docs](https://katex.org/docs/supported.html) for supported functions.
Some functions only work within math that takes up the whole message
(`\[...\]`). If anything at all is wrong, none of the message will render as
math.

Clicking the three dots to the left of a message then "Show Original" will
remove all formatting from the message.

## Limitations
Messenger might make changes to the webpage at any time which breaks this
extension.

Right now, the code is searching in the webpage for some constants, such as
the text the user is typing. Additionally, it uses a MutationObserver to
determine when the user types and when the webpage is ready to hook onto.
Directly using existing code may increase the efficiency of these operations or
make them more reliable.

The extension only works in www.messenger.com, not the preview within
www.facebook.com.
