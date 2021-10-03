import React, { useRef, useEffect, useState } from "react"

const useBroadcast = (
  channelName = "DEFAULT_BROADCAST_CHANNEL_NAME",
  onMessageCB?: (
    event: MessageEvent<any>,
    messages: any[],
    bcContext: string,
    selfContext: string
  ) => void
) => {
  const [messages, setMessages] = useState<any[]>([])
  const bc = useRef<BroadcastChannel>()
  useEffect(() => {
    const onMessage = (event: MessageEvent<any>) => {
      const selfContext = sessionStorage.getItem("bc_self_context") || ""
      const bcContext = localStorage.getItem("bc_context") || ""
      if (selfContext === event.data.id) {
        return
      }
      const nextMessages = messages.slice()
      const { data } = event
      nextMessages.push(data)
      setMessages(nextMessages)
      onMessageCB && onMessageCB(event, nextMessages, bcContext, selfContext)
    }
    // for receiving from other contexts *ONLY*. Will return early if this context is the emitting context
    // creating this abstraction for "parent" and "child" context, to delineate message handling
    // basically, do not want receiving a message in a child context to update state (unless explicitly...) in the parent
    let bcContext = localStorage.getItem("bc_context") || ""
    let selfContext = sessionStorage.getItem("bc_self_context") || ""
    if (!selfContext) {
      if (!bcContext) {
        localStorage.setItem("bc_context", "1")
        sessionStorage.setItem("bc_self_context", "1")
      }
    }
    if (!selfContext && bcContext === "1") {
      sessionStorage.setItem("bc_self_context", `${parseInt(bcContext) + 1}`)
    }
    if (!selfContext && !bcContext) {
      sessionStorage.setItem("bc_self_context", `${1}`)
    }
    selfContext = sessionStorage.getItem("bc_self_context") || ""
    bcContext = localStorage.getItem("bc_context") || ""
    bc.current = new BroadcastChannel(channelName)
    bc.current.onmessage = (event) => onMessage(event)
    return () => {
      if (bcContext === "1" && selfContext === "1") {
        localStorage.removeItem("bc_context")
      }
      sessionStorage.removeItem("bc_self_context")
      bc.current?.close()
      bc.current = undefined
    }
  }, [messages, onMessageCB, channelName])
  const emit = (message: string) => {
    const selfContext = sessionStorage.getItem("bc_self_context") || ""
    bc.current?.postMessage({
      message,
      id: selfContext,
      timestamp: new Date().toString(),
    })
  }
  return {
    emit,
    messages,
  }
}

export default useBroadcast
