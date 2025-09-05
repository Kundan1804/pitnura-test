import React, { useRef, useEffect } from "react";
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

    layoutDirectionPreference: 'auto', // Auto-adapt to screen orientation
    layoutHorizontalUtilsPreference: 'left', // Tools on left for better UX
    layoutVerticalUtilsPreference: 'bottom', // Mobile-friendly bottom nav
    layoutVerticalToolbarPreference: 'top', // Toolbar at top for easy access
    layoutVerticalControlGroupsPreference: 'bottom', // Controls at bottom
    layoutVerticalControlTabsPreference: 'bottom', // Tabs below controls
    
    // Visual Enhancements
    enableTransparencyGrid: true, // Show transparency grid for transparent images
    previewUpscale: true, // Better preview scaling
    previewMaskOpacity: 0.92, // Subtle mask opacity
    zoomMaskOpacity: 0.88, // Smooth zoom overlay
    
    // Performance & Quality
    previewImageDataMaxSize: { width: 2048, height: 2048 }, // High quality preview
    elasticityMultiplier: 8, // Smooth elastic interactions
    
    // Animation & Interactions
    animations: 'auto', // Enable smooth animations
    fixScrollDirection: true, // Fix macOS scroll direction
    
    // Zoom Configuration
    enableZoom: true,
    enableZoomControls: true,
    zoomPresetOptions: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8],
    zoomAdjustStep: 0.25,
    zoomAdjustFactor: 0.15, // Smooth zoom speed
    zoomAdjustWheelFactor: 1.2, // Responsive scroll zoom
    
    // Enable User-Friendly Features
    enablePan: true,
    enableDropImage: true, // Drag & drop support
    enablePasteImage: true, // Paste from clipboard
    enableBrowseImage: true, // Click to browse for image
    
    // Button Configuration
    enableButtonClose: false, // Customize based on your modal needs
    enableButtonExport: true,
    enableButtonRevert: true,
    enableNavigateHistory: true, // Undo/redo buttons
    
    // Toolbar & Utils
    enableToolbar: true,
    enableUtils: true,

    // ✅ Custom color controls for annotate + decorate
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
    
    // Event Handlers
    handleEvent: (type, detail) => {
      // Log events for debugging (remove in production)
      console.log(`Pintura Event: ${type}`, detail);
    },
    
    // Confirmation Hooks for Better UX
    willClose: async () => {
      // Add confirmation dialog if user has unsaved changes
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
      // Show processing status
      if (editorRef.current?.editor) {
        editorRef.current.editor.status = ['Processing image...', 0.5];
        
        // Simulate processing delay (remove this in production)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Clear status
        editorRef.current.editor.status = undefined;
      }
      return true;
    },
    
    // Custom request handling for assets
    willRequest: (url, info) => {
      const { resourceType } = info;
      
      // Add custom headers for image requests if needed
      if (resourceType === 'image') {
        return {
          headers: {
            'Cache-Control': 'max-age=3600',
          },
        };
      }
      
      // Allow all stylesheet requests from CDN
      if (resourceType === 'stylesheet') {
        return true;
      }
    },
    
    ...props // Allow overriding any config
  };

  return (
    <div className="pintura-editor-wrapper">
      <PinturaEditor
        ref={editorRef}
        {...editorConfig}
        src={src}
        onProcess={onProcess}
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
  }
  .pintura-editor {
    height: 600px;
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
  
  /* Mobile responsiveness */
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
`;

// Usage Example Component with proper image source
const ExampleUsage = () => {
  const handleImageProcess = (imageState) => {
    console.log('Image processed:', imageState);
    // Handle the processed image here
  };

  return (
    <div>
      <AttractivePinturaEditor
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
        onProcess={handleImageProcess}
      />
    </div>
  );
};

export { AttractivePinturaEditor, ExampleUsage };
export default AttractivePinturaEditor;