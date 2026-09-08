import { createRoot } from 'react-dom/client'

import { ComposedFormExample } from './form-fixture'

const host = document.querySelector('#form-fixture')
if (host === null) {
  throw new Error('Missing browser fixture host')
}
createRoot(host).render(
  <ComposedFormExample
    onSave={async (value) => {
      const response = await fetch('/__form-submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(value),
      })

      if (!response.ok) {
        throw new Error('Fixture submission failed')
      }
    }}
  />,
)
