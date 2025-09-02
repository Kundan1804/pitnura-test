import React, { useRef, useEffect } from 'react';
import { PinturaEditor } from '@pqina/react-pintura';
import { getEditorDefaults } from '@pqina/pintura';
import '@pqina/pintura/pintura.css';

const AttractivePinturaEditor = ({ src, onProcess, ...props }) => {
  const editorRef = useRef(null);

  // Get default configuration
  const editorDefaults = getEditorDefaults();

  // Add styles to head on mount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const editorConfig = {
    ...editorDefaults,
    
    // UI Layout & Positioning - Modern responsive design
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
    
    // Customize available tools (remove unused ones for cleaner UI)
    utils: [
      'crop',
      'filter', 
      'finetune',
      'annotate',
      'decorate',
      'resize'
    ],
    
    // Custom Status Messages
    status: undefined, // Can be used for loading states
    
    // Localization - Customize button labels for better UX
    locale: {
      ...editorDefaults.locale,
      labelButtonExport: 'Save Changes',
      labelButtonRevert: 'Reset All',
      labelClose: 'Cancel',
      labelAuto: 'Auto',
      labelEdit: 'Edit Image',
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

// CSS Styles for enhanced appearance - moved above component for hoisting
const styles = `
  .pintura-editor-wrapper {
    /* Container styling */
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
    
    /* Custom transparency grid colors */
    --grid-color-even: rgba(248, 249, 250, 0.8);
    --grid-color-odd: rgba(233, 236, 239, 0.8);
    --grid-size: 16;
    
    /* Custom color scheme for modern look */
    --pintura-color-primary: #3b82f6;
    --pintura-color-primary-hover: #2563eb;
    --pintura-color-background: #ffffff;
    --pintura-color-foreground: #1f2937;
    --pintura-color-text: #374151;
    --pintura-color-text-secondary: #6b7280;
    --pintura-border-radius: 8px;
    
    /* Enhanced button styling */
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