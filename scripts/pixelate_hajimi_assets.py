#!/usr/bin/env python3
"""Batch-convert approved cat images into deterministic pixel-art portraits."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageOps


SUPPORTED_SUFFIXES = {".jpeg", ".jpg", ".png", ".webp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--prefix", default="hajimi-extra")
    parser.add_argument("--pixel-size", type=int, default=64)
    parser.add_argument("--output-size", type=int, default=256)
    parser.add_argument("--colors", type=int, default=64)
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def convert_portrait(
    source_path: Path,
    output_path: Path,
    *,
    pixel_size: int,
    output_size: int,
    colors: int,
) -> None:
    with Image.open(source_path) as source:
        normalized = ImageOps.exif_transpose(source).convert("RGB")
        pixelated = ImageOps.fit(
            normalized,
            (pixel_size, pixel_size),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )
        pixelated = pixelated.quantize(
            colors=colors,
            method=Image.Quantize.MEDIANCUT,
            dither=Image.Dither.NONE,
        ).convert("RGB")
        portrait = pixelated.resize(
            (output_size, output_size),
            resample=Image.Resampling.NEAREST,
        )
        portrait.save(output_path, format="PNG", optimize=True)


def main() -> None:
    args = parse_args()
    if args.pixel_size <= 0 or args.output_size <= 0:
        raise SystemExit("image sizes must be positive")
    if args.output_size % args.pixel_size != 0:
        raise SystemExit("output size must be an integer multiple of pixel size")
    if not 2 <= args.colors <= 256:
        raise SystemExit("colors must be between 2 and 256")

    source_paths = sorted(
        (
            path
            for path in args.input_dir.iterdir()
            if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES
        ),
        key=lambda path: path.name.casefold(),
    )
    if not source_paths:
        raise SystemExit(f"no supported images found in {args.input_dir}")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    outputs = []
    for index, source_path in enumerate(source_paths, start=1):
        output_path = args.output_dir / f"{args.prefix}-{index:02d}.png"
        if output_path.exists() and not args.overwrite:
            raise SystemExit(f"output already exists: {output_path}")
        convert_portrait(
            source_path,
            output_path,
            pixel_size=args.pixel_size,
            output_size=args.output_size,
            colors=args.colors,
        )
        outputs.append(
            {
                "source": source_path.name,
                "output": output_path.name,
            }
        )

    print(
        json.dumps(
            {
                "count": len(outputs),
                "pixelSize": args.pixel_size,
                "outputSize": args.output_size,
                "colors": args.colors,
                "files": outputs,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
