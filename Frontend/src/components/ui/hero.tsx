import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

interface HeroAction {
  label: string
  href: string
  variant?: "default" | "outline" | "ghost"
}

interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: HeroAction[]
  titleClassName?: string
  subtitleClassName?: string
  actionsClassName?: string
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(
  (
    {
      className,
      title,
      subtitle,
      actions,
      titleClassName,
      subtitleClassName,
      actionsClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-background",
          className,
        )}
        {...props}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-primary/20 blur-[140px]" />
        </div>

        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl px-6 text-center"
        >
          <h1
            className={cn(
              "font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight",
              titleClassName,
            )}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className={cn(
                "mt-6 text-lg sm:text-xl text-muted-foreground",
                subtitleClassName,
              )}
            >
              {subtitle}
            </p>
          )}

          {actions && actions.length > 0 && (
            <div
              className={cn(
                "mt-10 flex flex-col sm:flex-row justify-center gap-4",
                actionsClassName,
              )}
            >
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  size="lg"
                  asChild
                >
                  <Link to={action.href}>{action.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    )
  },
)

Hero.displayName = "Hero"
export { Hero }
