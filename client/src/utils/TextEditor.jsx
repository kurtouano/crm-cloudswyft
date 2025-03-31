import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { Extension } from '@tiptap/core';
import { FaBold, FaItalic, FaUnderline, FaLink, FaPaperclip, FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt, FaListOl, FaListUl, FaHeading, FaFont, FaImage, FaPalette, FaFillDrip, FaTable } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from "react";
import Downshift from 'downshift';
import "./TextEditor.css";

const FontFamily = Extension.create({
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {};
              }
              return { style: `font-family: ${attributes.fontFamily}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontFamily: fontFamily => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily })
          .run();
      },
      unsetFontFamily: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

const BackgroundColor = Extension.create({
  name: 'backgroundColor',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: element => element.style.backgroundColor || null,
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {};
              }
              return { style: `background-color: ${attributes.backgroundColor}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setBackgroundColor: backgroundColor => ({ chain }) => {
        return chain()
          .setMark('textStyle', { backgroundColor })
          .run();
      },
      unsetBackgroundColor: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { backgroundColor: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

const TipTap = ({ content, onUpdate, resetTrigger, handleFileChange }) => {
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [fontColor, setFontColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [showTableDropdown, setShowTableDropdown] = useState(false);
  
  // Canned messages data
  const [cannedMessages] = useState([
    {
      id: 'interested-lead-followup',
      name: 'Interested Lead Follow-Up',
      content: `
        <p>Dear <span style="color:#1155cc;">[First Name]</span>,</p> <br>
        <p>Thank you for your interest in [Product/Service].</p>
        <p>Next steps:</p>
        <p>• [Next Step 1]<br>• [Next Step 2]</p>
        <p>Please let me know if you have any questions.</p><br>
        <p>Best regards,<br>Cloudswyft</p>
      `
    },
    {
      id: 'standard-followup',
      name: 'Standard Follow-Up',
      content: `
        <p>Dear <span style="color:#1155cc;">[First Name]</span>,</p><br>
        <p>I wanted to follow up regarding our recent conversation about [Topic].</p>
        <p>Please let me know if you have any questions.</p><br>
        <p>Best regards,<br>Cloudswyft</p>
      `
    },
    {
      id: 'thank-you',
      name: 'Thank You Note',
      content: `
        <p>Dear <span style="color:#1155cc;">[First Name]</span>,</p><br>
        <p>Thank you for [specific reason].</p>
        <p>We appreciate your [business/partnership/support].</p><br>
        <p>Best regards,<br>Cloudswyft</p>
      `
    },
    {
      id: 'follow-up-newsletter',
      name: 'Follow Up Newsletter',
      content: `
          <h1>
            <span style="color:#ffffff;background-color:#4a6bdf;border-radius:4px;display:inline-block;font-size:20px;font-weight:bold;">Quick Follow-Up</span>
          </h1> <br>
          <p>
            Hi <span style="color:#4a6bdf;">[First Name]</span>,
          </p>
          <p>
            I noticed we haven't connected since my last email about <span style="background-color:#f3f6ff;padding:2px 6px;">[Your Product/Service]</span>. Here's a quick reminder of how we can help:
          </p>
          <p>
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" alt="Business solution" style="max-width:100%;height:auto;">
          </p>
          <p>
            <span style="background-color:#f3f6ff;padding:8px 12px;display:inline-block;">
              • Solve <span style="color:#4a6bdf;font-weight:bold;">[Specific Pain Point]</span><br>
              • Save <span style="color:#4a6bdf;font-weight:bold;">X hours/week</span><br>
              • Boost <span style="color:#4a6bdf;font-weight:bold;">[Relevant Metric] by Y%</span>
            </span>
          </p><br>
          <p>
            Would <span style="background-color:#fff8e6;padding:2px 4px;">15 minutes next week</span> work to explore this further?
          </p>
          <p>
            <a href="[Calendly Link]" style="color:#ffffff;background-color:#4a6bdf;padding:12px 24px;border-radius:4px;text-decoration:none;display:inline-block;font-weight:bold;">Schedule a Call</a>
          </p>
          <p>
            If now's not the right time, just reply "not now" - no hard feelings!
          </p><br>
          <p>
            Best,<br>
            <span style="font-weight:bold;">[Your Name]</span><br>
            <span style="color:#7f8c8d;">Cloudswyft Global Systems, Inc.</span>
          </p>
      `
    }
  ]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const [showHeadingsDropdown, setShowHeadingsDropdown] = useState(false);
  const [showFontsDropdown, setShowFontsDropdown] = useState(false);
  const editorRef = useRef(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        paragraph: {
          HTMLAttributes: {
            style: 'margin: 0; padding: 0;',
          },
        },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
      Underline,
      TextStyle,
      Color,
      BackgroundColor,
      FontFamily, 
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'embedded-image',
          style: 'display: inline-block; max-width: 100%; height: auto;',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Send a Message',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none',
      },
    },
    content: content || '',
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
      checkForSlashCommand(editor);
    },
    onKeyDown: ({ event }) => {
      return handleEditorKeyDown(event);
    },
  });

  // Track editor element
  useEffect(() => {
    if (editor) {
      editorRef.current = editor.view.dom;
    }
  }, [editor]);

  useEffect(() => {
    if (editor && resetTrigger) {
      editor.commands.setContent('');
    }
  }, [resetTrigger, editor]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSuggestions) {
        if (e.key === 'Escape') {
          setShowSuggestions(false);
          editor?.commands.focus();
        }
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSuggestions, editor]);

  const checkForSlashCommand = (editor) => {
    const { from } = editor.state.selection;
    const textBefore = editor.state.doc.textBetween(
      Math.max(0, from - 1),
      from,
      '\n'
    );
    
    if (textBefore === '`') {
      const { top, left } = editor.view.coordsAtPos(from);
      setSuggestionPosition({ 
        top: top + window.scrollY, 
        left: left + window.scrollX 
      });
      setShowSuggestions(true);
      setSuggestions(cannedMessages);
    } else if (showSuggestions) {
      setShowSuggestions(false);
    }
  };

  const handleEditorKeyDown = (e) => {
    if (showSuggestions) {
      if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
        e.stopPropagation();
        return true;
      }
    }
    return false;
  };

  const insertContent = (content) => {
    if (editor) {
      editor.commands.deleteRange({
        from: editor.state.selection.from - 1,
        to: editor.state.selection.from
      });
      editor.commands.insertContent(content.trim());
      setShowSuggestions(false);
      editor.commands.focus();
    }
  };

  // Table functions
  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    setShowTableDropdown(false);
  };

  const addColumnBefore = () => editor?.chain().focus().addColumnBefore().run();
  const addColumnAfter = () => editor?.chain().focus().addColumnAfter().run();
  const deleteColumn = () => editor?.chain().focus().deleteColumn().run();
  const addRowBefore = () => editor?.chain().focus().addRowBefore().run();
  const addRowAfter = () => editor?.chain().focus().addRowAfter().run();
  const deleteRow = () => editor?.chain().focus().deleteRow().run();
  const deleteTable = () => editor?.chain().focus().deleteTable().run();
  const mergeCells = () => editor?.chain().focus().mergeCells().run();
  const splitCell = () => editor?.chain().focus().splitCell().run();
  const toggleHeaderColumn = () => editor?.chain().focus().toggleHeaderColumn().run();
  const toggleHeaderRow = () => editor?.chain().focus().toggleHeaderRow().run();
  const toggleHeaderCell = () => editor?.chain().focus().toggleHeaderCell().run();

  // List functions
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();

  // Heading functions
  const setHeading = (level) => {
    editor?.chain().focus().toggleHeading({ level }).run();
    setShowHeadingsDropdown(false);
  };

  // Font functions
  const setFont = (font) => {
    editor?.chain().focus().setFontFamily(font).run();
    setShowFontsDropdown(false);
  };

  // Color functions
  const applyTextColor = () => {
    editor?.chain().focus().setColor(fontColor).run();
    setShowColorPicker(null);
  };

  const applyBackgroundColor = () => {
    editor?.chain().focus().setBackgroundColor(bgColor).run();
    setShowColorPicker(null);
  };

  const resetTextColor = () => {
    editor?.chain().focus().unsetColor().run();
    setShowColorPicker(null);
  };

  const resetBackgroundColor = () => {
    editor?.chain().focus().unsetBackgroundColor().run();
    setShowColorPicker(null);
  };

  const addLink = () => {
    if (!editor) return;
  
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);
  
    if (url === null) return;
  
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
  
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      finalUrl = `https://${url}`;
    }
  
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: finalUrl })
      .run();
  };

  const addImageFromUrl = () => {
    if (!editor) return;
    
    const url = window.prompt('Enter the image URL');
    
    if (url) {
      let finalUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        finalUrl = `https://${url}`;
      }
      
      editor
        .chain()
        .focus()
        .setImage({ src: finalUrl })
        .run();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    handleFileChange(e);
    
    editor?.chain().focus()
      .insertContent(`
        <div class="file-attachment" data-filename="${file.name}">
          <span class="file-name">${file.name}</span>
        </div>
      `)
      .run();

    setFileInputKey(Date.now());
  };

  return (
    <div className="email-editor">
      {/* Formatting Toolbar */}
      <div className="toolbar">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'active' : ''}
          title="Bold"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'active' : ''}
          title="Italic"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={editor?.isActive('underline') ? 'active' : ''}
          title="Underline"
        >
          <FaUnderline />
        </button>

        {/* List buttons */}
        <button
          type="button"
          onClick={toggleOrderedList}
          className={editor?.isActive('orderedList') ? 'active' : ''}
          title="Ordered List"
        >
          <FaListOl />
        </button>
        <button
          type="button"
          onClick={toggleBulletList}
          className={editor?.isActive('bulletList') ? 'active' : ''}
          title="Bullet List"
        >
          <FaListUl />
        </button>

        {/* Headings dropdown */}
        <div className="dropdown-container">
          <button
            type="button"
            onClick={() => setShowHeadingsDropdown(!showHeadingsDropdown)}
            className={editor?.isActive('heading') ? 'active' : ''}
            title="Headings"
          >
            <FaHeading />
          </button>
          {showHeadingsDropdown && (
            <div className="dropdown-menu">
              <button type="button" onClick={() => setHeading(1)}>Heading 1</button>
              <button type="button" onClick={() => setHeading(2)}>Heading 2</button>
              <button type="button" onClick={() => setHeading(3)}>Heading 3</button>
              <button type="button" onClick={() => editor?.chain().focus().setParagraph().run()}>
                Paragraph
              </button>
            </div>
          )}
        </div>

        {/* Fonts dropdown */}
        <div className="dropdown-container">
          <button
            type="button"
            onClick={() => setShowFontsDropdown(!showFontsDropdown)}
            title="Fonts"
          >
            <FaFont />
          </button>
          {showFontsDropdown && (
            <div className="dropdown-menu">
              <button type="button" onClick={() => setFont('Arial')}>Arial</button>
              <button type="button" onClick={() => setFont('Times New Roman')}>Times New Roman</button>
              <button type="button" onClick={() => setFont('Courier New')}>Courier New</button>
              <button type="button" onClick={() => setFont('Georgia')}>Georgia</button>
              <button type="button" onClick={() => setFont('Verdana')}>Verdana</button>
            </div>
          )}
        </div>

        {/* Text Color Picker */}
        <div className="dropdown-container">
          <button
            type="button"
            onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
            title="Text Color"
          >
            <FaPalette />
          </button>
          {showColorPicker === 'text' && (
            <div className="dropdown-menu color-picker">
              <input 
                type="color" 
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
              />
              <button type="button" onClick={applyTextColor}>Apply</button>
              <button type="button" onClick={resetTextColor}>Reset</button>
            </div>
          )}
        </div>

        {/* Background Color Picker */}
        <div className="dropdown-container">
          <button
            type="button"
            onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
            title="Background Color"
          >
            <FaFillDrip />
          </button>
          {showColorPicker === 'background' && (
            <div className="dropdown-menu color-picker">
              <input 
                type="color" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
              <button type="button" onClick={applyBackgroundColor}>Apply</button>
              <button type="button" onClick={resetBackgroundColor}>Reset</button>
            </div>
          )}
        </div>

        {/* Table controls */}
        <div className="dropdown-container">
          <button
            type="button"
            onClick={() => setShowTableDropdown(!showTableDropdown)}
            className={editor?.isActive('table') ? 'active' : ''}
            title="Table"
          >
            <FaTable />
          </button>
          {showTableDropdown && (
            <div className="dropdown-menu dropdown-menu-table">
              <button type="button" onClick={insertTable}>Insert Table</button>
              {editor?.isActive('table') && (
                <>
                  <button type="button" onClick={addColumnBefore}>Add Column Before</button>
                  <button type="button" onClick={addColumnAfter}>Add Column After</button>
                  <button type="button" onClick={deleteColumn}>Delete Column</button>
                  <button type="button" onClick={addRowBefore}>Add Row Before</button>
                  <button type="button" onClick={addRowAfter}>Add Row After</button>
                  <button type="button" onClick={deleteRow}>Delete Row</button>
                  <button type="button" onClick={deleteTable}>Delete Table</button>
                  <button type="button" onClick={mergeCells}>Merge Cells</button>
                  <button type="button" onClick={splitCell}>Split Cell</button>
                  <button type="button" onClick={toggleHeaderColumn}>Toggle Header Column</button>
                  <button type="button" onClick={toggleHeaderRow}>Toggle Header Row</button>
                  <button type="button" onClick={toggleHeaderCell}>Toggle Header Cell</button>
                </>
              )}
            </div>
          )}
        </div>

        <button type="button" onClick={addLink} title="Insert Link">
          <FaLink />
        </button>
        
        <button type="button" onClick={addImageFromUrl} title="Insert Image from URL">
          <FaImage />
        </button>
        
        <label htmlFor="file-upload" title="Attach File" className="file-upload-label">
          <FaPaperclip />
          <input
            id="file-upload"
            key={fileInputKey}
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.csv,image/*"
          />
        </label>
      </div>

      <EditorContent editor={editor} />

      {/* Canned Messages Suggestions */}
      {showSuggestions && (
        <Downshift
          isOpen={true}
          onOuterClick={() => setShowSuggestions(false)}
          onInputValueChange={() => {}}
          onChange={(selection) => {
            if (selection) {
              insertContent(selection.content);
            }
            setShowSuggestions(false);
          }}
          itemToString={(item) => (item ? item.name : '')}
        >
          {({
            getMenuProps,
            getItemProps,
            highlightedIndex,
            isOpen,
          }) => (
            <div
              style={{
                position: 'absolute',
                fontSize: '14px',
                top: `${suggestionPosition.top + 20}px`,
                left: `${suggestionPosition.left}px`,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'scroll',
                width: '250px',
              }}
            >
              <ul {...getMenuProps()} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {isOpen &&
                  suggestions.map((item, index) => (
                    <li
                      key={item.id}
                      {...getItemProps({
                        item,
                        index,
                        style: {
                          backgroundColor: highlightedIndex === index ? '#f5f5f5' : 'white',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee',
                        },
                      })}
                    >
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </Downshift>
      )}

      {/* Hidden file icons for HTML rendering */}
      <div style={{ display: 'none' }}>
        <FaFilePdf className="file-icon" />
        <FaFileWord className="file-icon" />
        <FaFileExcel className="file-icon" />
        <FaFileAlt className="file-icon" />
      </div>
    </div>
  );
};

TipTap.propTypes = {
  content: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  resetTrigger: PropTypes.string,
  handleFileChange: PropTypes.func.isRequired,
};

export default TipTap;