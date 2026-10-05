import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AIAssistChat } from "./AIAssistChat";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function AIAssistButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              variant="outline"
              size="default"
              className="shadow-md hover:shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              Ask AI
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AIAssistChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
