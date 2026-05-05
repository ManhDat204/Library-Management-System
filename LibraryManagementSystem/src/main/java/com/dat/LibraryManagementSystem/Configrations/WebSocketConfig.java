package com.dat.LibraryManagementSystem.Configrations;

import com.dat.LibraryManagementSystem.websocket.LoanWebSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(loanWebSocketHandler(), "/ws/loans")
                .setAllowedOrigins("*");
    }

    @Bean
    public WebSocketHandler loanWebSocketHandler() {
        return new LoanWebSocketHandler();
    }
}
