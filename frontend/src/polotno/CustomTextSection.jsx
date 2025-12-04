import React from 'react';
import { SectionTab } from 'polotno/side-panel/side-panel';

export const CustomTextSection = {
  name: 'text',
  Tab: (props) => (
    <SectionTab name="Text" {...props}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
         <path d="M15.5 5H11V16H9V5H4.5V3H15.5V5Z" />
      </svg>
    </SectionTab>
  ),
  Panel: ({ store }) => {
    return (
      <div style={{ padding: '15px' }}>
        <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>Text hinzufügen</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button
            onClick={() => {
              store.activePage.addElement({
                type: 'text',
                text: 'Überschrift',
                fontFamily: 'Roboto Slab',
                fontSize: 60,
                fontWeight: 'bold',
                align: 'center',
                width: 400
              });
            }}
            style={{ 
                padding: '15px', 
                fontSize: '24px', 
                fontFamily: 'Roboto Slab', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                textAlign: 'center'
            }}
          >
            Überschrift
          </button>
          <button
            onClick={() => {
              store.activePage.addElement({
                type: 'text',
                text: 'Unterüberschrift',
                fontFamily: 'PT Sans',
                fontSize: 40,
                fontWeight: 'normal',
                align: 'center',
                width: 300
              });
            }}
            style={{ 
                padding: '12px', 
                fontSize: '18px', 
                fontFamily: 'PT Sans', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                textAlign: 'center'
            }}
          >
            Unterüberschrift
          </button>
          <button
            onClick={() => {
              store.activePage.addElement({
                type: 'text',
                text: 'Fließtext',
                fontFamily: 'PT Sans',
                fontSize: 24,
                fontWeight: 'normal',
                align: 'center',
                width: 200
              });
            }}
            style={{ 
                padding: '10px', 
                fontSize: '14px', 
                fontFamily: 'PT Sans', 
                cursor: 'pointer',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                textAlign: 'center'
            }}
          >
            Fließtext
          </button>
        </div>
      </div>
    );
  },
};
