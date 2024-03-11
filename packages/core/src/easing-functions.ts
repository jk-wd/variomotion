export function linear(t: number) {
  return t;
}

export function easeInSine(t: number) {
  return -1 * Math.cos(t * (Math.PI / 2)) + 1;
}

export function easeOutSine(t: number) {
  return Math.sin(t * (Math.PI / 2));
}

export function easeInOutSine(t: number) {
  return -0.5 * (Math.cos(Math.PI * t) - 1);
}

export function easeInQuad(t: number) {
  return t * t;
}

export function easeOutQuad(t: number) {
  return t * (2 - t);
}

export function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeInCubic(t: number) {
  return t * t * t;
}

export function easeOutCubic(t: number) {
  const t1 = t - 1;
  return t1 * t1 * t1 + 1;
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

export function easeInQuart(t: number) {
  return t * t * t * t;
}

export function easeOutQuart(t: number) {
  const t1 = t - 1;
  return 1 - t1 * t1 * t1 * t1;
}

export function easeInOutQuart(t: number) {
  const t1 = t - 1;
  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * t1 * t1 * t1 * t1;
}

export function easeInQuint(t: number) {
  return t * t * t * t * t;
}

export function easeOutQuint(t: number) {
  const t1 = t - 1;
  return 1 + t1 * t1 * t1 * t1 * t1;
}

export function easeInOutQuint(t: number) {
  const t1 = t - 1;
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * t1 * t1 * t1 * t1 * t1;
}
export function easeInExpo(t: number) {
  if (t === 0) {
    return 0;
  }

  return Math.pow(2, 10 * (t - 1));
}

export function easeOutExpo(t: number) {
  if (t === 1) {
    return 1;
  }

  return -Math.pow(2, -10 * t) + 1;
}

export function easeInOutExpo(t: number) {
  if (t === 0 || t === 1) {
    return t;
  }

  const scaledTime = t * 2;
  const scaledTime1 = scaledTime - 1;

  if (scaledTime < 1) {
    return 0.5 * Math.pow(2, 10 * scaledTime1);
  }

  return 0.5 * (-Math.pow(2, -10 * scaledTime1) + 2);
}

export function easeInCirc(t: number) {
  const scaledTime = t / 1;
  return -1 * (Math.sqrt(1 - scaledTime * t) - 1);
}

export function easeOutCirc(t: number) {
  const t1 = t - 1;
  return Math.sqrt(1 - t1 * t1);
}

export function easeInOutCirc(t: number) {
  const scaledTime = t * 2;
  const scaledTime1 = scaledTime - 2;

  if (scaledTime < 1) {
    return -0.5 * (Math.sqrt(1 - scaledTime * scaledTime) - 1);
  }

  return 0.5 * (Math.sqrt(1 - scaledTime1 * scaledTime1) + 1);
}

export function easeInBack(t: number, magnitude = 1.70158) {
  return t * t * ((magnitude + 1) * t - magnitude);
}

export function easeOutBack(t: number, magnitude = 1.70158) {
  const scaledTime = t / 1 - 1;

  return (
    scaledTime * scaledTime * ((magnitude + 1) * scaledTime + magnitude) + 1
  );
}

export function easeInOutBack(t: number, magnitude = 1.70158) {
  const scaledTime = t * 2;
  const scaledTime2 = scaledTime - 2;

  const s = magnitude * 1.525;

  if (scaledTime < 1) {
    return 0.5 * scaledTime * scaledTime * ((s + 1) * scaledTime - s);
  }

  return 0.5 * (scaledTime2 * scaledTime2 * ((s + 1) * scaledTime2 + s) + 2);
}

export function easeInElastic(t: number, magnitude = 0.7) {
  if (t === 0 || t === 1) {
    return t;
  }

  const scaledTime = t / 1;
  const scaledTime1 = scaledTime - 1;

  const p = 1 - magnitude;
  const s = (p / (2 * Math.PI)) * Math.asin(1);

  return -(
    Math.pow(2, 10 * scaledTime1) *
    Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p)
  );
}

export function easeOutElastic(t: number, magnitude = 0.7) {
  if (t === 0 || t === 1) {
    return t;
  }

  const p = 1 - magnitude;
  const scaledTime = t * 2;

  const s = (p / (2 * Math.PI)) * Math.asin(1);
  return (
    Math.pow(2, -10 * scaledTime) *
      Math.sin(((scaledTime - s) * (2 * Math.PI)) / p) +
    1
  );
}

export function easeInOutElastic(t: number, magnitude = 0.65) {
  if (t === 0 || t === 1) {
    return t;
  }

  const p = 1 - magnitude;
  const scaledTime = t * 2;
  const scaledTime1 = scaledTime - 1;

  const s = (p / (2 * Math.PI)) * Math.asin(1);

  if (scaledTime < 1) {
    return (
      -0.5 *
      (Math.pow(2, 10 * scaledTime1) *
        Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p))
    );
  }

  return (
    Math.pow(2, -10 * scaledTime1) *
      Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p) *
      0.5 +
    1
  );
}

// Bounce to completion
export function easeOutBounce(t: number) {
  const scaledTime = t / 1;

  if (scaledTime < 1 / 2.75) {
    return 7.5625 * scaledTime * scaledTime;
  } else if (scaledTime < 2 / 2.75) {
    const scaledTime2 = scaledTime - 1.5 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
  } else if (scaledTime < 2.5 / 2.75) {
    const scaledTime2 = scaledTime - 2.25 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.9375;
  } else {
    const scaledTime2 = scaledTime - 2.625 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.984375;
  }
}

export function easeInBounce(t: number) {
  return 1 - easeOutBounce(1 - t);
}
export function easeInOutBounce(t: number) {
  if (t < 0.5) {
    return easeInBounce(t * 2) * 0.5;
  }

  return easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
}

export const easingFunctions: {
  [key: string]: (t: number) => number;
} = {
  linear,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeOutBounce,
  easeInBounce,
  easeInOutBounce,
};

/*
linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - --t * t * t * t,
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => 1 + --t * t * t * t * t,
  easeInOutQuint: (t) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
  easeOutElastic: function (t) {
    return (0.04 - 0.04 / t) * Math.sin(25 * t) + 1;
  },
  easeInElastic: function (t) {
    return ((0.04 * t) / --t) * Math.sin(25 * t);
  },
  easeInOutElastic: function (t) {
    return (t -= 0.5) < 0
      ? (0.02 + 0.01 / t) * Math.sin(50 * t)
      : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1;
  },
  */
