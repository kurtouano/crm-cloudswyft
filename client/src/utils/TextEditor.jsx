const API_URL = import.meta.env.VITE_BACKEND_URL; 

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
import Paragraph from '@tiptap/extension-paragraph'
import { FaBold, FaItalic, FaUnderline, FaLink, FaPaperclip, FaFilePdf, FaFileWord, FaFileExcel, FaFileAlt, FaListOl, FaListUl, FaHeading, FaFont, FaImage, FaPalette, FaFillDrip, FaTable } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useMemo } from "react";
import Downshift from 'downshift';
import "./TextEditor.css";

const CustomParagraph = Paragraph.extend({
  name: 'paragraph',
  addOptions() {
    return {
      HTMLAttributes: {
        style: null, // Explicitly allow style attributes
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (node) => ({
          style: node.getAttribute('style'),
          // Preserve all attributes for nested elements
          ...(node.innerHTML.includes('<span') && {
            'data-has-spans': true,
          }),
        }),
      },
      { tag: 'p' },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0];
  },
  addAttributes() {
    return {
      style: {
        default: null,
        // Parse styles recursively for nested elements
        parseHTML: (element) => {
          const styles = element.getAttribute('style');
          if (styles) return styles;
          
          // Handle nested elements (e.g., spans)
          const nested = element.querySelector('[style]');
          return nested ? nested.getAttribute('style') : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});
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


const TipTap = ({ content, onUpdate, resetTrigger, handleFileChange, editorId, commsType }) => {
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [fontColor, setFontColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [showTableDropdown, setShowTableDropdown] = useState(false);

    // Define all canned messages by type
    const allCannedMessages = useMemo(() => ({
      revenue: [
        {
          id: 'revenue-offer',
          name: 'Revenue Growth Offer',
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; background-color: #f8f9fa; border-radius: 8px;">
              <h1><span style="color: #1155cc; font-weight: bold; display: block;">LIMITED TIME OFFER!</span></h1>
              <br><br>
              <span style="color: #1155cc; font-size: 20px; font-weight: bold; display: block;">GET 50% OFF ALL COURSES</span>
              <br><br>
              <span style="color: #333333; font-size: 16px; display: block;">Upgrade your skills with our premium courses at half the price.</span>
              <br><br>
              <span style="color: #d32f2f; font-weight: bold; display: block;">This exclusive offer expires in 48 hours!</span>
              <br><br>
              <span style="background-color: #1155cc; color: white; padding: 10px 20px; border-radius: 4px; display: inline-block; font-weight: bold;">CLAIM YOUR DISCOUNT NOW</span>
              <br><br><br>
              <span style="color: #666666; font-size: 14px; display: block;">Don't miss this opportunity to boost your career!</span>
            </div>
          `
        },
        {
          id: 'revenue-followup',
          name: 'Revenue Follow-Up',
          content: `
            <p>Dear <span style="color:#1155cc">[First Name]</span>,</p><br>
            <p>I wanted to follow up about our conversation regarding [Product/Service].</p>
            <p>Here are the key benefits:</p>
            <p>• [Benefit 1]<br>• [Benefit 2]<br>• [Benefit 3]</p><br>
            <p>Would you be available for a quick call to discuss further?</p><br>
            <p>Best regards,<br>Sales Team</p>
          `
        }
      ],


      afterSales: [
        {
          id: 'thank-you',
          name: 'Thank You Note',
          content: `
            <p>Dear <span style="color:#1155cc;">[First Name]</span>,</p><br>
            <p>Thank you for your purchase! We truly appreciate your business.</p>
            <p>Your order details:</p>
            <p>• Order #: [Number]<br>• Items: [Description]</p><br>
            <p>If you have any questions, please don't hesitate to contact us.</p><br>
            <p>Best regards,<br>Customer Support</p>
          `
        },
        {
          id: 'issue-resolved',
          name: 'Resolved with Satisfaction Survey',
          content: `
            <p>Hi <span style="color:#1155cc;">[First Name]</span>,</p><br>
            <p>Thank you for reaching out! If there's anything else you need, feel free to let us know — we're always here to help.</p><br>
            <p>We'd love to hear how we did today. Please rate your experience:</p><br>
            <p><a href="${API_URL}/api/feedback?rating=happy" style="color:#1155cc; text-decoration: none;">😊 Happy</a> – I'm impressed!</p>
            <p><a href="${API_URL}/api/feedback?rating=neutral" style="color:#1155cc; text-decoration: none;">😐 Neutral</a> – You can do better next time.</p>
            <p><a href="${API_URL}/api/feedback?rating=sad" style="color:#1155cc; text-decoration: none;">😞 Sad</a> – I'm quite unhappy with this.</p><br>
            <p>Your feedback helps us improve and serve you better.</p><br>
            <p>Best regards,<br>Cloudswyft Global Systems, Inc.</p>
          `
        },
        {
          id: 'follow-up-check',
          name: 'Follow-Up Check',
          content: `
            <p>Hello <span style="color:#1155cc;">[First Name]</span>,</p><br>
            <p>We hope you're enjoying your purchase!</p>
            <p>Just checking in to see if everything is working as expected.</p><br>
            <p>Feel free to reply with any feedback or questions.</p><br>
            <p>Best,<br>Customer Care</p>
          `
        }
      ],

      createEmail: [
        {
          id: 'standard-followup',
          name: 'Standard Follow-Up',
          content: `
            <p>Dear <span style="color:#1155cc;">[First Name]</span>,</p><br>
            <p>I wanted to follow up regarding our recent conversation about [Topic].</p>
            <p>Please let me know if you have any questions.</p><br>
            <p>Best regards,<br>[Your Name]</p>
          `
        },
        {
          id: 'newsletter-template',
          name: 'Newsletter Template',
          content: `
            <h1><span style="color:#4a6bdf;">Monthly Update</span></h1><br>
            <p>Hi <span style="color:#4a6bdf;">[First Name]</span>,</p>
            <p>Here's what's new this month:</p>
            <p>• [Update 1]<br>• [Update 2]<br>• [Update 3]</p><br>
            <p>Let us know what you think!</p><br>
            <p>Best,<br>Marketing Team</p>
          `
        },
        {
          id: 'promotional-newsletter',
          name: 'Promotional Newsletter',
          content: `
            <p><span style="font-size: 1.5em; font-weight: bold; color:#4a6bdf;">Exciting Promotions This Week!</span></p> <br>
            <p><span>Hi </span><span style="color:#4a6bdf;">[First Name]</span><span>,</span></p>
            <p><span>Check out these amazing offers we have for you:</span></p>
            
            <!-- Promotion 1 -->
            <p><span><img src="https://cloudswyft.co/wp-content/uploads/2021/12/marco-fileccia-HE7_hMkqn9A-unsplash-scaled.jpg" alt="Latest Products" style="max-width: 500px;"></span></p>
            <p><span>Discover our latest collection of innovative products.</span></p>
            <u><a href="${API_URL}/api/newsletters/track/1?redirectUrl=https://cloudswyft.co/education-amidst-the-pandemic-the-role-of-cloud-based-learning-platforms-in-continuing-learning-and-instruction/"><span style="color:#1155cc;">Cloud based Learning Platforms</span></a></u><br>
            
            <!-- Promotion 2 -->
            <p><span><img src="https://cloudswyft.co/wp-content/uploads/2021/11/pexels-photo-5554288.jpeg" alt="Premium Services" style="max-width: 500px;"></span></p>
            <p><span>Special discounts on our premium services.</span></p>
            <u><a href="${API_URL}/api/newsletters/track/2?redirectUrl=https://cloudswyft.co/how-virtual-computer-labs-are-revolutionising-the-way-universities-teach/"><span style="color:#1155cc;">Virtual Computer Labs</span></a></u><br>
            
            <!-- Promotion 3 -->
            <p><span><img src="https://cloudswyft.co/wp-content/uploads/2018/01/CloudSwyft.jpg" alt="Platform Features" style="max-width: 500px;"></span></p>
            <p><span>New features now available in our platform.</span></p>
            <u><a href="${API_URL}/api/newsletters/track/3?redirectUrl=https://cloudswyft.co/cloudswyft-the-startup-that-aims-to-change-the-way-companies-do-human-capital-development/"><span style="color:#1155cc;">Our Cloudswyft Team</span></a></u><br>
            
            <!-- Promotion 4 -->
            <p><span><img src="https://cloudswyft.co/wp-content/uploads/2020/10/15May_Card-Holder_992x560.png" alt="Limited Offer" style="max-width: 500px"></span></p>
            <p><span>Limited time offer - don't miss out!</span></p>
            <u><a href="${API_URL}/api/newsletters/track/4?redirectUrl=https://cloudswyft.co/finding-your-career-amidst-the-pandemic/"><span style="color:#1155cc;">Find your Career</span></a></u><br>
            
            <p><span>Thank you for being a valued customer!</span></p><br>
            <p><span>Best regards,</span></p>
            <p><span style="color:#4a6bdf; font-weight: bold">Cloudswyft Global Systems, Inc.</span></p>
          `
        },

      ]
    }), []);
  
    // Initialize with the correct canned messages based on commsType
    const [cannedMessages, setCannedMessages] = useState(
      allCannedMessages[commsType] || allCannedMessages.createEmail
    );
  
    // Update messages when commsType changes
    useEffect(() => {
      setCannedMessages(allCannedMessages[commsType] || allCannedMessages.createEmail);
    }, [commsType, allCannedMessages]);

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
        paragraph: false,
      }),
      CustomParagraph,
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
      // Get the editor's DOM element
      const editorElement = editor.view.dom;
      const editorRect = editorElement.getBoundingClientRect();
      const coords = editor.view.coordsAtPos(from);
      
      setSuggestionPosition({ 
        top: coords.top - editorRect.top + editorElement.scrollTop,
        left: coords.left - editorRect.left
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
                top: `${suggestionPosition.top + 60}px`,
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
              className={`canned-message-dropdown ${editorId ? `editor-${editorId}` : ''}`}
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
  editorId: PropTypes.string,
  commsType: PropTypes.oneOf(['revenue', 'afterSales', 'createEmail']),
};

export default TipTap;