package com.dat.LibraryManagementSystem.Configrations;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.net.Authenticator;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class JwtValidator extends OncePerRequestFilter {
    @Override

    protected void doFilterInternal (HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException{
//        System.out.println("PATH = " + request.getRequestURI());
        String path = request.getServletPath();
        // add
        if (path.equals("/api/payments/vnpay-return")) {
            filterChain.doFilter(request, response);
            return;
        }
        String  jwt = request.getHeader(JwtConstant.JWT_HEADER);
        if(jwt != null){
            jwt = jwt.substring(7);
            try {
                SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(jwt)
                        .getBody();
                String email = String.valueOf(claims.get("email"));
                String authories = String.valueOf(claims.get("authorities"));

                List<GrantedAuthority> authoritiesList = AuthorityUtils
                        .commaSeparatedStringToAuthorityList(authories);
                Authentication auth = new UsernamePasswordAuthenticationToken(
                        email, null, authoritiesList);
                SecurityContextHolder.getContext().setAuthentication(auth);

            }catch (Exception e){
                throw  new BadCredentialsException("Invalid JWT token! ");
            }
        }
        filterChain.doFilter(request,response);
    }
}
