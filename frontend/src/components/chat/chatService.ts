import type { Mode } from '../Navbar'

/** UI-facing seam for the future conversation API; it does not define its HTTP contract. */
export type ChatSender = (message: string, mode: Mode) => Promise<string>

export class ChatUnavailableError extends Error {
  constructor(message = 'El servicio de conversación aún no está conectado.') {
    super(message)
    this.name = 'ChatUnavailableError'
  }
}

/** Replace this adapter once the backend publishes POST /api/chat and its real contract. */
export const sendChatMessage: ChatSender = async () => {
  throw new ChatUnavailableError()
}
