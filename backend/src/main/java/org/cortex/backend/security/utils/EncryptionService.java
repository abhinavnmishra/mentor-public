package org.cortex.backend.security.utils;

import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class EncryptionService {

    private static final String ENCRYPTION_ALGO = "AES/GCM/NoPadding";
    private static final int KEY_SIZE = 256; // AES-256
    private static final int IV_SIZE = 12;   // Recommended 12 bytes for GCM
    private static final int TAG_LENGTH_BIT = 128;

    private final SecretKey secretKey;

    public EncryptionService() throws Exception {
        // You can replace this with a persisted or environment-injected key
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(KEY_SIZE);
        this.secretKey = keyGen.generateKey();
    }

    public String encrypt(String plainText) throws Exception {
        byte[] iv = new byte[IV_SIZE];
        SecureRandom secureRandom = new SecureRandom();
        secureRandom.nextBytes(iv);

        Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGO);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

        byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

        // Store IV with ciphertext (Base64 encoded)
        byte[] encryptedWithIv = new byte[iv.length + cipherText.length];
        System.arraycopy(iv, 0, encryptedWithIv, 0, iv.length);
        System.arraycopy(cipherText, 0, encryptedWithIv, iv.length, cipherText.length);

        return Base64.getEncoder().encodeToString(encryptedWithIv);
    }

    public String decrypt(String encryptedText) throws Exception {
        byte[] decoded = Base64.getDecoder().decode(encryptedText);

        byte[] iv = new byte[IV_SIZE];
        byte[] cipherText = new byte[decoded.length - IV_SIZE];
        System.arraycopy(decoded, 0, iv, 0, IV_SIZE);
        System.arraycopy(decoded, IV_SIZE, cipherText, 0, cipherText.length);

        Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGO);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

        byte[] plainText = cipher.doFinal(cipherText);
        return new String(plainText, StandardCharsets.UTF_8);
    }

    // Example of loading key from Base64 string (e.g. environment variable)
    public static SecretKey loadKeyFromBase64(String base64Key) {
        byte[] decodedKey = Base64.getDecoder().decode(base64Key);
        return new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");
    }

    public String exportKeyBase64() {
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }
}
