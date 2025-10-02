package org.cortex.backend.security.config;

import io.jsonwebtoken.*;
import org.cortex.backend.security.constant.Role;
import org.cortex.backend.security.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private long expiration;

    /**
     * Generate a JWT token using the user’s email
     */
    public String generateToken(String username, String email, String organisationId, String userId, Role role) {
        logger.debug("Inside generateToken");
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        try {
            String token = Jwts.builder()
                    .setSubject(username)
                    .setId(username)
                    .setIssuedAt(now)
                    .setExpiration(expiryDate)
                    .addClaims(Map.of("username", username, "email", email, "userId", userId, "organisationId", organisationId, "role", role.name()))
                    .signWith(SignatureAlgorithm.HS256, secret)
                    .compact();
            return token;
        } catch (Exception e){
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Validate the JWT token and return the email (subject) if valid
     */
    public String validateToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
        return (String) claims.get("role");
    }

    public Claims getClaimsFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
        return claims;
    }
}