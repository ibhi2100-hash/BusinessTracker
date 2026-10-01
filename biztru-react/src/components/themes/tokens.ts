export const tokens = {
  colors: {
    background: "bg-black",

    glass: {
      surface: "bg-white/[0.04]",
      surfaceStrong: "bg-white/[0.08]",
      surfaceHover: "bg-white/[0.10]",

      border: "border-white/10",
      borderStrong: "border-white/20",
    },

    text: {
      primary: "text-white",
      secondary: "text-gray-400",
      muted: "text-gray-500",
    },

    brand: {
      teal: "text-teal-400",
      emerald: "text-emerald-400",
      cyan: "text-cyan-400",
    },
  },

  radius: {
    sm: "rounded-xl",
    md: "rounded-2xl",
    lg: "rounded-3xl",
    full: "rounded-full",
  },

  blur: {
    sm: "backdrop-blur-md",
    md: "backdrop-blur-xl",
    lg: "backdrop-blur-2xl",
  },

  surface: {
    default: `
      bg-white/[0.04]
      border-white/10
    `,

    elevated: `
      bg-white/[0.08]
      border-white/20
    `,

    accent: `
      bg-gradient-to-br
      from-teal-500/10
      via-emerald-500/5
      to-cyan-500/5
      border-teal-500/20
    `,
  },

  shadow: {
    sm: "shadow-lg",

    card: `
      shadow-[0_20px_80px_rgba(0,0,0,0.4)]
    `,

    primary: `
      shadow-[0_15px_50px_rgba(20,184,166,0.35)]
    `,
  },

  variant: {
    primary: `
        bg-gradient-to-r
        from-teal-500
        to-emerald-600
        text-white
        shadow-[0_15px_50px_rgba(20,184,166,0.35)]
        hover:brightness-110
      `,
    secondary: `
        bg-white/5
        border
        border-white/10
        backdrop-blur-xl
        hover:bg-white/10   
        `,
    tertiary: `
        text-gray-300
        hover:bg-white/5
        `,
    danger: `
        bg-red-500/10
        border-red-500/20
        text-red-400
        hover:bg-red-500/20 
        `,
    success: `
        bg-emerald-500/10   
        border-emerald-500/20
        text-emerald-400
        hover:bg-emerald-500/20
        `,
    },
  }