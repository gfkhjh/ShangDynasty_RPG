"""Deterministically synthesize the game's offline rain and digging WAV assets."""

from pathlib import Path
import wave

import numpy as np


SAMPLE_RATE = 44_100
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "assets" / "resources" / "audio"


def write_stereo_wav(path: Path, samples: np.ndarray) -> None:
    samples = np.clip(samples, -1.0, 1.0)
    pcm = np.round(samples * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(SAMPLE_RATE)
        output.writeframes(pcm.tobytes())


def periodic_noise(rng: np.random.Generator, sample_count: int, tilt: float) -> np.ndarray:
    """FFT-shaped noise whose first/last boundary is naturally periodic."""
    frequencies = np.fft.rfftfreq(sample_count, 1.0 / SAMPLE_RATE)
    phase = rng.uniform(0.0, np.pi * 2.0, frequencies.size)
    magnitude = np.ones_like(frequencies)
    magnitude[0] = 0.0
    magnitude *= np.power(np.maximum(frequencies, 35.0) / 1000.0, tilt)
    magnitude *= 1.0 / (1.0 + np.power(frequencies / 15_000.0, 8.0))
    spectrum = magnitude * np.exp(1j * phase)
    noise = np.fft.irfft(spectrum, n=sample_count)
    return noise / max(1e-9, np.std(noise))


def synthesize_rain() -> np.ndarray:
    duration = 10.0
    count = int(SAMPLE_RATE * duration)
    rng = np.random.default_rng(0x5241494E)
    time = np.arange(count) / SAMPLE_RATE
    channels = []
    for channel in range(2):
        hiss = periodic_noise(rng, count, 0.18)
        body = periodic_noise(rng, count, -0.48)
        modulation = 0.88 + 0.08 * np.sin(2 * np.pi * time / duration * 3 + channel)
        rain = (0.72 * hiss + 0.28 * body) * modulation

        # Sparse drops add depth. Wrapping indices keeps the loop boundary clean.
        drops = np.zeros(count)
        for _ in range(145):
            start = int(rng.integers(0, count))
            length = int(rng.uniform(0.012, 0.045) * SAMPLE_RATE)
            drop_time = np.arange(length) / SAMPLE_RATE
            envelope = np.exp(-drop_time * rng.uniform(75.0, 130.0))
            tone = np.sin(2 * np.pi * rng.uniform(1700.0, 4300.0) * drop_time)
            indices = (start + np.arange(length)) % count
            drops[indices] += envelope * tone * rng.uniform(0.10, 0.28)
        channels.append(rain + drops)

    stereo = np.column_stack(channels)
    stereo *= 0.15 / np.sqrt(np.mean(stereo * stereo))
    stereo *= min(1.0, 0.72 / np.max(np.abs(stereo)))
    return stereo


def synthesize_dig() -> np.ndarray:
    duration = 0.82
    count = int(SAMPLE_RATE * duration)
    rng = np.random.default_rng(0x444947)
    time = np.arange(count) / SAMPLE_RATE

    raw = rng.normal(0.0, 1.0, count)
    soil = np.convolve(raw, np.ones(19) / 19.0, mode="same")
    soil /= max(1e-9, np.std(soil))
    soil_envelope = np.where(
        time >= 0.055,
        np.exp(-(time - 0.055) * 4.8) * (1.0 - np.exp(-(time - 0.055) * 60.0)),
        0.0,
    )

    impact_envelope = np.exp(-time * 26.0)
    blade_impact = (
        np.sin(2 * np.pi * 185.0 * time)
        + 0.55 * np.sin(2 * np.pi * 370.0 * time)
        + 0.22 * np.sin(2 * np.pi * 1110.0 * time)
    ) * impact_envelope

    scrape_noise = rng.normal(0.0, 1.0, count)
    scrape = scrape_noise - np.convolve(scrape_noise, np.ones(11) / 11.0, mode="same")
    scrape_envelope = np.exp(-np.square((time - 0.25) / 0.18)) * (time > 0.045)

    mono = 0.42 * blade_impact + 0.31 * soil * soil_envelope + 0.10 * scrape * scrape_envelope
    mono *= np.minimum(1.0, time / 0.004)
    mono *= np.minimum(1.0, (duration - time) / 0.07)
    mono *= 0.82 / max(1e-9, np.max(np.abs(mono)))
    stereo = np.column_stack((mono, np.roll(mono, 13) * 0.94))
    return stereo


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    write_stereo_wav(OUTPUT_DIR / "rain_loop.wav", synthesize_rain())
    write_stereo_wav(OUTPUT_DIR / "shovel_dig.wav", synthesize_dig())


if __name__ == "__main__":
    main()
