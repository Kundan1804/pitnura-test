import { useRef, useState, useEffect } from 'react';

// react-pintura
import { PinturaEditor } from '@pqina/react-pintura';

// pintura
// import '@pqina/pintura/pintura.css';
import "./pintura-custom.css";

import {
    // editor
    locale_en_gb,
    createDefaultImageReader,
    createDefaultImageWriter,
    createDefaultShapePreprocessor,
    createDefaultImageOrienter,

    // plugins
    setPlugins,
    plugin_crop,
    plugin_crop_locale_en_gb,
    plugin_finetune,
    plugin_finetune_locale_en_gb,
    plugin_finetune_defaults,
    plugin_filter,
    plugin_filter_locale_en_gb,
    plugin_filter_defaults,
    plugin_annotate,
    plugin_annotate_locale_en_gb,
    markup_editor_defaults,
    markup_editor_locale_en_gb,
    plugin_sticker,
    plugin_sticker_locale_en_gb,
    createMarkupEditorShapeStyleControls,
    createDefaultFontSizeOptions,
    createDefaultLineHeightOptions,
    createDefaultFontFamilyOptions,
    createDefaultFontScaleOptions
} from '@pqina/pintura';

setPlugins(
    plugin_crop,
    plugin_finetune,
    plugin_filter,
    plugin_annotate,
    plugin_sticker
);

plugin_sticker_locale_en_gb.stickerLabel = 'Image';
plugin_sticker_locale_en_gb.stickerIcon = `
<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-width=".125em">
  <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
  <path d="M16 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
  <path d="M5 15l4-4 4 4 5-5 4 4"/>
</g>`;

const editorDefaults = {
    utils: ['crop', 'finetune', 'filter', 'annotate', 'sticker'],
    imageReader: createDefaultImageReader(),
    imageWriter: createDefaultImageWriter(),
    imageOrienter: createDefaultImageOrienter(),
    shapePreprocessor: createDefaultShapePreprocessor(),
    ...plugin_finetune_defaults,
    ...plugin_filter_defaults,
    ...markup_editor_defaults,
    locale: {
        ...locale_en_gb,
        ...plugin_crop_locale_en_gb,
        ...plugin_finetune_locale_en_gb,
        ...plugin_filter_locale_en_gb,
        ...plugin_annotate_locale_en_gb,
        ...markup_editor_locale_en_gb,
        ...plugin_sticker_locale_en_gb,
    },
    stickers: ['😅', '🏃', '🏃‍♂️'],
    stickerStickToImage: true,
    markupEditorShapeStyleControls: createMarkupEditorShapeStyleControls({
        fontSizeOptions: createDefaultFontSizeOptions(),
        fontScaleOptions: createDefaultFontScaleOptions(),
        lineHeightOptions: createDefaultLineHeightOptions(),
        fontFamilyOptions: [
            ['Viaoda Libre', 'Viaoda Libre'],
            ...createDefaultFontFamilyOptions(),
        ],
    }),
};

export default function Example() {
    const [result, setResult] = useState('');
    const editorRef = useRef(null);
    const [annotationsAdded, setAnnotationsAdded] = useState(false);
    const [frameSrc, setFrameSrc] = useState(null);

    // Generate background frame as an image
    useEffect(() => {
        // take from your src_file JSON
        const srcFile = {
            "frame": {
                "width": 1080.0,
                "height": 1080.0
            },
            "backgroundColor": [
                1.0,
                1.0,
                1.0,
                1
            ]
        }

        // Convert normalized rgba [0–1] into CSS rgba()
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


    const handleEditorUpdate = (imageState) => {
        console.log('Editor updated:', imageState);
    };

    const addAnnotations = () => {
        if (editorRef.current && !annotationsAdded) {
            try {
                editorRef.current.editor.util = 'annotate';

                const currentState = editorRef.current.editor.imageState;

                const newState = {
                    ...currentState,

                    "cropLimitToImage": true,
                    "cropMinSize": {
                        "width": 1,
                        "height": 1
                    },
                    "cropMaxSize": {
                        "width": 32768,
                        "height": 32768
                    },
                    "flipX": false,
                    "flipY": false,
                    "rotation": 0,
                    "manipulation": [],
                    "redaction": [],
                    "annotation": [
                        {
                            "x": "57.22%",
                            "y": "90.56%",
                            "width": "38.98%",
                            "height": "7.13%",
                            "text": "JUST $1 PER CUP",
                            "disableTextScale": true,
                            "color": [
                                0.6352941393852234,
                                0.18039216101169586,
                                0.6823529601097107,
                                1
                            ],
                            "fontSize": 50.0,
                            "fontFamily": "Kanit",
                            "lineHeight": "120%",
                            "rotation": 0,
                            "opacity": 1,
                            "id": "30:169",
                            "disableErase": true,
                            "fontVariant": "normal",
                            "format": "text",
                            "textAlign": "CENTER",
                            "isSelected": false,
                            "isEditing": false
                        },
                    ]
                };

                editorRef.current.editor.imageState = newState;
                setAnnotationsAdded(true);
                console.log('Annotations added successfully');
            } catch (error) {
                console.error('Error adding annotations:', error);
            }
        }
    };

    return (
        <div className="App">
            <h2>Example</h2>

            <div style={{ height: '70vh' }}>
                <PinturaEditor
                    {...editorDefaults}
                    ref={editorRef}
                    src={frameSrc}
                    onLoad={addAnnotations}
                    onUpdate={handleEditorUpdate}
                    onProcess={({ dest }) => setResult(URL.createObjectURL(dest))}
                />
            </div>

            {!!result?.length && (
                <p>
                    <img src={result} alt="" />
                </p>
            )}
        </div>
    );
}