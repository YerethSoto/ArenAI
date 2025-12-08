import confetti from 'canvas-confetti';

// A subtle, controlled confetti burst
export const triggerConfetti = () => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 },
        zIndex: 1500 // Above modals
    };

    function fire(particleRatio: number, opts: any) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });

    fire(0.2, {
        spread: 60,
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
};

export const triggerSubtleConfetti = () => {
    confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8d6b56', '#90BEAB', '#FFD54F'],
        disableForReducedMotion: true,
        zIndex: 1500
    });
};
