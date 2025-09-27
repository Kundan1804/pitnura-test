import React, { useRef, useEffect, useState } from "react";
import { PinturaEditor } from "@pqina/react-pintura";
import {
  getEditorDefaults,
  setPlugins,
  plugin_sticker,
  plugin_sticker_locale_en_gb,

  createDefaultColorOptions,
  createMarkupEditorBackgroundColorControl,
  createMarkupEditorStrokeColorControl,
  createMarkupEditorFontColorControl, // ✅ correct import for text
  createMarkupEditorColorOptions,
  createMarkupEditorShapeStyleControls,
} from "@pqina/pintura";
import "@pqina/pintura/pintura.css";
import annotationsData from './annotations';

setPlugins(plugin_sticker);

plugin_sticker_locale_en_gb.stickerLabel = 'Image';
plugin_sticker_locale_en_gb.stickerIcon = `
<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width=".125em">
  <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
  <path d="M16 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
  <path d="M5 15l4-4 4 4 5-5 4 4"/>
</g>`;

const AttractivePinturaEditor = ({ src, onProcess, ...props }) => {
  const editorRef = useRef(null);
  const [annotationsAdded, setAnnotationsAdded] = useState(false);

  const editorDefaults = getEditorDefaults();

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const colorOptions = createMarkupEditorColorOptions(createDefaultColorOptions());

  const editorConfig = {
    ...editorDefaults,

    utils: ["crop", "filter", "finetune", "annotate", "sticker", "resize"],
    stickers: ['😅', '🏃', '🏃‍♂️'],
    stickerStickToImage: true,

    layoutDirectionPreference: 'auto',
    layoutHorizontalUtilsPreference: 'left',
    layoutVerticalUtilsPreference: 'bottom',
    layoutVerticalToolbarPreference: 'top',
    layoutVerticalControlGroupsPreference: 'bottom',
    layoutVerticalControlTabsPreference: 'bottom',

    enableTransparencyGrid: true,
    previewUpscale: true,
    previewMaskOpacity: 0.92,
    zoomMaskOpacity: 0.88,

    previewImageDataMaxSize: { width: 2048, height: 2048 },
    elasticityMultiplier: 8,

    animations: 'auto',
    fixScrollDirection: true,

    enableZoom: true,
    enableZoomControls: true,
    zoomPresetOptions: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8],
    zoomAdjustStep: 0.25,
    zoomAdjustFactor: 0.15,
    zoomAdjustWheelFactor: 1.2,
    zoomLevel: 0.5,

    enablePan: true,
    enableDropImage: true,
    enablePasteImage: true,
    enableBrowseImage: true,

    enableButtonClose: false,
    enableButtonExport: true,
    enableButtonRevert: true,
    enableNavigateHistory: true,

    enableToolbar: true,
    enableUtils: true,

    markupEditorShapeStyleControls: createMarkupEditorShapeStyleControls({
      backgroundColor: createMarkupEditorBackgroundColorControl(colorOptions, {
        enableInput: true,
        enableOpacity: true,
        enablePicker: true,
        enableEyeDropper: true,
      }),
      strokeColor: createMarkupEditorStrokeColorControl(colorOptions, {
        enableInput: true,
        enableOpacity: true,
        enablePicker: true,
        enableEyeDropper: true,
      }),
      textColor: createMarkupEditorFontColorControl(colorOptions, {
        enableInput: true,
        enableOpacity: true,
        enablePicker: true,
        enableEyeDropper: true,
      }),
    }),
    locale: {
      ...editorDefaults.locale,
      labelButtonExport: 'Save Changes',
      labelButtonRevert: 'Reset All',
      labelClose: 'Cancel',
      labelAuto: 'Auto',
      labelEdit: 'Edit Image',
      ...plugin_sticker_locale_en_gb,
    },

    handleEvent: (type, detail) => {
      // console.log(`Pintura Event: ${type}`, detail);
    },

    willClose: async () => {
      const hasChanges = editorRef.current?.editor?.history?.length > 0;
      if (hasChanges) {
        return window.confirm('You have unsaved changes. Are you sure you want to close?');
      }
      return true;
    },

    willRevert: async () => {
      return window.confirm('This will reset all your changes. Are you sure?');
    },

    willProcessImage: async () => {
      if (editorRef.current?.editor) {
        editorRef.current.editor.status = ['Processing image...', 0.5];
        await new Promise(resolve => setTimeout(resolve, 500));
        editorRef.current.editor.status = undefined;
      }
      return true;
    },

    willRequest: (url, info) => {
      const { resourceType } = info;
      if (resourceType === 'image') {
        return {
          headers: {
            'Cache-Control': 'max-age=3600',
          },
        };
      }
      if (resourceType === 'stylesheet') {
        return true;
      }
    },

    ...props
  };

  const addAnnotations = async () => {
    if (editorRef.current && !annotationsAdded) {
      try {
        editorRef.current.editor.util = 'annotate';

        const currentState = editorRef.current.editor.imageState;
        const newState = {
          ...currentState,
          ...annotationsData
        };

        editorRef.current.editor.imageState = newState;
        setAnnotationsAdded(true);
        console.log('Annotations added successfully');
      } catch (error) {
        console.error('Error adding annotations:', error);
      }


      const editor = editorRef.current?.editor;
      if (!editor) return;

      // get the current image as a Blob
        // const blob = await editor.getResult({
        //   mimeType: 'image/png',
        //   width: 300,     // optional thumbnail size
        // });

        // const url = URL.createObjectURL(blob);
      console.log('Thumbnail URL:', editor);
      // setThumbnailUrl(url);
    }

  };


  return (
    <div className="pintura-editor-wrapper">
      <PinturaEditor
        ref={editorRef}
        {...editorConfig}
        src={src}
        onLoad={addAnnotations}
      // onProcess={({ dest }) => {
      //   if (onThumbnail) {
      //     const url = URL.createObjectURL(dest);
      //     onThumbnail(url); // ✅ call parent callback
      //   }
      // }}


      // onUpdate={handleEditorUpdate}
      // onProcess={({ dest }) => setResult(URL.createObjectURL(dest))}
      />
    </div>
  );
};

const styles = `
  .pintura-editor-wrapper {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    background: #fff;
    position: relative;
    width: 900px;
    margin: 0 auto;
    display: block;
  }
  .pintura-editor {
    height: 800px;
    min-height: 400px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --grid-color-even: rgba(248, 249, 250, 0.8);
    --grid-color-odd: rgba(233, 236, 239, 0.8);
    --grid-size: 16;
    --pintura-color-primary: #3b82f6;
    --pintura-color-primary-hover: #2563eb;
    --pintura-color-background: #ffffff;
    --pintura-color-foreground: #1f2937;
    --pintura-color-text: #374151;
    --pintura-color-text-secondary: #6b7280;
    --pintura-border-radius: 8px;
    --pintura-button-background: #f8fafc;
    --pintura-button-background-hover: #e2e8f0;
    --pintura-button-text-color: #475569;
    --pintura-button-border-radius: 6px;
  }
  @media (max-width: 768px) {
    .pintura-editor {
      height: 500px;
    }
  }
  @media (max-width: 480px) {
    .pintura-editor {
      height: 400px;
    }
  }
  .canvas {
    margin: 0;
    padding: 0;
  }
`;

const ExampleUsage = () => {
  const editorRef = useRef(null);
  const [frameSrc, setFrameSrc] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    // sample src_file JSON
    const srcFile = {
      "frame": {
        "width": 1080.0,
        "height": 1080.0
      },
      "backgroundColor": [
        0.9334183931350708,
        0.12500935792922974,
        0.8660511374473572,
        1
      ],
      "backgroundColorHex": "#ee1fdc"
    };

    const [r, g, b, a] = srcFile.backgroundColor;
    const cssColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;

    const canvas = document.createElement('canvas');
    canvas.width = srcFile.frame.width;
    canvas.height = srcFile.frame.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = cssColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    setFrameSrc(canvas.toDataURL('image/png'));
  }, []);


  const handleImageProcess = (imageState) => {
    console.log('Image processed:', imageState);
    // Handle the processed image here
  };

  // generate thumbnail after editor has loaded image


  return (
    <div>
      <AttractivePinturaEditor
        ref={editorRef}
        src={frameSrc}
      // onThumbnail={(url) => setThumbnailUrl(url)} // ✅ pass callback
      />

      {thumbnailUrl && (
        <div style={{ marginTop: "16px" }}>
          <h3>Thumbnail Preview</h3>
          <img src={thumbnailUrl} alt="Preview" style={{ border: "1px solid #ccc", borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
};

export { AttractivePinturaEditor, ExampleUsage };
export default AttractivePinturaEditor;