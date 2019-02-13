import { Client } from 'rpc-websockets'

const CONDUCTOR_CONFIG = '/_dna_connections.json'

type Call = (...segments: Array<string>) => (params: any) => Promise<any>
type Close = () => Promise<any>

export const connect = (paramUrl?: string) => new Promise<{call: Call, close: Close, ws: any}>(async (fulfill, reject) => {
  const url = paramUrl || await getUrlFromContainer()
  console.log(url)
  const ws = new Client(url)
  ws.on('open', () => {
    const call = (...segments) => (params) => {
      const method = segments.length === 1 ? segments[0] : segments.join('/')
      return ws.call(method, params)
    }
    const close = () => ws.close()
    fulfill({ call, close, ws })
  })
})

function getUrlFromContainer (): Promise<string> {
  return fetch(CONDUCTOR_CONFIG)
    .then(data => data.json())
    .then(json => json.driver.Websocket.port)
    .then(port => `ws://localhost:${port}`)
}

if (typeof(window) !== 'undefined') {
  const win = (window as any)
  win.holoclient = win.holoclient || { connect }
}
