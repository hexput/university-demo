<script lang="ts">
    import { onMount } from 'svelte';
    import { EditorView, basicSetup } from 'codemirror';
    import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
    import { tags } from '@lezer/highlight';
    import { StreamLanguage } from '@codemirror/language';

    let {
        code = $bindable("// Write your code here\nvl items = [\"apple\", \"pie\", \"skip\", \"banana\", \"stop\", \"orange\"];\nvl filteredList = [];\nvl i = 0;\n\nloop item in items {\n  if item == \"stop\" {\n    end;\n  }\n  if item == \"skip\" {\n    continue;\n  }\n  \n  filteredList[i] = item;\n  i = i + 1;\n}\n\nprint(filteredList.join(\", \"));\nres filteredList;"),
        class: className
    }: {
        code: string;
        class: string;
    } = $props();
    
    let lastCode = code;
    let editorElement: HTMLElement;
    let editorView: EditorView;
    // Define custom language highlighting
    const customLanguage = StreamLanguage.define({
      name: "customLanguage",
      token(stream, state) {
        // Skip whitespace
        if (stream.eatSpace()) return null;
  
        // Handle comments
        if (stream.match('//')) {
          stream.skipToEnd();
          return 'comment';
        }
  
        // Handle string literals
        if (stream.match(/"([^"\\]|\\.)*"/)) {
          return 'string';
        }
  
        // Handle number literals
        if (stream.match(/-?[0-9]+(\.[0-9]+)?/)) {
          return 'number';
        }
  
        // Handle keywords
        const keywords = ['vl', 'if', 'else', 'cb', 'res', 'loop', 'in', 'end', 'continue', 'keysof'];
        const word = stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/);
        if (word) {
          //@ts-ignore
          const wordStr = word[0];
          if (keywords.includes(wordStr)) {
            return 'keyword';
          }
          if (wordStr === 'true' || wordStr === 'false' || wordStr === 'null') {
            return 'atom';
          }
          return 'variable';
        }
  
        // Handle operators and delimiters
        if (stream.match(/[!+=*\/><=(){}\[\],;:.]/)) {
          return 'operator';
        }
  
        // Skip any unrecognized character
        stream.next();
        return null;
      }
    });
  
    // Create custom theme
    const customHighlightStyle = HighlightStyle.define([
      { tag: tags.keyword, color: "#5c6bc0" },
      { tag: tags.comment, color: "#888888", fontStyle: "italic" },
      { tag: tags.string, color: "#009688" },
      { tag: tags.number, color: "#f44336" },
      { tag: tags.atom, color: "#9c27b0" },
      { tag: tags.variableName, color: "#333333" },
      { tag: tags.operator, color: "#795548" }
    ]);
  
    // Add resize observer to handle editor resizing
    function setupResizeObserver(element: HTMLElement, view: EditorView) {
      const resizeObserver = new ResizeObserver(() => {
        // Update CodeMirror layout when container is resized
        view.requestMeasure();
      });
      resizeObserver.observe(element);
      return resizeObserver;
    }
  
    onMount(() => {
      // Initialize editor
      editorView = new EditorView({
        doc: code,
        extensions: [
          basicSetup,
          customLanguage,
          syntaxHighlighting(customHighlightStyle),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              lastCode = update.state.doc.toString();
              code = lastCode;
            }
          })
        ],
        parent: editorElement
      });
  
      // Setup resize observer for the editor
      const editorResizeObserver = setupResizeObserver(editorElement, editorView);
  
      return () => {
        // Cleanup on component destruction
        editorView.destroy();
        editorResizeObserver.disconnect();
      };
    });

    $effect(() => {
      if (code !== lastCode) {
        editorView.dispatch({
          changes: { from: 0, to: editorView.state.doc.length, insert: code }
        });
        lastCode = code;
      }
    });
</script>
  
<div
    bind:this={editorElement} 
    class="editor-container border border-gray-300 rounded-md overflow-hidden {className}"
></div>
  
  <style>
    /* Add styles for the CodeMirror editor */
    :global(.cm-editor) {
      height: 100%;
      font-family: monospace;
    }
    
    .editor-container {
      height: 300px;
      min-height: 100px;
      max-height: 800px;
      resize: vertical;
      overflow: auto;
    }
    
    :global(.result-container .cm-editor) {
      height: 100%;
    }
    
    :global(.result-container .cm-content) {
      padding: 8px;
    }
    
    :global(.result-container .cm-gutters) {
      display: none;
    }
  </style>
  