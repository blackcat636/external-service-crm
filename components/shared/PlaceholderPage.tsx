"use client";

import { motion } from "framer-motion";

interface PlaceholderPageProps {
  platform: string;
  section: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
}

export function PlaceholderPage({
  platform,
  section,
  icon,
  gradientFrom,
  gradientTo,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* Animated Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Glow Effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} blur-3xl opacity-20 rounded-full scale-150`}
        />

        {/* Content Card */}
        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center max-w-md">
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} opacity-30`}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            />
            <div className="absolute inset-[1px] bg-[#0a0a0a] rounded-2xl" />
          </div>

          {/* Icon */}
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-10 mb-6"
          >
            <div
              className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r ${gradientFrom} ${gradientTo} shadow-lg`}
            >
              <div className="h-10 w-10 text-white">{icon}</div>
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="relative z-10 text-2xl font-light text-white mb-2">
            {platform} {section}
          </h1>

          {/* Gradient Text */}
          <motion.p
            className={`relative z-10 text-3xl font-bold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            To Be Continued...
          </motion.p>

          {/* Description */}
          <p className="relative z-10 mt-4 text-sm text-white/40 font-mono">
            We&apos;re working on bringing {platform} tracking to Content Zavod.
            <br />
            Stay tuned for updates!
          </p>

          {/* Animated dots */}
          <div className="relative z-10 flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
