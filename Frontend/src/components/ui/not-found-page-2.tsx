import { motion } from "framer-motion";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "./empty";
import { Link } from "react-router-dom";

const PRIMARY_ORB_HORIZONTAL_OFFSET = 40;
const PRIMARY_ORB_VERTICAL_OFFSET = 20;

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground">

      {/* Animated background orbs */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            x: [0, PRIMARY_ORB_HORIZONTAL_OFFSET, -PRIMARY_ORB_HORIZONTAL_OFFSET, 0],
            y: [0, PRIMARY_ORB_VERTICAL_OFFSET, -PRIMARY_ORB_VERTICAL_OFFSET, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/3 h-64 w-64 bg-primary/10 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -PRIMARY_ORB_HORIZONTAL_OFFSET, PRIMARY_ORB_HORIZONTAL_OFFSET, 0],
            y: [0, -PRIMARY_ORB_VERTICAL_OFFSET, PRIMARY_ORB_VERTICAL_OFFSET, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut",
          }}
          className="absolute right-1/4 bottom-1/3 h-72 w-72 bg-secondary/10 blur-3xl"
        />
      </div>

      <Empty>
        <EmptyHeader>
          <EmptyTitle className="font-extrabold text-8xl">
            404
          </EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for might have been <br />
            moved or doesn&apos;t exist.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link to="/analyze">
                <Compass className="mr-2 h-4 w-4" />
                Analyze
              </Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
