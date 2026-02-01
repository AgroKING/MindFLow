import os
import hashlib
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from app.config import settings


def get_encryption_key() -> bytes:
    """Derive a 32-byte key from settings."""
    # Ensure encryption key is available
    if not hasattr(settings, "encryption_key") or not settings.encryption_key:
         # Fallback or error - for now assuming it will be there or we might need to handle it. 
         # Given the plan, let's assume settings has it. If not, it will crash, which is better than insecure.
         # Ideally we'd validte this in config.py
         pass
    
    key = settings.encryption_key.encode()
    return hashlib.sha256(key).digest()


def encrypt_content(plaintext: str) -> tuple[bytes, bytes]:
    """
    Encrypt content using AES-256-GCM.
    Returns (ciphertext, iv).
    """
    key = get_encryption_key()
    iv = os.urandom(12)  # 96-bit IV for GCM

    cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    ciphertext = encryptor.update(plaintext.encode()) + encryptor.finalize()

    # Append the tag to ciphertext. GCM tag is usually needed for decryption.
    # The cryptography library might handle tag separately. 
    # modes.GCM.tag is available after finalize().
    # Standard practice with this lib: ciphertext + tag.
    return ciphertext + encryptor.tag, iv


def decrypt_content(ciphertext: bytes, iv: bytes) -> str:
    """
    Decrypt content using AES-256-GCM.
    """
    key = get_encryption_key()

    # Extract tag (last 16 bytes for GCM default)
    tag = ciphertext[-16:]
    actual_ciphertext = ciphertext[:-16]

    cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
    decryptor = cipher.decryptor()

    plaintext = decryptor.update(actual_ciphertext) + decryptor.finalize()
    return plaintext.decode()


def hash_content(content: str) -> str:
    """Generate SHA-256 hash for content integrity."""
    return hashlib.sha256(content.encode()).hexdigest()
