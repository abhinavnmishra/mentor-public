package org.cortex.backend.security.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.cortex.backend.security.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws IOException, jakarta.servlet.ServletException {
        try {
            String requestURI = request.getRequestURI();

            // List of whitelisted APIs
            List<String> whitelist = Arrays.asList("/auth/login", "/auth/register");

            if (whitelist.contains(requestURI)) {
                filterChain.doFilter(request, response); // Skip JWT validation
                return;
            }

            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7); // Remove "Bearer " prefix
                String email = jwtUtil.validateToken(token);

                if (email != null) {
                    GrantedAuthority authority = new SimpleGrantedAuthority(jwtUtil.getRoleFromToken(token));
                    Claims claims = jwtUtil.getClaimsFromToken(token);
                    // In a real application, we’d fetch user details/roles here
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(claims, null, List.of(authority));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException ex) {
            // **Fix: Return 401 explicitly when the token is expired**
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("JWT Token has expired");
            response.getWriter().flush();
            return;

        } catch (JwtException ex) {
            // Handle other JWT-related exceptions
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid JWT Token");
            response.getWriter().flush();
            return;
        }
    }
}