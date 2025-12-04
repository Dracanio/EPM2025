
import React from 'react';
import { createStore } from 'polotno/model/store';
import { Workspace } from 'polotno/canvas/workspace';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { SidePanel, UploadSection, ElementsSection } from 'polotno/side-panel/side-panel';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { setColorsPresetFunc, setGoogleFonts, addGlobalFont } from 'polotno/config';
import "../assets/polotno.css"; // Import Polotno CSS locally

import { CustomTextSection } from './CustomTextSection';
import { CustomBackgroundSection } from './CustomBackgroundSection';

// Define TH Köln Colors
const TH_COLORS = [
  '#ED1B65', // Primary Red/Pink
  '#00AB42', // Green
  '#9829C8', // Purple
  '#241F20', // Dark Gray/Black
  '#AAAAAA', // Light Gray
  '#EFEFEF', // Very Light Gray
  '#FFFFFF', // White
  '#000000', // Black
];

// 1. Restrict Colors
setColorsPresetFunc((store) => TH_COLORS);

// 2. Restrict Fonts
// Disable all default Google Fonts
setGoogleFonts([]);

// Add only TH Köln specific fonts
addGlobalFont({
  fontFamily: 'Roboto Slab',
  url: 'https://fonts.gstatic.com/s/robotoslab/v24/BngbUXZYTXPIvIBgJJSb6s3BzlRRfKOFbvjojISmb2Rj.ttf',
});
addGlobalFont({
  fontFamily: 'PT Sans',
  url: 'https://fonts.gstatic.com/s/ptsans/v17/jizfRExUiTo99u79B_mh0O6tLR8a8zI.ttf',
});

// Create a store instance
const store = createStore({
  key: 'YOUR_API_KEY', // You usually need a key for some features, but for local dev it might work with warning
  showCredit: false, // Hide "Made with Polotno" if allowed by license
});



// Define the sections we want to show
const sections = [
  CustomTextSection,
  ElementsSection,
  UploadSection,
  CustomBackgroundSection,
];

// Custom Action Button for Export
const ActionControls = ({ store }) => {
  return (
    <div style={{ display: 'flex', gap: '10px', padding: '0 10px', alignItems: 'center' }}>
      <button
        onClick={() => {
          store.saveAsPDF({ fileName: 'th-koeln-poster.pdf' });
        }}
        className="bg-[#ED1B65] text-white px-4 py-2 rounded hover:bg-[#c41552] transition-colors"
        style={{ fontSize: '14px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
      >
        Export PDF
      </button>
    </div>
  );
};

export function PosterDesignerApp() {
  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <div style={{ height: '50px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#fff' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>TH Köln Poster Designer</h2>
        <ActionControls store={store} />
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e0e0' }}>
           <SidePanel store={store} sections={sections} defaultSection="text" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <Toolbar store={store} />
          <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
            <Workspace store={store} />
          </div>
          <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
            <ZoomButtons store={store} />
          </div>
        </div>
      </div>
    </div>
  );
}
