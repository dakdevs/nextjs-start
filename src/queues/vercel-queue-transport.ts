import 'server-only'

import { Layer } from 'effect'

import { QueueTransport } from '~/queues/queue-publisher'
import { vercelQueueClient } from '~/queues/vercel-client'

const vercelQueueTransport = QueueTransport.of({
  send: (topic, payload, options) => vercelQueueClient.send(topic, payload, options),
})

export const VercelQueueTransportLive = Layer.succeed(
  QueueTransport,
  vercelQueueTransport,
)
