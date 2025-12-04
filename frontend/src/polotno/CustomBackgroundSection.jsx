import React from 'react';
import { SectionTab } from 'polotno/side-panel/side-panel';

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

export const CustomBackgroundSection = {
  name: 'background',
  Tab: (props) => (
    <SectionTab name="Hintergrund" {...props}>
       <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="14" height="14" rx="2" />
       </svg>
    </SectionTab>
  ),
  Panel: ({ store }) => {
    return (
      <div style={{ padding: '15px' }}>
         <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>Hintergrundfarbe</h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {TH_COLORS.map(color => (
              <div
                key={color}
                onClick={() => store.activePage.set({ background: color })}
                style={{
                  width: '100%',
                  paddingBottom: '100%',
                  backgroundColor: color,
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
                title={color}
              />
            ))}
         </div>
         <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            <p>Wähle eine Farbe aus der TH Köln Palette.</p>
         </div>
      </div>
    );
  },
};
