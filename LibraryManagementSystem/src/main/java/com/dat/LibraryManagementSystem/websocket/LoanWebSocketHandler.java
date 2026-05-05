package com.dat.LibraryManagementSystem.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

public class LoanWebSocketHandler extends TextWebSocketHandler {

    private static final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        System.out.println(" WebSocket connected: " + session.getId() + " | Total clients: " + sessions.size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        System.out.println("Message received: " + payload);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
        sessions.remove(session);
        System.out.println("WebSocket disconnected: " + session.getId() + " | Remaining clients: " + sessions.size());
    }


    public static void broadcastLoanUpdate(Long loanId, String status, String type) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("loanId", loanId);
        message.put("status", status);
        message.put("timestamp", System.currentTimeMillis());
        
        broadcastMessage(message);
    }


    public static void broadcastMessage(Object message) {
        try {
            String payload = objectMapper.writeValueAsString(message);
            TextMessage textMessage = new TextMessage(payload);

            for (WebSocketSession session : sessions) {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                        System.out.println(" Sent to " + session.getId());
                    }
                } catch (IOException e) {
                    System.err.println(" Error sending to session: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println(" Error broadcasting: " + e.getMessage());
        }
    }

    public static int getConnectedClientsCount() {
        return sessions.size();
    }
}
