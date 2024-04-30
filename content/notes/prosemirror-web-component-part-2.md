Date: 22 April 2024

# ProseMirror Web Component Part 2

In the [first part of this series](https://mishareyzlin.com/notes/prose-mirror-web-component-step-1), we have set up import maps for ProseMirror packages to enable build-less development for our web component.

In the part two, we’ll wrap a minimal prosemirror editor in a custom element. We’ll be using our editor like this:

	<prosemirror-editor
	  change-event="custom-change-event-name"
	  html="
	    <p>Lorem ipsum dolor sit amet, <a href='/this'>consectetur</a> adipiscing elit. Etiam efficitur, diam eu hendrerit dapibus, turpis lorem convallis felis, nec volutpat elit enim nec orci. Aliquam eget cursus nulla. Maecenas quis mauris turpis. Nullam id faucibus ex. Nulla cursus velit nibh, sit amet maximus dolor pulvinar non. Quisque ut efficitur odio. Phasellus vitae justo a purus semper imperdiet.</p>
	    <p>Nunc <a href='/this'>cursus</a>, odio nec egestas eleifend, dui enim porttitor dui, quis bibendum arcu felis eget ante. Donec vulputate massa velit, nec tempus dolor pulvinar non. Sed ultrices velit et tempus fermentum. Morbi interdum id est sit amet efficitur. Suspendisse venenatis in augue nec commodo. Ut vehicula eros vitae leo commodo cursus. Mauris viverra sodales massa, a bibendum nisl malesuada ultrices. Morbi pulvinar urna nec justo pharetra eleifend. Nunc aliquet diam malesuada dui placerat venenatis. Sed at libero rutrum, aliquam turpis eget, imperdiet nisl.</p>
		"
	>
	</prosemirror-editor>
	<script>
    document.querySelector("prosemirror-editor").addEventListener("custom-change-event-name", (e) => {
	    console.log(e.detail.html);
	    console.log(e.detail.json);
	  });
	</script>

Prosemirror is a library to create a rich editing experience.  It provides concepts and tools that allow to build a robust editor with only the features you need, fully customisable to your specific needs. I recommend reading through the Prosemirror guide [here](https://prosemirror.net/docs/guide/). It touches on everything this library has to offer and provides a lot of examples. My series explores an example integration of this library with HTML Custom Element API, which I think is a perfect match to build a self-contained wrapper around the specific editor setup you might need to build.

## Schema

To keep things simple, in the beginning our editor will only allow editing paragraphs of text and links. We’ll start by creating a basic schema:

	import { Schema } from "prosemirror-model";

	const schema = new Schema({
		nodes: {
			doc: { content: "block+" },
			paragraph: {
				content: "text*",
				group: "block",
				parseDOM: [{ tag: "p" }],
				toDOM() { return ["p", 0]; }
			},
			text: { group: "inline" }
		},
		marks: {
			link: {
				attrs: {
					href: {}
				},
				// By default, marks are inclusive, meaning that they
				// get applied to content inserted at their end (as well
				// as at their start when they start at the start 
				// of their parent node)
				inclusive: false,
				parseDOM: [{ tag: "a[href]", getAttrs(dom) {
					return { href: dom.getAttribute("href"), title: dom.getAttribute("title") };
				}}],
				toDOM(node) { return ["a", node.attrs, 0]; }
			}
		}
	});

Here, `doc` is a required root level node, `paragraph` and `text` are self-explanatory and link is not a node, but a “`mark`” - marks represent inline formatting or annotations that can apply to a range of text. 

For `content` property, the star (`*`) and plus (`+`) characters are used in the schema definitions to specify the cardinality of nodes, that is, how many times a particular type of node can or must appear in a certain context. `*` means node can appear zero or more times. `+` indicates that the node must appear one or more times.

To read more about writing your own schema see the official examples [here](https://prosemirror.net/examples/schema/) and [here](https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.ts).

## Web Component

As a next step, let’s create our web component:

```
class ProseMirrorEditor extends HTMLElement {
	constructor() {
		super();
		this.editorView = null;
	}

	connectedCallback() {
		this.innerHTML = `<div id="editor"></div>`;
		const editorElement = this.querySelector("#editor");
		const initialContent = this.getAttribute("html");
		const customChangeEventName = this.getAttribute("change-event");
		// default empty paragraph
		let doc = schema.node("doc", null, [schema.node("paragraph")]);
		if (initialContent) {
			// HTML string -> DOM
			const contentElement = new DOMParser().parseFromString(
				initialContent,
				"text/html"
			).body;
			// DOM -> Prosemirror doc
			doc = PMDOMParser.fromSchema(schema).parse(contentElement);
		}
		const state = EditorState.create({
			doc,
			schema,
			plugins: [
				history(),
				keymap({ "Mod-z": undo, "Mod-y": redo }),
				keymap(baseKeymap),
			],
		});
		this.editorView = new EditorView(editorElement, {
			state,
			dispatchTransaction: (transaction) => {
				const newState = this.editorView.state.apply(transaction);
				this.editorView.updateState(newState);
				if (transaction.docChanged) {
					this.dispatchEvent(
						new CustomEvent(customChangeEventName || 'editor-change', {
							detail: {
								html: getHTMLStringFromState(newState),
								json: newState.doc.toJSON()
							}
						})
					);
				}
			},
		});
	}
	
	disconnectedCallback() {
		if (this.editorView) {
			this.editorView.destroy();
		}
	}
}

function getHTMLStringFromState (state) {
	// Prosemirror doc => DOM 
	const fragment =
		DOMSerializer.fromSchema(state.schema).serializeFragment(state.doc.content);
	const div = document.createElement("div");
	div.appendChild(fragment);
	// DOM => HTML string
	return div.innerHTML;
}
customElements.define('prosemirror-editor', ProseMirrorEditor);
```

We are doing a couple of things here:

- we initialise an `editorView` property to store a reference to the ProseMirror editor instance and hook it to the components’ lifecycle
- we initialise the "doc" (ProseMirror’s data structure representing an hierarchy of nodes – your document’s JSON) with initial value set to an empty paragraph
- we parse the html string passed via the `html` attribute – in case it’s there, we initialise the editor’s state with the html, parsed from string to DOM and then parsed with the schema we defined earlier using ProseMirror’s DOMParser
- we add basic functionality plugins for prosemirror – things like handling what happens when "enter", "backspace" or "cmd + a" to "select all”, as well as undo/redo history support and the associated key bindings
- we dispatch an event with the current state serialised as HTML and JSON on every document change, allowing the user of the component to react to the data changes (using custom-event="custom-change-event-name" it’s possible to define a custom event name for each instance of the component)

With the code above, we can see the editor with the initial state rendered on the page and we can do basic editing of the text (note that in the embedded example below we also initialise the component in the HTML and add the ProseMirror CSS rules):

<script async src="//jsfiddle.net/gryzzly/os46qjeL/embed/result,js,html,css"></script>

## Adding Menu

To make this implementation more complete and allow editing links and their attributes, we will create a menu that allows us to execute a “toggle link" command upon the current selection in the editor.

We’ll add the command first. To see how toggling a link mark on a text selection could be implemented, let’s head to [prosemirror-example-setup/src/menu](https://github.com/ProseMirror/prosemirror-example-setup/blob/master/src/menu.ts#L72). – 

```js
function linkItem(markType: MarkType) {
  return new MenuItem({
    title: "Add or remove link",
    icon: icons.link,
    active(state) { return markActive(state, markType) },
    enable(state) { return !state.selection.empty },
    run(state, dispatch, view) {
      if (markActive(state, markType)) {
        toggleMark(markType)(state, dispatch)
        return true
      }
      openPrompt({
        title: "Create a link",
        fields: {
          href: new TextField({
            label: "Link target",
            required: true
          }),
          title: new TextField({label: "Title"})
        },
        callback(attrs) {
          toggleMark(markType, attrs)(view.state, view.dispatch)
          view.focus()
        }
      })
    }
  })
}
```

In the scope of this function, the `markType` argument represents the `link` node of the schema, like the one we previously defined (`schema.nodes.link`). Under "run", which is the method that is invoked when the menu item in the example setup is activated, we see:

```
if (markActive(state, markType)) {
	toggleMark(markType)(state, dispatch)
	return true
}
```

this code checks for whether the current selection has link mark already activated and toggles it via the standard `toggleMark` that is imported from `prosemirror-commands` package. We pass the schema for our node (we’d do `toggleMark(schema.nodes.link)`) to create the command function which we then invoke with its expected arguments.

And we can see that markActive is defined about twenty lines above: 

```
function markActive(state: EditorState, type: MarkType) {
	let {from, $from, to, empty} = state.selection
	if (empty) return !!type.isInSet(state.storedMarks || $from.marks())
	else return state.doc.rangeHasMark(from, to, type)
}
```

From my understanding "empty" condition covers the case when you have an editor focused and you pressed, say, "bold" command in the menu. The “bold” mark is already set even though the selection is empty. The result of the typing will have the bold mark applied to it. It doesn’t really apply to adding the link, I think. Seems like the link with its "select text - apply URL" flow is somehow slightly different from simpler plain marks like "emphasis" or "strong". However, let’s keep this `markActive` function as is, as we might want to add the standard text editing mark up like strong and emphasis into our component. 

In case a selection does not yet have the `link` mark activated upon it, the example setup proceeds with the following code:

```
openPrompt({
	title: "Create a link",
	fields: {
		href: new TextField({
			label: "Link target",
			required: true
		}),
		title: new TextField({label: "Title"})
	},
	callback(attrs) {
		toggleMark(markType, attrs)(view.state, view.dispatch)
		view.focus()
	}
})
```

For our component, we will rely on the browser native dialog as a way to prompt the URL. As we can see in the example code above, after the user inserted the link target URL, the standard `toggleMark` command is invoked with the link schema as argument, as well as the result of the user prompt input (represented by `attrs` parameter). 

So, let’s create our own `toggleLink` command: 

	import { toggleMark } from "prosemirror-commands";

	const linkSchema = schema.marks.link;

	function toggleLink(view) {
		const { state, dispatch } = view;
		if (markActive(state, linkSchema)) {
			toggleMark(linkSchema)(state, dispatch)
			return true
		}
		const href = prompt("Link target?");
		toggleMark(linkSchema, { href })(view.state, view.dispatch)
		view.focus();
	}

And we’ll want to add a new element to our component – a button that will toggle the link on the current selection in the editor: 

```
// inside connectedCallback, right after `this.editorView` initialisation block
const toggle = document.createElement('button');
toggle.innerText = 'toggle link';
editorElement.after(toggle);
toggle.addEventListener('click', () => {
	toggleLink(this.editorView);
});
```

Nice! Try selecting some text and then press the “Toggle link” button – you should be able to set the target for the link.

<script async src="//jsfiddle.net/gryzzly/3g59upre/embed/result,js,html,css"></script>

This is pretty good outcome:
- we have learned how to set up a basic prosemirror editor
- how to create our own minimal schema 
- how to add a menu and manipulate selection of text to apply a mark to it

Let’s see how can we extend our custom prosemirror web component further in the next post.