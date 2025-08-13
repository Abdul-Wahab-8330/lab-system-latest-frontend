import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog({ 
  title = "Are you sure?", 
  description = "This action cannot be undone.", 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  onConfirm, 
  trigger 
}) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <span onClick={() => setOpen(true)}>
        {trigger}
      </span>

      {/* Dialog */}
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {cancelText}
          </Button>
          <Button className='bg-red-500 text-white' variant="destructive" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
