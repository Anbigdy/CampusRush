#!/usr/bin/env python3
"""Decrypt a NetEase Cloud Music NCM container to its original audio file."""

from __future__ import annotations

import argparse
import base64
import json
import struct
from pathlib import Path

from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


CORE_KEY = bytes.fromhex("687a4852416d736f356b496e62617857")
META_KEY = bytes.fromhex("2331346c6a6b5f215c5d2630553c2728")
NCM_MAGIC = b"CTENFDAM"


def aes_ecb_decrypt(data: bytes, key: bytes) -> bytes:
    decryptor = Cipher(algorithms.AES(key), modes.ECB()).decryptor()
    padded = decryptor.update(data) + decryptor.finalize()
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    return unpadder.update(padded) + unpadder.finalize()


def build_key_box(key: bytes) -> list[int]:
    box = list(range(256))
    j = 0
    for i in range(256):
        j = (box[i] + j + key[i % len(key)]) & 0xFF
        box[i], box[j] = box[j], box[i]
    return box


def decrypt_audio_chunk(chunk: bytearray, key_box: list[int]) -> None:
    for index in range(len(chunk)):
        j = (index + 1) & 0xFF
        chunk[index] ^= key_box[
            (key_box[j] + key_box[(key_box[j] + j) & 0xFF]) & 0xFF
        ]


def read_u32(stream) -> int:
    raw = stream.read(4)
    if len(raw) != 4:
        raise ValueError("Unexpected end of NCM container")
    return struct.unpack("<I", raw)[0]


def decrypt_ncm(source: Path, output: Path | None) -> tuple[Path, dict]:
    with source.open("rb") as stream:
        if stream.read(8) != NCM_MAGIC:
            raise ValueError(f"Not a supported NCM file: {source}")

        stream.seek(2, 1)
        encrypted_key = bytearray(stream.read(read_u32(stream)))
        for index in range(len(encrypted_key)):
            encrypted_key[index] ^= 0x64
        stream_key = aes_ecb_decrypt(bytes(encrypted_key), CORE_KEY)[17:]
        if not stream_key:
            raise ValueError("NCM stream key is empty")
        key_box = build_key_box(stream_key)

        encrypted_meta = bytearray(stream.read(read_u32(stream)))
        metadata = {}
        if encrypted_meta:
            for index in range(len(encrypted_meta)):
                encrypted_meta[index] ^= 0x63
            decoded_meta = base64.b64decode(encrypted_meta[22:])
            metadata_text = aes_ecb_decrypt(decoded_meta, META_KEY)[6:].decode(
                "utf-8"
            )
            metadata = json.loads(metadata_text)

        stream.seek(5, 1)
        image_space_size = read_u32(stream)
        image_size = read_u32(stream)
        stream.seek(image_size, 1)
        stream.seek(max(0, image_space_size - image_size), 1)

        extension = str(metadata.get("format") or "mp3").lower()
        destination = output or source.with_suffix(f".{extension}")
        destination.parent.mkdir(parents=True, exist_ok=True)

        with destination.open("wb") as audio_file:
            while chunk := bytearray(stream.read(0x8000)):
                decrypt_audio_chunk(chunk, key_box)
                audio_file.write(chunk)

    return destination, metadata


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    destination, metadata = decrypt_ncm(args.source, args.output)
    summary = {
        "output": str(destination),
        "format": metadata.get("format"),
        "musicName": metadata.get("musicName"),
        "artist": metadata.get("artist"),
        "duration": metadata.get("duration"),
    }
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
