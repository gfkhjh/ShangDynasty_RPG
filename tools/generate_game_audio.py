"""Deterministically synthesize the game's offline rain, digging, and music WAV assets."""

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
    duration = 0.42
    count = int(SAMPLE_RATE * duration)
    rng = np.random.default_rng(0x444947)
    time = np.arange(count) / SAMPLE_RATE

    # A short, soft wooden-handle pass with no pitched metal transient.
    swing_raw = rng.normal(0.0, 1.0, count)
    swing = np.convolve(swing_raw, np.ones(9) / 9.0, mode="same")
    swing -= np.convolve(swing, np.ones(181) / 181.0, mode="same")
    swing_envelope = np.exp(-np.square((time - 0.065) / 0.043))

    raw = rng.normal(0.0, 1.0, count)
    soil = np.convolve(raw, np.ones(13) / 13.0, mode="same")
    soil -= np.convolve(soil, np.ones(241) / 241.0, mode="same")
    soil /= max(1e-9, np.std(soil))
    soil_envelope = np.where(
        time >= 0.09,
        np.exp(-(time - 0.09) * 11.5) * (1.0 - np.exp(-(time - 0.09) * 48.0)),
        0.0,
    )

    # A few quiet, filtered grains suggest loose earth falling back into place.
    falling = np.zeros(count)
    for start_seconds, gain in ((0.19, 0.16), (0.245, 0.12), (0.305, 0.08)):
        length = int(0.085 * SAMPLE_RATE)
        grain_time = np.arange(length) / SAMPLE_RATE
        grains = rng.normal(0.0, 1.0, length)
        grains = np.convolve(grains, np.ones(17) / 17.0, mode="same")
        grains *= np.exp(-grain_time * 38.0) * gain
        start = int(start_seconds * SAMPLE_RATE)
        end = min(count, start + length)
        falling[start:end] += grains[:end - start]

    mono = 0.045 * swing * swing_envelope + 0.18 * soil * soil_envelope + falling
    mono *= np.minimum(1.0, time / 0.004)
    mono *= np.minimum(1.0, (duration - time) / 0.045)
    mono *= 0.62 / max(1e-9, np.max(np.abs(mono)))
    stereo = np.column_stack((mono, np.roll(mono, 7) * 0.97))
    return stereo


def synthesize_footstep(variant: int) -> np.ndarray:
    """Soft shoe-on-grass/loose-earth step with no pitched impact."""
    durations = (0.194, 0.202, 0.188, 0.208)
    duration = durations[variant]
    count = int(SAMPLE_RATE * duration)
    shared_rng = np.random.default_rng(0x46535450)
    variant_rng = np.random.default_rng(0x534F4654 + variant * 31)
    time = np.arange(count) / SAMPLE_RATE

    # Most texture is shared so the set reads as one surface; a small amount
    # of variant noise and filter movement prevents mechanical repetition.
    sole_raw = shared_rng.normal(0.0, 1.0, count)
    sole_raw += variant_rng.normal(0.0, 0.13, count)
    sole_width = 87 + variant * 4
    sole = np.convolve(sole_raw, np.ones(sole_width) / sole_width, mode="same")
    sole -= np.convolve(sole, np.ones(801) / 801.0, mode="same")
    sole /= max(1e-9, np.std(sole))
    contact_center = 0.083 + variant * 0.002
    contact = np.exp(-np.square((time - contact_center) / (0.057 + variant * 0.001)))

    earth_raw = shared_rng.normal(0.0, 1.0, count)
    earth_raw += variant_rng.normal(0.0, 0.1, count)
    earth_width = 125 - variant * 3
    earth = np.convolve(earth_raw, np.ones(earth_width) / earth_width, mode="same")
    earth -= np.convolve(earth, np.ones(1001) / 1001.0, mode="same")
    earth /= max(1e-9, np.std(earth))
    release_start = 0.092 + variant * 0.003
    release = np.where(
        time >= release_start,
        np.exp(-(time - release_start) * (16.0 + variant)),
        0.0,
    )

    mono = 0.095 * sole * contact + 0.052 * earth * release
    mono *= np.minimum(1.0, time / 0.022)
    mono *= np.minimum(1.0, (duration - time) / 0.052)
    mono *= 0.38 / max(1e-9, np.max(np.abs(mono)))
    delay = 4 + variant
    stereo = np.column_stack((mono, np.roll(mono, delay) * (0.98 - variant * 0.006)))
    return stereo


def add_circular_voice(track: np.ndarray, start: int, voice: np.ndarray, gain: float, pan: float) -> None:
    indices = (start + np.arange(voice.size)) % track.shape[0]
    left = np.sqrt((1.0 - pan) * 0.5)
    right = np.sqrt((1.0 + pan) * 0.5)
    track[indices, 0] += voice * gain * left
    track[indices, 1] += voice * gain * right


def plucked_string(frequency: float, duration: float, rng: np.random.Generator) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    time = np.arange(count) / SAMPLE_RATE
    phases = rng.uniform(0.0, np.pi * 2.0, 5)
    voice = sum(
        np.sin(2 * np.pi * frequency * harmonic * time + phases[harmonic - 1])
        * np.exp(-time * (1.5 + harmonic * 0.75)) / harmonic
        for harmonic in range(1, 6)
    )
    pick = rng.normal(0.0, 1.0, count) * np.exp(-time * 55.0)
    envelope = np.minimum(1.0, time / 0.008) * np.minimum(1.0, (duration - time) / 0.08)
    return (voice * 0.72 + pick * 0.08) * envelope


def tonal_flute(frequency: float, duration: float, brightness: float = 1.0) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    time = np.arange(count) / SAMPLE_RATE
    vibrato = 1.0 + 0.0028 * np.sin(2 * np.pi * 4.7 * time)
    phase = 2 * np.pi * frequency * np.cumsum(vibrato) / SAMPLE_RATE
    tone = np.sin(phase) + 0.2 * brightness * np.sin(2 * phase) + 0.06 * brightness * np.sin(3 * phase)
    attack = np.minimum(1.0, time / 0.12)
    release = np.minimum(1.0, (duration - time) / 0.16)
    return tone * 0.55 * attack * release


def bowed_string(frequency: float, duration: float) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    time = np.arange(count) / SAMPLE_RATE
    phase = 2 * np.pi * frequency * time
    tone = np.sin(phase) + 0.28 * np.sin(2 * phase) + 0.1 * np.sin(3 * phase)
    envelope = np.minimum(1.0, time / 0.65) * np.minimum(1.0, (duration - time) / 0.75)
    return tone * envelope


def hammered_string(frequency: float, duration: float) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    time = np.arange(count) / SAMPLE_RATE
    voice = sum(
        np.sin(2 * np.pi * frequency * harmonic * time) * np.exp(-time * (3.2 + harmonic * 0.8)) / harmonic
        for harmonic in range(1, 6)
    )
    return voice * np.minimum(1.0, time / 0.004) * np.minimum(1.0, (duration - time) / 0.05)


def wood_block(duration: float = 0.18) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    time = np.arange(count) / SAMPLE_RATE
    return (
        np.sin(2 * np.pi * 760.0 * time)
        + 0.32 * np.sin(2 * np.pi * 1135.0 * time)
    ) * np.exp(-time * 34.0)


def synthesize_bgm() -> np.ndarray:
    """Original 24-bar, three-section Chinese pastoral loop without ambience."""
    bpm = 58.0
    beat = 60.0 / bpm
    total_beats = 96
    duration = total_beats * beat
    count = round(duration * SAMPLE_RATE)
    rng = np.random.default_rng(0x59494E5855)
    track = np.zeros((count, 2), dtype=np.float64)

    # Three original D-major pentatonic sections: arrival, village dance, and
    # a broader reprise. Each has a distinct contour rather than one repeated
    # phrase.
    melody = [
        0, -1, 4, -1, 7, 9, 7, 4, 2, -1, 4, 7, 9, -1, 7, -1,
        4, 7, 9, 12, 9, 7, 4, 2, 0, 2, 4, 7, 4, 2, 0, -1,
        7, 9, 12, 14, 12, 9, 7, -1, 4, 7, 9, 7, 4, 2, 4, -1,
        9, 12, 16, 14, 12, 9, 7, 4, 2, 4, 7, 9, 7, 4, 2, -1,
        0, 4, 7, 9, 12, 9, 7, 4, 2, 7, 9, 12, 14, 12, 9, 7,
        4, 9, 12, 16, 14, 12, 9, 7, 4, 7, 9, 7, 4, 2, 0, -1,
    ]
    base_frequency = 293.6648  # D4
    for beat_index, interval in enumerate(melody):
        if interval < 0:
            continue
        frequency = base_frequency * 2 ** (interval / 12.0)
        brightness = 0.72 if 32 <= beat_index < 64 else 1.0
        voice = tonal_flute(frequency, beat * 0.92, brightness)
        lead_gain = 0.12 if beat_index < 32 else 0.14 if beat_index < 64 else 0.155
        add_circular_voice(track, round(beat_index * beat * SAMPLE_RATE), voice, lead_gain, 0.2)

    # Guzheng arpeggios provide a flowing accompaniment throughout.
    progression = [0, 7, 9, 7, 4, 9, 7, 0, 9, 4, 7, 0,
                   0, 4, 9, 7, 2, 7, 4, 0, 9, 7, 4, 0]
    arpeggio = [0, 7, 12, 16, 12, 7, 4, 7]
    accompaniment_base = 146.8324  # D3
    for bar, root_interval in enumerate(progression):
        for half_beat, arp_interval in enumerate(arpeggio):
            start_beat = bar * 4 + half_beat * 0.5
            frequency = accompaniment_base * 2 ** ((root_interval + arp_interval) / 12.0)
            voice = plucked_string(frequency, beat * 1.65, rng)
            pan = -0.42 + 0.12 * (half_beat % 4)
            add_circular_voice(track, round(start_beat * beat * SAMPLE_RATE), voice, 0.055, pan)

    # Pipa answers the main melody on offbeats; the rhythm becomes fuller in
    # the middle and final sections.
    for beat_index in range(total_beats):
        if beat_index % 4 not in (1, 3):
            continue
        root = progression[beat_index // 4]
        interval = root + (12 if beat_index % 4 == 1 else 7)
        voice = plucked_string(220.0 * 2 ** (interval / 12.0), beat * 0.72, rng)
        gain = 0.042 if beat_index < 32 else 0.058
        add_circular_voice(track, round((beat_index + 0.48) * beat * SAMPLE_RATE), voice, gain, 0.42)

    # Yangqin highlights introduce the second section and brighten the reprise.
    for beat_index in list(range(32, 64, 2)) + list(range(68, 96, 2)):
        interval = melody[beat_index] if melody[beat_index] >= 0 else 7
        voice = hammered_string(base_frequency * 2 ** (interval / 12.0), beat * 1.15)
        add_circular_voice(track, round(beat_index * beat * SAMPLE_RATE), voice, 0.037, -0.08)

    # Soft string harmony changes every bar and gives the arrangement clear
    # sections without any wind, rain, or other environmental bed.
    for bar, root_interval in enumerate(progression):
        for chord_interval, pan in ((0, -0.3), (7, 0.3)):
            frequency = 110.0 * 2 ** ((root_interval + chord_interval) / 12.0)
            voice = bowed_string(frequency, beat * 4.35)
            gain = 0.022 if bar < 8 else 0.03 if bar < 16 else 0.036
            add_circular_voice(track, round(bar * 4 * beat * SAMPLE_RATE), voice, gain, pan)

    # Tonal wooden percussion marks beats two and four, never using broadband
    # ambience that could be mistaken for rain or wind.
    block = wood_block()
    for beat_index in range(total_beats):
        if beat_index % 4 in (1, 3):
            gain = 0.018 if beat_index < 32 else 0.026
            add_circular_voice(track, round(beat_index * beat * SAMPLE_RATE), block, gain, 0.0)

    track *= 0.115 / max(1e-9, np.sqrt(np.mean(track * track)))
    track *= min(1.0, 0.72 / max(1e-9, np.max(np.abs(track))))
    return track


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    write_stereo_wav(OUTPUT_DIR / "rain_loop.wav", synthesize_rain())
    write_stereo_wav(OUTPUT_DIR / "shovel_dig.wav", synthesize_dig())
    write_stereo_wav(OUTPUT_DIR / "bgm_main_loop.wav", synthesize_bgm())
    for variant in range(4):
        write_stereo_wav(OUTPUT_DIR / f"footstep_grass_{variant + 1}.wav", synthesize_footstep(variant))


if __name__ == "__main__":
    main()
