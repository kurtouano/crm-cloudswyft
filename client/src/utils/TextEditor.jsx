import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { FaBold, FaItalic, FaUnderline, FaLink, FaImage, FaPaperclip, FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt, FaListOl, FaListUl, FaHeading, FaFont } from 'react-icons/fa';
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

const TipTap = ({ content, onUpdate, resetTrigger, handleFileChange }) => {
  // Canned messages data
  const [cannedMessages] = useState([
    {
      id: 'newsletter1',
      name: 'Newsletter 1',
      content: '<p>Thank you for subscribing to our newsletter! Here are this week\'s updates...</p>'
    },
    {
      id: 'newsletter2',
      name: 'Newsletter 2',
      content: '<p>Special offer just for you! Use code SPECIAL20 for 20% off...</p>'
    },
    {
      id: 'followup',
      name: 'Follow-up',
      content: '<p>Just following up on our previous conversation. Let me know if you have any questions!</p>'
    },
    {
      id: 'trademarks',
      name: 'Cloudswyft Trademarks',
      content: '<p>Cloudswyft Global Systems, Inc.</p>'
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
      FontFamily, 
      Image.configure({
        inline: true,
        allowBase64: true, // Allow base64 images as fallback
        HTMLAttributes: {
          class: 'embedded-image',
          style: 'display: inline-block; max-width: 100%; height: auto;',
        },
      }),
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
    
    if (textBefore === '/') {
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
      editor.commands.insertContent(content);
      setShowSuggestions(false);
      editor.commands.focus();
    }
  };

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

  const addLink = () => {
    if (!editor) return;
  
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);
  
    // User cancelled
    if (url === null) return;
  
    // Remove link if empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
  
    // Basic URL validation
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      finalUrl = `https://${url}`;
    }
  
    // Set the link
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: finalUrl })
      .run();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // For images, create a preview immediately
    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Insert image directly as base64 for immediate display
        editor?.chain().focus()
          .setImage({ src: event.target.result })
          .run();
        
        // DON'T call handleFileChange for images - we don't want them as attachments
      };
      reader.readAsDataURL(file);
    } else {
      // Handle non-image files as before
      handleFileChange(e);
      const fileIcon = getFileIconHtml(file.type);
      
      editor?.chain().focus()
        .insertContent(`
          <div class="file-attachment" data-filename="${file.name}">
            <span class="file-icon-container">${fileIcon}</span>
            <span class="file-name">${file.name}</span>
          </div>
        `)
        .run();
    }
  };
  
  const getFileIconHtml = (type) => {
    if (type.includes('pdf')) return '<i class="fas fa-file-pdf pdf-icon"></i>';
    if (type.includes('word') || type.includes('msword') || type.includes('docx')) 
      return '<i class="fas fa-file-word word-icon"></i>';
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xlsx')) 
      return '<i class="fas fa-file-excel excel-icon"></i>';
    return '<i class="fas fa-file-alt generic-icon"></i>';
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
              <button onClick={() => setFont('Arial')}>Arial</button>
              <button onClick={() => setFont('Times New Roman')}>Times New Roman</button>
              <button onClick={() => setFont('Courier New')}>Courier New</button>
              <button onClick={() => setFont('Georgia')}>Georgia</button>
              <button onClick={() => setFont('Verdana')}>Verdana</button>
            </div>
          )}
        </div>

        <button type="button" onClick={addLink} title="Insert Link">
          <FaLink />
        </button>
        <label htmlFor="file-upload" title="Attach File" className="file-upload-label">
          <FaPaperclip />
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept="*/*"
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
            selectedItem,
            isOpen,
          }) => (
            <div
              style={{
                position: 'absolute',
                top: `${suggestionPosition.top + 20}px`,
                left: `${suggestionPosition.left}px`,
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto',
                width: '300px',
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
                          fontWeight: selectedItem === item ? 'bold' : 'normal',
                        },
                      })}
                    >
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ 
                        fontSize: '0.8em', 
                        color: '#666',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {item.content.replace(/<[^>]*>/g, '')}
                      </div>
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