import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export const MemeModal = ({ isOpen, onClose, imageUrl, alt }: MemeModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <img 
          src={imageUrl} 
          alt={alt}
          className="w-full h-auto rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}; 