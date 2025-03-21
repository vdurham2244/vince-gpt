/**
 * FACS Animation Utility with ARKit Blendshapes
 * 
 * Enhanced version supporting ARKit's 51 blendshapes for more realistic facial animation
 */

// ARKit-compatible FACS blendshapes
const ARKIT_BLENDSHAPES = {
    // Eye blendshapes
    'eyeBlinkLeft': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeBlinkRight': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeSquintLeft': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeSquintRight': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeWideLeft': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeWideRight': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeLookUpLeft': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeLookUpRight': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeLookDownLeft': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeLookDownRight': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeLookInLeft': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeLookInRight': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeLookOutLeft': { group: 'eyes', max: 1.0, default: 0.0 },
    'eyeLookOutRight': { group: 'eyes', max: 1.0, default: 0.0 },

    // Brow blendshapes
    'browDownLeft': { group: 'brow', max: 1.0, default: 0.0 },
    'browDownRight': { group: 'brow', max: 1.0, default: 0.0 },
    'browInnerUp': { group: 'brow', max: 1.0, default: 0.0 },
    'browOuterUpLeft': { group: 'brow', max: 1.0, default: 0.0 },
    'browOuterUpRight': { group: 'brow', max: 1.0, default: 0.0 },

    // Cheek blendshapes
    'cheekPuff': { group: 'cheek', max: 1.0, default: 0.0 },
    'cheekSquintLeft': { group: 'cheek', max: 1.0, default: 0.0 },
    'cheekSquintRight': { group: 'cheek', max: 1.0, default: 0.0 },

    // Nose blendshapes
    'noseSneerLeft': { group: 'nose', max: 1.0, default: 0.0 },
    'noseSneerRight': { group: 'nose', max: 1.0, default: 0.0 },

    // Mouth blendshapes
    'mouthLeft': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthRight': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthFunnel': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthPucker': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthRollUpper': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthRollLower': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthShrugUpper': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthShrugLower': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthClose': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthSmileLeft': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthSmileRight': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthFrownLeft': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthFrownRight': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthDimpleLeft': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthDimpleRight': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthUpperUpLeft': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthUpperUpRight': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthLowerDownLeft': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthLowerDownRight': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthPressLeft': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthPressRight': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthStretchLeft': { group: 'mouth', max: 1.0, default: 0.0 },
    'mouthStretchRight': { group: 'mouth', max: 1.0, default: 0.0 },

    // Jaw blendshapes
    'jawOpen': { group: 'jaw', max: 1.0, default: 0.0 },
    'jawForward': { group: 'jaw', max: 1.0, default: 0.0 },
    'jawLeft': { group: 'jaw', max: 1.0, default: 0.0 },
    'jawRight': { group: 'jaw', max: 1.0, default: 0.0 }
};

// Phoneme and expression tracking
let idleExpressionCount = 0;
let lastIdleAction = Date.now();
const IDLE_CHECK_INTERVAL = 15000; // 15 seconds of idle time

// Phoneme to viseme mapping
const PHONEME_TO_VISEME = {
    // Vowels
    'AA': 'ah',  // "father"
    'AE': 'ah',  // "cat"
    'AH': 'ah',  // "but"
    'AO': 'oh',  // "dog"
    'AW': 'oh',  // "cow"
    'AY': 'ah',  // "hide"
    'EH': 'eh',  // "bed"
    'ER': 'er',  // "bird"
    'EY': 'eh',  // "say"
    'IH': 'ih',  // "bid"
    'IY': 'ih',  // "bee"
    'OW': 'oh',  // "show"
    'OY': 'oh',  // "toy"
    'UH': 'oh',  // "good"
    'UW': 'uw',  // "two"
    
    // Consonants
    'B': 'mb',   // "bed"
    'CH': 'ch',  // "cheese"
    'D': 'th',   // "dig"
    'DH': 'th',  // "this"
    'F': 'fv',   // "fan"
    'G': 'kg',   // "game"
    'HH': 'ah',  // "help"
    'JH': 'ch',  // "joy"
    'K': 'kg',   // "key"
    'L': 'th',   // "lie"
    'M': 'mb',   // "mom"
    'N': 'th',   // "noon"
    'NG': 'kg',  // "sing"
    'P': 'mb',   // "pop"
    'R': 'er',   // "red"
    'S': 'ss',   // "see"
    'SH': 'ch',  // "she"
    'T': 'th',   // "tea"
    'TH': 'th',  // "thin"
    'V': 'fv',   // "van"
    'W': 'uw',   // "way"
    'Y': 'ih',   // "yard"
    'Z': 'ss',   // "zoo"
    'ZH': 'ch'   // "vision"
};

// Viseme definitions with FACS blendshapes
const VISEME_DEFINITIONS = {
    'ah': {
        mouthOpen: 0.7,
        jawOpen: 0.7,
        mouthFunnel: 0.1,
        mouthStretchLeft: 0.2,
        mouthStretchRight: 0.2
    },
    'oh': {
        mouthOpen: 0.4,
        jawOpen: 0.4,
        mouthPucker: 0.7,
        mouthFunnel: 0.3
    },
    'eh': {
        mouthOpen: 0.3,
        jawOpen: 0.3,
        mouthStretchLeft: 0.4,
        mouthStretchRight: 0.4,
        mouthSmileLeft: 0.2,
        mouthSmileRight: 0.2
    },
    'ih': {
        mouthOpen: 0.2,
        jawOpen: 0.2,
        mouthStretchLeft: 0.6,
        mouthStretchRight: 0.6
    },
    'uw': {
        mouthOpen: 0.2,
        jawOpen: 0.2,
        mouthPucker: 0.8,
        mouthFunnel: 0.4
    },
    'er': {
        mouthOpen: 0.3,
        jawOpen: 0.3,
        mouthFunnel: 0.3,
        mouthStretchLeft: 0.2,
        mouthStretchRight: 0.2
    },
    'mb': {
        mouthClose: 0.8,
        mouthPressLeft: 0.5,
        mouthPressRight: 0.5
    },
    'ch': {
        mouthOpen: 0.2,
        jawOpen: 0.2,
        mouthPucker: 0.4,
        mouthFunnel: 0.6
    },
    'th': {
        mouthOpen: 0.1,
        jawOpen: 0.1,
        tongueOut: 0.3
    },
    'fv': {
        mouthClose: 0.3,
        mouthPressLeft: 0.4,
        mouthPressRight: 0.4,
        mouthStretchLeft: 0.2,
        mouthStretchRight: 0.2
    },
    'ss': {
        mouthOpen: 0.2,
        jawOpen: 0.1,
        mouthStretchLeft: 0.5,
        mouthStretchRight: 0.5,
        mouthSmileLeft: 0.3,
        mouthSmileRight: 0.3
    }
};

// Enhanced talking patterns combining natural movements with phonemes
const TALKING_PATTERNS = [
    {
        name: 'vowel-a',
        description: 'Pronouncing "a" as in "father"',
        keyframes: [
            { 
                time: 0.0,
                morphs: {
                    'jawOpen': 0.0,
                    'mouthClose': 0.0
                }
            },
            {
                time: 0.1,
                morphs: {
                    'jawOpen': 0.7,
                    'mouthClose': 0.0,
                    'mouthStretchLeft': 0.2,
                    'mouthStretchRight': 0.2
                }
            },
            {
                time: 0.4,
                morphs: {
                    'jawOpen': 0.7,
                    'mouthClose': 0.0,
                    'mouthStretchLeft': 0.2,
                    'mouthStretchRight': 0.2
                }
            },
            {
                time: 0.5,
                morphs: {
                    'jawOpen': 0.1,
                    'mouthClose': 0.1
                }
            }
        ]
    },
    {
        name: 'vowel-e',
        description: 'Pronouncing "e" as in "see"',
        keyframes: [
            {
                time: 0.0,
                morphs: {
                    'jawOpen': 0.0,
                    'mouthClose': 0.0,
                    'mouthSmileLeft': 0.0,
                    'mouthSmileRight': 0.0
                }
            },
            {
                time: 0.1,
                morphs: {
                    'jawOpen': 0.2,
                    'mouthClose': 0.0,
                    'mouthSmileLeft': 0.4,
                    'mouthSmileRight': 0.4,
                    'mouthStretchLeft': 0.3,
                    'mouthStretchRight': 0.3
                }
            },
            {
                time: 0.3,
                morphs: {
                    'jawOpen': 0.3,
                    'mouthClose': 0.0,
                    'mouthSmileLeft': 0.4,
                    'mouthSmileRight': 0.4,
                    'mouthStretchLeft': 0.3,
                    'mouthStretchRight': 0.3
                }
            },
            {
                time: 0.4,
                morphs: {
                    'jawOpen': 0.1,
                    'mouthClose': 0.1,
                    'mouthSmileLeft': 0.1,
                    'mouthSmileRight': 0.1
                }
            }
        ]
    },
    {
        name: 'vowel-o',
        description: 'Pronouncing "o" as in "go"',
        keyframes: [
            {
                time: 0.0,
                morphs: {
                    'jawOpen': 0.0,
                    'mouthClose': 0.0,
                    'mouthPucker': 0.0
                }
            },
            {
                time: 0.1,
                morphs: {
                    'jawOpen': 0.3,
                    'mouthClose': 0.0,
                    'mouthPucker': 0.7,
                    'mouthFunnel': 0.3
                }
            },
            {
                time: 0.3,
                morphs: {
                    'jawOpen': 0.4,
                    'mouthClose': 0.0,
                    'mouthPucker': 0.7,
                    'mouthFunnel': 0.3
                }
            },
            {
                time: 0.4,
                morphs: {
                    'jawOpen': 0.1,
                    'mouthClose': 0.1,
                    'mouthPucker': 0.1
                }
            }
        ]
    },
    {
        name: 'consonant-m',
        description: 'Pronouncing "m" sound',
        keyframes: [
            {
                time: 0.0,
                morphs: {
                    'jawOpen': 0.1,
                    'mouthClose': 0.3,
                    'mouthPressLeft': 0.2,
                    'mouthPressRight': 0.2
                }
            },
            {
                time: 0.2,
                morphs: {
                    'jawOpen': 0.1,
                    'mouthClose': 0.3,
                    'mouthPressLeft': 0.2,
                    'mouthPressRight': 0.2
                }
            },
            {
                time: 0.3,
                morphs: {
                    'jawOpen': 0.0,
                    'mouthClose': 0.0
                }
            }
        ]
    }
];

// Blinking state management with improved timing
let lastBlinkTime = Date.now();
let isBlinking = false;
let nextBlinkDelay = 2000 + Math.random() * 4000; // 2-6 seconds

// Enhanced blink animation
function createBlinkAnimation() {
    return [
        { time: 0, value: 0 },    // Eyes open
        { time: 0.05, value: 0.5 }, // Quick close
        { time: 0.1, value: 1 },    // Fully closed
        { time: 0.15, value: 0.5 }, // Quick open
        { time: 0.2, value: 0 }     // Eyes open
    ];
}

// Improved natural blinking
function handleBlinking(morphTargetInfluences, availableMorphs) {
    const currentTime = Date.now();
    const timeSinceLastBlink = currentTime - lastBlinkTime;

    if (!isBlinking && timeSinceLastBlink > nextBlinkDelay) {
        isBlinking = true;
        lastBlinkTime = currentTime;
        nextBlinkDelay = 2000 + Math.random() * 4000; // Random delay for next blink

        const blinkAnim = createBlinkAnimation();
        let blinkIndex = 0;

        function animateBlink() {
            if (blinkIndex < blinkAnim.length) {
                const frame = blinkAnim[blinkIndex];
                
                // Apply blink to both eyes with slight asymmetry
                if (availableMorphs['eyeBlinkLeft'] !== undefined) {
                    morphTargetInfluences[availableMorphs['eyeBlinkLeft']] = frame.value * (1 + Math.random() * 0.1);
                }
                if (availableMorphs['eyeBlinkRight'] !== undefined) {
                    morphTargetInfluences[availableMorphs['eyeBlinkRight']] = frame.value * (1 + Math.random() * 0.1);
                }

                // Add subtle squint during blink
                if (availableMorphs['eyeSquintLeft'] !== undefined) {
                    morphTargetInfluences[availableMorphs['eyeSquintLeft']] = frame.value * 0.3;
                }
                if (availableMorphs['eyeSquintRight'] !== undefined) {
                    morphTargetInfluences[availableMorphs['eyeSquintRight']] = frame.value * 0.3;
                }

                blinkIndex++;
                setTimeout(animateBlink, 50); // 50ms between frames
            } else {
                isBlinking = false;
            }
        }

        animateBlink();
    }
}

// Enhanced idle expressions
function handleIdleExpressions(morphTargetInfluences, availableMorphs) {
    const currentTime = Date.now();
    
    // Check if we've been idle for a while
    if (currentTime - lastIdleAction > IDLE_CHECK_INTERVAL) {
        idleExpressionCount++;
        lastIdleAction = currentTime;
        
        // Every 4 blinks, do a special expression
        if (idleExpressionCount >= 4) {
            idleExpressionCount = 0;
            
            // Random choice between wink and smile
            if (Math.random() > 0.5) {
                // Wink with right eye
                const winkDuration = 400;
                if (availableMorphs['eyeBlinkRight'] !== undefined) {
                    morphTargetInfluences[availableMorphs['eyeBlinkRight']] = 1.0;
                    if (availableMorphs['mouthSmileRight'] !== undefined) {
                        morphTargetInfluences[availableMorphs['mouthSmileRight']] = 0.3;
                    }
                    setTimeout(() => {
                        if (availableMorphs['eyeBlinkRight'] !== undefined) {
                            morphTargetInfluences[availableMorphs['eyeBlinkRight']] = 0.0;
                        }
                        if (availableMorphs['mouthSmileRight'] !== undefined) {
                            morphTargetInfluences[availableMorphs['mouthSmileRight']] = 0.0;
                        }
                    }, winkDuration);
                }
            } else {
                // Gentle smile
                const smileDuration = 2000;
                if (availableMorphs['mouthSmileLeft'] !== undefined && 
                    availableMorphs['mouthSmileRight'] !== undefined) {
                    morphTargetInfluences[availableMorphs['mouthSmileLeft']] = 0.3;
                    morphTargetInfluences[availableMorphs['mouthSmileRight']] = 0.3;
                    if (availableMorphs['cheekSquintLeft'] !== undefined && 
                        availableMorphs['cheekSquintRight'] !== undefined) {
                        morphTargetInfluences[availableMorphs['cheekSquintLeft']] = 0.2;
                        morphTargetInfluences[availableMorphs['cheekSquintRight']] = 0.2;
                    }
                    setTimeout(() => {
                        morphTargetInfluences[availableMorphs['mouthSmileLeft']] = 0.0;
                        morphTargetInfluences[availableMorphs['mouthSmileRight']] = 0.0;
                        if (availableMorphs['cheekSquintLeft'] !== undefined && 
                            availableMorphs['cheekSquintRight'] !== undefined) {
                            morphTargetInfluences[availableMorphs['cheekSquintLeft']] = 0.0;
                            morphTargetInfluences[availableMorphs['cheekSquintRight']] = 0.0;
                        }
                    }, smileDuration);
                }
            }
        }
    }
}

// Enhanced subtle movements
function addSubtleMovements(morphTargetInfluences, availableMorphs, intensity = 0.1) {
    // Natural blinking
    handleBlinking(morphTargetInfluences, availableMorphs);
    
    // Handle idle expressions
    handleIdleExpressions(morphTargetInfluences, availableMorphs);
    
    // Subtle constant smile
    if (availableMorphs['mouthSmileLeft'] !== undefined && 
        availableMorphs['mouthSmileRight'] !== undefined) {
        const baseSmile = 0.1; // Constant slight smile
        morphTargetInfluences[availableMorphs['mouthSmileLeft']] = 
            Math.max(morphTargetInfluences[availableMorphs['mouthSmileLeft']], baseSmile);
        morphTargetInfluences[availableMorphs['mouthSmileRight']] = 
            Math.max(morphTargetInfluences[availableMorphs['mouthSmileRight']], baseSmile);
    }

    // Subtle eye movements
    const eyeMovements = ['eyeLookUpLeft', 'eyeLookUpRight', 'eyeLookDownLeft', 'eyeLookDownRight',
                         'eyeLookInLeft', 'eyeLookInRight', 'eyeLookOutLeft', 'eyeLookOutRight'];
    
    eyeMovements.forEach(movement => {
        if (availableMorphs[movement] !== undefined && Math.random() < 0.02) {
            const currentValue = morphTargetInfluences[availableMorphs[movement]];
            const newValue = Math.max(0, Math.min(0.2, currentValue + (Math.random() * 0.1 - 0.05)));
            morphTargetInfluences[availableMorphs[movement]] = newValue;
        }
    });

    // Subtle brow movements
    const browMovements = ['browInnerUp', 'browOuterUpLeft', 'browOuterUpRight'];
    browMovements.forEach(movement => {
        if (availableMorphs[movement] !== undefined && Math.random() < 0.03) {
            const currentValue = morphTargetInfluences[availableMorphs[movement]];
            const newValue = Math.max(0, Math.min(0.2, currentValue + (Math.random() * 0.1 - 0.05)));
            morphTargetInfluences[availableMorphs[movement]] = newValue;
        }
    });

    // Micro-expressions
    if (Math.random() < 0.01) {
        const microExpressions = [
            { morphs: ['mouthSmileLeft', 'mouthSmileRight'], intensity: 0.1 },
            { morphs: ['cheekSquintLeft', 'cheekSquintRight'], intensity: 0.05 },
            { morphs: ['noseSneerLeft', 'noseSneerRight'], intensity: 0.05 }
        ];

        const expression = microExpressions[Math.floor(Math.random() * microExpressions.length)];
        expression.morphs.forEach(morph => {
            if (availableMorphs[morph] !== undefined) {
                morphTargetInfluences[availableMorphs[morph]] = Math.random() * expression.intensity;
            }
        });
    }
}

// Helper function to find available morph targets
function findAvailableMorphTargets(morphTargetDictionary) {
    const availableMorphs = {};
    
    Object.keys(ARKIT_BLENDSHAPES).forEach(blendshapeName => {
        const possibleNames = [
            blendshapeName,
            blendshapeName.toLowerCase(),
            'ARKit_' + blendshapeName,
            blendshapeName.replace(/([A-Z])/g, '_$1').toLowerCase(),
            blendshapeName.charAt(0).toUpperCase() + blendshapeName.slice(1)
        ];
        
        for (const name of possibleNames) {
            if (morphTargetDictionary[name] !== undefined) {
                availableMorphs[blendshapeName] = morphTargetDictionary[name];
                break;
            }
        }
    });
    
    return availableMorphs;
}

// Enhanced talking sequence generator with phoneme support
function generateTalkingSequence(durationMs = 2000, text = '') {
    const sequence = [];
    const frameRate = 60;
    const totalFrames = Math.floor(durationMs / 1000 * frameRate);
    const frameDuration = 1000 / frameRate;

    // If no text provided, generate random visemes
    if (!text) {
        const visemeKeys = Object.keys(VISEME_DEFINITIONS);
        let currentTime = 0;
        
        while (currentTime < durationMs) {
            const viseme = visemeKeys[Math.floor(Math.random() * visemeKeys.length)];
            const visemeDuration = 100 + Math.random() * 150; // 100-250ms per viseme
            const transitionDuration = 50; // 50ms transition
            
            // Add keyframes for this viseme
            addVisemeKeyframes(sequence, currentTime, visemeDuration, transitionDuration, 
                             VISEME_DEFINITIONS[viseme], frameRate);
            
            currentTime += visemeDuration;
        }
    } else {
        // TODO: Add text-to-phoneme conversion and timing
        // For now, use the same random generation
        const visemeKeys = Object.keys(VISEME_DEFINITIONS);
        let currentTime = 0;
        
        while (currentTime < durationMs) {
            const viseme = visemeKeys[Math.floor(Math.random() * visemeKeys.length)];
            const visemeDuration = 100 + Math.random() * 150;
            const transitionDuration = 50;
            
            addVisemeKeyframes(sequence, currentTime, visemeDuration, transitionDuration, 
                             VISEME_DEFINITIONS[viseme], frameRate);
            
            currentTime += visemeDuration;
        }
    }

    // Fill any gaps in the sequence
    let lastFrame = null;
    for (let i = 0; i < totalFrames; i++) {
        if (!sequence[i]) {
            if (lastFrame) {
                sequence[i] = {
                    time: i * frameDuration,
                    morphs: { ...lastFrame.morphs }
                };
            } else {
                sequence[i] = {
                    time: i * frameDuration,
                    morphs: Object.fromEntries(
                        Object.keys(ARKIT_BLENDSHAPES)
                            .map(key => [key, ARKIT_BLENDSHAPES[key].default])
                    )
                };
            }
        } else {
            lastFrame = sequence[i];
        }
    }

    return sequence;
}

// Helper function to add viseme keyframes with smooth transitions
function addVisemeKeyframes(sequence, startTime, duration, transitionDuration, visemeDefinition, frameRate) {
    const frameDuration = 1000 / frameRate;
    
    // Convert times to frame indices
    const startFrame = Math.floor(startTime / frameDuration);
    const endFrame = Math.floor((startTime + duration) / frameDuration);
    const transitionFrames = Math.floor(transitionDuration / frameDuration);
    
    // Add transition in
    for (let i = 0; i < transitionFrames; i++) {
        const frame = startFrame + i;
        const progress = i / transitionFrames;
        const morphs = {};
        
        Object.entries(visemeDefinition).forEach(([morphName, targetValue]) => {
            const currentValue = sequence[frame - 1]?.morphs[morphName] || 0;
            morphs[morphName] = currentValue + (targetValue - currentValue) * progress;
        });
        
        sequence[frame] = {
            time: frame * frameDuration,
            morphs: morphs
        };
    }
    
    // Hold the viseme
    for (let frame = startFrame + transitionFrames; frame < endFrame - transitionFrames; frame++) {
        sequence[frame] = {
            time: frame * frameDuration,
            morphs: { ...visemeDefinition }
        };
    }
    
    // Add transition out
    for (let i = 0; i < transitionFrames; i++) {
        const frame = endFrame - transitionFrames + i;
        const progress = i / transitionFrames;
        const morphs = {};
        
        Object.entries(visemeDefinition).forEach(([morphName, value]) => {
            morphs[morphName] = value * (1 - progress);
        });
        
        sequence[frame] = {
            time: frame * frameDuration,
            morphs: morphs
        };
    }
}

// Apply frame from the talking sequence to the model's morph targets
function applyTalkingFrame(morphTargetInfluences, availableMorphs, frame) {
    // Reset all mouth and jaw related morphs first
    Object.entries(availableMorphs).forEach(([blendshapeName, morphIndex]) => {
        if (ARKIT_BLENDSHAPES[blendshapeName] && 
            (ARKIT_BLENDSHAPES[blendshapeName].group === 'mouth' || 
             ARKIT_BLENDSHAPES[blendshapeName].group === 'jaw')) {
            morphTargetInfluences[morphIndex] = 0;
        }
    });
    
    // Apply the morph values from the frame
    Object.entries(frame.morphs).forEach(([blendshapeName, value]) => {
        if (availableMorphs[blendshapeName] !== undefined) {
            // Ensure the value doesn't exceed the maximum
            const maxValue = ARKIT_BLENDSHAPES[blendshapeName].max;
            morphTargetInfluences[availableMorphs[blendshapeName]] = Math.min(value, maxValue);
        }
    });
}

export {
    ARKIT_BLENDSHAPES,
    findAvailableMorphTargets,
    generateTalkingSequence,
    applyTalkingFrame,
    addSubtleMovements,
    handleBlinking
}; 