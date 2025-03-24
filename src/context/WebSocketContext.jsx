import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WebSocketContext = createContext(null)

export const WebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false)
    const stompClientRef = useRef(null)
    const token = localStorage.getItem('token')

    useEffect(() => {
        if (!token) return

        const socket = new SockJS('http://10.130.234.25:8080/ws')
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (msg) => console.log('[WebSocket Debug]:', msg),
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                console.log('Connected to WebSocket')
                setIsConnected(true)
            },
            onStompError: (frame) =>
                console.error('STOMP Error:', frame.headers.message),
            onWebSocketError: (error) =>
                console.error('WebSocket Error:', error),
        })

        stompClientRef.current = stompClient
        stompClient.activate()

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate()
                setIsConnected(false)
            }
        }
    }, [token])

    // Function to subscribe to topics
    const subscribe = (topic, callback) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            const subscription = stompClientRef.current.subscribe(
                topic,
                (message) => {
                    console.log('Received message:', message.body)
                    callback(JSON.parse(message.body))
                }
            )
            return subscription
        } else {
            console.error('WebSocket is not connected yet')
        }
    }

    return (
        <WebSocketContext.Provider value={{ isConnected, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocket = () => {
    return useContext(WebSocketContext)
}
