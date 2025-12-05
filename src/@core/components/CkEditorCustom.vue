<script setup lang="ts">
import {
  AutoLink, Base64UploadAdapter, BlockQuote, Bold, ClassicEditor, Clipboard, Code, CodeBlock, CodeBlockEditing, CodeBlockUI, CodeEditing, Essentials, Font, Heading, ImageBlock, ImageBlockEditing, ImageCaption,
  ImageInline,
  ImageInsertUI,
  ImageResize,
  ImageStyle, ImageStyleEditing, ImageStyleUI, ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent, IndentBlock, Italic, LinkImage, LinkImageEditing, LinkImageUI, ListEditing, ListUI, Mention, Paragraph, Strikethrough, Subscript, Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableClipboard,
  TableColumnResize,
  TableProperties,
  TableSelection,
  TableToolbar,
  TableUtils,
  TodoList, Underline, Undo
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const editorConfig = ref<any>({
  plugins: [AutoLink, Base64UploadAdapter, BlockQuote, Bold, ClassicEditor, Clipboard, Code, CodeBlock, CodeBlockEditing, CodeBlockUI, CodeEditing, Essentials, Font, Heading, ImageBlock, ImageBlockEditing, ImageCaption, ImageInline,
    ImageInsertUI,
    ImageResize,
    ImageStyle, ImageStyleEditing, ImageStyleUI, ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Indent, IndentBlock, Italic, LinkImage, LinkImageEditing, LinkImageUI, ListEditing, ListUI, Mention, Paragraph, Strikethrough, Subscript, Superscript,
    Table,
    TableCaption,
    TableCellProperties,
    TableClipboard,
    TableColumnResize,
    TableProperties,
    TableSelection,
    TableToolbar,
    TableUtils,
    TodoList, Underline, Undo],
  toolbar: {
    items: [
      'blockQuote',
      'bold', 'codeBlock', 'accessibilityHelp', 'selectAll', 'undo', 'redo', 'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', 'heading', 'insertImage', 'indent', 'outdent', 'italic', 'link', 'linkImage', 'numberedList', 'bulletedList', 'strikethrough', 'todoList', 'underline', 'subscript', 'superscript', 'code', 'insertTable', 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'toggleTableCaption', 'tableCellProperties'
    ],
    shouldNotGroupWhenFull: false
  },
  table: {
    contentToolbar: [
      'toggleTableCaption', 'tableRow', 'tableColumn', 'mergeTableCells'
    ]
  },
  image: {
    styles: {
      // Defining custom styling options for the images.
      options: [
        {
          name: 'side',
          title: 'Side image',
          className: 'image-side',
          modelElements: ['imageBlock']
        }, {
          name: 'margin-left',
          title: 'Image on left margin',
          className: 'image-margin-left',
          modelElements: ['imageInline']
        }, {
          name: 'margin-right',
          title: 'Image on right margin',
          className: 'image-margin-right',
          modelElements: ['imageInline']
        },
        // Modifying icons and titles of the default inline and
        // block image styles to reflect its real appearance.
        {
          name: 'inline',
        }, {
          name: 'block',
          title: 'Centered image',
        }]
    },
    toolbar: [{
      // Grouping the buttons for the icon-like image styling
      // into one dropdown.
      name: 'imageStyle:icons',
      title: 'Alignment',
      items: [
        'imageStyle:margin-left',
        'imageStyle:margin-right',
        'imageStyle:inline'
      ],
      defaultItem: 'imageStyle:margin-left'
    },
    {
      // Grouping the buttons for the regular
      // picture-like image styling into one dropdown.
      name: 'imageStyle:pictures',
      title: 'Style',
      items: ['imageStyle:block', 'imageStyle:side'],
      defaultItem: 'imageStyle:block'
    }, '|', 'toggleImageCaption', 'linkImage'
    ]
  }
})
const editor = ClassicEditor;
const editorData = ref<string>(props.modelValue || "");

watch(() => props.modelValue, () => {
  if (editorData.value !== props.modelValue && editorData.value === "")
    editorData.value = props.modelValue
})

watch(() => editorData.value, () => {
  if (editorData.value !== props.modelValue) {
    emit('update:modelValue', editorData.value)
  }
})
</script>
<template>
  <ckeditor :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>
  <div id="toolbarContainer"></div>

</template>

<style lang="scss">
.ck.ck-reset {
  ul,
  ol {
    padding-inline-start: 20px;
  }
}

.v-theme--dark .ck.ck-editor__main>.ck-editor__editable {
  background: rgb(47, 51, 73);
}
</style>
