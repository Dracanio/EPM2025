import React from 'react'
import { createStore } from 'polotno/model/store'
import { Workspace } from 'polotno/canvas/workspace'
import { Toolbar } from 'polotno/toolbar/toolbar'
import { SidePanel } from 'polotno/side-panel/side-panel'

const store = createStore({
  showCredit: true,
})

export function PolotnoApp() {
  return (
    <div style={{ display: 'flex', height: '100%', gap: '4px' }}>
      <SidePanel store={store} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar store={store} />
        <Workspace store={store} />
      </div>
    </div>
  )
}


